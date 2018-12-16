from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from .forms import SignUpForm

from .models import Therapist, Patient


# Create your views here.
def index(request, *args, **kwargs):
    return render(request, "index.html")


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user_type = form.cleaned_data["type"]
            user = authenticate(username=username, password=raw_password)
            if user_type == "Therapist":
                Therapist.objects.create(user=user)
            elif user_type == "Patient":
                Patient.objects.create(user=user)
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'registration/registration.html', {'form': form})