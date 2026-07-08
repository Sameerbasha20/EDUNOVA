"""
RBAC + object-ownership tests across all four portals.

Complements test_auth.py (which covers the OTP login flow itself) by
covering what happens *after* login: does the role resolved at login time
actually gate access to each portal's endpoints, and does object-level
ownership (a parent's own child, and only that child) hold up under a
direct HTTP request rather than just a trusted UI.

Run with:
    python manage.py test portal.tests.test_rbac
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.db import connection
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

DASHBOARDS = {
    "Student": "/api/student/dashboard/",
    "Teacher": "/api/teacher/dashboard/",
    "Parent": "/api/parent/dashboard/",
    "Admin": "/api/admin-portal/dashboard/",
}


def _auth_header(user):
    access = RefreshToken.for_user(user).access_token
    return {"HTTP_AUTHORIZATION": f"Bearer {access}"}


def _make_user(username, group_name, email=None):
    user = User.objects.create_user(
        username=username, password="TestPass@99", email=email or f"{username}@edunova.edu"
    )
    group, _ = Group.objects.get_or_create(name=group_name)
    user.groups.add(group)
    return user


class RoleBasedAccessTests(TestCase):
    """Only the matching role should be able to reach each portal's dashboard."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # portal_* tables are raw-SQL, not Django migrations, so a freshly
        # created test database doesn't have them until this runs.
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.student = _make_user("rbac_student", "Student")
        self.teacher = _make_user("rbac_teacher", "Teacher")
        self.parent = _make_user("rbac_parent", "Parent")
        self.admin = _make_user("rbac_admin", "Admin")

    def test_unauthenticated_request_is_401(self):
        for role, path in DASHBOARDS.items():
            resp = self.client.get(path)
            self.assertEqual(resp.status_code, 401, f"{path} should require auth")

    def test_each_role_can_reach_only_its_own_dashboard(self):
        users_by_role = {
            "Student": self.student,
            "Teacher": self.teacher,
            "Parent": self.parent,
            "Admin": self.admin,
        }
        for owner_role, user in users_by_role.items():
            headers = _auth_header(user)
            for dash_role, path in DASHBOARDS.items():
                resp = self.client.get(path, **headers)
                if dash_role == owner_role:
                    self.assertNotEqual(
                        resp.status_code, 403,
                        f"{owner_role} was blocked from its own dashboard {path}",
                    )
                else:
                    self.assertEqual(
                        resp.status_code, 403,
                        f"{owner_role} should be denied {path} (got {resp.status_code})",
                    )

    def test_superuser_without_group_resolves_to_admin(self):
        superuser = User.objects.create_superuser(
            username="rbac_super", password="TestPass@99", email="super@edunova.edu"
        )
        resp = self.client.get(DASHBOARDS["Admin"], **_auth_header(superuser))
        self.assertNotEqual(resp.status_code, 403)

    def test_is_staff_alone_does_not_grant_admin(self):
        # Regression guard: a CMS content editor (is_staff=True) must not
        # automatically gain Admin Portal authority over fees/medical/family
        # data just by having Django admin-site access.
        staff_user = User.objects.create_user(
            username="rbac_staff", password="TestPass@99", email="staff@edunova.edu"
        )
        staff_user.is_staff = True
        staff_user.save()
        resp = self.client.get(DASHBOARDS["Admin"], **_auth_header(staff_user))
        self.assertEqual(resp.status_code, 403)


class ParentChildOwnershipTests(TestCase):
    """A parent may read their own child's records and no one else's."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("apply_portal_schema", verbosity=0)

    def setUp(self):
        self.parent_a = _make_user("rbac_parent_a", "Parent", email="parent_a@edunova.edu")
        self.parent_b = _make_user("rbac_parent_b", "Parent", email="parent_b@edunova.edu")
        self.child = _make_user("rbac_child", "Student", email="child@edunova.edu")
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_student_profile (user_id, parent_id, admission_number) "
                "VALUES (%s, %s, %s)",
                [self.child.id, self.parent_a.id, "RBAC-TEST-001"],
            )

    def test_owning_parent_can_access_child_attendance(self):
        resp = self.client.get(
            f"/api/parent/attendance/?child_id={self.child.id}", **_auth_header(self.parent_a)
        )
        self.assertNotEqual(resp.status_code, 403)

    def test_other_parent_cannot_access_child_attendance(self):
        resp = self.client.get(
            f"/api/parent/attendance/?child_id={self.child.id}", **_auth_header(self.parent_b)
        )
        self.assertEqual(resp.status_code, 403)

    def test_other_parent_cannot_access_child_fees(self):
        resp = self.client.get(
            f"/api/parent/fees/?child_id={self.child.id}", **_auth_header(self.parent_b)
        )
        self.assertEqual(resp.status_code, 403)

    def test_other_parent_cannot_access_child_results(self):
        resp = self.client.get(
            f"/api/parent/results/?child_id={self.child.id}", **_auth_header(self.parent_b)
        )
        self.assertEqual(resp.status_code, 403)

    def test_parent_cannot_access_nonexistent_child(self):
        resp = self.client.get(
            "/api/parent/attendance/?child_id=999999", **_auth_header(self.parent_a)
        )
        self.assertEqual(resp.status_code, 403)

    def test_owning_parent_children_list_includes_child(self):
        resp = self.client.get("/api/parent/children/", **_auth_header(self.parent_a))
        self.assertEqual(resp.status_code, 200)
        ids = [c["id"] for c in resp.json()]
        self.assertIn(self.child.id, ids)

    def test_other_parent_children_list_excludes_child(self):
        resp = self.client.get("/api/parent/children/", **_auth_header(self.parent_b))
        self.assertEqual(resp.status_code, 200)
        ids = [c["id"] for c in resp.json()]
        self.assertNotIn(self.child.id, ids)
