from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Seed demo Parent and Admin portal users. Password: EduNova@123"

    def handle(self, *args, **options):
        User = get_user_model()
        parent_group, _ = Group.objects.get_or_create(name="Parent")
        admin_group, _ = Group.objects.get_or_create(name="Admin")

        parent, _ = User.objects.get_or_create(
            username="parent.demo",
            defaults={"email": "parent@edunova.edu", "first_name": "Ravi", "last_name": "Khan", "is_active": True},
        )
        parent.email = "parent@edunova.edu"
        parent.first_name = "Ravi"
        parent.last_name = "Khan"
        parent.set_password("EduNova@123")
        parent.save()
        parent.groups.add(parent_group)

        admin, _ = User.objects.get_or_create(
            username="admin.demo",
            defaults={"email": "admin@edunova.edu", "first_name": "Priya", "last_name": "Sharma", "is_active": True, "is_staff": True},
        )
        admin.email = "admin@edunova.edu"
        admin.first_name = "Priya"
        admin.last_name = "Sharma"
        admin.is_staff = True
        admin.set_password("EduNova@123")
        admin.save()
        admin.groups.add(admin_group)

        with connection.cursor() as c:
            # portal_user_profile rows
            c.execute("""
                INSERT INTO portal_user_profile (user_id, user_type, phone_number)
                VALUES (%s,'Parent','9000000003'), (%s,'Admin','9000000004')
                ON CONFLICT (user_id) DO UPDATE SET user_type=EXCLUDED.user_type, phone_number=EXCLUDED.phone_number
            """, [parent.id, admin.id])

            # parent profile — link to the demo student created by seed_portal_demo
            c.execute("""
                INSERT INTO portal_parent_profile (user_id, father_name, emergency_contact, is_verified)
                VALUES (%s,'Ravi Khan','9000000003',true)
                ON CONFLICT (user_id) DO UPDATE SET father_name=EXCLUDED.father_name
            """, [parent.id])

            # wire parent -> demo student (if student profile exists)
            c.execute("""
                UPDATE portal_student_profile
                SET parent_id = %s
                WHERE admission_number = 'EDN-STU-001' AND parent_id IS NULL
            """, [parent.id])

            # employee row for admin (required by portal_employee FK used in admin views)
            c.execute("""
                INSERT INTO portal_employee (user_id, employee_code, department, designation, is_active)
                VALUES (%s,'EMP-ADMIN-001','Administration','School Administrator',true)
                ON CONFLICT (user_id) DO UPDATE SET department=EXCLUDED.department, designation=EXCLUDED.designation
            """, [admin.id])

        self.stdout.write(self.style.SUCCESS("Demo parent/admin data seeded."))
        self.stdout.write("Parent login: parent@edunova.edu / EduNova@123 / OTP 123456")
        self.stdout.write("Admin  login: admin@edunova.edu  / EduNova@123 / OTP 123456")
