from django.contrib import admin
from .models import (
    SchoolSettings, Campus, AcademicProgram, Department, LeadershipMember,
    SchoolStat, WhyChooseItem, TechnologyPartner, CMSPage, NewsPost, Event,
    GalleryAlbum, GalleryImage, Achievement, Testimonial, FAQ, Document,
    JobPosting, ContactSubmission, ScholarshipInfo,
)

admin.site.register(SchoolSettings)
admin.site.register(Campus)
admin.site.register(AcademicProgram)
admin.site.register(Department)
admin.site.register(LeadershipMember)
admin.site.register(SchoolStat)
admin.site.register(WhyChooseItem)
admin.site.register(TechnologyPartner)
admin.site.register(CMSPage)
admin.site.register(NewsPost)
admin.site.register(Event)
admin.site.register(GalleryAlbum)
admin.site.register(GalleryImage)
admin.site.register(Achievement)
admin.site.register(Testimonial)
admin.site.register(FAQ)
admin.site.register(Document)
admin.site.register(JobPosting)
admin.site.register(ScholarshipInfo)


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone", "submitted_at", "is_resolved"]
    list_filter = ["is_resolved"]
    readonly_fields = ["submitted_at"]
