from django.shortcuts import render
from django.views.generic import FormView, ListView, View
from profiles.models import Therapist
from pinax.messages.forms import NewMessageForm as PinaxNewMessageForm
from .forms import NewMessageForm as InternalNewMessageForm
from pinax.messages.models import Message
from django.urls import reverse_lazy


# Create your views here.
class NewSession(FormView):
    pass


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

    def get_success_url(self):
        return reverse_lazy("pinax-messages:thread_detail", args=[self.thread_id])

    def get_context_data(self, **kwargs):
        context_data = super(CreateSessionView, self).get_context_data(**kwargs)
        context_data.update({"recipient":Therapist.objects.get(id=self.kwargs["therapist_id"])})
        return context_data

    def form_valid(self, form):
        text = form.cleaned_data["text"]
        recipient = Therapist.objects.get(id=form.cleaned_data["recipient"]).user
        subject = "Request for new Therapy Session"
        message = Message.new_message(from_user=self.request.user, to_users=[recipient,], subject=subject, content=text)
        self.thread_id = message.thread_id
        return super(CreateSessionView, self).form_valid(form)
