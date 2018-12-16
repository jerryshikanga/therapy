var sliderTimer;
var TIMEFORMAT_SEARCH_GROUP = '<b>%l<br />%g:%i%a</b>';
var TIMEFORMAT_GROUP_DETAIL = '%l<br />%g:%i%a';
var TIMEFORMAT_GROUP_DATE = '%F %dd<sup>%S</sup>';
var isRegistrationOpened = false;
var isPaymentOpened = false;
var questionText = false;
var submitCategoryUnregistered = false;
var centerDialogs = {
        animationInProgress : false,
        numberCount : 0,
        animationDone: 0,
        timeout: false,
        timeoutUntilNextExecution : 1000,
        animationSpeed : 600,
};

var _jsTimezone = (typeof jstz == "object") ? jstz.determine() : false;
var _jsTimezoneName = _jsTimezone ? _jsTimezone.name() : "";

$(function () {
    $('.scrollToTSection').click(function(){
        windowScroll({top: $('#meetOurTherapists').offset().top});
    });
    // any functions that need to be executed after the page has loaded
    showClientTimeFromUTC('searchGroups_UTC_time', TIMEFORMAT_SEARCH_GROUP);
    showClientTimeFromUTC('groupDetailPageTime', TIMEFORMAT_GROUP_DETAIL);
    showClientTimeFromUTC('groupDetailNextSessionDate', TIMEFORMAT_GROUP_DATE);
    prefillCurrentTime();
    //retrieve timestamp and update every 10 sec for elements with 'timeline' class
    setInterval(function(){updateTimestampWithSec('timeline', 10)}, 10000);
    

    publicGroupLinkPage();
    hoverGroupContainer();
    
    calculateSliderDimensions();

    sliderTimer = setTimeout(activateSlider, 5000);

    $(window).bind('resize', function() {
        // center dialogs
        if ($('.ui-dialog-content').length > 0) {
            $('.ui-dialog-content').not('#rateTherapistPopup, #cmCategoryMessageDialog, #lightbox-approve-mic').dialog('option', 'position', 'center');
        }
    });
    
    /*
    $('.openRequestParticipantScreen').bind('click', function() {
        $('#puser_register_popup').dialog('open');
    });
    */
    
    //removes yellow background autofill on chrome
    if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0) {
    	$(window).load(function(){
    	    $('input:-webkit-autofill').each(function(){
    	        var text = $(this).val();
    	        var name = $(this).attr('name');
    	        var id = $(this).attr('id');
    	        $(this).after(this.outerHTML).remove();
    	        $('input[name=' + name + ']#' +id).val(text);
    	    });
    	});
    }
    //submits form with class "loginFormSubmit" on enter keypress on any input
    /*
    $(window).load(function(){
        $('form.loginFormSubmit').each(function() {
        	if ($.browser.webkit || $.browser.msie) {
	            $('input').keypress(function(e) {
	                // Enter pressed?
	                if(e.which == 10 || e.which == 13) {
	                    this.form.submit();
	                }
	            });
        	};
        });
    });
    */
    
    if (typeof openRegistrionPopup != 'function') {
        $('.openRequestParticipantScreen').unbind().bind('click', function(e) {
            e.preventDefault();
            window.location = '/';
        });
    }
    
    $('#filterForm').bind("submit", function(e) {
    	var searchInput = $("#searchGroopTerm");

    	if (searchInput.val().trim() == "") {
    		e.preventDefault();
    		e.stopPropagation();
    	}
    	return;
    });
    $('.postQuestion, .tChatQuestion, .pppChatQuestion').not('.disabled').unbind().bind('click', function()
    {
        $(this).find('textarea:first:visible').focus();
    });
    
    // new landing page "start free" btn
    $('.landingButtonClass').click(function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, {
            duration: 500,
            easing: 'swing',
            queue: false,
            complete: function() {
                /*
                 * There's a know iOS issue
                 * We cannot get focus on elements
                 * without user interaction
                 */

                $('.pcFlow .pcfTextarea').focus();
            }
        });         
        
        return false;
    });

});

var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
      if (!uniqueId) {
        //"Don't call this twice without a uniqueId";
          return;
      }
      if (timers[uniqueId]) {
        clearTimeout (timers[uniqueId]);
      }
      timers[uniqueId] = setTimeout(callback, ms);
    };
  })();

function sendGoogleTag(ajaxResponse, options) {
    if (typeof dataLayer != "undefined" && ajaxResponse && typeof ajaxResponse.gtm == "object") {
        options = options || {};
        var variables = $.extend({}, ajaxResponse.gtm, options);
        variables['window_url'] = window.location.href;
        dataLayer.push(variables);
    } else {
        if(options && typeof options.eventCallback == "function") {
            options.eventCallback();
        }else if(ajaxResponse && ajaxResponse.gtm && typeof ajaxResponse.gtm.eventCallback == "function") {
            ajaxResponse.gtm.eventCallback();
        };
    }
}

