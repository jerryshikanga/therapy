from django.urls import path
from . import views

app_name = "profiles"

urlpatterns = [
    path("home", views.index, name="home"),
    path("register", views.signup, name="register")
]