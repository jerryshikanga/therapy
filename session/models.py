from django.db import models
from django_extensions.db.models import TimeStampedModel
from profiles.models import Therapist, Patient
from author.decorators import with_author


# Create your models here.
@with_author
class TherapySession(TimeStampedModel):
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