//use to bind butons on offers
function rebindRecurlySubscriptionButton() {
    $('.therapistOfferOuterContainer .offerContainer,\n\
        .therapistOfferContainer .offerPlan').unbind().bind('click', function() {
        var selectedElement = $(this);
        var parent = selectedElement.parent();
        if (!selectedElement.hasClass('selected')) {
            parent.find('.selected').removeClass('selected');
            selectedElement.addClass('selected');
        }
    });
    
    var isOnMyAccountPage = + (typeof _accountPageNamespace !== 'undefined');

    if(!$('.therapistOfferOuterContainer .offerButton, .participantMessage .oneTimeExpire,\n\
       .therapistOfferContainer .offerButton').hasClass('not_room')){
        $(this).unbind('click');
    }

    $('.therapistOfferOuterContainer .offerButton, .participantMessage .oneTimeExpire,\n\
       .therapistOfferContainer .offerButton').bind('click', function() {
        var element = $(this);
        
        if (typeof newChat !=='undefined' && newChat.isNewChat) {
            //var selectedElement = $('.secondSection .selected:first');
            var selectedElement = element.parents('.therapistOfferContainer .secondSection .offerPlan');
            if (selectedElement.length == 0) {
                var selectedElement = $(this);
            }
        } else {
            var selectedElement = element.parent().find('.secondSection .selected:first');
        }

        var appDiv = $("body").find("[ng-app='app']");
        if ('object' === typeof appDiv && appDiv.length > 0 && element.hasClass('isCampaign')) {
            var appDivId = appDiv.attr('id');
            if ('object' === typeof angular.element($('#' + appDivId)).scope()) {
                var angularScope = (angular.element($('#' + appDivId)).scope());
                
                //funnel for offer was close by user
                if ('object' === typeof recurlyNamespace && recurlyNamespace.hasOwnProperty('campaignId') && angularScope.showCampaignCoupon) {
                    $.ajax({
                        type: 'POST',
                        url: '/private-chat/campaign-funnel',
                        data: {
                            privateTalkId : newChat.privateTalkId,
                            campaignId: 'undefined' !== typeof recurlyNamespace.campaignId ? recurlyNamespace.campaignId : 0,
                            userAction: 'select_plan_' + selectedElement.data('selectedPlan')
                        }
                    }).done(function(){

                    });                    
                }
            }
        }
        
        var blockElement = $(this);
        var isYearlyOffer = element.hasClass('oneTimeYearlyOffer');
        var isCouple = element.hasClass('coupleOffer');
        var isCoupleHigh = isCouple && element.hasClass('hg');
        
        if(typeof selectedElement.data('title') !== 'undefined') {
            $('.current-offer-title').html(selectedElement.data('title') + '<span class=\'bundle-trademark\'>TM</span>');
        }
        
        if(typeof selectedElement.data('subtitle') !== 'undefined') {
            $('.current-offer-subtitle').html(selectedElement.data('subtitle'));
        }
        
        if(typeof selectedElement.data('subtitle-second') !== 'undefined' && selectedElement.data('subtitle-second').length) {
            $('.current-offer-subtitle-second').html(selectedElement.data('subtitle-second')).show();
        }
        else {
            $('.current-offer-subtitle-second').hide();
        }

        if(typeof selectedElement.data('subtitle-third') !== 'undefined' && selectedElement.data('subtitle-third').length) {
            $('.current-offer-subtitle-third').html(selectedElement.data('subtitle-third')).show();
        }
        else {
            $('.current-offer-subtitle-third').hide();
        }

        if(typeof selectedElement.data('description') !== 'undefined') {
            $('.current-offer-description').html(selectedElement.data('description'));
        }
        
        if(typeof selectedElement.data('offer_type') !== 'undefined') {
            $('#recurlyPaymentForm .payment-screen-review').addClass(selectedElement.data('offer_type'));
        }
        
        if(typeof selectedElement.data('total_amount') !== 'undefined') {
            $('.current-offer-total_amount').data('price', selectedElement.data('total_amount'));
            $('.current-offer-total_amount').html(selectedElement.data('total_amount'));
        }
        else {
            $('.current-offer-total_amount').data('price', '');
            $('.current-offer-total_amount').html('');
        }
        
        if(typeof selectedElement.data('currency') !== 'undefined') {
            $('.current-offer-currency').html(selectedElement.data('currency'));
        }
        else {
            $('.current-offer-currency').html('');
        }

        if(typeof selectedElement.data('total_description') !== 'undefined') {
            $('.current-offer-total_description').html(selectedElement.data('total_description'));
        }
        else {
            $('.current-offer-total_description').html('');
        }

        if(typeof selectedElement.data('coupon_code') !== 'undefined' && selectedElement.data('coupon_code') !== '') {
            $('#current-offer-coupon_code').html(selectedElement.data('coupon_code'));
            $('.discount-button-paypal, .discount-button-credit').show();
        }
        else {
            $('.discount-button-paypal, .discount-button-credit').hide();
        }

        if(typeof selectedElement.data('coupon_code_description') !== 'undefined') {
            $('.current-offer-coupon_code_description').html(selectedElement.data('coupon_code_description'));
        }
        
        if(typeof selectedElement.data('action_button_text') !== 'undefined') {
            $('#submit-payment button').html(selectedElement.data('action_button_text'));
        }
        
        if(typeof selectedElement.data('action_button_text') !== 'undefined') {
            $('#submit-payment button').html(selectedElement.data('action_button_text'));
        } else {
            $('#submit-payment button').html('Subscribe');
        }
        
        if(typeof selectedElement.data('payment_popup_description_title') !== 'undefined') {
            $('#recurlyPaymentForm .review-plan').html(selectedElement.data('payment_popup_description_title'));
            $('#recurlyPaymentForm .review-plan').html('Review Your Plan');
        } else {
            $('#recurlyPaymentForm .review-plan').html('Review Your Plan');
        }
           
           // Maintenance offer
        if (element.hasClass('maintenanceOffer')) {
            var
            options = {
                maintenance: {
                    plan: element.data('plan'),
                    day: element.data('day'),
                    room_id: element.data('room'),
                    maintanacePlan: 1,
                    isOnMyAccountPage : isOnMyAccountPage,
                    campaignId : recurlyNamespace.campaignId
                }
            },
            subscriptionType = ( options.maintenance.plan == 'monthly' ? 't_yourchoicetherapy_monthly' : 't_yourchoicetherapy_quarterly' );
            switch(options.maintenance.plan) {
                case 'couple_monthly':
                    subscriptionType = 'messaging_couple_maintenance_monthly';
                    break;
                case 'couple_quarterly':
                    subscriptionType = 'messaging_couple_maintenance_quarterly';
                    break;
                case 'monthly':
                    subscriptionType = 't_yourchoicetherapy_monthly';
                    break;
                default :
                    subscriptionType = 't_yourchoicetherapy_quarterly';
            } 
            
            element.next('.subscribeInfo').remove();
            subscriptionTypeText = "Therapy " + element.data('day') + '&trade;';
            
            recurlyNamespace.showPaymentForm(subscriptionType, blockElement, options);            
            return;
        }
        
        if (!element.hasClass('oneTimeOffer') && selectedElement.length == 1 || element.hasClass('oneTimeExpire') || element.hasClass('singleOffer')) {
            if (selectedElement.hasClass('week')) {
                recurlyNamespace.showPaymentForm('_weekly', element);

                if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                    paymentPopupCoolaData("offer", "weekly");
                }                            
            } else if (selectedElement.hasClass('month') || element.hasClass('oneTimeExpire')) {
                recurlyNamespace.showPaymentForm('_monthly', element);

                if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                    paymentPopupCoolaData("offer", "monthly");
                }
            } else if (selectedElement.hasClass('year')) {
                recurlyNamespace.showPaymentForm('messaging_subscription_regular_year_high', element);

                if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                    paymentPopupCoolaData("offer", "yearly");
                }
            } else if (selectedElement.hasClass('week12') || element.hasClass('week12')) {
                recurlyNamespace.showPaymentForm('_12weeks', element);

                if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                    paymentPopupCoolaData("offer", "quarterly");
                }
            } else if (selectedElement.hasClass('silver-monthly') || element.hasClass('silver-monthly')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Silver_Monthly', element);
            } else if (selectedElement.hasClass('gold-monthly') || element.hasClass('gold-monthly')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Gold_Monthly', element);
            } else if (selectedElement.hasClass('platinum-monthly') || element.hasClass('platinum-monthly')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Platinum_Monthly', element);
            } else if (selectedElement.hasClass('month-planh')) {
                recurlyNamespace.showPaymentForm('messaging_subscription_regular_monthly_high', element);
            } else if (selectedElement.hasClass('quarterly-planh')) {
                recurlyNamespace.showPaymentForm('messaging_subscription_regular_quarterly_high', element);
            } else if (element.hasClass('quarterly-social-media')) {
                recurlyNamespace.showPaymentForm('messaging_subscription_social_media_quarterly', element);
            } else if (selectedElement.hasClass('bundle-0-live-session') || element.hasClass('bundle-0-live-session')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_0_Live_Session', element);
            } else if (selectedElement.hasClass('bundle-1-live-session') || element.hasClass('bundle-1-live-session')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_1_Live_Session', element);
            } else if (selectedElement.hasClass('bundle-4-live-session') || element.hasClass('bundle-4-live-session')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_4_Live_Session', element);
            } else if (selectedElement.hasClass('bundle-0-live-session-3m') || element.hasClass('bundle-0-live-session-3m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_0_Live_Session_3M', element);
            } else if (selectedElement.hasClass('bundle-1-live-session-3m') || element.hasClass('bundle-1-live-session-3m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_1_Live_Session_3M', element);
            } else if (selectedElement.hasClass('bundle-4-live-session-3m') || element.hasClass('bundle-4-live-session-3m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_4_Live_Session_3M', element);
            } else if (selectedElement.hasClass('bundle-0-live-session-6m') || element.hasClass('bundle-0-live-session-6m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_0_Live_Session_6M', element);
            } else if (selectedElement.hasClass('bundle-1-live-session-6m') || element.hasClass('bundle-1-live-session-6m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_1_Live_Session_6M', element);
            } else if (selectedElement.hasClass('bundle-4-live-session-6m') || element.hasClass('bundle-4-live-session-6m')) {
                recurlyNamespace.showPaymentForm('Messaging_Subscription_Bundle_4_Live_Session_6M', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_1_daily_response_128') || element.hasClass('bundle_0_live_session_1_daily_response_128')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_1_Daily_Response_128', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_156') || element.hasClass('bundle_0_live_session_2_daily_responses_156')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_156', element);            
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_196') || element.hasClass('bundle_1_live_session_2_daily_responses_196')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_196', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_1_daily_response_3m_348') || element.hasClass('bundle_0_live_session_1_daily_response_3m_348')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_1_Daily_Response_3M_348', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_3m_420') || element.hasClass('bundle_0_live_session_2_daily_responses_3m_420')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_3M_420', element);            
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_3m_528') || element.hasClass('bundle_1_live_session_2_daily_responses_3m_528')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_3M_528', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_1_daily_response_6m_600') || element.hasClass('bundle_0_live_session_1_daily_response_6m_600')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_1_Daily_Response_6M_600', element);            
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_6m_744') || element.hasClass('bundle_0_live_session_2_daily_responses_6m_744')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_6M_744', element);            
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_6m_936') || element.hasClass('bundle_1_live_session_2_daily_responses_6m_936')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_6M_936', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_396') || element.hasClass('bundle_4_live_sessions_2_daily_responses_396')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Sessions_2_Daily_Responses_396', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_3m_1068') || element.hasClass('bundle_4_live_sessions_2_daily_responses_3m_1068')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Sessions_2_Daily_Responses_3M_1068', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_6m_1896') || element.hasClass('bundle_4_live_sessions_2_daily_responses_6m_1896')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Sessions_2_Daily_Responses_6M_1896', element);
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_196') || element.hasClass('bundle_0_live_session_2_daily_responses_196')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_196', element);
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_236') || element.hasClass('bundle_1_live_session_2_daily_responses_236')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_236', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_316') || element.hasClass('bundle_4_live_sessions_2_daily_responses_316')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Session_2_Daily_Responses_316', element);
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_3m_528') || element.hasClass('bundle_0_live_session_2_daily_responses_3m_528')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_3M_528', element);
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_3m_636') || element.hasClass('bundle_1_live_session_2_daily_responses_3m_636')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_3M_636', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_3m_852') || element.hasClass('bundle_4_live_sessions_2_daily_responses_3m_852')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Sessions_2_Daily_Responses_3M_852', element);
            } else if (selectedElement.hasClass('bundle_0_live_session_2_daily_responses_6m_936') || element.hasClass('bundle_0_live_session_2_daily_responses_6m_936')) {
                recurlyNamespace.showPaymentForm('Bundle_0_Live_Session_2_Daily_Responses_6M_936', element);
            } else if (selectedElement.hasClass('bundle_1_live_session_2_daily_responses_6m_1128') || element.hasClass('bundle_1_live_session_2_daily_responses_6m_1128')) {
                recurlyNamespace.showPaymentForm('Bundle_1_Live_Session_2_Daily_Responses_6M_1128', element);
            } else if (selectedElement.hasClass('bundle_4_live_sessions_2_daily_responses_6m_1512') || element.hasClass('bundle_4_live_sessions_2_daily_responses_6m_1512')) {
                recurlyNamespace.showPaymentForm('Bundle_4_Live_Sessions_2_Daily_Responses_6M_1512', element);
            }else if (selectedElement.hasClass('couples_0_live_sessions_2_daily_responses_316') || element.hasClass('couples_0_live_sessions_2_daily_responses_316')) {
                recurlyNamespace.showPaymentForm('Couples_0_Live_Sessions_2_Daily_Responses_316', element);
            } else if (selectedElement.hasClass('couples_0_live_sessions_2_daily_responses_3m_852') || element.hasClass('couples_0_live_sessions_2_daily_responses_3m_852')) {
                recurlyNamespace.showPaymentForm('Couples_0_Live_Sessions_2_Daily_Responses_3M_852', element);
            } else if (selectedElement.hasClass('teen_0_live_session_2_daily_responses_196') || element.hasClass('teen_0_live_session_2_daily_responses_196')) {
                recurlyNamespace.showPaymentForm('Teen_0_Live_Session_2_Daily_Responses_196', element);
            }
        } 

        if (isYearlyOffer) {
            recurlyNamespace.showPaymentForm('messaging_subscription_regular_year_high', blockElement);

            if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                paymentPopupCoolaData("offer", "yearly");
            }
        } else if (isCouple) {
            var planname = isCoupleHigh ? "couple_quarterly_v2" : "t_couple_quarterly";
            if (element.hasClass('monthly')) {
                planname = isCoupleHigh ? "couple_monthly_v2" : "t_couple_monthly";
            }

            recurlyNamespace.showPaymentForm(planname, blockElement);

            if (typeof newChat === 'undefined' || !newChat.isNewChat) {
                paymentPopupCoolaData("offer", planname);
            }
        }        
        
        if (element.hasClass('oneTimeOffer')) {
            recurlyNamespace.showPaymentForm('', blockElement);
        }
        
    });
}

