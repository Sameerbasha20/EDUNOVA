from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .status_view import status_dashboard

urlpatterns = [
    path("", status_dashboard, name="status-dashboard"),
    path("admin/", admin.site.urls),
    path("api/cms/", include("apps.cms.urls")),
    path("api/admissions/", include("apps.admissions.urls")),
    path("api/", include("portal.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
