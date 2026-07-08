from datetime import date
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response

from .views import table_exists, rows, row, serialise, EXAM_NAME_CHOICES
from .roles import IsTeacher


class TeacherMixin:
    # RBAC: only accounts whose resolved role is 'Teacher' pass.
    permission_classes = [IsTeacher]


def teacher_classes(user_id):
    if not table_exists("portal_academic_allocation"):
        return []
    return rows(
        """
        SELECT aa.id, aa.class_id, c.name || '-' || c.section AS class_name,
               aa.subject_id, s.name AS subject_name,
               (SELECT COUNT(*) FROM portal_student_enrollment se WHERE se.class_id=aa.class_id)::int AS student_count
        FROM portal_academic_allocation aa
        JOIN portal_class c ON c.id=aa.class_id
        JOIN portal_subject s ON s.id=aa.subject_id
        WHERE aa.teacher_id=%s
        ORDER BY c.name, c.section, s.name
        """, [user_id]
    )


class TeacherProfileView(TeacherMixin, APIView):
    def get(self, request):
        u = request.user
        profile = {
            "id": u.id,
            "name": u.get_full_name().strip() or u.username,
            "email": u.email,
            "user_type": "Teacher",
            "phone_number": "",
            "employee_code": "—",
            "qualification": "",
            "specialization": "",
            "date_of_joining": None,
        }
        if table_exists("portal_user_profile"):
            p = row("SELECT phone_number FROM portal_user_profile WHERE user_id=%s", [u.id])
            if p: profile.update(p)
        if table_exists("portal_teacher_profile"):
            t = row("SELECT employee_code, qualification, specialization, date_of_joining FROM portal_teacher_profile WHERE user_id=%s", [u.id])
            if t: profile.update(t)
        return Response(serialise(profile))


class TeacherDashboardView(TeacherMixin, APIView):
    def get(self, request):
        uid = request.user.id
        classes = teacher_classes(uid)
        today = date.today()
        todays_timetable = []
        if table_exists("portal_timetable"):
            todays_timetable = rows(
                """
                SELECT t.id, c.name || '-' || c.section AS class_name, s.name AS subject_name,
                       t.start_time, t.end_time
                FROM portal_timetable t
                JOIN portal_class c ON c.id=t.class_id
                JOIN portal_subject s ON s.id=t.subject_id
                WHERE t.teacher_id=%s AND lower(t.day_of_week)=lower(to_char(current_date, 'FMDay'))
                ORDER BY t.start_time
                """, [uid]
            )
        upcoming_exams = []
        if table_exists("portal_exam_schedule"):
            upcoming_exams = rows(
                """
                SELECT e.id, e.exam_name, e.exam_date, c.name || '-' || c.section AS class_name, s.name AS subject_name
                FROM portal_exam_schedule e
                JOIN portal_class c ON c.id=e.class_id
                JOIN portal_subject s ON s.id=e.subject_id
                WHERE e.teacher_id=%s AND e.exam_date >= current_date
                ORDER BY e.exam_date ASC LIMIT 8
                """, [uid]
            )
        pending_grading = 0
        if table_exists("portal_assignment_submission"):
            p = row(
                """
                SELECT COUNT(*)::int AS count
                FROM portal_assignment_submission sub
                JOIN portal_assignment a ON a.id=sub.assignment_id
                WHERE a.teacher_id=%s AND sub.marks_obtained IS NULL
                """, [uid]
            )
            pending_grading = p["count"] if p else 0
        unread_messages = 0
        if table_exists("portal_message"):
            m = row("SELECT COUNT(*)::int AS count FROM portal_message WHERE receiver_id=%s AND is_read=false", [uid])
            unread_messages = m["count"] if m else 0
        attendance_flags = []
        if table_exists("portal_attendance"):
            for c in classes:
                marked = row("SELECT COUNT(*)::int AS count FROM portal_attendance WHERE class_id=%s AND date=current_date", [c["class_id"]])
                attendance_flags.append({
                    "class_name": c["class_name"],
                    "subject_name": c["subject_name"],
                    "marked_count": marked["count"] if marked else 0,
                    "roster_count": c["student_count"],
                    "complete": (marked["count"] if marked else 0) >= c["student_count"] and c["student_count"] > 0,
                })
        return Response(serialise({
            "total_classes": len(classes),
            "pending_grading": pending_grading,
            "upcoming_exams": upcoming_exams,
            "unread_messages": unread_messages,
            "today": today.isoformat(),
            "todays_timetable": todays_timetable,
            "attendance_flags": attendance_flags,
        }))