/**
 * Returns promises objects for tracking scripts
 * needed after a new user buys a private product, or post a public question
 * @returns {Array}
 */
function trackWelcomeEvents() {
    var protocol = 'http:';
    if (location.protocol == 'https:') {
        protocol = location.protocol;
    }

    var
    images = [
        // Google Code for new HP Conversion Page
        '<img class="trackWelcomeEvents" height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/999238654/?value=0&amp;label=iS2QCIKfrwkQ_te83AM&amp;guid=ON&amp;script=0" />',
        // FB Code
        '<img class="trackWelcomeEvents" height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/offsite_event.php?id=6013760834569&amp;value=0&amp;currency=USD" />',
        // 7Search Code for Conversion Page
        '<img class="trackWelcomeEvents" width="1" height="1" border="0" src="' + protocol + '//conversion.7search.com/conversion/v1/?advid=207134&urlid=&type=purchase&value=1&noscript=1" />'
    ],
    promises = [new $.Deferred(), new $.Deferred(), new $.Deferred()],
    insertImage = function(index, image) {
        promises[index].resolve();
        if ($('body > img.trackWelcomeEvents').length < images.length) {
            $('body').append(image);
        }        
    };

    $(images[0]).load(function() { insertImage( 0, $(this) ); });        
    $(images[1]).load(function() { insertImage( 1, $(this) ); });        
    $(images[2]).load(function() { insertImage( 2, $(this) ); });        
    
    // taboola syndication
    window._tfa = window._tfa || []; 
    _tfa.push({notify:"action", name:"registration_successful"}); 
    promises.push( $.getScript(protocol + '//cdn.taboola.com/libtrc/talktala/tfa.js') );
    
    return [];
}

