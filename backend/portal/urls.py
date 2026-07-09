from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import auth_views, teacher_views, views, parent_views, admin_views, facilities_views, exam_extras_views, lms_extras_views

urlpatterns = [
    # Auth (credentials -> OTP -> JWT), shared by every portal
    path("auth/login/", auth_views.login_step1, name="login-step1"),
    path("auth/verify-otp/", auth_views.login_step2_verify_otp, name="login-verify-otp"),
    path("auth/resend-otp/", auth_views.resend_otp, name="resend-otp"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", auth_views.logout, name="logout"),

    # Profile picture -- shared across every portal (any authenticated role)
    path("profile/avatar/", views.AvatarView.as_view()),

    # Student portal
    path("student/profile/", views.ProfileView.as_view()),
    path("student/dashboard/", views.DashboardView.as_view()),
    path("student/attendance/", views.AttendanceListView.as_view()),
    path("student/timetable/", views.TimetableView.as_view()),
    path("student/homework/", views.HomeworkListView.as_view()),
    path("student/assignments/", views.AssignmentListView.as_view()),
    path("student/assignments/<int:assignment_id>/submit/", views.AssignmentSubmitView.as_view()),
    path("student/courses/", views.CourseListView.as_view()),
    path("student/quizzes/<int:quiz_id>/", views.QuizDetailView.as_view()),
    path("student/exams/", views.ExamListView.as_view()),
    path("student/hall-tickets/", views.HallTicketListView.as_view()),
    path("student/results/", views.ResultListView.as_view()),
    path("student/fees/", views.FeesView.as_view()),
    path("student/fees/pay/", views.InitiatePaymentView.as_view()),
    path("student/library/", views.LibraryView.as_view()),
    path("student/library/search/", views.BookSearchView.as_view()),
    path("student/certificates/", views.CertificateListView.as_view()),
    path("student/announcements/", views.AnnouncementListView.as_view()),
    path("student/events/", views.EventListView.as_view()),
    path("student/messages/", views.StudentMessageThreadView.as_view()),
    path("student/hostel/", facilities_views.StudentHostelView.as_view()),
    path("student/medical-records/", facilities_views.StudentMedicalView.as_view()),
    path("student/report-card/", exam_extras_views.StudentReportCardView.as_view()),
    path("lms/forum-topics/", lms_extras_views.ForumTopicListView.as_view()),
    path("lms/forum-topics/<int:topic_id>/", lms_extras_views.ForumTopicDetailView.as_view()),
    path("lms/forum-topics/<int:topic_id>/reply/", lms_extras_views.ForumPostView.as_view()),
    path("lms/notes/", lms_extras_views.DigitalNoteView.as_view()),
    path("lms/mark-complete/", lms_extras_views.MarkContentCompleteView.as_view()),
    path("lms/analytics/", lms_extras_views.CourseAnalyticsView.as_view()),

    # Teacher portal — mirrors the "Teacher Portal — Detailed Flowchart"
    path("teacher/profile/", teacher_views.TeacherProfileView.as_view()),
    path("teacher/dashboard/", teacher_views.TeacherDashboardView.as_view()),
    path("teacher/classes/", teacher_views.MyClassesView.as_view()),
    path("teacher/classes/<int:class_id>/roster/", teacher_views.ClassRosterView.as_view()),
    path("teacher/attendance/", teacher_views.AttendanceView.as_view()),
    path("teacher/homework/", teacher_views.HomeworkView.as_view()),
    path("teacher/assignments/", teacher_views.AssignmentView.as_view()),
    path("teacher/assignments/<int:assignment_id>/submissions/", teacher_views.AssignmentSubmissionsView.as_view()),
    path("teacher/assignments/<int:assignment_id>/submissions/<int:submission_id>/", teacher_views.AssignmentSubmissionsView.as_view()),
    path("teacher/question-bank/", teacher_views.QuestionBankView.as_view()),
    path("teacher/question-bank/<int:question_id>/", teacher_views.QuestionBankView.as_view()),
    path("teacher/exams/", teacher_views.TeacherExamView.as_view()),
    path("teacher/marks-entry/", teacher_views.MarksEntryView.as_view()),
    path("teacher/performance/", teacher_views.PerformanceAnalyticsView.as_view()),
    path("teacher/messages/", teacher_views.MessageThreadView.as_view()),
    path("teacher/contacts/", teacher_views.MyContactsView.as_view()),
    path("teacher/notices/", teacher_views.NoticeListView.as_view()),
    path("teacher/leaves/", teacher_views.LeaveView.as_view()),
    path("teacher/timetable/", teacher_views.TeacherTimetableView.as_view()),
    path("teacher/documents/", teacher_views.TeacherDocumentsView.as_view()),

    # Parent portal
    path("parent/profile/", parent_views.ParentProfileView.as_view()),
    path("parent/dashboard/", parent_views.ParentDashboardView.as_view()),
    path("parent/children/", parent_views.ChildrenListView.as_view()),
    path("parent/attendance/", parent_views.ChildAttendanceView.as_view()),
    path("parent/homework/", parent_views.ChildHomeworkView.as_view()),
    path("parent/results/", parent_views.ChildResultsView.as_view()),
    path("parent/fees/", parent_views.ChildFeesView.as_view()),
    path("parent/fees/pay/", parent_views.ChildFeesPayView.as_view()),
    path("parent/documents/", parent_views.ChildDocumentsView.as_view()),
    path("parent/transport/", parent_views.ChildTransportView.as_view()),
    path("parent/hostel/", facilities_views.ChildHostelView.as_view()),
    path("parent/teachers/", parent_views.TeacherContactsView.as_view()),
    path("parent/messages/", parent_views.MessageThreadView.as_view()),
    path("parent/notifications/", parent_views.NotificationListView.as_view()),
    path("parent/leaves/", parent_views.LeaveRequestView.as_view()),
    path("parent/ptm/", parent_views.PtmBookingView.as_view()),
    path("parent/feedback/", parent_views.FeedbackView.as_view()),

    # Admin portal
    path("admin-portal/dashboard/", admin_views.AdminDashboardView.as_view()),
    path("admin-portal/admissions/", admin_views.AdmissionListView.as_view()),
    path("admin-portal/admissions/<str:registration_number>/action/", admin_views.AdmissionActionView.as_view()),
    path("admin-portal/users/", admin_views.UserListView.as_view()),
    path("admin-portal/users/<int:user_id>/", admin_views.UserDetailView.as_view()),
    path("admin-portal/users/<int:user_id>/reset-password/", admin_views.UserDetailView.as_view()),
    path("admin-portal/roles/", admin_views.RolesView.as_view()),
    path("admin-portal/students/", admin_views.StudentListView.as_view()),
    path("admin-portal/students/<int:user_id>/", admin_views.StudentDetailView.as_view()),
    path("admin-portal/teachers/", admin_views.TeacherListView.as_view()),
    path("admin-portal/teachers/<int:user_id>/", admin_views.TeacherDetailView.as_view()),
    path("admin-portal/departments/", admin_views.DepartmentListView.as_view()),
    path("admin-portal/classes/", admin_views.ClassView.as_view()),
    path("admin-portal/subjects/", admin_views.SubjectView.as_view()),
    path("admin-portal/vehicles/", admin_views.VehicleView.as_view()),
    path("admin-portal/routes/", admin_views.RouteView.as_view()),
    path("admin-portal/transport-allocations/", admin_views.TransportAllocationView.as_view()),
    path("admin-portal/fee-structures/", admin_views.FeeStructureView.as_view()),
    path("admin-portal/payments/", admin_views.PaymentListView.as_view()),
    path("admin-portal/library/books/", admin_views.LibraryBookView.as_view()),
    path("admin-portal/library/issue/", admin_views.LibraryIssueView.as_view()),
    path("admin-portal/library/return/<int:transaction_id>/", admin_views.LibraryReturnView.as_view()),
    path("admin-portal/notices/", admin_views.NoticeBroadcastView.as_view()),
    path("admin-portal/leaves/", admin_views.LeaveApprovalListView.as_view()),
    path("admin-portal/leaves/<int:leave_id>/decide/", admin_views.LeaveApprovalListView.as_view()),
    path("admin-portal/reports/", admin_views.ReportsView.as_view()),
    path("admin-portal/audit-log/", admin_views.AuditLogListView.as_view()),
    path("admin-portal/backup/export/", admin_views.BackupExportView.as_view()),

    # Hostel module
    path("admin-portal/hostels/", facilities_views.HostelView.as_view()),
    path("admin-portal/rooms/", facilities_views.RoomView.as_view()),
    path("admin-portal/hostel-allocations/", facilities_views.HostelAllocationView.as_view()),
    path("admin-portal/hostel-allocations/<int:allocation_id>/vacate/", facilities_views.HostelVacateView.as_view()),

    # Inventory module
    path("admin-portal/inventory/", facilities_views.InventoryView.as_view()),

    # Visitor Management
    path("admin-portal/visitors/", facilities_views.VisitorLogView.as_view()),
    path("admin-portal/visitors/<int:visitor_id>/checkout/", facilities_views.VisitorCheckoutView.as_view()),

    # Alumni Registry
    path("admin-portal/alumni/", facilities_views.AlumniView.as_view()),

    # Medical Records
    path("admin-portal/medical-logs/", facilities_views.MedicalLogView.as_view()),

    # Exam extras: rank lists + report cards
    path("admin-portal/rank-list/", exam_extras_views.RankListView.as_view()),
    path("admin-portal/rank-list/overall/", exam_extras_views.OverallRankListView.as_view()),
    path("admin-portal/report-card/", exam_extras_views.ReportCardView.as_view()),
]
