from django.urls import path
from . import views

app_name = "session"

urlpatterns = [
    path("therapist/list/", views.TherapistListView.as_view(), name="therapist_list"),
    path("session/start/therapist/<int:therapist_id>/", views.CreateSessionView.as_view(), name="start_session_with_therapist")
]