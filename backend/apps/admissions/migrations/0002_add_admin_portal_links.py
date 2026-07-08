from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("admissions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="admissionenquiry",
            name="student_user_id",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="admissionenquiry",
            name="parent_user_id",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
