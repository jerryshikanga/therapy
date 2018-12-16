from django import forms


class NewSessionForm(forms.Form):
    pass


class NewMessageForm(forms.Form):
    text = forms.CharField(widget=forms.Textarea(), required=True)
    recipient = forms.IntegerField(max_value=9999, required=True)
