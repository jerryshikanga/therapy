from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import AbstractProfile, Therapist, Patient
from djchoices import DjangoChoices, ChoiceItem


class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2',)


class UserRoles(DjangoChoices):
    Therapist = ChoiceItem("Therapist")
    Patient = ChoiceItem("Patient")


class ProfileUpdateForm(forms.ModelForm):
    role = forms.ChoiceField(widget=forms.RadioSelect(), choices=UserRoles.choices, initial=UserRoles.Patient)
    telephone = forms.CharField(widget=forms.TextInput(), help_text="Use International format e.g. +254...")
    date_of_birth = forms.CharField(widget=forms.DateInput(format='%d/%m/%Y'), help_text="Use format YYYY-MM-DD")
    picture = forms.ImageField()

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user")
        self.picture = kwargs.pop("picture") if "picture" in kwargs else None
        super(ProfileUpdateForm, self).__init__(*args, **kwargs)

    class Meta:
        model = AbstractProfile
        fields = ["gender", "date_of_birth", "description", "telephone", "picture"]

    def save(self, *args, **kwargs):
        user_role = self.cleaned_data.get("role")
        kwargs = self.cleaned_data
        kwargs.update({
            "user": self.user,
            "picture": self.picture
        })
        if user_role == UserRoles.Therapist:
            return Therapist.objects.get_or_create(user=kwargs["user"])
        elif user_role == UserRoles.Patient:
            return Patient.objects.get_or_create(user=kwargs["user"])
