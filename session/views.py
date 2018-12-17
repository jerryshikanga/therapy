from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, render
from django.utils.decorators import method_decorator
from django.views.generic import FormView, ListView, View, TemplateView
from django.shortcuts import redirect
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
        context_data.update({"recipient": Therapist.objects.get(id=self.kwargs["therapist_id"])})
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
        message = Message.new_message(from_user=self.request.user, to_users=[recipient, ], subject=subject,
                                      content=text)
        self.thread_id = message.thread_id
        return super(CreateSessionView, self).form_valid(form)


class MessageThreadView(View):

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(MessageThreadView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        thread = get_object_or_404(Thread, id=self.kwargs["thread_id"])
        thread.userthread_set.filter(user=self.request.user).update(unread=False)
        threads = []
        for t in Thread.objects.all():
            if self.request.user in t.users.all():
                threads.append(t)
        context = {
            "thread_active": thread,
            "recipient": thread.users.all()[0].get_full_name(),
            "threads": threads,
            "threads_unread": Thread.ordered(Thread.unread(self.request.user))
        }
        return render(self.request, "session/thread.html", context)

    def post(self, request, *args, **kwargs):
        thread = get_object_or_404(Thread, id=self.kwargs["thread_id"])
        content = str(self.request.POST.get("content")).strip()
        if content is not None or content != "":
            Message.new_reply(thread=thread, user=self.request.user, content=content)
        # return redirect(self.request.path)
        return self.get(self.request, *args, **kwargs)


class InboxView(TemplateView):
    """
    View inbox thread list.
    """
    # template_name = "session/inbox.html"
    template_name = "session/thread.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(InboxView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(InboxView, self).get_context_data(**kwargs)
        thread = Thread.ordered(Thread.inbox(self.request.user))[-1]
        thread.userthread_set.filter(user=self.request.user).update(unread=False)
        threads = []
        for t in Thread.objects.all():
            if self.request.user in t.users.all():
                threads.append(t)
        context.update({
            "thread_active": thread,
            "recipient": thread.users.all()[0].get_full_name(),
            "threads": threads,
            "threads_unread": Thread.ordered(Thread.unread(self.request.user))
        })
        return context
