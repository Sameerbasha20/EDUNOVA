from datetime import date, datetime
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .roles import IsStudent

User = get_user_model()


def table_exists(table_name):
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema='public' AND table_name=%s
                )
                """,
                [table_name],
            )
            return cursor.fetchone()[0]
    except Exception:
        return False


def rows(sql, params=None):
    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, r)) for r in cursor.fetchall()]


def row(sql, params=None):
    result = rows(sql, params)
    return result[0] if result else None


# Fixed set of exam-cycle names. Rank lists and report cards group results by
# exam_name as a raw string — without a fixed set, "Mid Term" vs "Mid-Term"
# vs "midterm" would silently split one exam cycle's results across three
# different "cycles", producing incomplete report cards with no error.
EXAM_NAME_CHOICES = [
    "Unit_Test_1", "Unit_Test_2", "Unit_Test_3", "Unit_Test_4",
    "Mid_Term", "Final_Term", "Pre_Board", "Board_Exam",
]


def qdate(v):
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    return v


def serialise(obj):
    if isinstance(obj, list):
        return [serialise(i) for i in obj]
    if isinstance(obj, dict):
        return {k: qdate(v) for k, v in obj.items()}
    return qdate(obj)


def current_class_for_student(user_id):
    if not table_exists("portal_student_enrollment"):
        return None
    return row(
        """
        SELECT e.class_id, c.name || '-' || c.section AS class_name, e.academic_year, e.roll_number
        FROM portal_student_enrollment e
        JOIN portal_class c ON c.id=e.class_id
        WHERE e.student_id=%s
        ORDER BY e.academic_year DESC, e.id DESC
        LIMIT 1
        """,
        [user_id],
    )


def student_profile_payload(user):
    full_name = user.get_full_name().strip() or user.username
    base = {
        "id": user.id,
        "name": full_name,
        "email": user.email,
        "is_active": user.is_active,
        "phone_number": "",
        "admission_number": "—",
        "class_name": "Not assigned",
        "date_of_birth": None,
        "gender": "",
        "blood_group": "",
        "status": "Active",
        "qr_id_code": None,
        "avatar_url": None,
    }
    if table_exists("portal_user_profile"):
        p = row("SELECT phone_number, avatar_url FROM portal_user_profile WHERE user_id=%s", [user.id])
        if p:
            base["phone_number"] = p.get("phone_number") or ""
            base["avatar_url"] = p.get("avatar_url")
    if table_exists("portal_student_profile"):
        sp = row("SELECT admission_number, qr_id_code, date_of_birth, gender, blood_group, status FROM portal_student_profile WHERE user_id=%s", [user.id])
        if sp:
            base.update(serialise(sp))
    cls = current_class_for_student(user.id)
    if cls:
        base["class_name"] = cls["class_name"]
        base["roll_number"] = cls.get("roll_number")
        base["academic_year"] = cls.get("academic_year")
    return base


class StudentOnlyMixin:
    # RBAC: only accounts whose resolved role is 'Student' pass. Resolved via
    # portal.roles.get_role (portal_user_profile -> groups -> is_staff), never
    # trusted from the client.
    permission_classes = [IsStudent]


class ProfileView(StudentOnlyMixin, APIView):
    def get(self, request):
        return Response(student_profile_payload(request.user))


class DashboardView(StudentOnlyMixin, APIView):
    def get(self, request):
        uid = request.user.id
        cls = current_class_for_student(uid)
        class_id = cls["class_id"] if cls else None

        attendance_percentage = None
        if class_id and table_exists("portal_attendance"):
            stats = row(
                """
                SELECT COUNT(*)::int total,
                       SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END)::int present
                FROM portal_attendance WHERE student_id=%s
                """,
                [uid],
            )
            if stats and stats["total"]:
                attendance_percentage = round((stats["present"] or 0) * 100 / stats["total"], 1)

        assignments_due = []
        if class_id and table_exists("portal_assignment"):
            assignments_due = rows(
                """
                SELECT a.id, a.title, a.description, a.due_date, a.max_marks, s.name AS subject_name
                FROM portal_assignment a JOIN portal_subject s ON s.id=a.subject_id
                WHERE a.class_id=%s AND a.due_date >= now()
                ORDER BY a.due_date ASC LIMIT 5
                """,
                [class_id],
            )

        upcoming_exams = []
        if class_id and table_exists("portal_exam_schedule"):
            upcoming_exams = rows(
                """
                SELECT e.id, e.exam_name, e.exam_type, e.exam_date, e.duration_minutes, e.max_marks,
                       s.name AS subject_name
                FROM portal_exam_schedule e JOIN portal_subject s ON s.id=e.subject_id
                WHERE e.class_id=%s AND e.exam_date >= current_date
                ORDER BY e.exam_date ASC LIMIT 5
                """,
                [class_id],
            )

        recent_results = []
        if table_exists("portal_result"):
            recent_results = rows(
                """
                SELECT r.id, r.marks_obtained, r.rank_position, r.grade_letter, r.remarks,
                       ROUND((r.marks_obtained / NULLIF(e.max_marks,0)) * 100, 1) AS percentage,
                       json_build_object('id', e.id, 'exam_name', e.exam_name, 'max_marks', e.max_marks, 'subject_name', s.name) AS exam
                FROM portal_result r
                JOIN portal_exam_schedule e ON e.id=r.exam_schedule_id
                JOIN portal_subject s ON s.id=e.subject_id
                WHERE r.student_id=%s
                ORDER BY e.exam_date DESC LIMIT 6
                """,
                [uid],
            )

        homework_due = []
        if class_id and table_exists("portal_homework"):
            homework_due = rows(
                """
                SELECT h.id, h.title, h.description, h.assigned_date, h.due_date,
                       s.name AS subject_name, (h.due_date < current_date) AS is_overdue
                FROM portal_homework h JOIN portal_subject s ON s.id=h.subject_id
                WHERE h.class_id=%s
                ORDER BY h.due_date ASC LIMIT 5
                """,
                [class_id],
            )

        announcements = []
        if table_exists("portal_notification"):
            announcements = rows(
                """
                SELECT n.id, n.title, n.message, n.created_at,
                       COALESCE(u.first_name || ' ' || u.last_name, u.username, 'EduNova Admin') AS sender_name
                FROM portal_notification n LEFT JOIN auth_user u ON u.id=n.sender_id
                WHERE n.recipient_type IN ('All','Student') OR n.target_class_id=%s
                ORDER BY n.created_at DESC LIMIT 5
                """,
                [class_id],
            )
        elif table_exists("cms_newspost"):
            announcements = rows(
                """
                SELECT id, title, content AS message, published_date AS created_at, 'EduNova Admin' AS sender_name
                FROM cms_newspost WHERE is_published=true ORDER BY published_date DESC LIMIT 5
                """
            )

        pending_fees = []
        if class_id and table_exists("portal_fee_structure"):
            pending_fees = rows(
                """
                SELECT fs.id, fs.term_name, fs.tuition_fee, fs.transport_fee, fs.hostel_fee, fs.total_amount
                FROM portal_fee_structure fs
                WHERE fs.class_id=%s AND NOT EXISTS (
                  SELECT 1 FROM portal_payment p WHERE p.fee_structure_id=fs.id AND p.student_id=%s AND p.status='Success'
                )
                ORDER BY fs.id LIMIT 5
                """,
                [class_id, uid],
            )

        return Response(serialise({
            "attendance_percentage": attendance_percentage,
            "assignments_due": assignments_due,
            "upcoming_exams": upcoming_exams,
            "pending_fees": pending_fees,
            "recent_results": recent_results,
            "homework_due": homework_due,
            "announcements": announcements,
        }))


class AttendanceListView(StudentOnlyMixin, APIView):
    def get(self, request):
        month = request.query_params.get("month")
        uid = request.user.id
        records = []
        if table_exists("portal_attendance"):
            sql = "SELECT id, date, status, remarks FROM portal_attendance WHERE student_id=%s"
            params = [uid]
            if month:
                sql += " AND to_char(date, 'YYYY-MM')=%s"
                params.append(month)
            sql += " ORDER BY date DESC"
            records = rows(sql, params)
        summary = {"present": 0, "absent": 0, "late": 0, "medical_leave": 0, "percentage": None}
        for r in records:
            key = str(r["status"]).lower()
            if key == "medical_leave": key = "medical_leave"
            if key in summary: summary[key] += 1
        total = len(records)
        if total:
            summary["percentage"] = round(summary["present"] * 100 / total, 1)
        return Response(serialise({"summary": summary, "records": records}))


class TimetableView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        if not cls or not table_exists("portal_timetable"):
            return Response([])
        data = rows(
            """
            SELECT t.id, t.day_of_week, t.start_time, t.end_time,
                   s.name AS subject_name,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username) AS teacher_name
            FROM portal_timetable t
            JOIN portal_subject s ON s.id=t.subject_id
            JOIN auth_user u ON u.id=t.teacher_id
            WHERE t.class_id=%s
            ORDER BY t.day_of_week, t.start_time
            """, [cls["class_id"]]
        )
        return Response(serialise(data))


class HomeworkListView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        if not cls or not table_exists("portal_homework"):
            return Response([])
        data = rows(
            """
            SELECT h.id, h.title, h.description, h.assigned_date, h.due_date,
                   s.name AS subject_name,
                   COALESCE(u.first_name || ' ' || u.last_name, u.username) AS teacher_name,
                   (h.due_date < current_date) AS is_overdue
            FROM portal_homework h
            JOIN portal_subject s ON s.id=h.subject_id
            JOIN auth_user u ON u.id=h.teacher_id
            WHERE h.class_id=%s ORDER BY h.due_date DESC
            """, [cls["class_id"]]
        )
        return Response(serialise(data))


class AssignmentListView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        if not cls or not table_exists("portal_assignment"):
            return Response([])
        data = rows(
            """
            SELECT a.id, a.title, a.description, a.file_url, a.max_marks, a.due_date, s.name AS subject_name,
              (SELECT json_build_object('id', sub.id, 'submission_url', sub.submission_url, 'submitted_at', sub.submitted_at,
                                        'marks_obtained', sub.marks_obtained, 'teacher_feedback', sub.teacher_feedback)
               FROM portal_assignment_submission sub WHERE sub.assignment_id=a.id AND sub.student_id=%s) AS my_submission
            FROM portal_assignment a JOIN portal_subject s ON s.id=a.subject_id
            WHERE a.class_id=%s ORDER BY a.due_date DESC
            """, [request.user.id, cls["class_id"]]
        )
        return Response(serialise(data))


class AssignmentSubmitView(StudentOnlyMixin, APIView):
    def post(self, request, assignment_id):
        if not table_exists("portal_assignment_submission"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        url = request.data.get("submission_url") or request.data.get("file_url")
        if not url:
            return Response({"detail": "submission_url is required."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO portal_assignment_submission (assignment_id, student_id, submission_url)
                VALUES (%s,%s,%s)
                ON CONFLICT (assignment_id, student_id)
                DO UPDATE SET submission_url=EXCLUDED.submission_url, submitted_at=now()
                RETURNING id
                """, [assignment_id, request.user.id, url]
            )
            sid = cursor.fetchone()[0]
        return Response({"detail": "Assignment submitted.", "id": sid})


