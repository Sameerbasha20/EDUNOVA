"""Shared RBAC helpers.

Role is derived per-request (never trusted from the client) from, in order:
1. portal_user_profile.user_type (source of truth once the portal schema is applied)
2. Django group membership (Student/Teacher/Parent/Admin/Employee)
3. is_staff / is_superuser -> Admin
4. fallback: Student

This mirrors the logic already used in auth_views.get_user_role so that the
role handed out at login time and the role enforced on every subsequent
request are always computed the same way.
"""
from django.db import connection
from rest_framework.permissions import BasePermission

ROLE_ORDER = ["Student", "Teacher", "Parent", "Admin", "Employee"]


def _table_exists(table_name):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = %s
            )
            """,
            [table_name],
        )
        return cursor.fetchone()[0]


def get_role(user):
    if not user or not getattr(user, "is_authenticated", False):
        return None
    try:
        if _table_exists("portal_user_profile"):
            with connection.cursor() as cursor:
                cursor.execute("SELECT user_type FROM portal_user_profile WHERE user_id = %s", [user.id])
                row = cursor.fetchone()
                if row:
                    return row[0]
    except Exception:
        pass

    group_names = list(user.groups.values_list("name", flat=True))
    for role in ROLE_ORDER:
        if role in group_names:
            return role
    # SECURITY: only a genuine superuser auto-qualifies as Admin here — not
    # merely is_staff. is_staff is granted to give someone /admin/ access for
    # CMS content editing; it must never silently also grant Admin Portal
    # authority over fees, medical records, and every family's data. If a
    # non-superuser genuinely needs Admin Portal access, put them in the
    # "Admin" Django group (or set portal_user_profile.user_type='Admin')
    # explicitly instead of relying on this fallback.
    if user.is_superuser:
        return "Admin"
    return "Student"


def log_action(actor, action, target_type="", target_id="", details=None):
    """Append a row to portal_audit_log. Silently no-ops if the extension
    SQL hasn't been applied yet, so this is always safe to call."""
    import json
    if not _table_exists("portal_audit_log"):
        return
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO portal_audit_log (actor_id, action, target_type, target_id, details) VALUES (%s,%s,%s,%s,%s)",
            [getattr(actor, "id", None), action, target_type, str(target_id), json.dumps(details or {})],
        )


class RoleRequired(BasePermission):
    """Use as `permission_classes = [RoleRequired.for_roles('Admin')]`."""

    allowed_roles = ()

    @classmethod
    def for_roles(cls, *roles):
        return type("RoleRequiredScoped", (cls,), {"allowed_roles": roles})

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        role = get_role(request.user)
        request.user_role = role  # cache for the view
        return role in self.allowed_roles


IsAdmin = RoleRequired.for_roles("Admin")
IsParent = RoleRequired.for_roles("Parent")
IsTeacher = RoleRequired.for_roles("Teacher")
IsStudent = RoleRequired.for_roles("Student")
IsAdminOrTeacher = RoleRequired.for_roles("Admin", "Teacher")
