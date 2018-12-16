from django.urls import path
from . import views

app_name = "profiles"

urlpatterns = [
    path("home", views.index, name="home"),
    path("register", views.SignUpView.as_view(), name="register"),
    path("profile/update/", views.UpdateProfileView.as_view(), name="create_profile_view"),
]