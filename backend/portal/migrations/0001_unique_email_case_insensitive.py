"""
Enforces case-insensitive email uniqueness on Django's built-in auth_user
table at the database level.

Application code already checks for a duplicate email in one place
(UserListView.post in admin_views.py), but that check is bypassed by
`manage.py createsuperuser`, the Django admin's own "add user" form, and any
future code path that doesn't remember to call it -- which is exactly how
two pairs of accounts ended up sharing an email in the live database
(found during QA testing, see qa_test_report.md TC-SEC-06). A DB-level
constraint is the only thing that closes this for every path at once.

IMPORTANT -- do NOT run this migration until the existing duplicate emails
are resolved first:
    admin@edunova.edu               (user ids 16 and 5)
    jhansilakshmi1004@gmail.com     (user ids 21 and 17)
CREATE UNIQUE INDEX will fail with a duplicate-key error while those rows
exist. Change one of each pair's email (or deactivate/merge the account),
then run `manage.py migrate portal`.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE UNIQUE INDEX auth_user_email_ci_uniq
                ON auth_user (LOWER(email))
                WHERE email <> '';
            """,
            reverse_sql="DROP INDEX IF EXISTS auth_user_email_ci_uniq;",
        ),
    ]