class MyClassesView(TeacherMixin, APIView):
    def get(self, request):
        return Response(serialise(teacher_classes(request.user.id)))


class ClassRosterView(TeacherMixin, APIView):
    def get(self, request, class_id):
        if not table_exists("portal_student_enrollment"):
            return Response([])
        data = rows(
            """
            SELECT u.id AS student, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   sp.admission_number, se.roll_number
            FROM portal_student_enrollment se
            JOIN auth_user u ON u.id=se.student_id
            LEFT JOIN portal_student_profile sp ON sp.user_id=u.id
            WHERE se.class_id=%s ORDER BY se.roll_number NULLS LAST, student_name
            """, [class_id]
        )
        return Response(serialise(data))


class AttendanceView(TeacherMixin, APIView):
    def get(self, request):
        class_id = request.query_params.get("class_id")
        if not class_id:
            classes = teacher_classes(request.user.id)
            class_id = classes[0]["class_id"] if classes else None
        if not class_id:
            return Response({"records": []})
        roster = rows(
            """
            SELECT u.id AS student, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   sp.admission_number,
                   COALESCE(a.status, 'Present') AS status,
                   COALESCE(a.remarks, '') AS remarks
            FROM portal_student_enrollment se
            JOIN auth_user u ON u.id=se.student_id
            LEFT JOIN portal_student_profile sp ON sp.user_id=u.id
            LEFT JOIN portal_attendance a ON a.student_id=u.id AND a.class_id=se.class_id AND a.date=current_date
            WHERE se.class_id=%s ORDER BY se.roll_number NULLS LAST, student_name
            """, [class_id]
        ) if table_exists("portal_student_enrollment") else []
        return Response(serialise({"records": roster}))

    def post(self, request):
        class_id = request.data.get("class_id")
        date_value = request.data.get("date") or date.today().isoformat()
        records = request.data.get("records", [])
        if not table_exists("portal_attendance"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            for rec in records:
                cursor.execute(
                    """
                    INSERT INTO portal_attendance (student_id, class_id, date, status, marked_by, remarks)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (student_id, class_id, date)
                    DO UPDATE SET status=EXCLUDED.status, marked_by=EXCLUDED.marked_by, remarks=EXCLUDED.remarks
                    """,
                    [rec.get("student"), class_id, date_value, rec.get("status", "Present"), request.user.id, rec.get("remarks", "")],
                )
        return Response({"detail": "Attendance synced successfully."})


class HomeworkView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_homework"):
            return Response([])
        data = rows(
            """
            SELECT h.id, h.title, h.description, h.assigned_date, h.due_date,
                   c.name || '-' || c.section AS class_name, s.name AS subject_name
            FROM portal_homework h
            JOIN portal_class c ON c.id=h.class_id
            JOIN portal_subject s ON s.id=h.subject_id
            WHERE h.teacher_id=%s ORDER BY h.due_date DESC
            """, [request.user.id]
        )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_homework"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        data = request.data
        class_id = data.get("class_id")
        subject_id = data.get("subject_id")
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO portal_homework (class_id, subject_id, teacher_id, title, description, assigned_date, due_date)
                   VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                [class_id, subject_id, request.user.id, data.get("title"), data.get("description"), data.get("assigned_date") or date.today(), data.get("due_date")],
            )
            hid = cursor.fetchone()[0]
        return Response({"id": hid, "detail": "Homework assigned."})


class AssignmentView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_assignment"):
            return Response([])
        data = rows(
            """
            SELECT a.id, a.title, a.description, a.file_url, a.max_marks, a.due_date,
                   c.name || '-' || c.section AS class_name, s.name AS subject_name,
                   (SELECT COUNT(*) FROM portal_assignment_submission sub WHERE sub.assignment_id=a.id)::int AS submission_count,
                   (SELECT COUNT(*) FROM portal_assignment_submission sub WHERE sub.assignment_id=a.id AND sub.marks_obtained IS NOT NULL)::int AS graded_count
            FROM portal_assignment a
            JOIN portal_class c ON c.id=a.class_id
            JOIN portal_subject s ON s.id=a.subject_id
            WHERE a.teacher_id=%s ORDER BY a.due_date DESC
            """, [request.user.id]
        )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_assignment"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        data = request.data
        class_id = data.get("class_id")
        subject_id = data.get("subject_id")
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO portal_assignment (class_id, subject_id, teacher_id, title, description, file_url, max_marks, due_date)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                [class_id, subject_id, request.user.id, data.get("title"), data.get("description"), data.get("file_url"), data.get("max_marks") or 100, data.get("due_date")],
            )
            aid = cursor.fetchone()[0]
        return Response({"id": aid, "detail": "Assignment created."})


