from django.db import models
from django.contrib.auth.models import User
from django_extensions.db.models import TimeStampedModel
from phonenumber_field.modelfields import PhoneNumberField
from django.utils import timesince
from author.decorators import with_author
from djchoices import ChoiceItem, DjangoChoices


# Create your models here.
class Genders(DjangoChoices):
    Male = ChoiceItem("Male")
    Female = ChoiceItem("Female")


class AbstractProfile(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(choices=Genders.choices, null=True, blank=True, max_length=10)
    description = models.TextField(null=True, blank=True)
    telephone = PhoneNumberField(blank=True, null=True)
    picture = models.ImageField(upload_to="profiles", null=True, blank=True)

    class Meta:
        abstract = True

    def get_age(self):
        return timesince.timesince(self.date_of_birth)

    def __str__(self):
        return self.user.get_full_name()


@with_author
class Therapist(AbstractProfile):
    sessions = models.IntegerField(default=0)
    rating_total = models.IntegerField(default=0)
    raters = models.IntegerField(default=0)


class Patient(AbstractProfile):
    pass
