from django.core.management.base import BaseCommand
from apps.cms.models import (
    SchoolSettings, AcademicProgram, Department, SchoolStat, WhyChooseItem,
    TechnologyPartner, CMSPage, FAQ, ScholarshipInfo,
)


class Command(BaseCommand):
    help = "Seed the public portal with EduNova's actual requirements-doc content"

    def handle(self, *args, **options):
        SchoolSettings.objects.update_or_create(
            pk=1,
            defaults=dict(
                legal_name="EduNova Global Academy Private Limited",
                tagline="Inspiring Minds. Building Futures.",
                website_domain="www.edunovaacademy.edu.in",
                company_type="Private Limited Educational Institution",
                established_year=2015,
            ),
        )

        programs = [
            "Pre Primary", "Middle School", "High School", "Senior Secondary",
            "Cambridge Curriculum", "CBSE", "International Programs",
            "STEM Education", "Skill Development",
        ]
        for i, name in enumerate(programs):
            AcademicProgram.objects.update_or_create(name=name, defaults={"sort_order": i})

        departments = [
            "Academic Affairs", "Admissions", "Student Services", "Transport",
            "Library", "Finance", "Accounts", "Human Resources",
            "IT Department", "Examination Cell", "Sports", "Hostel",
            "Medical Center", "Research", "Innovation Lab",
        ]
        for name in departments:
            Department.objects.get_or_create(name=name)

        stats = [
            ("Students", "6,500+"), ("Employees", "620+"), ("Teachers", "350+"),
            ("Smart Classrooms", "45+"), ("Science Labs", "18"),
            ("Computer Labs", "6"), ("Innovation Centers", "2"),
            ("Board Results", "98%"), ("Digital Campus", "100%"),
        ]
        for i, (label, value) in enumerate(stats):
            SchoolStat.objects.update_or_create(label=label, defaults={"value": value, "sort_order": i})

        why_choose = [
            "Smart Campus", "Digital Classrooms", "Experienced Faculty",
            "AI Learning Analytics", "Parent Mobile App", "Online Fee Payments",
            "Digital Attendance", "CBSE Curriculum", "Robotics Lab",
            "STEM Education", "Career Counseling", "24x7 Parent Support",
        ]
        for i, title in enumerate(why_choose):
            WhyChooseItem.objects.update_or_create(title=title, defaults={"sort_order": i})

        partners = [
            "Google Workspace", "Microsoft Education", "AWS Educate",
            "Cisco Networking Academy", "Intel Education",
            "Adobe Creative Cloud", "Oracle Academy", "Zoom", "Moodle",
            "OpenAI Education",
        ]
        for i, name in enumerate(partners):
            TechnologyPartner.objects.update_or_create(name=name, defaults={"sort_order": i})

        pages = {
            "about": ("About EduNova", (
                "EduNova Global Academy Private Limited is one of India's leading "
                "educational institutions offering holistic education through "
                "innovative teaching methodologies, digital transformation, and "
                "advanced academic management systems."
            )),
            "privacy-policy": ("Privacy Policy", "Privacy policy content goes here."),
            "terms": ("Terms & Conditions", "Terms & conditions content goes here."),
            "student-life": ("Student Life", "Student life content goes here."),
            "infrastructure": ("Infrastructure", "Infrastructure content goes here."),
            "facilities": ("Facilities", "Facilities content goes here."),
            "sports": ("Sports", "Sports content goes here."),
            "careers": ("Careers", "Careers content goes here."),
            "library": ("Library", "Public-facing library info goes here."),
            "transport": ("Transport", "Public-facing transport info goes here."),
            "hostel": ("Hostel", "Public-facing hostel info goes here."),
        }
        for slug, (title, content) in pages.items():
            CMSPage.objects.update_or_create(slug=slug, defaults={"title": title, "content_html": content})

        faqs = [
            ("What curricula does EduNova offer?", "We offer CBSE and Cambridge curricula across our campuses."),
            ("How do I apply for admission?", "Visit the Admissions page and complete the online registration form."),
            ("Does EduNova offer scholarships?", "Yes — see the Scholarships section on the Admissions page for eligibility."),
        ]
        for i, (q, a) in enumerate(faqs):
            FAQ.objects.update_or_create(question=q, defaults={"answer": a, "sort_order": i})

        ScholarshipInfo.objects.update_or_create(
            name="Merit Scholarship",
            defaults={
                "description": "Awarded to students with outstanding academic performance.",
                "eligibility": "Minimum 90% in previous academic year.",
                "coverage_percent": 50,
                "sort_order": 0,
            },
        )

        # --- Sample content below is placeholder — replace via /admin/ once
        # real testimonials/news/events/achievements are available. It
        # exists only so the homepage doesn't render empty during dev. ---
        from apps.cms.models import Testimonial, NewsPost, Event, Achievement
        import datetime

        sample_testimonials = [
            ("Anjali Rao", "Parent", "The digital attendance and fee payment features have made staying on top of my daughter's school life so much easier."),
            ("Rohit Sen", "Alumnus, Class of 2022", "The STEM and robotics programs at EduNova gave me a real head start before engineering college."),
            ("Priya Nair", "Student, Grade 11", "The AI tutor and online LMS help me revise at my own pace outside class hours."),
        ]
        for i, (name, role, msg) in enumerate(sample_testimonials):
            Testimonial.objects.update_or_create(author_name=name, defaults={"role": role, "message": msg, "sort_order": i})

        today = datetime.date.today()
        sample_news = [
            ("EduNova Wins State-Level Robotics Championship", "Our senior robotics team secured first place at the state-level competition, showcasing months of work in the Innovation Lab."),
            ("New AI-Powered Learning Analytics Dashboard Launched", "Parents and teachers can now track personalized learning progress through our new analytics dashboard."),
        ]
        for i, (title, content) in enumerate(sample_news):
            NewsPost.objects.update_or_create(
                slug=title.lower().replace(" ", "-")[:50],
                defaults={"title": title, "content": content, "published_date": today - datetime.timedelta(days=i * 5)},
            )

        sample_events = [
            ("Annual Sports Day", "Inter-house athletics and team sports competitions.", today + datetime.timedelta(days=20), "EduNova Sports Complex"),
            ("Science & Innovation Fair", "Student-led exhibitions from the Innovation Lab and Science Labs.", today + datetime.timedelta(days=35), "Main Auditorium"),
        ]
        for title, desc, edate, venue in sample_events:
            Event.objects.update_or_create(title=title, defaults={"description": desc, "event_date": edate, "venue": venue})

        sample_achievements = [
            ("98% Board Examination Results", "Highest-ever pass percentage achieved this academic year.", today - datetime.timedelta(days=60)),
            ("National Science Olympiad — 12 Medals", "Students brought home 12 medals across categories.", today - datetime.timedelta(days=90)),
        ]
        for title, desc, adate in sample_achievements:
            Achievement.objects.update_or_create(title=title, defaults={"description": desc, "achievement_date": adate})

        self.stdout.write(self.style.SUCCESS("Public portal seed data loaded."))