class AssignmentSubmissionsView(TeacherMixin, APIView):
    def get(self, request, assignment_id, submission_id=None):
        if not table_exists("portal_assignment_submission"):
            return Response([])
        return Response(serialise(rows(
            """
            SELECT sub.id, sub.submission_url, sub.submitted_at, sub.marks_obtained, sub.teacher_feedback,
                   u.id AS student, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   sp.admission_number
            FROM portal_assignment_submission sub
            JOIN auth_user u ON u.id=sub.student_id
            LEFT JOIN portal_student_profile sp ON sp.user_id=u.id
            WHERE sub.assignment_id=%s ORDER BY sub.submitted_at DESC
            """, [assignment_id]
        )))

    def patch(self, request, assignment_id, submission_id):
        if not table_exists("portal_assignment_submission"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE portal_assignment_submission SET marks_obtained=%s, teacher_feedback=%s WHERE id=%s AND assignment_id=%s",
                [request.data.get("marks_obtained"), request.data.get("teacher_feedback", ""), submission_id, assignment_id],
            )
        return Response({"detail": "Submission graded."})


class QuestionBankView(TeacherMixin, APIView):
    def get(self, request, question_id=None):
        if not table_exists("portal_question_bank"):
            return Response([])
        return Response(serialise(rows(
            """
            SELECT q.id, q.difficulty_level, q.question_text, q.answer_schema, s.id AS subject_id, s.name AS subject_name
            FROM portal_question_bank q JOIN portal_subject s ON s.id=q.subject_id
            WHERE q.teacher_id=%s ORDER BY q.id DESC
            """, [request.user.id]
        )))

    def post(self, request, question_id=None):
        if not table_exists("portal_question_bank"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_question_bank (subject_id, teacher_id, difficulty_level, question_text, answer_schema) VALUES (%s,%s,%s,%s,%s::jsonb) RETURNING id",
                [request.data.get("subject_id"), request.user.id, request.data.get("difficulty_level", "Medium"), request.data.get("question_text"), request.data.get("answer_schema", "{}")],
            )
            qid = cursor.fetchone()[0]
        return Response({"id": qid, "detail": "Question added."})

    def delete(self, request, question_id):
        if table_exists("portal_question_bank"):
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM portal_question_bank WHERE id=%s AND teacher_id=%s", [question_id, request.user.id])
        return Response({"detail": "Question removed."})


class TeacherExamView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_exam_schedule"):
            return Response([])
        return Response(serialise(rows(
            """
            SELECT e.id, e.exam_name, e.exam_type, e.exam_date, e.start_time, e.duration_minutes, e.max_marks,
                   c.name || '-' || c.section AS class_name, s.name AS subject_name
            FROM portal_exam_schedule e JOIN portal_class c ON c.id=e.class_id JOIN portal_subject s ON s.id=e.subject_id
            WHERE e.teacher_id=%s ORDER BY e.exam_date DESC
            """, [request.user.id]
        )))

    def post(self, request):
        if not table_exists("portal_exam_schedule"):
            return Response({"detail": "Portal schema has not been applied.", "exam_name_choices": EXAM_NAME_CHOICES}, status=400)
        data = request.data
        exam_name = (data.get("exam_name") or "").strip()
        if exam_name not in EXAM_NAME_CHOICES:
            return Response(
                {"detail": f"exam_name must be one of {EXAM_NAME_CHOICES}.",
                 "exam_name_choices": EXAM_NAME_CHOICES},
                status=400,
            )
        class_id = data.get("class_id")
        subject_id = data.get("subject_id")
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO portal_exam_schedule (class_id, subject_id, teacher_id, exam_name, exam_type, exam_date, start_time, duration_minutes, max_marks)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                [class_id, subject_id, request.user.id, exam_name, data.get("exam_type", "Unit_Test"), data.get("exam_date"), data.get("start_time", "09:00"), data.get("duration_minutes") or 60, data.get("max_marks") or 100],
            )
            eid = cursor.fetchone()[0]
        return Response({"id": eid, "detail": "Exam scheduled."})


