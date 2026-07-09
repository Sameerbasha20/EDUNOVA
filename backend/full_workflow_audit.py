"""
Full end-to-end workflow audit — every real action a user would take in each
portal, chained the way the UI chains them (not just isolated GET checks).
Uses Django's test Client against the REAL configured database (not an
ephemeral test DB), reading OTPs straight from cache so no real email
round-trip is needed.

Run as a standalone script (NOT piped into `manage.py shell <`, which parses
input line-by-line and mangles multi-line for-loops/if-blocks):
    venv/Scripts/python.exe full_workflow_audit.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.conf import settings
from django.test import Client
from django.core.cache import cache
from django.contrib.auth import get_user_model

if "testserver" not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append("testserver")

client = Client(raise_request_exception=False)
User = get_user_model()

import time
RUN_TAG = str(int(time.time()))[-6:]  # unique per run so re-runs don't collide on unique constraints

fails = []
passes = 0


def post(path, body, token=None):
    headers = {}
    if token:
        headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    resp = client.post(f"/api{path}", data=json.dumps(body), content_type="application/json", **headers)
    try:
        data = resp.json()
    except Exception:
        data = resp.content[:300]
    return data, resp.status_code


def patch(path, body, token=None):
    headers = {}
    if token:
        headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    resp = client.patch(f"/api{path}", data=json.dumps(body), content_type="application/json", **headers)
    try:
        data = resp.json()
    except Exception:
        data = resp.content[:300]
    return data, resp.status_code


def get(path, token=None):
    headers = {}
    if token:
        headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    resp = client.get(f"/api{path}", **headers)
    try:
        data = resp.json()
    except Exception:
        data = resp.content[:300]
    return data, resp.status_code


def login(email, password="EduNova@123"):
    d, s = post("/auth/login/", {"email": email, "password": password})
    if s != 200:
        return None, f"step1 {s}: {d}"
    user_id = d["user_id"]
    otp = cache.get(f"portal_login_otp:{user_id}")
    if not otp:
        return None, f"no OTP found in cache for user_id={user_id}"
    d2, s2 = post("/auth/verify-otp/", {"user_id": user_id, "otp": otp})
    if s2 != 200:
        return None, f"otp {s2}: {d2}"
    return d2["access"], None


def check(label, cond, detail=""):
    global passes
    if cond:
        passes += 1
        print(f"  [OK] {label}")
    else:
        fails.append((label, detail))
        print(f"  [FAIL] {label}  {detail}")


print("=== LOGIN ===")
st, e = login("student@edunova.edu")
check("student login", st is not None, e or "")
te, e = login("teacher@edunova.edu")
check("teacher login", te is not None, e or "")
pa, e = login("parent@edunova.edu")
check("parent login", pa is not None, e or "")
ad, e = login("admin@edunova.edu")
check("admin login", ad is not None, e or "")

# =============================================================================
# TEACHER WORKFLOW: classes -> roster -> attendance -> homework -> assignment
# -> grade submission -> question bank -> exam -> marks entry -> performance
# =============================================================================
print("\n=== TEACHER WORKFLOW ===")
classes_d, s = get("/teacher/classes/", te)
check("GET /teacher/classes/", s == 200, f"{s}: {classes_d}")
class_id = classes_d[0]["class_id"] if s == 200 and classes_d else None
subject_id = None

if class_id:
    roster_d, s = get(f"/teacher/classes/{class_id}/roster/", te)
    check("GET class roster", s == 200, f"{s}: {roster_d}")
    a_student_id = roster_d[0]["student"] if s == 200 and roster_d else None

    d, s = get("/teacher/exams/", te)
    subject_id = None
    if s == 200 and d:
        pass  # exam list doesn't give subject_id directly; fall back below

    # Get a subject id from admin classes/subjects listing (any subject works
    # for exercising the write path)
    subj_d, s = get("/admin-portal/subjects/", ad)
    subject_id = subj_d[0]["id"] if s == 200 and subj_d else None

    if a_student_id:
        d, s = post("/teacher/attendance/", {
            "class_id": class_id, "date": "2026-07-08",
            "records": [{"student": a_student_id, "status": "Present", "remarks": "audit"}],
        }, te)
        check("POST teacher/attendance/", s == 200, f"{s}: {d}")

    if subject_id:
        d, s = post("/teacher/homework/", {
            "class_id": class_id, "subject_id": subject_id, "title": "Workflow Audit HW",
            "description": "audit", "due_date": "2026-12-31",
        }, te)
        check("POST teacher/homework/", s == 200, f"{s}: {d}")

        d, s = post("/teacher/assignments/", {
            "class_id": class_id, "subject_id": subject_id, "title": "Workflow Audit Assignment",
            "description": "audit", "max_marks": 50, "due_date": "2026-12-31T00:00:00Z",
        }, te)
        check("POST teacher/assignments/", s == 200, f"{s}: {d}")
        assignment_id = d.get("id") if s == 200 else None

        d, s = post("/teacher/question-bank/", {
            "subject_id": subject_id, "difficulty_level": "Medium",
            "question_text": "Audit question?", "answer_schema": "{}",
        }, te)
        check("POST teacher/question-bank/", s == 200, f"{s}: {d}")
        question_id = d.get("id") if s == 200 else None
        if question_id:
            d, s = get("/teacher/question-bank/", te)
            check("GET teacher/question-bank/ includes new question", s == 200 and any(q["id"] == question_id for q in d), f"{s}: {d}")
            resp = client.delete(f"/api/teacher/question-bank/{question_id}/", HTTP_AUTHORIZATION=f"Bearer {te}")
            check("DELETE teacher/question-bank/{id}/", resp.status_code == 200, f"{resp.status_code}")

        d, s = post("/teacher/exams/", {
            "class_id": class_id, "subject_id": subject_id, "exam_name": "Unit_Test_1",
            "exam_type": "Unit_Test", "exam_date": "2026-08-01", "start_time": "09:00",
            "duration_minutes": 60, "max_marks": 100,
        }, te)
        check("POST teacher/exams/", s == 200, f"{s}: {d}")
        exam_id = d.get("id") if s == 200 else None

        if exam_id and a_student_id:
            d, s = get(f"/teacher/marks-entry/?exam_schedule_id={exam_id}", te)
            check("GET teacher/marks-entry/", s == 200, f"{s}: {d}")
            d, s = post("/teacher/marks-entry/", {
                "exam_schedule_id": exam_id,
                "entries": [{"student": a_student_id, "marks_obtained": 88, "remarks": "audit"}],
            }, te)
            check("POST teacher/marks-entry/", s == 200, f"{s}: {d}")

        d, s = get(f"/teacher/performance/?class_id={class_id}", te)
        check("GET teacher/performance/", s == 200, f"{s}: {d}")

        if assignment_id and a_student_id:
            d, s = get(f"/teacher/assignments/{assignment_id}/submissions/", te)
            check("GET assignment submissions (empty, no student submitted yet)", s == 200, f"{s}: {d}")

d, s = get("/teacher/messages/", te)
check("GET teacher/messages/", s == 200, f"{s}: {d}")
d, s = get("/teacher/contacts/", te)
check("GET teacher/contacts/", s == 200, f"{s}: {d}")
d, s = post("/teacher/leaves/", {
    "leave_type": "Sick", "start_date": "2026-08-10", "end_date": "2026-08-11", "reason": "audit",
}, te)
check("POST teacher/leaves/", s == 200, f"{s}: {d}")
d, s = get("/teacher/timetable/", te)
check("GET teacher/timetable/", s == 200, f"{s}: {d}")
d, s = post("/teacher/documents/", {"content_type": "PDF_Notes", "title": "Audit Doc", "resource_url": "https://example.com/doc.pdf"}, te)
check("POST teacher/documents/", s == 200, f"{s}: {d}")

# =============================================================================
# STUDENT WORKFLOW: courses -> quiz -> assignment submit -> forum -> notes ->
# mark-complete -> fees pay
# =============================================================================
print("\n=== STUDENT WORKFLOW ===")
courses_d, s = get("/student/courses/", st)
check("GET student/courses/", s == 200, f"{s}: {courses_d}")
course_id = courses_d[0]["id"] if s == 200 and courses_d else None

if course_id:
    d, s = post("/lms/forum-topics/", {"course_id": course_id, "title": "Audit Topic", "content": "audit"}, st)
    check("POST lms/forum-topics/ (student, own course)", s == 200, f"{s}: {d}")
    topic_id = d.get("id") if s == 200 else None
    if topic_id:
        d, s = post(f"/lms/forum-topics/{topic_id}/reply/", {"post_text": "audit reply"}, st)
        check("POST forum reply", s == 200, f"{s}: {d}")
        d, s = get(f"/lms/forum-topics/{topic_id}/", st)
        check("GET forum topic detail with reply", s == 200 and len(d.get("posts", [])) >= 1, f"{s}: {d}")

    d, s = post("/lms/notes/", {"course_id": course_id, "title": "Audit Note", "body_markdown": "# audit"}, st)
    check("POST lms/notes/ (student)", s == 200, f"{s}: {d}")

    content_list = courses_d[0].get("content", [])
    if content_list:
        d, s = post("/lms/mark-complete/", {"content_id": content_list[0]["id"]}, st)
        check("POST lms/mark-complete/", s == 200, f"{s}: {d}")

    quizzes = courses_d[0].get("quizzes", [])
    if quizzes:
        d, s = get(f"/student/quizzes/{quizzes[0]['id']}/", st)
        check("GET student/quizzes/{id}/", s == 200, f"{s}: {d}")

assignments_d, s = get("/student/assignments/", st)
check("GET student/assignments/", s == 200, f"{s}: {assignments_d}")
ungraded = [a for a in assignments_d if s == 200 and not a.get("my_submission")]
if ungraded:
    d, s = post(f"/student/assignments/{ungraded[0]['id']}/submit/", {"submission_url": "https://example.com/audit.pdf"}, st)
    check("POST student assignment submit", s == 200, f"{s}: {d}")

fees_d, s = get("/student/fees/", st)
check("GET student/fees/", s == 200, f"{s}: {fees_d}")
pending_fees = fees_d.get("pending", []) if s == 200 else []
if pending_fees:
    d, s = post("/student/fees/pay/", {"fee_structure_id": pending_fees[0]["id"], "payment_method": "UPI"}, st)
    check("POST student/fees/pay/", s == 200, f"{s}: {d}")
else:
    print("  [SKIP] student fee payment (no pending fees)")

# =============================================================================
# PARENT WORKFLOW
# =============================================================================
print("\n=== PARENT WORKFLOW ===")
children_d, s = get("/parent/children/", pa)
check("GET parent/children/", s == 200, f"{s}: {children_d}")
child_id = children_d[0]["id"] if s == 200 and children_d else None

if child_id:
    for path in [
        f"/parent/attendance/?child_id={child_id}", f"/parent/homework/?child_id={child_id}",
        f"/parent/results/?child_id={child_id}", f"/parent/fees/?child_id={child_id}",
        f"/parent/documents/?child_id={child_id}", f"/parent/transport/?child_id={child_id}",
        f"/parent/hostel/?child_id={child_id}",
    ]:
        d, s = get(path, pa)
        check(f"GET {path}", s == 200, f"{s}: {d}")

    d, s = post("/parent/leaves/", {
        "child_id": child_id, "leave_type": "Sick", "start_date": "2026-08-15",
        "end_date": "2026-08-16", "reason": "audit",
    }, pa)
    check("POST parent/leaves/", s == 200, f"{s}: {d}")

teachers_d, s = get("/parent/teachers/", pa)
check("GET parent/teachers/", s == 200, f"{s}: {teachers_d}")
a_teacher_id = teachers_d[0]["id"] if s == 200 and teachers_d else None
if a_teacher_id and child_id:
    d, s = post("/parent/ptm/", {
        "teacher_id": a_teacher_id, "student_id": child_id,
        "meeting_date": "2026-09-01", "time_slot": "10:00", "parent_notes": "audit",
    }, pa)
    check("POST parent/ptm/", s == 200, f"{s}: {d}")

d, s = post("/parent/feedback/", {"category": "General", "feedback_text": "audit feedback"}, pa)
check("POST parent/feedback/", s == 200, f"{s}: {d}")
d, s = get("/parent/notifications/", pa)
check("GET parent/notifications/", s == 200, f"{s}: {d}")
if a_teacher_id:
    d, s = post("/parent/messages/", {"receiver": a_teacher_id, "message_text": "audit message"}, pa)
    check("POST parent/messages/", s == 200, f"{s}: {d}")

# =============================================================================
# ADMIN WORKFLOW: full admissions lifecycle, users, classes/subjects,
# transport, fees, library issue/return, notices, leave approval, hostel,
# inventory, visitors, alumni, medical, rank list / report card
# =============================================================================
print("\n=== ADMIN WORKFLOW ===")

d, s = post("/admissions/enquiries/", {
    "applicant_name": "Workflow Audit Child", "date_of_birth": "2015-05-05", "gender": "Male",
    "target_class": "Grade 3", "parent_name": "Audit Parent", "parent_phone": "9999999999",
    "parent_email": f"audit.parent.wf.{RUN_TAG}@edunova.edu", "address": "Test address",
}, None)
check("POST public admissions enquiry", s == 201 or s == 200, f"{s}: {d}")
reg_no = d.get("registration_number") if s in (200, 201) else None

if reg_no:
    d, s = get(f"/admissions/enquiries/{reg_no}/", None)
    check("GET admissions enquiry status by registration_number (public)", s == 200 and d.get("status") == "Registered", f"{s}: {d}")

    for expected_next in ["Verification", "Screening", "Fee_Pending", "Confirmed"]:
        d, s = post(f"/admin-portal/admissions/{reg_no}/action/", {"action": "advance"}, ad)
        check(f"POST admissions action advance -> {expected_next}", s == 200 and d.get("status") == expected_next, f"{s}: {d}")

    check("Confirmed admission generated credentials", isinstance(d.get("credentials"), dict) and d["credentials"].get("student_username"), f"{d}")

    if isinstance(d.get("credentials"), dict):
        new_student_username = d["credentials"]["student_username"]
        new_student_pw = d["credentials"]["student_temp_password"]
        new_st, e = login(new_student_username, new_student_pw)
        check("Newly confirmed student can log in with temp password", new_st is not None, e or "")

# Rejected path
d, s = post("/admissions/enquiries/", {
    "applicant_name": "Workflow Reject Child", "date_of_birth": "2016-01-01", "gender": "Female",
    "target_class": "Grade 1", "parent_name": "Reject Parent", "parent_phone": "8888888888",
    "parent_email": "reject.parent.wf@edunova.edu", "address": "Test address",
}, None)
reg_no2 = d.get("registration_number") if s in (200, 201) else None
if reg_no2:
    d, s = post(f"/admin-portal/admissions/{reg_no2}/action/", {"action": "reject", "reason": "audit reject"}, ad)
    check("POST admissions action reject", s == 200 and d.get("status") == "Rejected", f"{s}: {d}")

# Users
d, s = post("/admin-portal/users/", {
    "role": "Teacher", "email": f"audit.newteacher.{RUN_TAG}@edunova.edu", "first_name": "Audit", "last_name": "Teacher",
}, ad)
check("POST admin-portal/users/ (create)", s == 200, f"{s}: {d}")
new_user_id = d.get("id") if s == 200 else None
if new_user_id:
    d, s = patch(f"/admin-portal/users/{new_user_id}/", {"is_active": False}, ad)
    check("PATCH admin-portal/users/{id}/ (deactivate)", s == 200, f"{s}: {d}")
    d, s = post(f"/admin-portal/users/{new_user_id}/reset-password/", {}, ad)
    check("POST admin-portal/users/{id}/reset-password/", s == 200 and "temp_password" in d, f"{s}: {d}")

d, s = get("/admin-portal/roles/", ad)
check("GET admin-portal/roles/", s == 200, f"{s}: {d}")

d, s = post("/admin-portal/classes/", {"name": f"Audit{RUN_TAG}", "section": "Z", "curriculum": "CBSE", "room_number": "999"}, ad)
check("POST admin-portal/classes/", s == 200, f"{s}: {d}")
new_class_id = d.get("id") if s == 200 else None

d, s = post("/admin-portal/subjects/", {"name": "Audit Subject", "subject_code": f"AUD{RUN_TAG}", "type": "Core"}, ad)
check("POST admin-portal/subjects/", s == 200, f"{s}: {d}")

d, s = post("/admin-portal/vehicles/", {"vehicle_number": f"AUD-{RUN_TAG}", "capacity": 40, "maintenance_status": "OK"}, ad)
check("POST admin-portal/vehicles/", s == 200, f"{s}: {d}")
new_vehicle_id = d.get("id") if s == 200 else None

d, s = post("/admin-portal/routes/", {"route_name": "Audit Route", "start_point": "A", "end_point": "B"}, ad)
check("POST admin-portal/routes/", s == 200, f"{s}: {d}")
new_route_id = d.get("id") if s == 200 else None

if new_class_id:
    d, s = post("/admin-portal/fee-structures/", {
        "class_id": new_class_id, "term_name": "Audit Term", "tuition_fee": 1000,
        "transport_fee": 100, "hostel_fee": 0, "total_amount": 1100,
    }, ad)
    check("POST admin-portal/fee-structures/", s == 200, f"{s}: {d}")

d, s = get("/admin-portal/payments/", ad)
check("GET admin-portal/payments/", s == 200, f"{s}: {d}")

# Library issue/return
d, s = post("/admin-portal/library/books/", {
    "title": "Audit Book", "author": "Audit Author", "isbn": f"AUD-ISBN-{RUN_TAG}",
    "barcode_id": f"AUD-BC-{RUN_TAG}", "quantity": 3, "available_quantity": 3, "book_type": "Physical",
}, ad)
check("POST admin-portal/library/books/", s == 200, f"{s}: {d}")
new_book_id = d.get("id") if s == 200 else None
if new_book_id and child_id:
    d, s = post("/admin-portal/library/issue/", {"book_id": new_book_id, "borrower_id": child_id, "loan_days": 14}, ad)
    check("POST admin-portal/library/issue/", s == 200, f"{s}: {d}")
    txn_id = d.get("id") if s == 200 else None
    if txn_id:
        d, s = post(f"/admin-portal/library/return/{txn_id}/", {}, ad)
        check("POST admin-portal/library/return/{id}/", s == 200, f"{s}: {d}")

d, s = post("/admin-portal/notices/", {"title": "Audit Notice", "message": "audit", "recipient_type": "All"}, ad)
check("POST admin-portal/notices/", s == 200, f"{s}: {d}")

leaves_pending, s = get("/admin-portal/leaves/?status=Pending", ad)
check("GET admin-portal/leaves/?status=Pending", s == 200, f"{s}: {leaves_pending}")
if s == 200 and leaves_pending:
    lid = leaves_pending[0]["id"]
    d, s = post(f"/admin-portal/leaves/{lid}/decide/", {"decision": "Approved"}, ad)
    check("POST admin-portal/leaves/{id}/decide/", s == 200, f"{s}: {d}")

d, s = get("/admin-portal/reports/", ad)
check("GET admin-portal/reports/", s == 200, f"{s}: {d}")
d, s = get("/admin-portal/audit-log/", ad)
check("GET admin-portal/audit-log/", s == 200, f"{s}: {d}")
d, s = get("/admin-portal/backup/export/", ad)
check("GET admin-portal/backup/export/", s == 200, f"{s}: {d}")

# Hostel: hostel -> room -> allocate -> vacate
d, s = post("/admin-portal/hostels/", {"name": "Audit Hostel", "type": "Boys"}, ad)
check("POST admin-portal/hostels/", s == 200, f"{s}: {d}")
new_hostel_id = d.get("id") if s == 200 else None
if new_hostel_id:
    d, s = post("/admin-portal/rooms/", {"hostel_id": new_hostel_id, "room_number": "101", "capacity": 2}, ad)
    check("POST admin-portal/rooms/", s == 200, f"{s}: {d}")
    new_room_id = d.get("id") if s == 200 else None
    if new_room_id and child_id:
        d, s = post("/admin-portal/hostel-allocations/", {"student_id": child_id, "room_id": new_room_id}, ad)
        check("POST admin-portal/hostel-allocations/", s == 200, f"{s}: {d}")
        alloc_id = d.get("id") if s == 200 else None
        if alloc_id:
            d, s = post(f"/admin-portal/hostel-allocations/{alloc_id}/vacate/", {}, ad)
            check("POST admin-portal/hostel-allocations/{id}/vacate/", s == 200, f"{s}: {d}")

# Inventory
d, s = post("/admin-portal/inventory/", {"item_name": "Audit Item", "category": "General", "quantity": 10, "department": "IT"}, ad)
check("POST admin-portal/inventory/", s == 200, f"{s}: {d}")
inv_id = d.get("id") if s == 200 else None
if inv_id:
    d, s = patch("/admin-portal/inventory/", {"id": inv_id, "quantity_delta": -3}, ad)
    check("PATCH admin-portal/inventory/", s == 200 and d.get("quantity") == 7, f"{s}: {d}")

# Visitors
d, s = post("/admin-portal/visitors/", {"visitor_name": "Audit Visitor", "purpose": "Meeting", "id_proof_type": "Aadhar"}, ad)
check("POST admin-portal/visitors/", s == 200, f"{s}: {d}")
visitor_id = d.get("id") if s == 200 else None
if visitor_id:
    d, s = post(f"/admin-portal/visitors/{visitor_id}/checkout/", {}, ad)
    check("POST admin-portal/visitors/{id}/checkout/", s == 200, f"{s}: {d}")

# Alumni
if child_id:
    d, s = post("/admin-portal/alumni/", {
        "student_id": child_id, "graduation_year": 2026, "current_occupation": "Student", "higher_studies_details": "N/A",
    }, ad)
    check("POST admin-portal/alumni/", s == 200, f"{s}: {d}")

    d, s = post("/admin-portal/medical-logs/", {
        "student_id": child_id, "symptoms": "Headache", "treatment_given": "Rest", "doctor_notes": "audit",
    }, ad)
    check("POST admin-portal/medical-logs/", s == 200, f"{s}: {d}")

print(f"\n=== SUMMARY: {passes} passed, {len(fails)} failed ===")
for label, detail in fails:
    print(f"  FAIL: {label}  {detail}")

print("now exiting")
