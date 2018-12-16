;(function(root,factory){'use strict';if(typeof module==='object'&&typeof module.exports==='object'){module.exports=factory(root,document);}else if(typeof define==='function'&&define.amd){define([],function(){return factory(root,document);});}else{root.plyr=factory(root,document);}}(typeof window!=='undefined'?window:this,function(window,document){'use strict';var fullscreen,scroll={x:0,y:0},defaults={enabled:true,debug:false,autoplay:false,loop:false,seekTime:10,volume:10,volumeMin:0,volumeMax:10,volumeStep:1,duration:null,displayDuration:true,loadSprite:true,iconPrefix:'plyr',iconUrl:'https://cdn.plyr.io/2.0.11/plyr.svg',clickToPlay:true,hideControls:true,showPosterOnEnd:false,disableContextMenu:true,keyboardShorcuts:{focused:true,global:false},tooltips:{controls:false,seek:true},selectors:{html5:'video, audio',embed:'[data-type]',editable:'input, textarea, select, [contenteditable]',container:'.plyr',controls:{container:null,wrapper:'.plyr__controls'},labels:'[data-plyr]',buttons:{seek:'[data-plyr="seek"]',play:'[data-plyr="play"]',pause:'[data-plyr="pause"]',restart:'[data-plyr="restart"]',rewind:'[data-plyr="rewind"]',forward:'[data-plyr="fast-forward"]',mute:'[data-plyr="mute"]',captions:'[data-plyr="captions"]',fullscreen:'[data-plyr="fullscreen"]'},volume:{input:'[data-plyr="volume"]',display:'.plyr__volume--display'},progress:{container:'.plyr__progress',buffer:'.plyr__progress--buffer',played:'.plyr__progress--played'},captions:'.plyr__captions',currentTime:'.plyr__time--current',duration:'.plyr__time--duration'},classes:{setup:'plyr--setup',ready:'plyr--ready',videoWrapper:'plyr__video-wrapper',embedWrapper:'plyr__video-embed',type:'plyr--{0}',stopped:'plyr--stopped',playing:'plyr--playing',muted:'plyr--muted',loading:'plyr--loading',hover:'plyr--hover',tooltip:'plyr__tooltip',hidden:'plyr__sr-only',hideControls:'plyr--hide-controls',isIos:'plyr--is-ios',isTouch:'plyr--is-touch',captions:{enabled:'plyr--captions-enabled',active:'plyr--captions-active'},fullscreen:{enabled:'plyr--fullscreen-enabled',active:'plyr--fullscreen-active'},tabFocus:'tab-focus'},captions:{defaultActive:false},fullscreen:{enabled:true,fallback:true,allowAudio:false},storage:{enabled:true,key:'plyr'},controls:['play-large','play','progress','current-time','mute','volume','captions','fullscreen'],i18n:{restart:'Restart',rewind:'Rewind {seektime} secs',play:'Play',pause:'Pause',forward:'Forward {seektime} secs',played:'played',buffered:'buffered',currentTime:'Current time',duration:'Duration',volume:'Volume',toggleMute:'Toggle Mute',toggleCaptions:'Toggle Captions',toggleFullscreen:'Toggle Fullscreen',frameTitle:'Player for {title}'},types:{embed:['youtube','vimeo','soundcloud'],html5:['video','audio']},urls:{vimeo:{api:'https://player.vimeo.com/api/player.js',},youtube:{api:'https://www.youtube.com/iframe_api'},soundcloud:{api:'https://w.soundcloud.com/player/api.js'}},listeners:{seek:null,play:null,pause:null,restart:null,rewind:null,forward:null,mute:null,volume:null,captions:null,fullscreen:null},events:['ready','ended','progress','stalled','playing','waiting','canplay','canplaythrough','loadstart','loadeddata','loadedmetadata','timeupdate','volumechange','play','pause','error','seeking','seeked','emptied'],logPrefix:'[Plyr]'};function _browserSniff(){var ua=navigator.userAgent,name=navigator.appName,fullVersion=''+parseFloat(navigator.appVersion),majorVersion=parseInt(navigator.appVersion,10),nameOffset,verOffset,ix,isIE=false,isFirefox=false,isChrome=false,isSafari=false;if((navigator.appVersion.indexOf('Windows NT')!==-1)&&(navigator.appVersion.indexOf('rv:11')!==-1)){isIE=true;name='IE';fullVersion='11';}else if((verOffset=ua.indexOf('MSIE'))!==-1){isIE=true;name='IE';fullVersion=ua.substring(verOffset+5);}else if((verOffset=ua.indexOf('Chrome'))!==-1){isChrome=true;name='Chrome';fullVersion=ua.substring(verOffset+7);}else if((verOffset=ua.indexOf('Safari'))!==-1){isSafari=true;name='Safari';fullVersion=ua.substring(verOffset+7);if((verOffset=ua.indexOf('Version'))!==-1){fullVersion=ua.substring(verOffset+8);}}else if((verOffset=ua.indexOf('Firefox'))!==-1){isFirefox=true;name='Firefox';fullVersion=ua.substring(verOffset+8);}else if((nameOffset=ua.lastIndexOf(' ')+1)<(verOffset=ua.lastIndexOf('/'))){name=ua.substring(nameOffset,verOffset);fullVersion=ua.substring(verOffset+1);if(name.toLowerCase()===name.toUpperCase()){name=navigator.appName;}}
if((ix=fullVersion.indexOf(';'))!==-1){fullVersion=fullVersion.substring(0,ix);}
if((ix=fullVersion.indexOf(' '))!==-1){fullVersion=fullVersion.substring(0,ix);}
majorVersion=parseInt(''+fullVersion,10);if(isNaN(majorVersion)){fullVersion=''+parseFloat(navigator.appVersion);majorVersion=parseInt(navigator.appVersion,10);}
return{name:name,version:majorVersion,isIE:isIE,isFirefox:isFirefox,isChrome:isChrome,isSafari:isSafari,isIos:/(iPad|iPhone|iPod)/g.test(navigator.platform),isIphone:/(iPhone|iPod)/g.test(navigator.userAgent),isTouch:'ontouchstart'in document.documentElement};}
function _supportMime(plyr,mimeType){var media=plyr.media;if(plyr.type==='video'){switch(mimeType){case 'video/webm':return!!(media.canPlayType&&media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/,''));case 'video/mp4':return!!(media.canPlayType&&media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/,''));case 'video/ogg':return!!(media.canPlayType&&media.canPlayType('video/ogg; codecs="theora"').replace(/no/,''));}}else if(plyr.type==='audio'){switch(mimeType){case 'audio/mpeg':return!!(media.canPlayType&&media.canPlayType('audio/mpeg;').replace(/no/,''));case 'audio/ogg':return!!(media.canPlayType&&media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/,''));case 'audio/wav':return!!(media.canPlayType&&media.canPlayType('audio/wav; codecs="1"').replace(/no/,''));}}
return false;}
function _injectScript(source){if(document.querySelectorAll('script[src="'+source+'"]').length){return;}
var tag=document.createElement('script');tag.src=source;var firstScriptTag=document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);}
function _inArray(haystack,needle){return Array.prototype.indexOf&&(haystack.indexOf(needle)!==-1);}
function _replaceAll(string,find,replace){return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g,'\\$1'),'g'),replace);}
function _wrap(elements,wrapper){if(!elements.length){elements=[elements];}
for(var i=elements.length-1;i>=0;i--){var child=(i>0)?wrapper.cloneNode(true):wrapper;var element=elements[i];var parent=element.parentNode;var sibling=element.nextSibling;child.appendChild(element);if(sibling){parent.insertBefore(child,sibling);}else{parent.appendChild(child);}
return child;}}
function _remove(element){if(!element){return;}
element.parentNode.removeChild(element);}
function _prependChild(parent,element){parent.insertBefore(element,parent.firstChild);}
function _setAttributes(element,attributes){for(var key in attributes){element.setAttribute(key,(_is.boolean(attributes[key])&&attributes[key])?'':attributes[key]);}}
function _insertElement(type,parent,attributes){var element=document.createElement(type);_setAttributes(element,attributes);_prependChild(parent,element);}
function _getClassname(selector){return selector.replace('.','');}
function _toggleClass(element,className,state){if(element){if(element.classList){element.classList[state?'add':'remove'](className);}else{var name=(' '+element.className+' ').replace(/\s+/g,' ').replace(' '+className+' ','');element.className=name+(state?' '+className:'');}}}
function _hasClass(element,className){if(element){if(element.classList){return element.classList.contains(className);}else{return new RegExp('(\\s|^)'+className+'(\\s|$)').test(element.className);}}
return false;}
function _matches(element,selector){var p=Element.prototype;var f=p.matches||p.webkitMatchesSelector||p.mozMatchesSelector||p.msMatchesSelector||function(s){return[].indexOf.call(document.querySelectorAll(s),this)!==-1;};return f.call(element,selector);}
function _proxyListener(element,eventName,userListener,defaultListener,useCapture){_on(element,eventName,function(event){if(userListener){userListener.apply(element,[event]);}
defaultListener.apply(element,[event]);},useCapture);}
function _toggleListener(element,events,callback,toggle,useCapture){var eventList=events.split(' ');if(!_is.boolean(useCapture)){useCapture=false;}
if(element instanceof NodeList){for(var x=0;x<element.length;x++){if(element[x]instanceof Node){_toggleListener(element[x],arguments[1],arguments[2],arguments[3]);}}
return;}
for(var i=0;i<eventList.length;i++){element[toggle?'addEventListener':'removeEventListener'](eventList[i],callback,useCapture);}}
function _on(element,events,callback,useCapture){if(element){_toggleListener(element,events,callback,true,useCapture);}}
function _event(element,type,bubbles,properties){if(!element||!type){return;}
if(!_is.boolean(bubbles)){bubbles=false;}
var event=new CustomEvent(type,{bubbles:bubbles,detail:properties});element.dispatchEvent(event);}
function _toggleState(target,state){if(!target){return;}
state=(_is.boolean(state)?state:!target.getAttribute('aria-pressed'));target.setAttribute('aria-pressed',state);return state;}
function _getPercentage(current,max){if(current===0||max===0||isNaN(current)||isNaN(max)){return 0;}
return((current/max)*100).toFixed(2);}
function _extend(){var objects=arguments;if(!objects.length){return;}
if(objects.length===1){return objects[0];}
var destination=Array.prototype.shift.call(objects),length=objects.length;for(var i=0;i<length;i++){var source=objects[i];for(var property in source){if(source[property]&&source[property].constructor&&source[property].constructor===Object){destination[property]=destination[property]||{};_extend(destination[property],source[property]);}else{destination[property]=source[property];}}}
return destination;}
var _is={object:function(input){return input!==null&&typeof(input)==='object';},array:function(input){return input!==null&&(typeof(input)==='object'&&input.constructor===Array);},number:function(input){return input!==null&&(typeof(input)==='number'&&!isNaN(input-0)||(typeof input==='object'&&input.constructor===Number));},string:function(input){return input!==null&&(typeof input==='string'||(typeof input==='object'&&input.constructor===String));},boolean:function(input){return input!==null&&typeof input==='boolean';},nodeList:function(input){return input!==null&&input instanceof NodeList;},htmlElement:function(input){return input!==null&&input instanceof HTMLElement;},function:function(input){return input!==null&&typeof input==='function';},undefined:function(input){return input!==null&&typeof input==='undefined';}};function _parseYouTubeId(url){var regex=/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;return(url.match(regex))?RegExp.$2:url;}
function _parseVimeoId(url){var regex=/^.*(vimeo.com\/|video\/)(\d+).*/;return(url.match(regex))?RegExp.$2:url;}
function _fullscreen(){var fullscreen={supportsFullScreen:false,isFullScreen:function(){return false;},requestFullScreen:function(){},cancelFullScreen:function(){},fullScreenEventName:'',element:null,prefix:''},browserPrefixes='webkit o moz ms khtml'.split(' ');if(!_is.undefined(document.cancelFullScreen)){fullscreen.supportsFullScreen=true;}else{for(var i=0,il=browserPrefixes.length;i<il;i++){fullscreen.prefix=browserPrefixes[i];if(!_is.undefined(document[fullscreen.prefix+'CancelFullScreen'])){fullscreen.supportsFullScreen=true;break;}else if(!_is.undefined(document.msExitFullscreen)&&document.msFullscreenEnabled){fullscreen.prefix='ms';fullscreen.supportsFullScreen=true;break;}}}
if(fullscreen.supportsFullScreen){fullscreen.fullScreenEventName=(fullscreen.prefix==='ms'?'MSFullscreenChange':fullscreen.prefix+'fullscreenchange');fullscreen.isFullScreen=function(element){if(_is.undefined(element)){element=document.body;}
switch(this.prefix){case '':return document.fullscreenElement===element;case 'moz':return document.mozFullScreenElement===element;default:return document[this.prefix+'FullscreenElement']===element;}};fullscreen.requestFullScreen=function(element){if(_is.undefined(element)){element=document.body;}
return(this.prefix==='')?element.requestFullScreen():element[this.prefix+(this.prefix==='ms'?'RequestFullscreen':'RequestFullScreen')]();};fullscreen.cancelFullScreen=function(){return(this.prefix==='')?document.cancelFullScreen():document[this.prefix+(this.prefix==='ms'?'ExitFullscreen':'CancelFullScreen')]();};fullscreen.element=function(){return(this.prefix==='')?document.fullscreenElement:document[this.prefix+'FullscreenElement'];};}
return fullscreen;}
var _storage={supported:(function(){if(!('localStorage'in window)){return false;}
try{window.localStorage.setItem('___test','OK');var result=window.localStorage.getItem('___test');window.localStorage.removeItem('___test');return(result==='OK');}
catch(e){return false;}
return false;})()};function Plyr(media,config){var plyr=this,timers={},api;plyr.media=media;var original=media.cloneNode(true);function _triggerEvent(element,type,bubbles,properties){_event(element,type,bubbles,_extend({},properties,{plyr:api}));}
function _console(type,args){if(config.debug&&window.console){args=Array.prototype.slice.call(args);if(_is.string(config.logPrefix)&&config.logPrefix.length){args.unshift(config.logPrefix);}
console[type].apply(console,args);}}
var _log=function(){_console('log',arguments)},_warn=function(){_console('warn',arguments)};_log('Config',config);function _getIconUrl(){return{url:config.iconUrl,absolute:(config.iconUrl.indexOf("http")===0)||plyr.browser.isIE};}
function _buildControls(){var html=[],iconUrl=_getIconUrl(),iconPath=(!iconUrl.absolute?iconUrl.url:'')+'#'+config.iconPrefix;if(_inArray(config.controls,'play-large')){html.push('<button type="button" data-plyr="play" class="plyr__play-large">','<svg><use xlink:href="'+iconPath+'-play" /></svg>','<span class="plyr__sr-only">'+config.i18n.play+'</span>','</button>');}
html.push('<div class="plyr__controls">');if(_inArray(config.controls,'restart')){html.push('<button type="button" data-plyr="restart">','<svg><use xlink:href="'+iconPath+'-restart" /></svg>','<span class="plyr__sr-only">'+config.i18n.restart+'</span>','</button>');}
if(_inArray(config.controls,'rewind')){html.push('<button type="button" data-plyr="rewind">','<svg><use xlink:href="'+iconPath+'-rewind" /></svg>','<span class="plyr__sr-only">'+config.i18n.rewind+'</span>','</button>');}
if(_inArray(config.controls,'play')){html.push('<button type="button" data-plyr="play">','<svg><use xlink:href="'+iconPath+'-play" /></svg>','<span class="plyr__sr-only">'+config.i18n.play+'</span>','</button>','<button type="button" data-plyr="pause">','<svg><use xlink:href="'+iconPath+'-pause" /></svg>','<span class="plyr__sr-only">'+config.i18n.pause+'</span>','</button>');}
if(_inArray(config.controls,'fast-forward')){html.push('<button type="button" data-plyr="fast-forward">','<svg><use xlink:href="'+iconPath+'-fast-forward" /></svg>','<span class="plyr__sr-only">'+config.i18n.forward+'</span>','</button>');}
if(_inArray(config.controls,'progress')){html.push('<span class="plyr__progress">','<label for="seek{id}" class="plyr__sr-only">Seek</label>','<input id="seek{id}" class="plyr__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-plyr="seek">','<progress class="plyr__progress--played" max="100" value="0" role="presentation"></progress>','<progress class="plyr__progress--buffer" max="100" value="0">','<span>0</span>% '+config.i18n.buffered,'</progress>');if(config.tooltips.seek){html.push('<span class="plyr__tooltip">00:00</span>');}
html.push('</span>');}
if(_inArray(config.controls,'current-time')){html.push('<span class="plyr__time">','<span class="plyr__sr-only">'+config.i18n.currentTime+'</span>','<span class="plyr__time--current">00:00</span>','</span>');}
if(_inArray(config.controls,'duration')){html.push('<span class="plyr__time">','<span class="plyr__sr-only">'+config.i18n.duration+'</span>','<span class="plyr__time--duration">00:00</span>','</span>');}
if(_inArray(config.controls,'mute')){html.push('<button type="button" data-plyr="mute">','<svg class="icon--muted"><use xlink:href="'+iconPath+'-muted" /></svg>','<svg><use xlink:href="'+iconPath+'-volume" /></svg>','<span class="plyr__sr-only">'+config.i18n.toggleMute+'</span>','</button>');}
if(_inArray(config.controls,'volume')){html.push('<span class="plyr__volume">','<label for="volume{id}" class="plyr__sr-only">'+config.i18n.volume+'</label>','<input id="volume{id}" class="plyr__volume--input" type="range" min="'+config.volumeMin+'" max="'+config.volumeMax+'" value="'+config.volume+'" data-plyr="volume">','<progress class="plyr__volume--display" max="'+config.volumeMax+'" value="'+config.volumeMin+'" role="presentation"></progress>','</span>');}
if(_inArray(config.controls,'captions')){html.push('<button type="button" data-plyr="captions">','<svg class="icon--captions-on"><use xlink:href="'+iconPath+'-captions-on" /></svg>','<svg><use xlink:href="'+iconPath+'-captions-off" /></svg>','<span class="plyr__sr-only">'+config.i18n.toggleCaptions+'</span>','</button>');}
if(_inArray(config.controls,'fullscreen')){html.push('<button type="button" data-plyr="fullscreen">','<svg class="icon--exit-fullscreen"><use xlink:href="'+iconPath+'-exit-fullscreen" /></svg>','<svg><use xlink:href="'+iconPath+'-enter-fullscreen" /></svg>','<span class="plyr__sr-only">'+config.i18n.toggleFullscreen+'</span>','</button>');}
html.push('</div>');return html.join('');}
function _setupFullscreen(){if(!plyr.supported.full){return;}
if((plyr.type!=='audio'||config.fullscreen.allowAudio)&&config.fullscreen.enabled){var nativeSupport=fullscreen.supportsFullScreen;if(nativeSupport||(config.fullscreen.fallback&&!_inFrame())){_log((nativeSupport?'Native':'Fallback')+' fullscreen enabled');_toggleClass(plyr.container,config.classes.fullscreen.enabled,true);}else{_log('Fullscreen not supported and fallback disabled');}
if(plyr.buttons&&plyr.buttons.fullscreen){_toggleState(plyr.buttons.fullscreen,false);}
_focusTrap();}}
function _setupCaptions(){if(plyr.type!=='video'){return;}
if(!_getElement(config.selectors.captions)){plyr.videoContainer.insertAdjacentHTML('afterbegin','<div class="'+_getClassname(config.selectors.captions)+'"></div>');}
plyr.usingTextTracks=false;if(plyr.media.textTracks){plyr.usingTextTracks=true;}
var captionSrc='',kind,children=plyr.media.childNodes;for(var i=0;i<children.length;i++){if(children[i].nodeName.toLowerCase()==='track'){kind=children[i].kind;if(kind==='captions'||kind==='subtitles'){captionSrc=children[i].getAttribute('src');}}}
plyr.captionExists=true;if(captionSrc===''){plyr.captionExists=false;_log('No caption track found');}else{_log('Caption track found; URI: '+captionSrc);}
if(!plyr.captionExists){_toggleClass(plyr.container,config.classes.captions.enabled);}else{var tracks=plyr.media.textTracks;for(var x=0;x<tracks.length;x++){tracks[x].mode='hidden';}
_showCaptions(plyr);if((plyr.browser.isIE&&plyr.browser.version>=10)||(plyr.browser.isFirefox&&plyr.browser.version>=31)){_log('Detected browser with known TextTrack issues - using manual fallback');plyr.usingTextTracks=false;}
if(plyr.usingTextTracks){_log('TextTracks supported');for(var y=0;y<tracks.length;y++){var track=tracks[y];if(track.kind==='captions'||track.kind==='subtitles'){_on(track,'cuechange',function(){if(this.activeCues[0]&&'text'in this.activeCues[0]){_setCaption(this.activeCues[0].getCueAsHTML());}else{_setCaption();}});}}}else{_log('TextTracks not supported so rendering captions manually');plyr.currentCaption='';plyr.captions=[];if(captionSrc!==''){var xhr=new XMLHttpRequest();xhr.onreadystatechange=function(){if(xhr.readyState===4){if(xhr.status===200){var captions=[],caption,req=xhr.responseText;var lineSeparator='\r\n';if(req.indexOf(lineSeparator+lineSeparator)===-1){if(req.indexOf('\r\r')!==-1){lineSeparator='\r';}else{lineSeparator='\n';}}
captions=req.split(lineSeparator+lineSeparator);for(var r=0;r<captions.length;r++){caption=captions[r];plyr.captions[r]=[];var parts=caption.split(lineSeparator),index=0;if(parts[index].indexOf(":")===-1){index=1;}
plyr.captions[r]=[parts[index],parts[index+1]];}
plyr.captions.shift();_log('Successfully loaded the caption file via AJAX');}else{_warn(config.logPrefix+'There was a problem loading the caption file via AJAX');}}};xhr.open('get',captionSrc,true);xhr.send();}}}}
function _setCaption(caption){var container=_getElement(config.selectors.captions),content=document.createElement('span');container.innerHTML='';if(_is.undefined(caption)){caption='';}
if(_is.string(caption)){content.innerHTML=caption.trim();}else{content.appendChild(caption);}
container.appendChild(content);var redraw=container.offsetHeight;}
function _seekManualCaptions(time){function _timecodeCommon(tc,pos){var tcpair=[];tcpair=tc.split(' --> ');for(var i=0;i<tcpair.length;i++){tcpair[i]=tcpair[i].replace(/(\d+:\d+:\d+\.\d+).*/,"$1");}
return _subTcSecs(tcpair[pos]);}
function _timecodeMin(tc){return _timecodeCommon(tc,0);}
function _timecodeMax(tc){return _timecodeCommon(tc,1);}
function _subTcSecs(tc){if(tc===null||tc===undefined){return 0;}else{var tc1=[],tc2=[],seconds;tc1=tc.split(',');tc2=tc1[0].split(':');seconds=Math.floor(tc2[0]*60*60)+Math.floor(tc2[1]*60)+Math.floor(tc2[2]);return seconds;}}
if(plyr.usingTextTracks||plyr.type!=='video'||!plyr.supported.full){return;}
plyr.subcount=0;time=_is.number(time)?time:plyr.media.currentTime;if(!plyr.captions[plyr.subcount]){return;}
while(_timecodeMax(plyr.captions[plyr.subcount][0])<time.toFixed(1)){plyr.subcount++;if(plyr.subcount>plyr.captions.length-1){plyr.subcount=plyr.captions.length-1;break;}}
if(plyr.media.currentTime.toFixed(1)>=_timecodeMin(plyr.captions[plyr.subcount][0])&&plyr.media.currentTime.toFixed(1)<=_timecodeMax(plyr.captions[plyr.subcount][0])){plyr.currentCaption=plyr.captions[plyr.subcount][1];_setCaption(plyr.currentCaption);}else{_setCaption();}}
function _showCaptions(){if(!plyr.buttons.captions){return;}
_toggleClass(plyr.container,config.classes.captions.enabled,true);var active=plyr.storage.captionsEnabled;if(!_is.boolean(active)){active=config.captions.defaultActive;}
if(active){_toggleClass(plyr.container,config.classes.captions.active,true);_toggleState(plyr.buttons.captions,true);}}
function _getElements(selector){return plyr.container.querySelectorAll(selector);}
function _getElement(selector){return _getElements(selector)[0];}
function _inFrame(){try{return window.self!==window.top;}
catch(e){return true;}}
function _focusTrap(){var tabbables=_getElements('input:not([disabled]), button:not([disabled])'),first=tabbables[0],last=tabbables[tabbables.length-1];function _checkFocus(event){if(event.which===9&&plyr.isFullscreen){if(event.target===last&&!event.shiftKey){event.preventDefault();first.focus();}else if(event.target===first&&event.shiftKey){event.preventDefault();last.focus();}}}
_on(plyr.container,'keydown',_checkFocus);}
function _insertChildElements(type,attributes){if(_is.string(attributes)){_insertElement(type,plyr.media,{src:attributes});}else if(attributes.constructor===Array){for(var i=attributes.length-1;i>=0;i--){_insertElement(type,plyr.media,attributes[i]);}}}
function _injectControls(){if(config.loadSprite){var iconUrl=_getIconUrl();if(iconUrl.absolute){_log('AJAX loading absolute SVG sprite'+(plyr.browser.isIE?' (due to IE)':''));loadSprite(iconUrl.url,"sprite-plyr");}else{_log('Sprite will be used as external resource directly');}}
var html=config.html;_log('Injecting custom controls');if(!html){html=_buildControls();}
html=_replaceAll(html,'{seektime}',config.seekTime);html=_replaceAll(html,'{id}',Math.floor(Math.random()*(10000)));var target;if(_is.string(config.selectors.controls.container)){target=document.querySelector(config.selectors.controls.container);}
if(!_is.htmlElement(target)){target=plyr.container}
target.insertAdjacentHTML('beforeend',html);if(config.tooltips.controls){var labels=_getElements([config.selectors.controls.wrapper,' ',config.selectors.labels,' .',config.classes.hidden].join(''));for(var i=labels.length-1;i>=0;i--){var label=labels[i];_toggleClass(label,config.classes.hidden,false);_toggleClass(label,config.classes.tooltip,true);}}}
function _findElements(){try{plyr.controls=_getElement(config.selectors.controls.wrapper);plyr.buttons={};plyr.buttons.seek=_getElement(config.selectors.buttons.seek);plyr.buttons.play=_getElements(config.selectors.buttons.play);plyr.buttons.pause=_getElement(config.selectors.buttons.pause);plyr.buttons.restart=_getElement(config.selectors.buttons.restart);plyr.buttons.rewind=_getElement(config.selectors.buttons.rewind);plyr.buttons.forward=_getElement(config.selectors.buttons.forward);plyr.buttons.fullscreen=_getElement(config.selectors.buttons.fullscreen);plyr.buttons.mute=_getElement(config.selectors.buttons.mute);plyr.buttons.captions=_getElement(config.selectors.buttons.captions);plyr.progress={};plyr.progress.container=_getElement(config.selectors.progress.container);plyr.progress.buffer={};plyr.progress.buffer.bar=_getElement(config.selectors.progress.buffer);plyr.progress.buffer.text=plyr.progress.buffer.bar&&plyr.progress.buffer.bar.getElementsByTagName('span')[0];plyr.progress.played=_getElement(config.selectors.progress.played);plyr.progress.tooltip=plyr.progress.container&&plyr.progress.container.querySelector('.'+config.classes.tooltip);plyr.volume={};plyr.volume.input=_getElement(config.selectors.volume.input);plyr.volume.display=_getElement(config.selectors.volume.display);plyr.duration=_getElement(config.selectors.duration);plyr.currentTime=_getElement(config.selectors.currentTime);plyr.seekTime=_getElements(config.selectors.seekTime);return true;}
catch(e){_warn('It looks like there is a problem with your controls HTML');_toggleNativeControls(true);return false;}}
function _toggleStyleHook(){_toggleClass(plyr.container,config.selectors.container.replace('.',''),plyr.supported.full);}
function _toggleNativeControls(toggle){if(toggle&&_inArray(config.types.html5,plyr.type)){plyr.media.setAttribute('controls','');}else{plyr.media.removeAttribute('controls');}}
function _setTitle(iframe){var label=config.i18n.play;if(_is.string(config.title)&&config.title.length){label+=', '+config.title;plyr.container.setAttribute('aria-label',config.title);}
if(plyr.supported.full&&plyr.buttons.play){for(var i=plyr.buttons.play.length-1;i>=0;i--){plyr.buttons.play[i].setAttribute('aria-label',label);}}
if(_is.htmlElement(iframe)){iframe.setAttribute('title',config.i18n.frameTitle.replace('{title}',config.title));}}
function _setupStorage(){var value=null;plyr.storage={};if(!_storage.supported||!config.storage.enabled){return;}
window.localStorage.removeItem('plyr-volume');value=window.localStorage.getItem(config.storage.key);if(!value){return;}else if(/^\d+(\.\d+)?$/.test(value)){_updateStorage({volume:parseFloat(value)});}else{plyr.storage=JSON.parse(value);}}
function _updateStorage(value){if(!_storage.supported||!config.storage.enabled){return;}
_extend(plyr.storage,value);window.localStorage.setItem(config.storage.key,JSON.stringify(plyr.storage));}
function _setupMedia(){if(!plyr.media){_warn('No media element found!');return;}
if(plyr.supported.full){_toggleClass(plyr.container,config.classes.type.replace('{0}',plyr.type),true);if(_inArray(config.types.embed,plyr.type)){_toggleClass(plyr.container,config.classes.type.replace('{0}','video'),true);}
_toggleClass(plyr.container,config.classes.stopped,config.autoplay);_toggleClass(plyr.ontainer,config.classes.isIos,plyr.browser.isIos);_toggleClass(plyr.container,config.classes.isTouch,plyr.browser.isTouch);if(plyr.type==='video'){var wrapper=document.createElement('div');wrapper.setAttribute('class',config.classes.videoWrapper);_wrap(plyr.media,wrapper);plyr.videoContainer=wrapper;}}
if(_inArray(config.types.embed,plyr.type)){_setupEmbed();}}
function _setupEmbed(){var container=document.createElement('div'),mediaId,id=plyr.type+'-'+Math.floor(Math.random()*(10000));switch(plyr.type){case 'youtube':mediaId=_parseYouTubeId(plyr.embedId);break;case 'vimeo':mediaId=_parseVimeoId(plyr.embedId);break;default:mediaId=plyr.embedId;}
var containers=_getElements('[id^="'+plyr.type+'-"]');for(var i=containers.length-1;i>=0;i--){_remove(containers[i]);}
_toggleClass(plyr.media,config.classes.videoWrapper,true);_toggleClass(plyr.media,config.classes.embedWrapper,true);if(plyr.type==='youtube'){plyr.media.appendChild(container);container.setAttribute('id',id);if(_is.object(window.YT)){_youTubeReady(mediaId,container);}else{_injectScript(config.urls.youtube.api);window.onYouTubeReadyCallbacks=window.onYouTubeReadyCallbacks||[];window.onYouTubeReadyCallbacks.push(function(){_youTubeReady(mediaId,container);});window.onYouTubeIframeAPIReady=function(){window.onYouTubeReadyCallbacks.forEach(function(callback){callback();});};}}else if(plyr.type==='vimeo'){if(plyr.supported.full){plyr.media.appendChild(container);}else{container=plyr.media;}
container.setAttribute('id',id);if(!_is.object(window.Vimeo)){_injectScript(config.urls.vimeo.api);var vimeoTimer=window.setInterval(function(){if(_is.object(window.Vimeo)){window.clearInterval(vimeoTimer);_vimeoReady(mediaId,container);}},50);}else{_vimeoReady(mediaId,container);}}else if(plyr.type==='soundcloud'){var soundCloud=document.createElement('iframe');soundCloud.loaded=false;_on(soundCloud,'load',function(){soundCloud.loaded=true;});_setAttributes(soundCloud,{'src':'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/'+mediaId,'id':id});container.appendChild(soundCloud);plyr.media.appendChild(container);if(!window.SC){_injectScript(config.urls.soundcloud.api);}
var soundCloudTimer=window.setInterval(function(){if(window.SC&&soundCloud.loaded){window.clearInterval(soundCloudTimer);_soundcloudReady.call(soundCloud);}},50);}}
function _embedReady(){if(plyr.supported.full){_setupInterface();_ready();}
_setTitle(_getElement('iframe'));}
function _youTubeReady(videoId,container){plyr.embed=new window.YT.Player(container.id,{videoId:videoId,playerVars:{autoplay:(config.autoplay?1:0),controls:(plyr.supported.full?0:1),rel:0,showinfo:0,iv_load_policy:3,cc_load_policy:(config.captions.defaultActive?1:0),cc_lang_pref:'en',wmode:'transparent',modestbranding:1,disablekb:1,origin:'*'},events:{'onError':function(event){_triggerEvent(plyr.container,'error',true,{code:event.data,embed:event.target});},'onReady':function(event){var instance=event.target;plyr.media.play=function(){instance.playVideo();plyr.media.paused=false;};plyr.media.pause=function(){instance.pauseVideo();plyr.media.paused=true;};plyr.media.stop=function(){instance.stopVideo();plyr.media.paused=true;};plyr.media.duration=instance.getDuration();plyr.media.paused=true;plyr.media.currentTime=0;plyr.media.muted=instance.isMuted();config.title=instance.getVideoData().title;if(plyr.supported.full){plyr.media.querySelector('iframe').setAttribute('tabindex','-1');}
_embedReady();_triggerEvent(plyr.media,'timeupdate');_triggerEvent(plyr.media,'durationchange');window.clearInterval(timers.buffering);timers.buffering=window.setInterval(function(){plyr.media.buffered=instance.getVideoLoadedFraction();if(plyr.media.lastBuffered===null||plyr.media.lastBuffered<plyr.media.buffered){_triggerEvent(plyr.media,'progress');}
plyr.media.lastBuffered=plyr.media.buffered;if(plyr.media.buffered===1){window.clearInterval(timers.buffering);_triggerEvent(plyr.media,'canplaythrough');}},200);},'onStateChange':function(event){var instance=event.target;window.clearInterval(timers.playing);switch(event.data){case 0:plyr.media.paused=true;_triggerEvent(plyr.media,'ended');break;case 1:plyr.media.paused=false;if(plyr.media.seeking){_triggerEvent(plyr.media,'seeked');}
plyr.media.seeking=false;_triggerEvent(plyr.media,'play');_triggerEvent(plyr.media,'playing');timers.playing=window.setInterval(function(){plyr.media.currentTime=instance.getCurrentTime();_triggerEvent(plyr.media,'timeupdate');},100);if(plyr.media.duration!==instance.getDuration()){plyr.media.duration=instance.getDuration();_triggerEvent(plyr.media,'durationchange');}
break;case 2:plyr.media.paused=true;_triggerEvent(plyr.media,'pause');break;}
_triggerEvent(plyr.container,'statechange',false,{code:event.data});}}});}
function _vimeoReady(mediaId,container){plyr.embed=new window.Vimeo.Player(container,{id:parseInt(mediaId),loop:config.loop,autoplay:config.autoplay,byline:false,portrait:false,title:false});plyr.media.play=function(){plyr.embed.play();plyr.media.paused=false;};plyr.media.pause=function(){plyr.embed.pause();plyr.media.paused=true;};plyr.media.stop=function(){plyr.embed.stop();plyr.media.paused=true;};plyr.media.paused=true;plyr.media.currentTime=0;_embedReady();plyr.embed.getCurrentTime().then(function(value){plyr.media.currentTime=value;_triggerEvent(plyr.media,'timeupdate');});plyr.embed.getDuration().then(function(value){plyr.media.duration=value;_triggerEvent(plyr.media,'durationchange');});plyr.embed.on('loaded',function(){if(_is.htmlElement(plyr.embed.element)&&plyr.supported.full){plyr.embed.element.setAttribute('tabindex','-1');}});plyr.embed.on('play',function(){plyr.media.paused=false;_triggerEvent(plyr.media,'play');_triggerEvent(plyr.media,'playing');});plyr.embed.on('pause',function(){plyr.media.paused=true;_triggerEvent(plyr.media,'pause');});plyr.embed.on('timeupdate',function(data){plyr.media.seeking=false;plyr.media.currentTime=data.seconds;_triggerEvent(plyr.media,'timeupdate');});plyr.embed.on('progress',function(data){plyr.media.buffered=data.percent;_triggerEvent(plyr.media,'progress');if(parseInt(data.percent)===1){_triggerEvent(plyr.media,'canplaythrough');}});plyr.embed.on('seeked',function(){plyr.media.seeking=false;_triggerEvent(plyr.media,'seeked');_triggerEvent(plyr.media,'play');});plyr.embed.on('ended',function(){plyr.media.paused=true;_triggerEvent(plyr.media,'ended');});}
function _soundcloudReady(){plyr.embed=window.SC.Widget(this);plyr.embed.bind(window.SC.Widget.Events.READY,function(){plyr.media.play=function(){plyr.embed.play();plyr.media.paused=false;};plyr.media.pause=function(){plyr.embed.pause();plyr.media.paused=true;};plyr.media.stop=function(){plyr.embed.seekTo(0);plyr.embed.pause();plyr.media.paused=true;};plyr.media.paused=true;plyr.media.currentTime=0;plyr.embed.getDuration(function(value){plyr.media.duration=value/1000;_embedReady();});plyr.embed.getPosition(function(value){plyr.media.currentTime=value;_triggerEvent(plyr.media,'timeupdate');});plyr.embed.bind(window.SC.Widget.Events.PLAY,function(){plyr.media.paused=false;_triggerEvent(plyr.media,'play');_triggerEvent(plyr.media,'playing');});plyr.embed.bind(window.SC.Widget.Events.PAUSE,function(){plyr.media.paused=true;_triggerEvent(plyr.media,'pause');});plyr.embed.bind(window.SC.Widget.Events.PLAY_PROGRESS,function(data){plyr.media.seeking=false;plyr.media.currentTime=data.currentPosition/1000;_triggerEvent(plyr.media,'timeupdate');});plyr.embed.bind(window.SC.Widget.Events.LOAD_PROGRESS,function(data){plyr.media.buffered=data.loadProgress;_triggerEvent(plyr.media,'progress');if(parseInt(data.loadProgress)===1){_triggerEvent(plyr.media,'canplaythrough');}});plyr.embed.bind(window.SC.Widget.Events.FINISH,function(){plyr.media.paused=true;_triggerEvent(plyr.media,'ended');});});}
function _play(){if('play'in plyr.media){plyr.media.play();}}
function _pause(){if('pause'in plyr.media){plyr.media.pause();}}
function _togglePlay(toggle){if(!_is.boolean(toggle)){toggle=plyr.media.paused;}
if(toggle){_play();}else{_pause();}
return toggle;}
function _rewind(seekTime){if(!_is.number(seekTime)){seekTime=config.seekTime;}
_seek(plyr.media.currentTime-seekTime);}
function _forward(seekTime){if(!_is.number(seekTime)){seekTime=config.seekTime;}
_seek(plyr.media.currentTime+seekTime);}
function _seek(input){var targetTime=0,paused=plyr.media.paused,duration=_getDuration();if(_is.number(input)){targetTime=input;}else if(_is.object(input)&&_inArray(['input','change'],input.type)){targetTime=((input.target.value/input.target.max)*duration);}
if(targetTime<0){targetTime=0;}else if(targetTime>duration){targetTime=duration;}
_updateSeekDisplay(targetTime);try{plyr.media.currentTime=targetTime.toFixed(4);}
catch(e){}
if(_inArray(config.types.embed,plyr.type)){switch(plyr.type){case 'youtube':plyr.embed.seekTo(targetTime);break;case 'vimeo':plyr.embed.setCurrentTime(targetTime.toFixed(0));break;case 'soundcloud':plyr.embed.seekTo(targetTime*1000);break;}
if(paused){_pause();}
_triggerEvent(plyr.media,'timeupdate');plyr.media.seeking=true;_triggerEvent(plyr.media,'seeking');}
_log('Seeking to '+plyr.media.currentTime+' seconds');_seekManualCaptions(targetTime);}
function _getDuration(){var duration=parseInt(config.duration),mediaDuration=0;if(plyr.media.duration!==null&&!isNaN(plyr.media.duration)){mediaDuration=plyr.media.duration;}
return(isNaN(duration)?mediaDuration:duration);}
function _checkPlaying(){_toggleClass(plyr.container,config.classes.playing,!plyr.media.paused);_toggleClass(plyr.container,config.classes.stopped,plyr.media.paused);_toggleControls(plyr.media.paused);}
function _saveScrollPosition(){scroll={x:window.pageXOffset||0,y:window.pageYOffset||0};}
function _restoreScrollPosition(){window.scrollTo(scroll.x,scroll.y);}
function _toggleFullscreen(event){var nativeSupport=fullscreen.supportsFullScreen;if(nativeSupport){if(event&&event.type===fullscreen.fullScreenEventName){plyr.isFullscreen=fullscreen.isFullScreen(plyr.container);}else{if(!fullscreen.isFullScreen(plyr.container)){_saveScrollPosition();fullscreen.requestFullScreen(plyr.container);}else{fullscreen.cancelFullScreen();}
plyr.isFullscreen=fullscreen.isFullScreen(plyr.container);return;}}else{plyr.isFullscreen=!plyr.isFullscreen;document.body.style.overflow=plyr.isFullscreen?'hidden':'';}
_toggleClass(plyr.container,config.classes.fullscreen.active,plyr.isFullscreen);_focusTrap(plyr.isFullscreen);if(plyr.buttons&&plyr.buttons.fullscreen){_toggleState(plyr.buttons.fullscreen,plyr.isFullscreen);}
_triggerEvent(plyr.container,plyr.isFullscreen?'enterfullscreen':'exitfullscreen',true);if(!plyr.isFullscreen&&nativeSupport){_restoreScrollPosition();}}
function _toggleMute(muted){if(!_is.boolean(muted)){muted=!plyr.media.muted;}
_toggleState(plyr.buttons.mute,muted);plyr.media.muted=muted;if(plyr.media.volume===0){_setVolume(config.volume);}
if(_inArray(config.types.embed,plyr.type)){switch(plyr.type){case 'youtube':plyr.embed[plyr.media.muted?'mute':'unMute']();break;case 'vimeo':case 'soundcloud':plyr.embed.setVolume(plyr.media.muted?0:parseFloat(config.volume/config.volumeMax));break;}
_triggerEvent(plyr.media,'volumechange');}}
function _setVolume(volume){var max=config.volumeMax,min=config.volumeMin;if(_is.undefined(volume)){volume=plyr.storage.volume;}
if(volume===null||isNaN(volume)){volume=config.volume;}
if(volume>max){volume=max;}
if(volume<min){volume=min;}
plyr.media.volume=parseFloat(volume/max);if(plyr.volume.display){plyr.volume.display.value=volume;}
if(_inArray(config.types.embed,plyr.type)){switch(plyr.type){case 'youtube':plyr.embed.setVolume(plyr.media.volume*100);break;case 'vimeo':case 'soundcloud':plyr.embed.setVolume(plyr.media.volume);break;}
_triggerEvent(plyr.media,'volumechange');}
if(volume===0){plyr.media.muted=true;}else if(plyr.media.muted&&volume>0){_toggleMute();}}
function _increaseVolume(step){var volume=plyr.media.muted?0:(plyr.media.volume*config.volumeMax);if(!_is.number(step)){step=config.volumeStep;}
_setVolume(volume+step);}
function _decreaseVolume(step){var volume=plyr.media.muted?0:(plyr.media.volume*config.volumeMax);if(!_is.number(step)){step=config.volumeStep;}
_setVolume(volume-step);}
function _updateVolume(){var volume=plyr.media.muted?0:(plyr.media.volume*config.volumeMax);if(plyr.supported.full){if(plyr.volume.input){plyr.volume.input.value=volume;}
if(plyr.volume.display){plyr.volume.display.value=volume;}}
_updateStorage({volume:volume});_toggleClass(plyr.container,config.classes.muted,(volume===0));if(plyr.supported.full&&plyr.buttons.mute){_toggleState(plyr.buttons.mute,(volume===0));}}
function _toggleCaptions(show){if(!plyr.supported.full||!plyr.buttons.captions){return;}
if(!_is.boolean(show)){show=(plyr.container.className.indexOf(config.classes.captions.active)===-1);}
plyr.captionsEnabled=show;_toggleState(plyr.buttons.captions,plyr.captionsEnabled);_toggleClass(plyr.container,config.classes.captions.active,plyr.captionsEnabled);_triggerEvent(plyr.container,plyr.captionsEnabled?'captionsenabled':'captionsdisabled',true);_updateStorage({captionsEnabled:plyr.captionsEnabled});}
function _checkLoading(event){var loading=(event.type==='waiting');clearTimeout(timers.loading);timers.loading=setTimeout(function(){_toggleClass(plyr.container,config.classes.loading,loading);_toggleControls(loading);},(loading?250:0));}
function _updateProgress(event){if(!plyr.supported.full){return;}
var progress=plyr.progress.played,value=0,duration=_getDuration();if(event){switch(event.type){case 'timeupdate':case 'seeking':if(plyr.controls.pressed){return;}
value=_getPercentage(plyr.media.currentTime,duration);if(event.type==='timeupdate'&&plyr.buttons.seek){plyr.buttons.seek.value=value;}
break;case 'playing':case 'progress':progress=plyr.progress.buffer;value=(function(){var buffered=plyr.media.buffered;if(buffered&&buffered.length){return _getPercentage(buffered.end(0),duration);}else if(_is.number(buffered)){return(buffered*100);}
return 0;})();break;}}
_setProgress(progress,value);}
function _setProgress(progress,value){if(!plyr.supported.full){return;}
if(_is.undefined(value)){value=0;}
if(_is.undefined(progress)){if(plyr.progress&&plyr.progress.buffer){progress=plyr.progress.buffer;}else{return;}}
if(_is.htmlElement(progress)){progress.value=value;}else if(progress){if(progress.bar){progress.bar.value=value;}
if(progress.text){progress.text.innerHTML=value;}}}
function _updateTimeDisplay(time,element){if(!element){return;}
if(isNaN(time)){time=0;}
plyr.secs=parseInt(time%60);plyr.mins=parseInt((time/60)%60);plyr.hours=parseInt(((time/60)/60)%60);var displayHours=(parseInt(((_getDuration()/60)/60)%60)>0);plyr.secs=('0'+plyr.secs).slice(-2);plyr.mins=('0'+plyr.mins).slice(-2);element.innerHTML=(displayHours?plyr.hours+':':'')+plyr.mins+':'+plyr.secs;}
function _displayDuration(){if(!plyr.supported.full){return;}
var duration=_getDuration()||0;if(!plyr.duration&&config.displayDuration&&plyr.media.paused){_updateTimeDisplay(duration,plyr.currentTime);}
if(plyr.duration){_updateTimeDisplay(duration,plyr.duration);}
_updateSeekTooltip();}
function _timeUpdate(event){_updateTimeDisplay(plyr.media.currentTime,plyr.currentTime);if(event&&event.type==='timeupdate'&&plyr.media.seeking){return;}
_updateProgress(event);}
function _updateSeekDisplay(time){if(!_is.number(time)){time=0;}
var duration=_getDuration(),value=_getPercentage(time,duration);if(plyr.progress&&plyr.progress.played){plyr.progress.played.value=value;}
if(plyr.buttons&&plyr.buttons.seek){plyr.buttons.seek.value=value;}}
function _updateSeekTooltip(event){var duration=_getDuration();if(!config.tooltips.seek||!plyr.progress.container||duration===0){return;}
var clientRect=plyr.progress.container.getBoundingClientRect(),percent=0,visible=config.classes.tooltip+'--visible';if(!event){if(_hasClass(plyr.progress.tooltip,visible)){percent=plyr.progress.tooltip.style.left.replace('%','');}else{return;}}else{percent=((100/clientRect.width)*(event.pageX-clientRect.left));}
if(percent<0){percent=0;}else if(percent>100){percent=100;}
_updateTimeDisplay(((duration/100)*percent),plyr.progress.tooltip);plyr.progress.tooltip.style.left=percent+"%";if(event&&_inArray(['mouseenter','mouseleave'],event.type)){_toggleClass(plyr.progress.tooltip,visible,(event.type==='mouseenter'));}}
function _toggleControls(toggle){if(!config.hideControls||plyr.type==='audio'){return;}
var delay=0,isEnterFullscreen=false,show=toggle,loading=_hasClass(plyr.container,config.classes.loading);if(!_is.boolean(toggle)){if(toggle&&toggle.type){isEnterFullscreen=(toggle.type==='enterfullscreen');show=_inArray(['mousemove','touchstart','mouseenter','focus'],toggle.type);if(_inArray(['mousemove','touchmove'],toggle.type)){delay=2000;}
if(toggle.type==='focus'){delay=3000;}}else{show=_hasClass(plyr.container,config.classes.hideControls);}}
window.clearTimeout(timers.hover);if(show||plyr.media.paused||loading){_toggleClass(plyr.container,config.classes.hideControls,false);if(plyr.media.paused||loading){return;}
if(plyr.browser.isTouch){delay=3000;}}
if(!show||!plyr.media.paused){timers.hover=window.setTimeout(function(){if((plyr.controls.pressed||plyr.controls.hover)&&!isEnterFullscreen){return;}
_toggleClass(plyr.container,config.classes.hideControls,true);},delay);}}
function _source(source){if(!_is.undefined(source)){_updateSource(source);return;}
var url;switch(plyr.type){case 'youtube':url=plyr.embed.getVideoUrl();break;case 'vimeo':plyr.embed.getVideoUrl.then(function(value){url=value;});break;case 'soundcloud':plyr.embed.getCurrentSound(function(object){url=object.permalink_url;});break;default:url=plyr.media.currentSrc;break;}
return url||'';}
function _updateSource(source){if(!_is.object(source)||!('sources'in source)||!source.sources.length){_warn('Invalid source format');return;}
_toggleClass(plyr.container,config.classes.ready,false);_pause();_updateSeekDisplay();_setProgress();_cancelRequests();function setup(){plyr.embed=null;_remove(plyr.media);if(plyr.type==='video'&&plyr.videoContainer){_remove(plyr.videoContainer);}
if(plyr.container){plyr.container.removeAttribute('class');}
if('type'in source){plyr.type=source.type;if(plyr.type==='video'){var firstSource=source.sources[0];if('type'in firstSource&&_inArray(config.types.embed,firstSource.type)){plyr.type=firstSource.type;}}}
plyr.supported=supported(plyr.type);switch(plyr.type){case 'video':plyr.media=document.createElement('video');break;case 'audio':plyr.media=document.createElement('audio');break;case 'youtube':case 'vimeo':case 'soundcloud':plyr.media=document.createElement('div');plyr.embedId=source.sources[0].src;break;}
_prependChild(plyr.container,plyr.media);if(_is.boolean(source.autoplay)){config.autoplay=source.autoplay;}
if(_inArray(config.types.html5,plyr.type)){if(config.crossorigin){plyr.media.setAttribute('crossorigin','');}
if(config.autoplay){plyr.media.setAttribute('autoplay','');}
if('poster'in source){plyr.media.setAttribute('poster',source.poster);}
if(config.loop){plyr.media.setAttribute('loop','');}}
_toggleClass(plyr.container,config.classes.fullscreen.active,plyr.isFullscreen);_toggleClass(plyr.container,config.classes.captions.active,plyr.captionsEnabled);_toggleStyleHook();if(_inArray(config.types.html5,plyr.type)){_insertChildElements('source',source.sources);}
_setupMedia();if(_inArray(config.types.html5,plyr.type)){if('tracks'in source){_insertChildElements('track',source.tracks);}
plyr.media.load();}
if(_inArray(config.types.html5,plyr.type)||(_inArray(config.types.embed,plyr.type)&&!plyr.supported.full)){_setupInterface();_ready();}
config.title=source.title;_setTitle();}
_destroy(setup,false);}
function _updatePoster(source){if(plyr.type==='video'){plyr.media.setAttribute('poster',source);}}
function _controlListeners(){var inputEvent=(plyr.browser.isIE?'change':'input');function togglePlay(){var play=_togglePlay();var trigger=plyr.buttons[play?'play':'pause'],target=plyr.buttons[play?'pause':'play'];if(target&&target.length>1){target=target[target.length-1];}else{target=target[0];}
if(target){var hadTabFocus=_hasClass(trigger,config.classes.tabFocus);setTimeout(function(){target.focus();if(hadTabFocus){_toggleClass(trigger,config.classes.tabFocus,false);_toggleClass(target,config.classes.tabFocus,true);}},100);}}
function getFocusElement(){var focused=document.activeElement;if(!focused||focused===document.body){focused=null;}else{focused=document.querySelector(':focus');}
return focused;}
function getKeyCode(event){return event.keyCode?event.keyCode:event.which;}
function checkTabFocus(focused){for(var button in plyr.buttons){var element=plyr.buttons[button];if(_is.nodeList(element)){for(var i=0;i<element.length;i++){_toggleClass(element[i],config.classes.tabFocus,(element[i]===focused));}}else{_toggleClass(element,config.classes.tabFocus,(element===focused));}}}
if(config.keyboardShorcuts.focused){var last=null;if(config.keyboardShorcuts.global){_on(window,'keydown keyup',function(event){var code=getKeyCode(event),focused=getFocusElement(),allowed=[48,49,50,51,52,53,54,56,57,75,77,70,67],count=get().length;if(count===1&&_inArray(allowed,code)&&(!_is.htmlElement(focused)||!_matches(focused,config.selectors.editable))){handleKey(event);}});}
_on(plyr.container,'keydown keyup',handleKey);}
function handleKey(event){var code=getKeyCode(event),pressed=event.type==='keydown',held=pressed&&code===last;if(!_is.number(code)){return;}
function seekByKey(){var duration=plyr.media.duration;if(!_is.number(duration)){return;}
_seek((duration/10)*(code-48));}
if(pressed){var preventDefault=[48,49,50,51,52,53,54,56,57,32,75,38,40,77,39,37,70,67];if(_inArray(preventDefault,code)){event.preventDefault();event.stopPropagation();}
switch(code){case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:if(!held){seekByKey();}break;case 32:case 75:if(!held){_togglePlay();}break;case 38:_increaseVolume();break;case 40:_decreaseVolume();break;case 77:if(!held){_toggleMute()}break;case 39:_forward();break;case 37:_rewind();break;case 70:_toggleFullscreen();break;case 67:if(!held){_toggleCaptions();}break;}
if(!fullscreen.supportsFullScreen&&plyr.isFullscreen&&code===27){_toggleFullscreen();}
last=code;}else{last=null;}}
_on(window,'keyup',function(event){var code=getKeyCode(event),focused=getFocusElement();if(code===9){checkTabFocus(focused);}});_on(document.body,'click',function(){_toggleClass(_getElement('.'+config.classes.tabFocus),config.classes.tabFocus,false);});for(var button in plyr.buttons){var element=plyr.buttons[button];_on(element,'blur',function(){_toggleClass(element,'tab-focus',false);});}
_proxyListener(plyr.buttons.play,'click',config.listeners.play,togglePlay);_proxyListener(plyr.buttons.pause,'click',config.listeners.pause,togglePlay);_proxyListener(plyr.buttons.restart,'click',config.listeners.restart,_seek);_proxyListener(plyr.buttons.rewind,'click',config.listeners.rewind,_rewind);_proxyListener(plyr.buttons.forward,'click',config.listeners.forward,_forward);_proxyListener(plyr.buttons.seek,inputEvent,config.listeners.seek,_seek);_proxyListener(plyr.volume.input,inputEvent,config.listeners.volume,function(){_setVolume(plyr.volume.input.value);});_proxyListener(plyr.buttons.mute,'click',config.listeners.mute,_toggleMute);_proxyListener(plyr.buttons.fullscreen,'click',config.listeners.fullscreen,_toggleFullscreen);if(fullscreen.supportsFullScreen){_on(document,fullscreen.fullScreenEventName,_toggleFullscreen);}
_on(plyr.buttons.captions,'click',_toggleCaptions);_on(plyr.progress.container,'mouseenter mouseleave mousemove',_updateSeekTooltip);if(config.hideControls){_on(plyr.container,'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen',_toggleControls);_on(plyr.controls,'mouseenter mouseleave',function(event){plyr.controls.hover=event.type==='mouseenter';});_on(plyr.controls,'mousedown mouseup touchstart touchend touchcancel',function(event){plyr.controls.pressed=_inArray(['mousedown','touchstart'],event.type);});_on(plyr.controls,'focus blur',_toggleControls,true);}
_on(plyr.volume.input,'wheel',function(event){event.preventDefault();var inverted=event.webkitDirectionInvertedFromDevice,step=(config.volumeStep/5);if(event.deltaY<0||event.deltaX>0){if(inverted){_decreaseVolume(step);}else{_increaseVolume(step);}}
if(event.deltaY>0||event.deltaX<0){if(inverted){_increaseVolume(step);}else{_decreaseVolume(step);}}});}
function _mediaListeners(){_on(plyr.media,'timeupdate seeking',_timeUpdate);_on(plyr.media,'timeupdate',_seekManualCaptions);_on(plyr.media,'durationchange loadedmetadata',_displayDuration);_on(plyr.media,'ended',function(){if(plyr.type==='video'&&config.showPosterOnEnd){if(plyr.type==='video'){_setCaption();}
_seek();plyr.media.load();}});_on(plyr.media,'progress playing',_updateProgress);_on(plyr.media,'volumechange',_updateVolume);_on(plyr.media,'play pause ended',_checkPlaying);_on(plyr.media,'waiting canplay seeked',_checkLoading);if(config.clickToPlay&&plyr.type!=='audio'){var wrapper=_getElement('.'+config.classes.videoWrapper);if(!wrapper){return;}
wrapper.style.cursor="pointer";_on(wrapper,'click',function(){if(config.hideControls&&plyr.browser.isTouch&&!plyr.media.paused){return;}
if(plyr.media.paused){_play();}else if(plyr.media.ended){_seek();_play();}else{_pause();}});}
if(config.disableContextMenu){_on(plyr.media,'contextmenu',function(event){event.preventDefault();});}
_on(plyr.media,config.events.concat(['keyup','keydown']).join(' '),function(event){_triggerEvent(plyr.container,event.type,true);});}
function _cancelRequests(){if(!_inArray(config.types.html5,plyr.type)){return;}
var sources=plyr.media.querySelectorAll('source');for(var i=0;i<sources.length;i++){_remove(sources[i]);}
plyr.media.setAttribute('src','https://cdn.selz.com/plyr/blank.mp4');plyr.media.load();_log('Cancelled network requests');}
function _destroy(callback,restore){if(!plyr.init){return null;}
switch(plyr.type){case 'youtube':window.clearInterval(timers.buffering);window.clearInterval(timers.playing);plyr.embed.destroy();cleanUp();break;case 'vimeo':plyr.embed.unload().then(cleanUp);timers.cleanUp=window.setTimeout(cleanUp,200);break;case 'video':case 'audio':_toggleNativeControls(true);cleanUp();break;}
function cleanUp(){clearTimeout(timers.cleanUp);if(!_is.boolean(restore)){restore=true;}
if(_is.function(callback)){callback.call(original);}
if(!restore){return;}
plyr.init=false;plyr.container.parentNode.replaceChild(original,plyr.container);document.body.style.overflow='';_triggerEvent(original,'destroyed',true);}}
function _init(){if(plyr.init){return null;}
fullscreen=_fullscreen();plyr.browser=_browserSniff();if(!_is.htmlElement(plyr.media)){return;}
_setupStorage();var tagName=media.tagName.toLowerCase();if(tagName==='div'){plyr.type=media.getAttribute('data-type');plyr.embedId=media.getAttribute('data-video-id');media.removeAttribute('data-type');media.removeAttribute('data-video-id');}else{plyr.type=tagName;config.crossorigin=(media.getAttribute('crossorigin')!==null);config.autoplay=(config.autoplay||(media.getAttribute('autoplay')!==null));config.loop=(config.loop||(media.getAttribute('loop')!==null));}
plyr.supported=supported(plyr.type);if(!plyr.supported.basic){return;}
plyr.container=_wrap(media,document.createElement('div'));plyr.container.setAttribute('tabindex',0);_toggleStyleHook();_log(''+plyr.browser.name+' '+plyr.browser.version);_setupMedia();if(_inArray(config.types.html5,plyr.type)||(_inArray(config.types.embed,plyr.type)&&!plyr.supported.full)){_setupInterface();_ready();_setTitle();}
plyr.init=true;}
function _setupInterface(){if(!plyr.supported.full){_warn('Basic support only',plyr.type);_remove(_getElement(config.selectors.controls.wrapper));_remove(_getElement(config.selectors.buttons.play));_toggleNativeControls(true);return;}
var controlsMissing=!_getElements(config.selectors.controls.wrapper).length;if(controlsMissing){_injectControls();}
if(!_findElements()){return;}
if(controlsMissing){_controlListeners();}
_mediaListeners();_toggleNativeControls();_setupFullscreen();_setupCaptions();_setVolume();_updateVolume();_timeUpdate();_checkPlaying();}
api={getOriginal:function(){return original;},getContainer:function(){return plyr.container},getEmbed:function(){return plyr.embed;},getMedia:function(){return plyr.media;},getType:function(){return plyr.type;},getDuration:_getDuration,getCurrentTime:function(){return plyr.media.currentTime;},getVolume:function(){return plyr.media.volume;},isMuted:function(){return plyr.media.muted;},isReady:function(){return _hasClass(plyr.container,config.classes.ready);},isLoading:function(){return _hasClass(plyr.container,config.classes.loading);},isPaused:function(){return plyr.media.paused;},on:function(event,callback){_on(plyr.container,event,callback);return this;},play:_play,pause:_pause,stop:function(){_pause();_seek();},restart:_seek,rewind:_rewind,forward:_forward,seek:_seek,source:_source,poster:_updatePoster,setVolume:_setVolume,togglePlay:_togglePlay,toggleMute:_toggleMute,toggleCaptions:_toggleCaptions,toggleFullscreen:_toggleFullscreen,toggleControls:_toggleControls,isFullscreen:function(){return plyr.isFullscreen||false;},support:function(mimeType){return _supportMime(plyr,mimeType);},destroy:_destroy};function _ready(){window.setTimeout(function(){_triggerEvent(plyr.media,'ready');},0);_toggleClass(plyr.media,defaults.classes.setup,true);_toggleClass(plyr.container,config.classes.ready,true);plyr.media.plyr=api;if(config.autoplay){_play();}}
_init();if(!plyr.init){return null;}
return api;}
function loadSprite(url,id){var x=new XMLHttpRequest();if(_is.string(id)&&_is.htmlElement(document.querySelector('#'+id))){return;}
var container=document.createElement('div');container.setAttribute('hidden','');if(_is.string(id)){container.setAttribute('id',id);}
document.body.insertBefore(container,document.body.childNodes[0]);if('withCredentials'in x){x.open('GET',url,true);}else{return;}
x.onload=function(){container.innerHTML=x.responseText;}
x.send();}
function supported(type){var browser=_browserSniff(),isOldIE=(browser.isIE&&browser.version<=9),isIos=browser.isIos,isIphone=browser.isIphone,audioSupport=!!document.createElement('audio').canPlayType,videoSupport=!!document.createElement('video').canPlayType,basic=false,full=false;switch(type){case 'video':basic=videoSupport;full=(basic&&(!isOldIE&&!isIphone));break;case 'audio':basic=audioSupport;full=(basic&&!isOldIE);break;case 'vimeo':basic=true;full=(!isOldIE&&!isIos);break;case 'youtube':basic=true;full=(!isOldIE&&!isIos);if(isIos&&!isIphone&&browser.version>=10){full=true;}
break;case 'soundcloud':basic=true;full=(!isOldIE&&!isIphone);break;default:basic=(audioSupport&&videoSupport);full=(basic&&!isOldIE);}
return{basic:basic,full:full};}
function setup(targets,options){var players=[],instances=[],selector=[defaults.selectors.html5,defaults.selectors.embed].join(',');if(_is.string(targets)){targets=document.querySelectorAll(targets);}else if(_is.htmlElement(targets)){targets=[targets];}else if(!_is.nodeList(targets)&&!_is.array(targets)&&!_is.string(targets)){if(_is.undefined(options)&&_is.object(targets)){options=targets;}
targets=document.querySelectorAll(selector);}
if(_is.nodeList(targets)){targets=Array.prototype.slice.call(targets);}
if(!supported().basic||!targets.length){return false;}
function add(target,media){if(!_hasClass(media,defaults.classes.hook)){players.push({target:target,media:media});}}
for(var i=0;i<targets.length;i++){var target=targets[i];var children=target.querySelectorAll(selector);if(children.length){for(var x=0;x<children.length;x++){add(target,children[x]);}}else if(_matches(target,selector)){add(target,target);}}
players.forEach(function(player){var element=player.target,media=player.media,match=false;if(media===element){match=true;}
var data={};try{data=JSON.parse(element.getAttribute('data-plyr'));}
catch(e){}
var config=_extend({},defaults,options,data);if(!config.enabled){return null;}
var instance=new Plyr(media,config);if(!_is.object(instance)){return;}
if(config.debug){var events=config.events.concat(['setup','statechange','enterfullscreen','exitfullscreen','captionsenabled','captionsdisabled']);_on(instance.getContainer(),events.join(' '),function(event){console.log([config.logPrefix,'event:',event.type].join(' '),event.detail.plyr);});}
_event(instance.getContainer(),'setup',true,{plyr:instance});instances.push(instance);});return instances;}
function get(container){if(_is.string(container)){container=document.querySelector(container);}else if(_is.undefined(container)){container=document.body;}
if(_is.htmlElement(container)){var elements=container.querySelectorAll('.'+defaults.classes.setup),instances=[];Array.prototype.slice.call(elements).forEach(function(element){if(_is.object(element.plyr)){instances.push(element.plyr);}});return instances;}
return[];}
return{setup:setup,supported:supported,loadSprite:loadSprite,get:get};}));(function(){if(typeof window.CustomEvent==='function'){return;}
function CustomEvent(event,params){params=params||{bubbles:false,cancelable:false,detail:undefined};var evt=document.createEvent('CustomEvent');evt.initCustomEvent(event,params.bubbles,params.cancelable,params.detail);return evt;}
CustomEvent.prototype=window.Event.prototype;window.CustomEvent=CustomEvent;})();