from django.shortcuts import render
from django.views.generic import FormView, ListView
from profiles.models import Therapist


# Create your views here.
class NewSession(FormView):
    pass


class TherapistListView(ListView):
    model = Therapist
    queryset = Therapist.objects.all()
    template_name = "session/therapist_list.html"


def start_session(request, *args, **kwargs):
    therapist = Therapist.objects.get(id=kwargs["id"])
    context = {
        "patient": request.user,
        "therapist": therapist
    }
    return render(request, "session/new_message_form.html", context=context)
