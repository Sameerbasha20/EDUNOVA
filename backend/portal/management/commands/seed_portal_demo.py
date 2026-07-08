from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Seed demo Student and Teacher portal users/data. Password: EduNova@123"

    def handle(self, *args, **options):
        User = get_user_model()
        student_group, _ = Group.objects.get_or_create(name="Student")
        teacher_group, _ = Group.objects.get_or_create(name="Teacher")

        teacher, created = User.objects.get_or_create(
            username="teacher.demo",
            defaults={"email": "teacher@edunova.edu", "first_name": "Aarav", "last_name": "Mehta", "is_active": True},
        )
        teacher.email = "teacher@edunova.edu"
        teacher.first_name = "Aarav"
        teacher.last_name = "Mehta"
        teacher.set_password("EduNova@123")
        teacher.save()
        teacher.groups.add(teacher_group)

        student, created = User.objects.get_or_create(
            username="student.demo",
            defaults={"email": "student@edunova.edu", "first_name": "Sara", "last_name": "Khan", "is_active": True},
        )
        student.email = "student@edunova.edu"
        student.first_name = "Sara"
        student.last_name = "Khan"
        student.set_password("EduNova@123")
        student.save()
        student.groups.add(student_group)

        with connection.cursor() as c:
            c.execute("""
                INSERT INTO portal_user_profile (user_id, user_type, phone_number)
                VALUES (%s,'Teacher','9000000001'), (%s,'Student','9000000002')
                ON CONFLICT (user_id) DO UPDATE SET user_type=EXCLUDED.user_type, phone_number=EXCLUDED.phone_number
            """, [teacher.id, student.id])
            c.execute("""
                INSERT INTO portal_teacher_profile (user_id, employee_code, qualification, specialization, date_of_joining)
                VALUES (%s,'TCH-DEMO-001','M.Sc., B.Ed.','Mathematics', current_date - interval '3 years')
                ON CONFLICT (user_id) DO UPDATE SET qualification=EXCLUDED.qualification, specialization=EXCLUDED.specialization
            """, [teacher.id])
            c.execute("""
                INSERT INTO portal_class (name, section, curriculum, room_number)
                VALUES ('Grade 8','A','CBSE','B-204')
                ON CONFLICT (name, section) DO UPDATE SET curriculum=EXCLUDED.curriculum
                RETURNING id
            """)
            class_id = c.fetchone()[0]
            c.execute("""
                INSERT INTO portal_subject (name, subject_code, type)
                VALUES ('Mathematics','MATH-8','Theory')
                ON CONFLICT (subject_code) DO UPDATE SET name=EXCLUDED.name
                RETURNING id
            """)
            subject_id = c.fetchone()[0]
            c.execute("""
                INSERT INTO portal_student_profile (user_id, admission_number, qr_id_code, date_of_birth, gender, blood_group, status)
                VALUES (%s,'EDN-STU-001','QR-EDN-STU-001','2012-06-12','Female','O+','Active')
                ON CONFLICT (user_id) DO UPDATE SET admission_number=EXCLUDED.admission_number, status=EXCLUDED.status
            """, [student.id])
            c.execute("""
                INSERT INTO portal_student_enrollment (student_id, class_id, academic_year, roll_number)
                VALUES (%s,%s,'2026-27',12)
                ON CONFLICT (student_id, class_id, academic_year) DO UPDATE SET roll_number=EXCLUDED.roll_number
            """, [student.id, class_id])
            c.execute("""
                INSERT INTO portal_academic_allocation (class_id, subject_id, teacher_id)
                VALUES (%s,%s,%s)
                ON CONFLICT (class_id, subject_id, teacher_id) DO NOTHING
            """, [class_id, subject_id, teacher.id])
            c.execute("""
                INSERT INTO portal_course (subject_id, class_id, title, description)
                VALUES (%s,%s,'Mathematics Grade 8','Demo course for Grade 8 Mathematics')
                ON CONFLICT DO NOTHING
                RETURNING id
            """, [subject_id, class_id])
            row = c.fetchone()
            if row:
                course_id = row[0]
                c.execute("""
                    INSERT INTO portal_course_content (course_id, content_type, title, resource_url, sort_order)
                    VALUES (%s,'PDF_Notes','Chapter 1 — Linear Equations','https://example.com/demo-notes.pdf',1)
                """, [course_id])
            for i, day in enumerate(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]):
                c.execute("""
                    INSERT INTO portal_timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time)
                    SELECT %s,%s,%s,%s,'09:00','09:45'
                    WHERE NOT EXISTS (
                      SELECT 1 FROM portal_timetable WHERE class_id=%s AND subject_id=%s AND teacher_id=%s AND day_of_week=%s
                    )
                """, [class_id, subject_id, teacher.id, day, class_id, subject_id, teacher.id, day])
            for offset, status in enumerate(["Present", "Present", "Late", "Present", "Absent"]):
                c.execute("""
                    INSERT INTO portal_attendance (student_id, class_id, date, status, marked_by, remarks)
                    VALUES (%s,%s,%s,%s,%s,'Demo record')
                    ON CONFLICT (student_id, class_id, date) DO UPDATE SET status=EXCLUDED.status
                """, [student.id, class_id, date.today() - timedelta(days=offset), status, teacher.id])
            c.execute("""
                INSERT INTO portal_homework (class_id, subject_id, teacher_id, title, description, due_date)
                VALUES (%s,%s,%s,'Algebra Worksheet','Complete questions 1 to 15 from the worksheet.', current_date + interval '3 days')
            """, [class_id, subject_id, teacher.id])
            c.execute("""
                INSERT INTO portal_assignment (class_id, subject_id, teacher_id, title, description, max_marks, due_date)
                VALUES (%s,%s,%s,'Linear Equations Assignment','Upload your solved PDF.', 50, now() + interval '5 days')
            """, [class_id, subject_id, teacher.id])
            c.execute("""
                INSERT INTO portal_exam_schedule (class_id, subject_id, teacher_id, exam_name, exam_type, exam_date, max_marks)
                VALUES (%s,%s,%s,'Unit_Test_1','Unit_Test', current_date + interval '10 days', 50)
            """, [class_id, subject_id, teacher.id])
            c.execute("""
                INSERT INTO portal_fee_structure (class_id, term_name, tuition_fee, transport_fee, hostel_fee, total_amount)
                VALUES (%s,'Term 1',25000,5000,0,30000)
            """, [class_id])
            c.execute("""
                INSERT INTO portal_notification (sender_id, recipient_type, target_class_id, title, message)
                VALUES (%s,'Student',%s,'Welcome to EduNova Portal','Your demo student and teacher portals are connected to Supabase.')
            """, [teacher.id, class_id])
            c.execute("""
                INSERT INTO portal_book (title, author, isbn, barcode_id, quantity, available_quantity)
                VALUES ('Mathematics Grade 8 Reference','EduNova Academic Team','DEMO-ISBN-001','DEMO-BOOK-001',10,8)
                ON CONFLICT (isbn) DO NOTHING
            """)

        self.stdout.write(self.style.SUCCESS("Demo portal data seeded."))
        self.stdout.write("Student login: student@edunova.edu / EduNova@123 / OTP 123456")
        self.stdout.write("Teacher login: teacher@edunova.edu / EduNova@123 / OTP 123456")
