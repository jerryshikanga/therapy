from django.contrib.auth import login, authenticate
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.forms import model_to_dict
from .forms import SignUpForm, ProfileUpdateForm
from .models import Therapist, Patient


# Create your views here.
def index(request, *args, **kwargs):
    return render(request, "index.html")


class SignUpView(FormView):
    form_class = SignUpForm
    template_name = "registration/registration.html"
    success_url = reverse_lazy("profiles:create_profile_view")

    def form_valid(self, form):
        form.save()
        username = form.cleaned_data.get('username')
        raw_password = form.cleaned_data.get('password1')
        user = authenticate(username=username, password=raw_password)
        login(self.request, user)
        return super(SignUpView, self).form_valid(form)


class UpdateProfileView(FormView):
    form_class = ProfileUpdateForm
    template_name = "registration/update_profile"
    success_url = reverse_lazy("home")

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(UpdateProfileView, self).dispatch(*args, **kwargs)

    def get_initial(self):
        initial = super(UpdateProfileView, self).get_initial()
        user = self.request.user
        fields = ["gender", "date_of_birth", "description", "telephone", "picture"]
        if Patient.objects.filter(user=user).exists():
            data = model_to_dict(Patient.objects.filter(user=user).first())
        elif Therapist.objects.filter(user=user).exists():
            data = model_to_dict(Therapist.objects.filter(user=user).first())
        else:
            data = None
        if data is not None:
            initial.update(data)
        return initial

    def form_valid(self, form):
        form.save(commit=False, user=self.request.user)
        return super(UpdateProfileView, self).form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(UpdateProfileView, self).get_form_kwargs()
        kwargs.update({"user":self.request.user})
        return kwargs
