from django import forms
from pinax.messages.models import Message


class NewMessageForm(forms.Form):
    subject = forms.CharField()
    content = forms.CharField(widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        self.sender = kwargs.pop("sender")
        self.recipient = kwargs.pop("recipient")
        super(NewMessageForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        data = self.cleaned_data
        return Message.new_message(
            self.sender, [self.recipient], data["subject"], data["content"]
        )


class MessageReplyForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.thread = kwargs.pop("thread")
        self.user = kwargs.pop("user")
        super(MessageReplyForm, self).__init__(*args, **kwargs)

    def save(self, commit=True):
        return Message.new_reply(
            self.thread, self.user, self.cleaned_data["content"]
        )

    class Meta:
        model = Message
        fields = ["content"]
