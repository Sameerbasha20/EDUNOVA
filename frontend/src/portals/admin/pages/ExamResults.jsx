import { useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast, Badge } from "../components/Common";

const EXAM_NAME_CHOICES = ["Unit_Test_1", "Unit_Test_2", "Unit_Test_3", "Unit_Test_4", "Mid_Term", "Final_Term", "Pre_Board", "Board_Exam"];

export default function ExamResults() {
  const [tab, setTab] = useState("rank");

  // Per-subject rank list
  const [examScheduleId, setExamScheduleId] = useState("");
  const [subjectRanks, setSubjectRanks] = useState(null);

  // Overall class rank list
  const [classId, setClassId] = useState("");
  const [examName, setExamName] = useState("");
  const [overallRanks, setOverallRanks] = useState(null);

  // Report card
  const [studentId, setStudentId] = useState("");
  const [reportExamName, setReportExamName] = useState("");
  const [reportCard, setReportCard] = useState(null);

  const [toast, setToast] = useState("");

  async function generateSubjectRank(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin-portal/rank-list/", { exam_schedule_id: examScheduleId });
      setToast(data.detail);
      const res = await api.get(`/admin-portal/rank-list/?exam_schedule_id=${examScheduleId}`);
      setSubjectRanks(res.data);
    } catch { setToast("Could not generate rank list."); }
  }

  async function loadOverallRanks(e) {
    e.preventDefault();
    try {
      const { data } = await api.get(`/admin-portal/rank-list/overall/?class_id=${classId}&exam_name=${encodeURIComponent(examName)}`);
      setOverallRanks(data);
    } catch { setToast("Could not load overall rank list."); }
  }

  async function loadReportCard(e) {
    e.preventDefault();
    try {
      const { data } = await api.get(`/admin-portal/report-card/?student_id=${studentId}&exam_name=${encodeURIComponent(reportExamName)}`);
      setReportCard(data);
    } catch { setToast("Could not load report card."); }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[
          ["rank", "Subject Rank List"],
          ["overall", "Overall Class Rank"],
          ["report", "Report Card"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === key ? "bg-academic-blue text-white" : "bg-white text-ink-secondary shadow-card"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "rank" && (
        <Card>
          <SectionTitle>Generate rank list for one subject exam</SectionTitle>
          <form onSubmit={generateSubjectRank} className="flex gap-3 mb-4">
            <input required placeholder="Exam schedule ID" value={examScheduleId} onChange={(e) => setExamScheduleId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="bg-academic-blue text-white rounded-xl px-4 font-medium">Generate</button>
          </form>
          {subjectRanks === null ? null : subjectRanks.length === 0 ? <EmptyState label="No results recorded for that exam yet." /> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Rank</th><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Roll No.</th><th className="py-2 pr-4">Marks</th><th className="py-2 pr-4">Grade</th>
              </tr></thead>
              <tbody>
                {subjectRanks.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4"><Badge tone={r.rank_position === 1 ? "gold" : "blue"}>#{r.rank_position}</Badge></td>
                    <td className="py-2 pr-4">{r.student_name}</td>
                    <td className="py-2 pr-4">{r.roll_number || "—"}</td>
                    <td className="py-2 pr-4">{r.marks_obtained}</td>
                    <td className="py-2 pr-4">{r.grade_letter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "overall" && (
        <Card>
          <SectionTitle>Overall rank across all subjects (one exam cycle)</SectionTitle>
          <form onSubmit={loadOverallRanks} className="flex gap-3 mb-4">
            <input required placeholder="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select required value={examName} onChange={(e) => setExamName(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Select exam cycle</option>
              {EXAM_NAME_CHOICES.map((name) => <option key={name} value={name}>{name.replace(/_/g, " ")}</option>)}
            </select>
            <button className="bg-academic-blue text-white rounded-xl px-4 font-medium">Load</button>
          </form>
          {overallRanks === null ? null : overallRanks.length === 0 ? <EmptyState label="No results found for that class/exam." /> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Rank</th><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Roll No.</th><th className="py-2 pr-4">Total</th><th className="py-2 pr-4">Out of</th>
              </tr></thead>
              <tbody>
                {overallRanks.map((r) => (
                  <tr key={r.student_id} className="border-b border-slate-50">
                    <td className="py-2 pr-4"><Badge tone={r.overall_rank === 1 ? "gold" : "blue"}>#{r.overall_rank}</Badge></td>
                    <td className="py-2 pr-4">{r.student_name}</td>
                    <td className="py-2 pr-4">{r.roll_number || "—"}</td>
                    <td className="py-2 pr-4 font-medium">{r.total_marks}</td>
                    <td className="py-2 pr-4">{r.max_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "report" && (
        <Card>
          <SectionTitle>Generate a report card</SectionTitle>
          <form onSubmit={loadReportCard} className="flex gap-3 mb-4">
            <input required placeholder="Student user ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-40 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select required value={reportExamName} onChange={(e) => setReportExamName(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Select exam cycle</option>
              {EXAM_NAME_CHOICES.map((name) => <option key={name} value={name}>{name.replace(/_/g, " ")}</option>)}
            </select>
            <button className="bg-academic-blue text-white rounded-xl px-4 font-medium">Generate</button>
          </form>
          {reportCard && (!reportCard.subjects || reportCard.subjects.length === 0) && <EmptyState label="No results found for that student/exam." />}
          {reportCard && reportCard.subjects && reportCard.subjects.length > 0 && (
            <div className="border border-slate-100 rounded-2xl p-6 print:border-0">
              <div className="text-center mb-6">
                <p className="font-heading text-xl font-bold text-academic-blue">EduNova Global Academy</p>
                <p className="text-sm text-ink-secondary">Report Card — {reportCard.exam_name}</p>
                <p className="font-semibold mt-2">{reportCard.student_name}</p>
              </div>
              {reportCard.is_complete === false && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2 mb-4">
                  Only {reportCard.subjects.length} of {reportCard.expected_subject_count} subjects have marks entered for this exam cycle — totals below don't reflect the full picture yet.
                </div>
              )}
              <table className="w-full text-sm mb-4">
                <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                  <th className="py-2 pr-4">Subject</th><th className="py-2 pr-4">Marks</th><th className="py-2 pr-4">Out of</th><th className="py-2 pr-4">Grade</th>
                </tr></thead>
                <tbody>
                  {reportCard.subjects.map((s, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2 pr-4">{s.subject_name}</td>
                      <td className="py-2 pr-4">{s.marks_obtained}</td>
                      <td className="py-2 pr-4">{s.max_marks}</td>
                      <td className="py-2 pr-4">{s.grade_letter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div><p className="text-xs text-ink-secondary uppercase">Total</p><p className="font-bold text-lg">{reportCard.total_marks} / {reportCard.max_total}</p></div>
                <div><p className="text-xs text-ink-secondary uppercase">Percentage</p><p className="font-bold text-lg">{reportCard.percentage}%</p></div>
                <div><p className="text-xs text-ink-secondary uppercase">Overall Grade</p><p className="font-bold text-lg">{reportCard.overall_grade}</p></div>
              </div>
              <button onClick={() => window.print()} className="mt-4 w-full bg-academic-green text-white rounded-xl py-2 font-medium print:hidden">Print report card</button>
            </div>
          )}
        </Card>
      )}

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
