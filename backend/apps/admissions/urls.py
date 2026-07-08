from rest_framework.routers import DefaultRouter
from .views import AdmissionEnquiryViewSet

router = DefaultRouter()
router.register("enquiries", AdmissionEnquiryViewSet, basename="enquiries")

urlpatterns = router.urls
