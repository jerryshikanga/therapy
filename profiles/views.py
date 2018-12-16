from django.contrib.auth import login, authenticate
from django.shortcuts import render
from django.views.generic import FormView, View
from django.urls import reverse_lazy
from .forms import SignUpForm, ProfileUpdateForm


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

    def form_valid(self, form):
        form.save(commit=False, user=self.request.user)
        return super(UpdateProfileView, self).form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(UpdateProfileView, self).get_form_kwargs()
        kwargs.update({"user":self.request.user})
        return kwargs