class CourseListView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        if not cls or not table_exists("portal_course"):
            return Response([])
        courses = rows(
            """
            SELECT c.id, c.title, c.description, s.name AS subject_name
            FROM portal_course c JOIN portal_subject s ON s.id=c.subject_id
            WHERE c.class_id=%s ORDER BY c.id
            """, [cls["class_id"]]
        )
        for c in courses:
            c["content"] = rows("SELECT id, content_type, title, resource_url, sort_order FROM portal_course_content WHERE course_id=%s ORDER BY sort_order", [c["id"]]) if table_exists("portal_course_content") else []
            c["quizzes"] = rows("SELECT id, title, duration_minutes, passing_score FROM portal_quiz WHERE course_id=%s ORDER BY id", [c["id"]]) if table_exists("portal_quiz") else []
        return Response(serialise(courses))


class QuizDetailView(StudentOnlyMixin, APIView):
    def get(self, request, quiz_id):
        if not table_exists("portal_quiz"):
            return Response({"id": quiz_id, "title": "Quiz", "questions": []})
        quiz = row("SELECT id, title, duration_minutes, passing_score FROM portal_quiz WHERE id=%s", [quiz_id]) or {"id": quiz_id, "title": "Quiz"}
        quiz["questions"] = rows("SELECT id, question_text, options FROM portal_quiz_question WHERE quiz_id=%s", [quiz_id]) if table_exists("portal_quiz_question") else []
        return Response(serialise(quiz))

    def post(self, request, quiz_id):
        if not table_exists("portal_quiz_question"):
            return Response({"score": 0, "total": 0, "percentage": 0, "passed": False})
        questions = rows("SELECT id, correct_answer FROM portal_quiz_question WHERE quiz_id=%s", [quiz_id])
        total = len(questions)
        # JSON object keys are always strings, so a question id of 12 arrives
        # as answers["12"], not answers[12].
        answers = request.data.get("answers") or {}
        score = sum(1 for q in questions if str(answers.get(str(q["id"]))) == str(q["correct_answer"]))
        percentage = round((score / total) * 100, 1) if total else 0
        quiz = row("SELECT passing_score FROM portal_quiz WHERE id=%s", [quiz_id]) if table_exists("portal_quiz") else None
        passing_score = quiz["passing_score"] if quiz else 40
        return Response({"score": score, "total": total, "percentage": percentage, "passed": percentage >= passing_score})


