from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic import ListView, View, TemplateView
from pinax.messages.models import Message, Thread

from profiles.models import Therapist


# Create your views here.
class TherapistListView(ListView):
    model = Therapist
    queryset = Therapist.objects.all()
    template_name = "session/therapist_list.html"


class CreateSessionView(View):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(CreateSessionView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        therapist = Therapist.objects.get(id=self.kwargs["therapist_id"])
        subject = "Therapy between {} and {}".format(self.request.user.first_name, therapist.user.first_name)
        content = "Hello {}, I would like to have a session with you.".format(therapist.user.get_full_name())
        thread = None
        for t in self.request.user.userthread_set.all():
            if therapist.user in t.thread.users.all():
                thread = t.thread
        if thread is None:
            message = Message.new_message(from_user=self.request.user, to_users=[therapist.user,], subject=subject, content=content)
            thread = message.thread
        url = reverse_lazy("session:message_thread", args=[thread.id])
        return redirect(url)


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
