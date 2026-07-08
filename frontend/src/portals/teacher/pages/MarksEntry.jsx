import { FileEdit, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import api from "../lib/api";

export default function MarksEntry() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [sheet, setSheet] = useState(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/teacher/exams/").then(({ data }) => {
      setExams(data);
      if (data.length) setExamId(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!examId) return;
    setSheet(null);
    api.get("/teacher/marks-entry/", { params: { exam_schedule_id: examId } }).then(({ data }) => {
      setSheet(data);
      setRows(data.rows);
    });
  }, [examId]);

  function updateRow(idx, field, value) {
    setRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  async function save(submit) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/teacher/marks-entry/", {
        exam_schedule_id: examId,
        entries: rows.map((r) => ({
          student: r.student,
          marks_obtained: r.marks_obtained === "" ? null : r.marks_obtained,
          grade_letter: r.grade_letter,
          remarks: r.remarks,
        })),
        submit,
      });
      setToast(data.detail);
      if (submit) {
        const refreshed = await api.get("/teacher/marks-entry/", { params: { exam_schedule_id: examId } });
        setRows(refreshed.data.rows);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't save marks.");
    } finally {
      setBusy(false);
    }
  }

  const complete = rows.length > 0 && rows.every((r) => r.marks_obtained !== "" && r.marks_obtained != null);

  return (
    <div className="space-y-4">
      <select
        value={examId}
        onChange={(e) => setExamId(e.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
      >
        {exams.map((e) => (
          <option key={e.id} value={e.id}>{e.exam_name} — {e.class_name} ({e.subject_name})</option>
        ))}
      </select>

      {!sheet ? (
        <Loader rows={4} />
      ) : (
        <Card>
          <SectionTitle
            action={
              <Badge tone={complete ? "green" : "gold"}>
                {complete ? "Marks entry complete" : "Marks entry incomplete"}
              </Badge>
            }
          >
            {sheet.exam.exam_name} — out of {sheet.exam.max_marks}
          </SectionTitle>
          {error && <div className="mb-3 text-sm text-danger bg-red-50 rounded-xl px-3 py-2">{error}</div>}
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-secondary text-xs uppercase tracking-wide">
                    <th className="py-2">Student</th>
                    <th className="py-2">Marks</th>
                    <th className="py-2">Grade</th>
                    <th className="py-2">Remarks</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, idx) => (
                    <tr key={r.student}>
                      <td className="py-2 pr-2">
                        <p className="font-medium">{r.student_name}</p>
                        <p className="text-xs text-ink-secondary font-numeric">{r.admission_number}</p>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          max={sheet.exam.max_marks}
                          disabled={r.published}
                          value={r.marks_obtained ?? ""}
                          onChange={(e) => updateRow(idx, "marks_obtained", e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus-ring outline-none disabled:bg-slate-50"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          disabled={r.published}
                          value={r.grade_letter ?? ""}
                          onChange={(e) => updateRow(idx, "grade_letter", e.target.value)}
                          placeholder="auto"
                          className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus-ring outline-none disabled:bg-slate-50"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          disabled={r.published}
                          value={r.remarks ?? ""}
                          onChange={(e) => updateRow(idx, "remarks", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus-ring outline-none disabled:bg-slate-50"
                        />
                      </td>
                      <td className="py-2">
                        <Badge tone={r.published ? "green" : "gold"}>{r.published ? "Published" : "Draft"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="No students enrolled in this class." />
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl border border-academic-blue/30 text-academic-blue px-4 py-2.5 text-sm font-medium hover:bg-academic-blue/5 disabled:opacity-60"
            >
              <FileEdit size={14} /> Save as draft
            </button>
            <button
              onClick={() => save(true)}
              disabled={busy || !complete}
              className="flex items-center gap-2 rounded-xl bg-academic-blue text-white px-4 py-2.5 text-sm font-medium hover:bg-academic-blue/90 disabled:opacity-60"
              title={!complete ? "Enter marks for every student first" : ""}
            >
              <Send size={14} /> Submit for admin publication
            </button>
          </div>
        </Card>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