class ExamListView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        if not cls or not table_exists("portal_exam_schedule"):
            return Response([])
        data = rows(
            """
            SELECT e.id, e.exam_name, e.exam_type, e.exam_date, e.start_time, e.duration_minutes, e.max_marks,
                   s.name AS subject_name
            FROM portal_exam_schedule e JOIN portal_subject s ON s.id=e.subject_id
            WHERE e.class_id=%s ORDER BY e.exam_date DESC
            """, [cls["class_id"]]
        )
        return Response(serialise(data))


class HallTicketListView(StudentOnlyMixin, APIView):
    def get(self, request):
        if not table_exists("portal_hall_ticket"):
            return Response([])
        data = rows(
            """
            SELECT ht.id, ht.ticket_number, ht.is_verified,
                   json_build_object('id', e.id, 'exam_name', e.exam_name, 'exam_date', e.exam_date, 'subject_name', s.name) AS exam
            FROM portal_hall_ticket ht
            JOIN portal_exam_schedule e ON e.id=ht.exam_schedule_id
            JOIN portal_subject s ON s.id=e.subject_id
            WHERE ht.student_id=%s ORDER BY e.exam_date DESC
            """, [request.user.id]
        )
        return Response(serialise(data))


class ResultListView(StudentOnlyMixin, APIView):
    def get(self, request):
        if not table_exists("portal_result"):
            return Response([])
        data = rows(
            """
            SELECT r.id, r.marks_obtained, r.rank_position, r.grade_letter, r.remarks,
                   ROUND((r.marks_obtained / NULLIF(e.max_marks,0)) * 100, 1) AS percentage,
                   json_build_object('id', e.id, 'exam_name', e.exam_name, 'max_marks', e.max_marks, 'subject_name', s.name) AS exam
            FROM portal_result r
            JOIN portal_exam_schedule e ON e.id=r.exam_schedule_id
            JOIN portal_subject s ON s.id=e.subject_id
            WHERE r.student_id=%s ORDER BY e.exam_date DESC
            """, [request.user.id]
        )
        return Response(serialise(data))


