from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic import FormView, ListView, UpdateView, TemplateView
from pinax.messages.forms import MessageReplyForm
from pinax.messages.models import Message, Thread

from profiles.models import Therapist
from .forms import NewMessageForm as InternalNewMessageForm


# Create your views here.
class TherapistListView(ListView):
    model = Therapist
    queryset = Therapist.objects.all()
    template_name = "session/therapist_list.html"


class CreateSessionView(FormView):
    form_class = InternalNewMessageForm
    template_name = "session/new_message_form.html"

    def __init__(self, *args, **kwargs):
        self.thread_id = None
        super(CreateSessionView, self).__init__(*args, **kwargs)

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(CreateSessionView, self).dispatch(*args, **kwargs)

    def get_success_url(self):
        return reverse_lazy("session:message_thread", args=[self.thread_id])

    def get_context_data(self, **kwargs):
        context_data = super(CreateSessionView, self).get_context_data(**kwargs)
        context_data.update({"recipient":Therapist.objects.get(id=self.kwargs["therapist_id"])})
        return context_data

    def get_form_kwargs(self):
        kwargs = super(CreateSessionView, self).get_form_kwargs()
        therapist = Therapist.objects.get(id=self.kwargs["therapist_id"])
        kwargs.update({
            "recipient": therapist,
            "sender": self.request.user,
        })
        return kwargs

    def form_valid(self, form):
        text = form.cleaned_data["text"]
        recipient = Therapist.objects.get(id=form.cleaned_data["recipient"]).user
        subject = "Request for new Therapy Session"
        message = Message.new_message(from_user=self.request.user, to_users=[recipient,], subject=subject, content=text)
        self.thread_id = message.thread_id
        return super(CreateSessionView, self).form_valid(form)


class MessageThreadView(UpdateView):

    """
        View a single Thread or POST a reply.
    """
    model = Thread
    form_class = MessageReplyForm
    context_object_name = "thread"
    template_name = "session/thread.html"
    success_url = reverse_lazy("session:inbox_view")

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(MessageThreadView, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        qs = super(MessageThreadView, self).get_queryset()
        qs = qs.filter(userthread__user=self.request.user).distinct()
        return qs

    def get_form_kwargs(self):
        kwargs = super(MessageThreadView, self).get_form_kwargs()
        kwargs.update({
            "user": self.request.user,
            "thread": self.object
        })
        return kwargs

    def get(self, request, *args, **kwargs):
        response = super(MessageThreadView, self).get(request, *args, **kwargs)
        self.object.userthread_set.filter(user=request.user).update(unread=False)
        return response


class InboxView(TemplateView):
    """
    View inbox thread list.
    """
    # template_name = "session/inbox.html"
    template_name = "session/inbox.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(InboxView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(InboxView, self).get_context_data(**kwargs)
        if self.kwargs.get("deleted", None):
            threads = Thread.ordered(Thread.deleted(self.request.user))
            folder = "deleted"
        else:
            threads = Thread.ordered(Thread.inbox(self.request.user))
            folder = "inbox"

        context.update({
            "folder": folder,
            "threads": threads,
            "threads_unread": Thread.ordered(Thread.unread(self.request.user))
        })
        return context
