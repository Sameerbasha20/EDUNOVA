import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function MedicalRecords() {
  const [logs, setLogs] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [form, setForm] = useState({ student_id: "", symptoms: "", treatment_given: "", doctor_notes: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/admin-portal/medical-logs/${studentId ? `?student_id=${studentId}` : ""}`).then(({ data }) => setLogs(data)).catch(() => setLogs([]));
  }
  useEffect(() => { load(); }, [studentId]);

  async function save(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/medical-logs/", form);
      setForm({ student_id: "", symptoms: "", treatment_given: "", doctor_notes: "" });
      setToast("Medical record saved.");
      load();
    } catch { setToast("Could not save record."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Log a medical visit</SectionTitle>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="Student user ID" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Treatment given" value={form.treatment_given} onChange={(e) => setForm({ ...form, treatment_given: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="Doctor notes (optional)" value={form.doctor_notes} onChange={(e) => setForm({ ...form, doctor_notes: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2" rows={2} />
          <button className="sm:col-span-2 bg-academic-blue text-white rounded-xl py-2 font-medium">Save record</button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Medical visit history</SectionTitle>
          <input placeholder="Filter by student user ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm w-56" />
        </div>
        {logs === null ? <Loader /> : logs.length === 0 ? <EmptyState label="No medical records yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Symptoms</th><th className="py-2 pr-4">Treatment</th><th className="py-2 pr-4">Notes</th>
              </tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4">{l.student_name}</td>
                    <td className="py-2 pr-4">{l.visit_date}</td>
                    <td className="py-2 pr-4">{l.symptoms}</td>
                    <td className="py-2 pr-4">{l.treatment_given}</td>
                    <td className="py-2 pr-4">{l.doctor_notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
