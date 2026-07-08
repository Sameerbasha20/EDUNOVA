from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("settings", views.SchoolSettingsViewSet, basename="settings")
router.register("campuses", views.CampusViewSet, basename="campuses")
router.register("academic-programs", views.AcademicProgramViewSet, basename="academic-programs")
router.register("departments", views.DepartmentViewSet, basename="departments")
router.register("leadership", views.LeadershipMemberViewSet, basename="leadership")
router.register("stats", views.SchoolStatViewSet, basename="stats")
router.register("why-choose", views.WhyChooseItemViewSet, basename="why-choose")
router.register("tech-partners", views.TechnologyPartnerViewSet, basename="tech-partners")
router.register("pages", views.CMSPageViewSet, basename="pages")
router.register("news", views.NewsPostViewSet, basename="news")
router.register("events", views.EventViewSet, basename="events")
router.register("gallery-albums", views.GalleryAlbumViewSet, basename="gallery-albums")
router.register("gallery-images", views.GalleryImageViewSet, basename="gallery-images")
router.register("achievements", views.AchievementViewSet, basename="achievements")
router.register("testimonials", views.TestimonialViewSet, basename="testimonials")
router.register("faqs", views.FAQViewSet, basename="faqs")
router.register("documents", views.DocumentViewSet, basename="documents")
router.register("jobs", views.JobPostingViewSet, basename="jobs")
router.register("scholarships", views.ScholarshipInfoViewSet, basename="scholarships")
router.register("contact", views.ContactSubmissionViewSet, basename="contact")

urlpatterns = router.urls
