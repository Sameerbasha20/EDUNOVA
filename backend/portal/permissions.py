"""Deprecated shim — this file used to import Student/Teacher ORM models that
were never actually declared in portal/models.py (this project stores portal
data via raw SQL against portal_* tables, not Django ORM models — see
models.py). That made this module dead code that would crash if anything ever
imported it. Real role-based permission classes now live in portal/roles.py.
Kept here only so any external reference doesn't hard-crash the app.
"""
from .roles import (  # noqa: F401
    IsAdmin,
    IsAdminOrTeacher,
    IsParent,
    IsStudent,
    IsTeacher,
    RoleRequired,
    get_role,
)
