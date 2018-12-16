from django.db import models
from django.contrib.auth.models import User
from django_extensions.db.models import TimeStampedModel
from author.decorators import with_author


# Create your models here.
@with_author
class Therapist(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating_total = models.IntegerField(default=0)
    raters = models.IntegerField(default=0)


class Patient(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
