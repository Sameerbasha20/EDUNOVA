from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from portal.admin_views import assign_role_id
from portal.roles import get_role

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Assign an ID number (admission_number/employee_code/parent_code) to "
        "every existing Student/Teacher/Parent account that doesn't already "
        "have one -- covers accounts created before ID auto-assignment was "
        "wired into account creation, and any demo/seed data."
    )

    def handle(self, *args, **options):
        has_id = 0
        skipped = 0
        for user in User.objects.all().iterator():
            role = get_role(user)
            if role not in ("Student", "Teacher", "Parent"):
                skipped += 1
                continue
            id_number = assign_role_id(user, role)
            if not id_number:
                skipped += 1
                continue
            has_id += 1
            self.stdout.write(f"{role:8} {user.username:30} {id_number}")
        self.stdout.write(self.style.SUCCESS(
            f"Done. {has_id} Student/Teacher/Parent accounts have an ID number "
            f"(existing or newly assigned this run), {skipped} skipped (Admin/Employee, "
            f"or portal schema not applied)."
        ))