class FeesView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        pending, history = [], []
        if cls and table_exists("portal_fee_structure"):
            pending = rows(
                """
                SELECT fs.id, fs.term_name, fs.tuition_fee, fs.transport_fee, fs.hostel_fee, fs.total_amount
                FROM portal_fee_structure fs
                WHERE fs.class_id=%s AND NOT EXISTS (
                  SELECT 1 FROM portal_payment p WHERE p.fee_structure_id=fs.id AND p.student_id=%s AND p.status='Success'
                ) ORDER BY fs.id
                """, [cls["class_id"], request.user.id]
            )
        if table_exists("portal_payment"):
            history = rows(
                """
                SELECT p.id, p.transaction_id, p.amount_paid, p.status, p.paid_at,
                       json_build_object('id', fs.id, 'term_name', fs.term_name, 'total_amount', fs.total_amount) AS fee_structure_detail
                FROM portal_payment p JOIN portal_fee_structure fs ON fs.id=p.fee_structure_id
                WHERE p.student_id=%s ORDER BY p.paid_at DESC
                """, [request.user.id]
            )
        return Response(serialise({"pending": pending, "payment_history": history}))


class InitiatePaymentView(StudentOnlyMixin, APIView):
    def post(self, request):
        if not table_exists("portal_payment"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        fee_id = request.data.get("fee_structure_id")
        method = request.data.get("payment_method") or "Online"
        fee = row("SELECT total_amount FROM portal_fee_structure WHERE id=%s", [fee_id])
        if not fee:
            return Response({"detail": "Invalid fee."}, status=400)
        tx = f"EDN-{uuid4().hex[:10].upper()}"
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO portal_payment (student_id, fee_structure_id, transaction_id, amount_paid, payment_method, status)
                VALUES (%s,%s,%s,%s,%s,'Success') RETURNING id
                """, [request.user.id, fee_id, tx, fee["total_amount"], method]
            )
            pid = cursor.fetchone()[0]
        return Response({"detail": "Payment recorded successfully.", "id": pid, "transaction_id": tx})


class LibraryView(StudentOnlyMixin, APIView):
    def get(self, request):
        if not table_exists("portal_library_transaction"):
            return Response([])
        data = rows(
            """
            SELECT t.id, t.issue_date, t.due_date, t.return_date, t.fine_amount,
                   json_build_object('id', b.id, 'title', b.title, 'author', b.author) AS book_detail
            FROM portal_library_transaction t JOIN portal_book b ON b.id=t.book_id
            WHERE t.borrower_id=%s ORDER BY t.issue_date DESC
            """, [request.user.id]
        )
        return Response(serialise(data))


class BookSearchView(StudentOnlyMixin, APIView):
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q or not table_exists("portal_book"):
            return Response([])
        return Response(serialise(rows(
            """
            SELECT id, title, author, available_quantity FROM portal_book
            WHERE title ILIKE %s OR author ILIKE %s ORDER BY title LIMIT 20
            """, [f"%{q}%", f"%{q}%"]
        )))


class CertificateListView(StudentOnlyMixin, APIView):
    def get(self, request):
        if not table_exists("portal_certificate"):
            return Response([])
        return Response(serialise(rows("SELECT id, certificate_type, issued_date, file_url FROM portal_certificate WHERE student_id=%s ORDER BY issued_date DESC", [request.user.id])))


class AnnouncementListView(StudentOnlyMixin, APIView):
    def get(self, request):
        cls = current_class_for_student(request.user.id)
        class_id = cls["class_id"] if cls else None
        if table_exists("portal_notification"):
            data = rows(
                """
                SELECT n.id, n.title, n.message, n.created_at,
                       COALESCE(u.first_name || ' ' || u.last_name, u.username, 'EduNova Admin') AS sender_name
                FROM portal_notification n LEFT JOIN auth_user u ON u.id=n.sender_id
                WHERE n.recipient_type IN ('All','Student') OR n.target_class_id=%s
                ORDER BY n.created_at DESC
                """, [class_id]
            )
            return Response(serialise(data))
        if table_exists("cms_newspost"):
            return Response(serialise(rows("SELECT id, title, content AS message, published_date AS created_at, 'EduNova Admin' AS sender_name FROM cms_newspost WHERE is_published=true ORDER BY published_date DESC")))
        return Response([])


class EventListView(StudentOnlyMixin, APIView):
    def get(self, request):
        if not table_exists("cms_event"):
            return Response([])
        return Response(serialise(rows("SELECT id, title, description, event_date, venue FROM cms_event ORDER BY event_date DESC")))


class StudentMessageThreadView(StudentOnlyMixin, APIView):
    """Same portal_message table the Teacher/Parent portals already use —
    lets a student message a staff member (e.g. the Support page)."""

    def get(self, request):
        uid = request.user.id
        other = request.query_params.get("with")
        if not table_exists("portal_message"):
            return Response([])
        if other:
            data = rows(
                """
                SELECT m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at
                FROM portal_message m
                WHERE (m.sender_id=%s AND m.receiver_id=%s) OR (m.sender_id=%s AND m.receiver_id=%s)
                ORDER BY m.created_at
                """,
                [uid, other, other, uid],
            )
        else:
            data = rows(
                """
                SELECT DISTINCT ON (CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END)
                       m.id, m.sender_id AS sender, m.receiver_id AS receiver, m.message_text, m.created_at
                FROM portal_message m
                WHERE m.sender_id=%s OR m.receiver_id=%s
                ORDER BY CASE WHEN sender_id=%s THEN receiver_id ELSE sender_id END, m.created_at DESC
                """,
                [uid, uid, uid, uid],
            )
        return Response(serialise(data))

    def post(self, request):
        if not table_exists("portal_message"):
            return Response({"detail": "Portal schema has not been applied."}, status=400)
        receiver_id = request.data.get("receiver")
        message_text = (request.data.get("message_text") or "").strip()
        if not receiver_id or not message_text:
            return Response({"detail": "receiver and message_text are required."}, status=400)
        if not User.objects.filter(id=receiver_id).exists():
            return Response({"detail": "Recipient not found."}, status=400)
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO portal_message (sender_id, receiver_id, message_text) VALUES (%s,%s,%s) RETURNING id",
                [request.user.id, receiver_id, message_text],
            )
            mid = cursor.fetchone()[0]
        return Response({"id": mid, "detail": "Message sent."})


class AvatarView(APIView):
    """Profile picture upload/delete -- shared across every portal since
    avatar_url lives on portal_user_profile regardless of role. Any
    authenticated user manages only their own (request.user), never
    someone else's -- there's no user_id parameter to tamper with."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .services.storage_service import AvatarUploadError, upload_avatar

        uploaded_file = request.FILES.get("avatar")
        if not uploaded_file:
            return Response({"detail": "No file uploaded (expected field name 'avatar')."}, status=400)
        try:
            url = upload_avatar(request.user, uploaded_file)
        except AvatarUploadError as e:
            return Response({"detail": str(e)}, status=400)
        return Response({"avatar_url": url, "detail": "Profile picture updated."})

    def delete(self, request):
        from .services.storage_service import delete_avatar

        delete_avatar(request.user)
        return Response({"detail": "Profile picture removed."})