class MarksEntryView(TeacherMixin, APIView):
    def get(self, request):
        exam_id = request.query_params.get("exam_schedule_id")
        if not exam_id or not table_exists("portal_exam_schedule"):
            return Response({"exam": None, "rows": []})
        exam = row("SELECT e.id, e.exam_name, e.max_marks, c.name || '-' || c.section AS class_name, s.name AS subject_name FROM portal_exam_schedule e JOIN portal_class c ON c.id=e.class_id JOIN portal_subject s ON s.id=e.subject_id WHERE e.id=%s", [exam_id])
        if not exam:
            return Response({"exam": None, "rows": []})
        data = rows(
            """
            SELECT u.id AS student, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS student_name,
                   sp.admission_number, r.marks_obtained, r.grade_letter, r.remarks,
                   CASE WHEN r.id IS NULL THEN false ELSE true END AS published
            FROM portal_student_enrollment se
            JOIN portal_exam_schedule e ON e.class_id=se.class_id
            JOIN auth_user u ON u.id=se.student_id
            LEFT JOIN portal_student_profile sp ON sp.user_id=u.id
            LEFT JOIN portal_result r ON r.student_id=u.id AND r.exam_schedule_id=e.id
            WHERE e.id=%s ORDER BY se.roll_number NULLS LAST, student_name
            """, [exam_id]
        ) if table_exists("portal_student_enrollment") else []
        return Response(serialise({"exam": exam, "rows": data}))

    def post(self, request):
        if not table_exists("portal_result"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        exam_id = request.data.get("exam_schedule_id")
        # Accept both 'entries' (frontend key) and 'rows' (legacy)
        marks_rows = request.data.get("entries") or request.data.get("rows", [])
        submit = request.data.get("submit", True)
        exam = row("SELECT max_marks FROM portal_exam_schedule WHERE id=%s", [exam_id])
        max_marks = exam["max_marks"] if exam else 100
        with connection.cursor() as cursor:
            for r in marks_rows:
                raw = r.get("marks_obtained")
                if raw is None or raw == "":
                    continue
                marks = float(raw)
                pct = (marks / max_marks) * 100 if max_marks else 0
                grade = r.get("grade_letter") or ("A" if pct >= 90 else "B" if pct >= 75 else "C" if pct >= 60 else "D" if pct >= 40 else "F")
                cursor.execute(
                    """
                    INSERT INTO portal_result (student_id, exam_schedule_id, marks_obtained, grade_letter, grade_points, remarks)
                    VALUES (%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (student_id, exam_schedule_id)
                    DO UPDATE SET marks_obtained=EXCLUDED.marks_obtained, grade_letter=EXCLUDED.grade_letter, grade_points=EXCLUDED.grade_points, remarks=EXCLUDED.remarks
                    """, [r.get("student"), exam_id, marks, grade, round(pct/10, 2), r.get("remarks", "")]
                )
        detail = "Marks submitted for publication." if submit else "Marks saved as draft."
        return Response({"detail": detail})


class PerformanceAnalyticsView(TeacherMixin, APIView):
    def get(self, request):
        class_id = request.query_params.get("class_id")
        subject_id = request.query_params.get("subject_id")
        if not class_id:
            return Response({"class_average": 0, "students": []})
        data = rows(
            """
            SELECT u.id AS student_id, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name,
              COALESCE(ROUND(AVG(r.marks_obtained),1),0) AS average_marks,
              COUNT(r.id)::int AS exams_taken,
              COALESCE(ROUND(AVG(CASE WHEN a.status='Present' THEN 100 ELSE 0 END),1),0) AS attendance_percentage
            FROM portal_student_enrollment se
            JOIN auth_user u ON u.id=se.student_id
            LEFT JOIN portal_exam_schedule e ON e.class_id=se.class_id AND (%s IS NULL OR e.subject_id=%s)
            LEFT JOIN portal_result r ON r.student_id=u.id AND r.exam_schedule_id=e.id
            LEFT JOIN portal_attendance a ON a.student_id=u.id AND a.class_id=se.class_id
            WHERE se.class_id=%s
            GROUP BY u.id, name ORDER BY name
            """, [subject_id, subject_id, class_id]
        ) if table_exists("portal_student_enrollment") else []
        class_avg = round(sum(float(s["average_marks"] or 0) for s in data) / len(data), 1) if data else 0
        return Response(serialise({"class_average": class_avg, "students": data}))


class MessageThreadView(TeacherMixin, APIView):
    def get(self, request):
        other = request.query_params.get("with")
        if not table_exists("portal_message"):
            return Response([])
        if other:
            data = rows(
                """
                SELECT m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at,
                       su.username AS sender_name, ru.username AS receiver_name
                FROM portal_message m JOIN auth_user su ON su.id=m.sender_id JOIN auth_user ru ON ru.id=m.receiver_id
                WHERE (m.sender_id=%s AND m.receiver_id=%s) OR (m.sender_id=%s AND m.receiver_id=%s)
                ORDER BY m.created_at
                """, [request.user.id, other, other, request.user.id]
            )
        else:
            data = rows(
                """
                SELECT DISTINCT ON (CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END)
                       m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at,
                       su.username AS sender_name, ru.username AS receiver_name
                FROM portal_message m JOIN auth_user su ON su.id=m.sender_id JOIN auth_user ru ON ru.id=m.receiver_id
                WHERE m.sender_id=%s OR m.receiver_id=%s
                ORDER BY CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END, m.created_at DESC
                """, [request.user.id, request.user.id, request.user.id, request.user.id]
            )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_message"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_message (sender_id, receiver_id, message_text) VALUES (%s,%s,%s) RETURNING id", [request.user.id, request.data.get("receiver"), request.data.get("message_text")])
            mid = cursor.fetchone()[0]
        return Response({"id": mid, "detail": "Message sent."})