function openWelcomeRegistration(id)
{
    $('#welcomeRegistrationContainer' + id ).dialog("open");
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function createWelcomeRegistrationDialog(id, textWidth)
{
    $('#welcomeRegistrationContainer' + id).dialog({
        dialogClass: 'welcomeAfterRegistration',
        draggable: false,
        resizable: false,
        modal: true,
        autoOpen: false ,
        position: ["center", "center"],
        width: textWidth,
        close: function() {
            if ($('.suggestedPart').length > 0) {
                $(window).scrollTop( $('.suggestedPart').offset().top );
            }
        }
    });

}

function hoverGroupContainer() {
    $('.groupContainer').hover(function() {
        var group = $(this).children('.publicSingleGroop');
        if (!group.hasClass('publicSingleGroopHover')) {
            group.addClass('publicSingleGroopHover');
        }
    }, 
    function() {
        var group = $(this).children('.publicSingleGroop');
            group.removeClass('publicSingleGroopHover');
    })
}

function updateTimestampWithSec(classToUse, seconds) {
    $('.' + classToUse).each( function (index, element) {
        if ($(element).data('timestamp') == undefined) {
            $(element).data('timestamp', parseInt($(element).attr('title')) + seconds);
        } else {
            $(element).data('timestamp', parseInt($(element).data('timestamp')) + seconds);
        }
    });
}
/**
 * check if ClickTaleExec function exists and execute
 * @param string method
 */
function executeClickTaleExec(params)
{
    return false;
}

/**
 * check if ClickTaleEvent function exists and execute
 * @param string method
 */
function executeClickTaleEvent(params)
{
    return false;
}

function fixedCharCodeAt(str, idx) {
    idx = idx || 0;
    var code = str.charCodeAt(idx);
    var hi, low;
    if (0xD800 <= code && code <= 0xDBFF) {
        hi = code;
        low = str.charCodeAt(idx + 1);
        if (isNaN(low)) {
           return false;
        }
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) {
        return false;
    }
    return code;
 };

 function countUtf8(str) {
    var result = 0;
    for (var n = 0; n < str.length; n++) {
        var charCode = fixedCharCodeAt(str, n);
        if (typeof charCode === "number") {
            if (charCode < 128) {
                result = result + 1;
            } else if (charCode < 2048) {
                result = result + 2;
            } else if (charCode < 65536) {
                result = result + 3;
            } else if (charCode < 2097152) {
                result = result + 4;
            } else if (charCode < 67108864) {
                result = result + 5;
            } else {
                result = result + 6;
            }
        }
    }
    return result;
 };
 
 function encode_utf8( s )
 {
   return unescape( encodeURIComponent( s ) );
 }

 function substr_utf8_bytes(str, startInBytes, lengthInBytes) {
     var resultStr = '';
     var startInChars = 0;

     for (bytePos = 0; bytePos < startInBytes; startInChars++) {

         ch = str.charCodeAt(startInChars);
         bytePos += (ch < 128) ? 1 : encode_utf8(str[startInChars]).length;
     }
     end = startInChars + lengthInBytes - 1;

     for (n = startInChars; startInChars <= end; n++) {
         ch = str.charCodeAt(n);
         end -= (ch < 128) ? 1 : encode_utf8(str[n]).length;

         if (encode_utf8(resultStr + str[n]).length <= lengthInBytes) {
             resultStr += str[n];
         }
     }

     return resultStr;
 }


function showPopupCornerIcon(dialog) {
    if ($('#_moneyBackIcon').length == 0) {
        $('body').append('<div class="cornerIconMoneyBack" id="_moneyBackIcon"></div>');
    }
    
    var offset = $(dialog).offset();
    $('#_moneyBackIcon').show();
    $('#_moneyBackIcon').css('top', parseInt(offset.top) - 73);
    $('#_moneyBackIcon').css('left', parseInt(offset.left) - 60 );
    
    $('#_moneyBackIcon').css('z-index', '1010' );
}

function hidePopupCornerIcon() {
    $('#_moneyBackIcon').hide();
}

function publicGroupLinkPage() {
    $('.groupContainer').unbind().bind('click', function(e) {
        window.location.href = '/group/' + $(this).children('.publicSingleGroop').attr('id');
    });
}

function calculateSliderDimensions() {
    var dimension = Math.max(1280, $(window).width());
    $('.sliderContentPage').css('width', dimension + 'px');
    $('#sliderContainer').css('left', '-'+dimension + 'px');
    $('.sliderImage').css('max-width',dimension + 'px');
}

function activateSlider() {
    clearTimeout(sliderTimer);
    var dimension = Math.max(1280, $(window).width());
    $('#sliderContainer').animate({
        left: "-=" + dimension+ "px"
    }, 1000, function() {
        $('#sliderContainer').css('left', '-'+dimension + 'px');
        $('#sliderContainer').append($('.sliderContentPage')[0]);
        sliderTimer = setTimeout(activateSlider, 5000);
    });
}


function GetSWF(strName) {
    if (window.document[strName] != null)
        if (window.document[strName].length == null)
            return window.document[strName];
        else
            return window.document[strName][1];
}

function addInputInlineLabel(inputSelector, content) {
    // var height = $('#' + inputSelector).height();
    var width = $('#' + inputSelector).width();
    width = width + 10;
    $('#' + inputSelector).after('<span class="inputInlineLabel" id="inlineLabelFor'+inputSelector+'" style="left: -'+ width +'px;">'+content+'</span>');
    $('#' + inputSelector).live('focus', function() {
        $('#inlineLabelFor' + inputSelector).hide();
    });
    $('#inlineLabelFor' + inputSelector).live('click', function() {
        $('#inlineLabelFor' + inputSelector).hide();
        $('#' + inputSelector).focus();
    });
    $('#' + inputSelector).live('click', function() {
        $('#inlineLabelFor' + inputSelector).hide();
        $('#' + inputSelector).focus();
    });
    $('#' + inputSelector).live('blur', function() {
        if ($('#' + inputSelector).val() == '') {
            $('#inlineLabelFor' + inputSelector).show();
        }
    });
    $(window).load(function(){ 
    	if ( $('#' + inputSelector).val() != '') {
	    	$('#inlineLabelFor' + inputSelector).hide();
    	}
    });
   
}

function placeholderIsSupported() {
    var test = document.createElement('input');
    return ('placeholder' in test);
}

function addInputBlockLabel(inputSelector, content) {
    if (placeholderIsSupported()) {
        return;
    }

    if (typeof inputSelector === "object" && inputSelector.length > 0) {
        var inputObject = inputSelector;
        var inputIdString = inputObject.attr('id');
    }

    if (typeof inputSelector === "string") {
        var inputObject = $('#' + inputSelector);
        var inputIdString = inputSelector;
    } 
    if (inputObject.length <= 0) {
        return;
    }

    //remove labelObject if already exists
    var labelObject = inputObject.next('.inputInlineLabel');
    if (labelObject.length > 0 ) {
        labelObject.remove();
    }

    var height = inputObject.height();
    //var width = $('#' + inputSelector).width();
    inputObject.after('<span class="inputInlineLabel" id="inlineLabelFor'+inputIdString+'" style="top: -'+ height +'px; left:10px">'+content+'</span>');
    var labelObject = inputObject.next('.inputInlineLabel');
    if ($.trim(inputObject.val()) != "") {
        labelObject.hide();
    }

    inputObject.live('focus', function() {
        labelObject.hide();
    });

    labelObject.bind('click', function() {
        labelObject.hide();
        inputObject.focus();
    });

    inputObject.live('click', function() {
        labelObject.hide();
        inputObject.focus();
    });

    inputObject.live('blur', function() {
        if (inputObject.val() == '') {
            labelObject.show();
        }
    });
    
    inputObject.live("focus", function(){
        if (inputObject.hasClass('errorField')){
            inputObject.removeClass('errorField');
        }
    });

    $(window).load(function(){ 
        if ( inputObject.val() != '') {
            labelObject.hide();
        }
    });
   
}

function getCurrentUserTimezoneDisplay() {
	var map = {};
	map['0'] = 'GMT Greenwich Mean Time';
	map['-60'] = 'GMT +01:00 Amsterdam, Berlin, Paris';
	map['-120'] = 'GMT +02:00 Athens, Istanbul, Israel';
	map['-180'] = 'GMT +03:00 Baghdad, Moscow, Nairobi';
	map['-210'] = 'GMT +03:30 Tehran';
	map['-240'] = 'GMT +04:00 Abu Dhabi, Muscat';
	map['-270'] = 'GMT +04:30 Kabul';
	map['-300'] = 'GMT +05:00 Islamabad, Karachi';
	map['-330'] = 'GMT +05:30 Mumbai, New Delhi';
	map['-345'] = 'GMT +05:45 Kathmandu, Nepal';
	map['-360'] = 'GMT +06:00 North Central Asia';
	map['-390'] = 'GMT +06:30 Rangoon';
	map['-420'] = 'GMT +07:00 Bangkok, Hanoi, Jakarta';
	map['-480'] = 'GMT +08:00 Beijing, Singapore, Taipei';
	map['-540'] = 'GMT +09:00 Tokyo, Seoul, Korea';
	map['-570'] = 'GMT +09:30 Adelaide, Darwin';
	map['-600'] = 'GMT +10:00 Sydney, Brisbane, Melbourne';
	map['-660'] = 'GMT +11:00 New Caledonia';
	map['-720'] = 'GMT +12:00 Auckland, Fiji Islands';
	map['-780'] = 'GMT +13:00 Nuku\'alofa, Tonga';
	map['60'] = 'GMT -01:00 Azores, Cape Verde';
	map['120'] = 'GMT -02:00 Mid-Atlantic';
	map['180'] = 'GMT -03:00 Brasilia, Buenos Aires';
	map['210'] = 'GMT -03:30 Newfoundland';
	map['240'] = 'GMT -04:00 Caracas, La Paz, Santiago';
	map['300'] = 'GMT -05:00 Eastern Time (US & Canada)';
	map['360'] = 'GMT -06:00 Central Time (US & Canada)';
	map['420'] = 'GMT -07:00 Mountain Time (US & Canada)';
	map['480'] = 'GMT -08:00 Pacific Time (US & Canada)';
	map['540'] = 'GMT -09:00 Alaska';
	map['600'] = 'GMT -10:00 Hawai';
	map['660'] = 'GMT -11:00 Midway Island, Samoa';
	map['720'] = 'GMT -12:00 Eniwetok, Kwajalein'; 
	
	var offset = getTimezoneOffsetWhithoutDst();
	return map[offset] == undefined ? '' : map[offset];
}

function getTimezoneOffsetWhithoutDst() {
	var newDate = new Date();
	var jan = new Date(newDate.getFullYear(), 0, 1);
	var jul = new Date(newDate.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

function hideMessage(passwordInputField){
    if( $('#' + passwordInputField).val() != '') {
		$('#inlineLabelFor' + passwordInputField).hide();
    }
}
function prefillCurrentTime() {
    var d = new Date();
    
    var gmtHours = -d.getTimezoneOffset()/60;
    
    var htmlText = '';
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var amPm = 'AM';
    if (hours >= 12) {
        amPm = 'PM';
        hours -= 12;
        if (hours == 0) {
            hours = 12;
        }
    } else {
        if (hours == 0) {
            hours = 12;
        }
    }

    htmlText = '' + ((hours < 10)?('0'):('')) + hours + ':' + ((minutes < 10)?('0'):('')) + minutes + ' ' + amPm;
    $('.current_time_prefill').html(htmlText);
    $('#selected_timezone').html(gmtHours);
}

/**
 * format and replace timestamp with a date
 * @param string classToUse search element with class to get timestamp
 * @param string format how the date should formated
 */
function showClientTimeFromUTC(classToUse, format) {
	
    if (classToUse == undefined ) {
        classToUse = '_UTC_time';
    }

    if (format == undefined) {
        format = '%l, %d %F %Y at %g:%i%a';
    }
	
    $('.' + classToUse).each( function (index, element) {
    	var timestamp = $(element).text();
    	var formatedDate = jsDate(format, timestamp);
        $(element).html(formatedDate);
        $(element).removeClass(classToUse);
    });
}

/**
 * Function to format a timestamp
 * accepted format modifiers: 
    %d - day
    %dd - day
    %D - day name (3 letters)
    %l - day name (full)
    %S - day suffix (st, nd, rd, th)
    %F - month name (full)
    %M - month name (3 letters)
    %m - month
    %Y - year
    %a - time suffix lowercase letters (am/pm) 
    %A - time suffix uppercase letters (AM/PM)
    %g - hours (12 hours format)
    %G - hours (24 hours format)
    %i - minutes
    %s - seconds
 */
function jsDate(format, timestamp) {
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var monthNames=new Array(12);
    monthNames[0]="January";
    monthNames[1]="February";
    monthNames[2]="March";
    monthNames[3]="April";
    monthNames[4]="May";
    monthNames[5]="June";
    monthNames[6]="July";
    monthNames[7]="August";
    monthNames[8]="September";
    monthNames[9]="October";
    monthNames[10]="November";
    monthNames[11]="December";
    
    // the initial date
    var d = new Date(parseInt(timestamp) * 1000);

    // time information
    var seconds = d.getSeconds();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var suffix = "am";
    if (hours >= 12) {
        suffix = "pm";
        hours = hours - 12;
    }
    if (hours == 0) {
        hours = 12;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    
    // date information
    var day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var dayOrdinalSuffix = 'th';
    if (1 == day % 10) {
        dayOrdinalSuffix = 'st';
    } else if (2 == day % 10) {
        dayOrdinalSuffix = 'nd';
    } else if (3 == day % 10) {
        dayOrdinalSuffix = 'rd';
    }
    var dayOfWeek = d.getDay();
    var month = d.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    var year = d.getFullYear();
    

    var finalText = format;
    // date information
    finalText = finalText.replace("%dd", d.getDate());
    finalText = finalText.replace("%d", day);
    finalText = finalText.replace("%D", weekday[dayOfWeek].substr(0, 3).ucWords());
    finalText = finalText.replace("%l", weekday[dayOfWeek].ucWords());
    finalText = finalText.replace("%S", dayOrdinalSuffix);
    finalText = finalText.replace("%F", monthNames[d.getMonth()]);
    finalText = finalText.replace("%M", monthNames[d.getMonth()].substr(0, 3));
    finalText = finalText.replace("%m", month);
    finalText = finalText.replace("%Y", year);
    // time information
    finalText = finalText.replace("%a", suffix);
    finalText = finalText.replace("%A", suffix.toUpperCase());
    finalText = finalText.replace("%g", hours);
    finalText = finalText.replace("%G", d.getHours());
    finalText = finalText.replace("%i", minutes);
    finalText = finalText.replace("%s", seconds);
    
    return finalText;
    
}

/**
 * You first need to create a formatting function to pad numbers to two digits
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/**
 * and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

Date.prototype.utcToMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

String.prototype.ucWords = function() {
    return (this + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
    });
}

String.prototype.initialLetter = function() {
    return this.charAt(0).toUpperCase();
}

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}


/**
 * converted stringify() to jQuery plugin.
 * serializes a simple object to a JSON formatted string.
 * Note: stringify() is different from jQuery.serialize() which URLEncodes form elements

 * UPDATES:
 *      Added a fix to skip over Object.prototype members added by the prototype.js library
 * USAGE:
 *  jQuery.ajax({
 *	    data : {serialized_object : jQuery.stringify (JSON_Object)},
 *		success : function (data) {
 *
 *		}
 *   });
 *
 * CREDITS: http://blogs.sitepointstatic.com/examples/tech/json-serialization/json-serialization.js
 */
jQuery.extend({
    stringify  : function stringify(obj) {
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

var _openMembershipPopupNs = {
	membership: false,
	openMembershipDialog: function () {
	    $('#membershipInformation').dialog({
	        resizable: false,
	        width: 965,
	        modal: true,
	        autoOpen: !_openMembershipPopupNs.membership,
	        closeOnEscape: false ,
	        dialogClass:'membershipDialog',
	        position:['center'] ,
	        open: function(evenet, ui) {
	            $('.membershipDialog .ui-dialog-titlebar').hide();
	            var scroolTop =  $(window).scrollTop();
	            var newTop = scroolTop + 50;
	            var popupHeight = $('#membershipInformation').parents('.ui-dialog').height();
	            var offsetBottom = popupHeight - $(window).height() + 70;
	            $('.ui-widget-overlay').height($('.ui-widget-overlay').height() + offsetBottom);

                openPopup($('#membershipInformation'));
                $('#membershipInformation').parents('.ui-dialog').css('top',newTop);
	        }
	    });
	    
	    if(_openMembershipPopupNs.membership) {
	        $('#membershipInformation').find('#'+_openMembershipPopupNs.membership).click();
	    }
	    
	}
};

function openMembershipPopup(type, membershipChosen, errorElem)
{	
	$('#membershipInformation').remove();
	if ($('body').data('isLoadingMembershipDialog')) {
	    return;
	}
	$('body').data('isLoadingMembershipDialog', true);
	$.ajax({
		type: 'POST',
		url: '/public/get-membership-dialog',
		cache: false,
		data: {
			dialogType: type
		}
	})
	.done(function(data) {
        if(data != "") {
            $('body').append(data);
            _openMembershipPopupNs.membership = membershipChosen;
            _openMembershipPopupNs.openMembershipDialog();
        }
        else if(errorElem != null) {
        	errorElem.html(data.message).show();
        }
	})	
	.complete(function(){
	    $('body').data('isLoadingMembershipDialog', false);
	});
}

function submitQuestionnaire(redirectLink)
{
    if (typeof redirectLink == 'string' && redirectLink.length > 0) {
        window.location.href = redirectLink;
    } else {
        $('#questionnaire').dialog('close');
        openRegistrationPopup();
    }
    
}

function openQuestionnaireDialog(userId, link)
{
    $('#questionnaire').dialog({
        modal: true,
        autoOpen: true,
        width: 760,
        position: ["center", "center"],
        resizable: false,
        dialogClass: 'popupBackgroundPattern popupNoButton',
        closeOnEscape: false,
        open: function(){
            $('#stepNumberQuestionnaire').html(parseInt($('#stepNumber').html()) + 1);
            $('#user_id').val(userId);
            $('.ui-dialog-titlebar, .ui-dialog-title').hide();
            $('#questionnaire').removeClass('ui-widget-content');
            $('#skipQuestionnaire').bind('click', function(e){
                e.preventDefault();
                submitQuestionnaire(link);
            });
            $('#submitQuestionnaire').bind('click', function(e){
                e.preventDefault();
                $.post('/public/submit-questionnaire', $('#qForm').serialize(), function(response) {
                    submitQuestionnaire(link);
                });
            });
            $('.closeQuestionnaire').bind('click',function(){
                submitQuestionnaire(link);
            });
            $('#otherInputCheckbox').bind('click', function(){
                if($(this).is(':checked')) {
                    $('#otherInputText').removeAttr('disabled');
                    $('#otherInputText').focus();
                } else {
                    $('#otherInputText').attr('disabled','disabled');
                }
            });
        },
        close: function(){
            $('#questionnaire').remove();
        }
    });	
    
}

var
_checkPrivateTalkStatusNs = {
	purchaseProductInstance: null
},
_checkPrivateTalkStatusArgs = [],
_checkPrivateTalkHitCallback = false;
function checkPrivateTalkStatus(privateChatId, privateChatType, popupPayemnt, userId, isRegistered) {
	_checkPrivateTalkStatusArgs = arguments;
    $(".processingLayer").css("display","block");
    $.ajax({
        dataType: 'json',
        type: 'POST',
        url: "/public/private-chat-status",
        data: {
            'privateChatId':privateChatId
        },
        success: function(msg){
            if (msg.active != true) {
                setTimeout(function() {
                    checkPrivateTalkStatus(privateChatId, privateChatType, popupPayemnt, userId, isRegistered);
                }, 5 * 1000);
            } else {
                if ($('#privateTalkId').length > 0 && isRegistered == false) {
                    $('#privateTalkId').val(privateChatId);
                }
                
                var ctEvent = 'payment-1-on-1-question-success';
                if (privateChatType == "single_week") {
                	ctEvent = 'payment-1-on-1-single-week-success';
                } else if (privateChatType == "weekly_subscription") {
                	ctEvent = 'payment-1-on-1-subscription-success';
                }

                	
            	// Google AdWords Conversion Tracking Code for 1-on-1 Question/Chat successfull payment
            	var trackingPixelImage = '<img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/999238654/?value=9&amp;label=nilCCIqEgQoQ_te83AM&amp;guid=ON&amp;script=0"/>';
            	$(trackingPixelImage).load(function() {
            	    $('body').append( $(this) );
            	    
            	    
                    var redirectLink = window.location.protocol + '//' + window.location.host + "/member/private-chat/index/id/" + privateChatId + "/show_popup/1";
                    // Extend 1-on-1 Question/Chat
                    if (popupPayemnt == false) {
                        window.location.href = redirectLink;
                    } 
                    // Purchase 1-on-1 Question/Chat
                    else {
                        questionText = false;
                        isPaymentOpened = false;
                        $('#processingPaymentPopup').dialog('close');
                        // inline flow
                        if (_checkPrivateTalkStatusNs.purchaseProductInstance) {
                            _checkPrivateTalkStatusNs.purchaseProductInstance.submitPaymentOnSuccess(redirectLink);
                        }
                        // popup flow
                        else {
                            if (isRegistered == true) {
                                window.location.href = redirectLink;
                            } else {
                                registerPopupNamespace.product = ( privateChatType == 'private_question' ? 'Ask a question' : '1-on-1 Chat' );
                                openRegistrationPopup(true);
                            }                               
                        }                        
                    }                	    
            	    
            	}); 

            }
        }
    });
    
}

function openRegistrationPopup() {
	if(typeof registerPopupNamespace != 'undefined') { 
    	registerPopupNamespace.dialog.verticalAlign = true;
    	if (typeof resetRegisterParams != 'undefined') {
    	    registerPopupNamespace.cleanup = resetRegisterParams;
    	}
    	
    	$($('.openRequestParticipantScreen').get(0)).trigger('click', arguments[0]);
	} 	
}

function bind1on1PanelTooltips() {
    $('.questionMarkIcon').mouseenter(function(){
        $(this).siblings('.toolTipShowMore').show();
        $(this).css('padding-bottom', '10px');
    });

    $('.questionMarkIcon').mouseout(function(){
        $(this).siblings('.toolTipShowMore').hide();
        $(this).css('padding-bottom', '0');
    });

    $('.toolTipShowMore').mouseenter(function(e){
        $(this).show();
    });
    $('.toolTipShowMore').bind('click', function(e){
        e.stopPropagation();
        e.preventDefault();
    });

    $('.toolTipShowMore').mouseout(function(event){
        e = event.toElement || event.relatedTarget;
        if (e.parentNode == this || e == this) {
            return;
        }
        $('.questionMarkIcon').css('padding-bottom', '0');
        $(this).hide();
    });	
}

function windowScroll(options) {
    $('html, body').animate({
        scrollTop: options.top
    }, {
        duration: 1000,
        easing: 'swing',
        queue: false,
        complete: function()
        {
            if(options.callback || typeof options.callback == 'function') {
                options.callback(options.callbackParams);
            }
        }

    });     
}

var openPaymentPopupParams = {
	_type: '',
	_dataToSend: {},
	_popupType: {}
};
function openPaymentPopup(type ,dataToSend, container)
{
    var popupType = {
        'sessionType':2,
        'membershipType':1
    }
    
	openPaymentPopupParams._type = type;
	openPaymentPopupParams._dataToSend = dataToSend;    
	openPaymentPopupParams._popupType = popupType;    

    $.post("/member/ajax/billing-form", dataToSend, function(response){
        $('#joinGroupNoCreditPopup').remove();
        sendGoogleTag(response, {'event' : 'openBuyForumMembership'});
        if(response.success === true) {
            $('.allOverpostingPopup').dialog('close');
            $('.allOverpostingPopup').find('.ui-widget-overlay').remove();
            $('body').append(response.message);
            ga('send', 'pageview', '/virtual/popup/payment/unlimited_posts');
            
           
            if (typeof container != "undefined") {
                if (container.length > 0 ) {
                    container.unblock();
                }
            }

            $('#joinGroupNoCreditPopup').dialog({
                resizable: false,
                width: 925,
                modal: true,
                autoOpen: true,
                closeOnEscape: false ,
                dialogClass:'billingFormDialog popupBackgroundPattern',
                position:['center',120] ,
                open: function(evenet, ui) {
                    openPopup($('#joinGroupNoCreditPopup'));
                    $('#coupon_code').blur();
                    $('.toolTipShowMore, .ui-dialog-title, .ui-dialog-titlebar-close').hide();
                    if (type == popupType.sessionType) {
                        showPopupCornerIcon($('#joinGroupNoCreditPopup'));
                    }
                }
            });
            
        }
    });    
}

function toggleShowMoreTherapistRatings(data)
{
	var data = data || {};
	if (data.hasOwnProperty('showMore')) {
		$('.moreContainer #moreRatings').toggle(data.showMore);
	}
}

function openPopup(elem)
{
    if($(window).width() < elem.width()) {
        elem.closest('.ui-dialog').css('left', '0');
    } else {
        elem.dialog({
            position:['center',120] 
        });  
    }
}

function canSubmitChatMessage(errorMessageElem) {
    return (errorMessageElem.data('canSubmit') == true );       
}

function openDialogPopup(elem, isPrivateTalk)
{
    if(isPrivateTalk == true && questionText !== false) {
        var questionTextarea = $('#questionTextarea');
        questionTextarea.val(questionText);//put question before pop-up is open
    }
    elem.dialog('open');

    if(isPrivateTalk == true) {
        var questionTextarea;
        questionTextarea.show();
        element = document.getElementById('questionTextarea');
        element.setSelectionRange(element.value.length,element.value.length);
        if (parseInt(element.style.height) < element.scrollHeight)
        {
            element.style.overflow = 'auto';
            var maxHeight = questionTextarea.css('max-height');
            if (parseInt(maxHeight) < element.scrollHeight)
            {
                questionTextarea.css('height', maxHeight);
            }
        }
        element.scrollTop = element.scrollHeight;
        element.focus();
        questionText = false;
    }
}


function bindForumLinks() {
    $('.clickableSection').unbind().bind('click', function()
    {
        window.location.href = $(this).attr('data-href');
    });
}

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
}

function coolaDataWrapper(coolaDataProperties, userId, sessionId, callbackFunction) {
    var eventName = coolaDataProperties.e;
    if (typeof Tracker === "undefined") {
        if (typeof callbackFunction === "function") {
            callbackFunction.call();
        }
        return false;
    }

    if (arguments.length == 1) {
        Tracker.trackEvent(eventName, coolaDataProperties);
    }
    
    if (typeof callbackFunction !== "function" && arguments.length > 2) {
        Tracker.trackEvent(eventName, userId, sessionId, coolaDataProperties);
    }

    var eventId = eventName + '_event_id';
    if (typeof callbackFunction === "function") {
        Tracker.trackEvent(eventName, userId, sessionId, coolaDataProperties, eventId, callbackFunction);
    }
    return true;
}

var truncateLatestReply = (typeof truncateLatestReply === 'function') ? truncateLatestReply : function() {
    $('.post .reply')
    .expander({
        slicePoint: 140,
        widow: 1,
        preserveWords: false,
        expandPrefix: '',
        expandText: '&hellip;',
        userCollapseText: ''
     })
     .delay(1000)
     .find('a').unbind().click(function(e) {
         e.preventDefault();
         return false;
     });
};

var signInPanel = function() {
    var
    open = function() {
        window.location.href = '/auth/login';
    },
    close = function() {
        $('#loginDrop').hide();
    },
    getElement = function() {
        return $('#loginDrop');
    };
    
    return {
        open: open,
        close: close,
        getElement: getElement
    }
}();



//chrome scrollbar fix
(function( $, undefined ) {
  if ($.ui && $.ui.dialog && $.ui.dialog.overlay) {
    $.ui.dialog.overlay.events = $.map('focus,keydown,keypress'.split(','), function(event) { return event + '.dialog-overlay'; }).join(' ');
  }
}(jQuery));

/**
 * Move caret to end of input or textarea
 * 
 * @param object - input/textarea element
 */
function moveCursorToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

/**
 * Centers an element within the browser's window
 * 
 * @param jQuery object el - element to center
 */
jQuery.fn.center = function() {
    this.css('position', 'absolute');
    this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + 'px');
    this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
    
    return this;
}

jQuery.fn.ajaxLoader = function(state, options) {
    var
    options = options || {},
    defaultOptions = {
        css_class: '',
        alternativePercentageLoader: false
    };
    defaultOptions = $.extend(defaultOptions, options);
    if (!defaultOptions.alternativePercentageLoader) {
        //ajaxLoader for new bundle
        if (this.val() && $(this).hasClass('submitOfferButton') && ($('.offer-container.therapistOfferContainer.bundle-container').hasClass('new_video_bundles') || $('.offer-container.therapistOfferContainer.bundle-container').hasClass('plus_premium_livetalk') || $('.offer-container.therapistOfferContainer.bundle-container').hasClass('2018_new_video_bundles'))) {
            var ajaxLoaderHtml = '<div class="ajaxloader greenButton newBundleButton" onclick="return false;"><a>' + this.val() + '</a> <i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>';
        }
        //ajaxLoader for login/signup
        else if (this.val() && ($('.loginContainer').length || $('.registrationContainer').length)) {
            var ajaxLoaderHtml = '<div class="ajaxloader greenAjaxLoader' + defaultOptions.css_class + '" onclick="return false;"><a>' + this.val() + '</a> <i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>';
        } else if (this.data('button-text') && options.hasOwnProperty('appendLoader')) {
            var ajaxLoaderHtml = '<span class="ajaxloader greenAjaxLoader' + defaultOptions.css_class + '" onclick="return false;"><a>' + this.data('button-text') + '</a> <i class="fa fa-circle-o-notch fa-spin fa-fw"></i></span>';
        }
        //ajaxLoader for left panel section *free subscription*
        else if (this.prop('id')=='startFree') {
            var btnContainer = $(this).find('.button-container:first');
        	if (state == 'show') {
        		btnContainer.append('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>');
        	}
        	else {
        		btnContainer.find('i.fa').remove();        		
        	}
        	return this;
        }
        //ajaxLoader for paymentForm Subscribe
        else if (this.html() === "Change Plan" || this.html() === "Subscribe") {
            var ajaxLoaderHtml = '<div class="ajaxloader greenButton" onclick="return false;" style="height:50px; padding: 16px;"><a>' + $(this).html() + '</a> <i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>';
        }
        //ajaxLoader for all other offers
        else {
            var ajaxLoaderHtml = '<a class="ajaxloader ' + defaultOptions.css_class + '" onclick="return false;"><span class="processingText">processing</span></a>';
        }
    } else {
        var ajaxLoaderHtml = '<a class="ajaxloader ' + defaultOptions.css_class + '" onclick="return false;"><span class="processingText">processing</span></a>';
    }
    
    
    if (state == 'show') {
        this
        .hide()
        .after(ajaxLoaderHtml)
        .next('.ajaxloader')
        .show();
    }
    else {
        this.next('.ajaxloader').remove();
        this.show();
    }    

    return this;
}

function isIosDevice() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function hasFlash() {
    var result = false;
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if(fo) result = true;
    } catch(e) {
      if(navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) result = true;
    }    
    return result;
}

function checkDocumentFocus() {
    if(typeof document.hasFocus === 'undefined') {
        return document.visibilityState == 'visible';
    } else {
        return document.hasFocus();
    }
}


function htmlspecialchars_decode(string, quote_style) {
    //       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
    //      original by: Mirek Slugen
    //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      bugfixed by: Mateusz "loonquawl" Zalega
    //      bugfixed by: Onno Marsman
    //      bugfixed by: Brett Zamir (http://brett-zamir.me)
    //      bugfixed by: Brett Zamir (http://brett-zamir.me)
    //         input by: ReverseSyntax
    //         input by: Slawomir Kaniecki
    //         input by: Scott Cariss
    //         input by: Francois
    //         input by: Ratheous
    //         input by: Mailfaker (http://www.weedem.fr/)
    //       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    //        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
    //        returns 1: '<p>this -> &quot;</p>'
    //        example 2: htmlspecialchars_decode("&amp;quot;");
    //        returns 2: '&quot;'

    var optTemp = 0,
      i = 0,
      noquotes = false;
    if (typeof quote_style === 'undefined') {
      quote_style = 2;
    }
    string = string.toString()
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    var OPTS = {
      'ENT_NOQUOTES': 0,
      'ENT_HTML_QUOTE_SINGLE': 1,
      'ENT_HTML_QUOTE_DOUBLE': 2,
      'ENT_COMPAT': 2,
      'ENT_QUOTES': 3,
      'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
      noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
      quote_style = [].concat(quote_style);
      for (i = 0; i < quote_style.length; i++) {
        // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
        if (OPTS[quote_style[i]] === 0) {
          noquotes = true;
        } else if (OPTS[quote_style[i]]) {
          optTemp = optTemp | OPTS[quote_style[i]];
        }
      }
      quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
      string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
      // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
    }
    if (!noquotes) {
      string = string.replace(/&quot;/g, '"');
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&');

    return string;
  }
function strip_tags(input, allowed) {
    allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
          commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '')
        .replace(tags, function($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
}


jQuery.fn.serializeObject = function() {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function() {
      var value;

      if (this.value != null) {
        value = this.value;
      } else {
        value = '';
      }

      if (objectData[this.name] != null) {
        if (!objectData[this.name].push) {
          objectData[this.name] = [objectData[this.name]];
        }

        objectData[this.name].push(value);
      } else {
        objectData[this.name] = value;
      }
    });

    return objectData;
  };
