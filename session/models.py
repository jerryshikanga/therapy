from django.db import models
from django_extensions.db.models import TimeStampedModel
from profiles.models import Therapist, Patient
from author.decorators import with_author
from djchoices import ChoiceItem, DjangoChoices


# Create your models here.
@with_author
class TherapySession(TimeStampedModel):
    class SessionStates(DjangoChoices):
        progress = ChoiceItem("Progress")
        complete = ChoiceItem("Complete")
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    status = models.CharField(choices=SessionStates.choices, default=SessionStates.progress, max_length=10)