class MyContactsView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_user_profile"):
            return Response([])
        data = rows("SELECT u.id, COALESCE(u.first_name || ' ' || u.last_name, u.username) AS name, p.user_type AS role FROM auth_user u JOIN portal_user_profile p ON p.user_id=u.id WHERE u.id<>%s ORDER BY name LIMIT 50", [request.user.id])
        return Response(serialise(data))


class NoticeListView(TeacherMixin, APIView):
    def get(self, request):
        if table_exists("cms_newspost"):
            data = rows("SELECT id, title, content, published_date AS created_at, NULL AS file_attachment_url, false AS is_pinned FROM cms_newspost WHERE is_published=true ORDER BY published_date DESC")
            return Response(serialise(data))
        return Response([])


class LeaveView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_leave"):
            return Response([])
        return Response(serialise(rows("SELECT id, leave_type, start_date, end_date, reason, status FROM portal_leave WHERE user_id=%s ORDER BY start_date DESC", [request.user.id])))

    def post(self, request):
        if not table_exists("portal_leave"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_leave (user_id, leave_type, start_date, end_date, reason) VALUES (%s,%s,%s,%s,%s) RETURNING id", [request.user.id, request.data.get("leave_type"), request.data.get("start_date"), request.data.get("end_date"), request.data.get("reason")])
            lid = cursor.fetchone()[0]
        return Response({"id": lid, "detail": "Leave request submitted."})


class TeacherTimetableView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_timetable"):
            return Response([])
        data = rows(
            """
            SELECT t.id, t.day_of_week, t.start_time, t.end_time, c.name || '-' || c.section AS class_name, s.name AS subject_name
            FROM portal_timetable t JOIN portal_class c ON c.id=t.class_id JOIN portal_subject s ON s.id=t.subject_id
            WHERE t.teacher_id=%s ORDER BY t.day_of_week, t.start_time
            """, [request.user.id]
        )
        return Response(serialise(data))


class TeacherDocumentsView(TeacherMixin, APIView):
    def get(self, request):
        if not table_exists("portal_teacher_document"):
            return Response([])
        return Response(serialise(rows("SELECT id, content_type, title, resource_url FROM portal_teacher_document WHERE teacher_id=%s ORDER BY created_at DESC", [request.user.id])))

    def post(self, request):
        if not table_exists("portal_teacher_document"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        data = request.data
        class_id = data.get("class_id")
        subject_id = data.get("subject_id")
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO portal_teacher_document (teacher_id, class_id, subject_id, content_type, title, resource_url) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id", [request.user.id, class_id, subject_id, data.get("content_type"), data.get("title"), data.get("resource_url")])
            did = cursor.fetchone()[0]
        return Response({"id": did, "detail": "Document uploaded."})
