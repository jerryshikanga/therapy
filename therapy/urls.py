"""therapy URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

from profiles.views import index

urlpatterns = [
    path("", index, name="index_page"),
    path("/", index, name="index_page"),
    path('admin/', admin.site.urls),
    path("messages/", include("pinax.messages.urls", namespace="pinax_messages")),
    path("profiles/", include("profiles.urls")),
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
