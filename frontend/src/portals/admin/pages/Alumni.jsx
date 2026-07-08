import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Alumni() {
  const [alumni, setAlumni] = useState(null);
  const [year, setYear] = useState("");
  const [form, setForm] = useState({ student_id: "", graduation_year: "", current_occupation: "", higher_studies_details: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/admin-portal/alumni/${year ? `?graduation_year=${year}` : ""}`).then(({ data }) => setAlumni(data)).catch(() => setAlumni([]));
  }
  useEffect(() => { load(); }, [year]);

  async function save(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/alumni/", form);
      setForm({ student_id: "", graduation_year: "", current_occupation: "", higher_studies_details: "" });
      setToast("Alumni record saved.");
      load();
    } catch { setToast("Could not save record."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Add / update alumni record</SectionTitle>
        <form onSubmit={save} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input required placeholder="Former student user ID" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Graduation year" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Current occupation" value={form.current_occupation} onChange={(e) => setForm({ ...form, current_occupation: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Higher studies details" value={form.higher_studies_details} onChange={(e) => setForm({ ...form, higher_studies_details: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="sm:col-span-2 lg:col-span-4 bg-academic-blue text-white rounded-xl py-2 font-medium">Save record</button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Alumni registry</SectionTitle>
          <input placeholder="Filter by graduation year" value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm w-48" />
        </div>
        {alumni === null ? <Loader /> : alumni.length === 0 ? <EmptyState label="No alumni records yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Graduated</th><th className="py-2 pr-4">Occupation</th><th className="py-2 pr-4">Higher studies</th>
              </tr></thead>
              <tbody>
                {alumni.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4">{a.student_name}</td>
                    <td className="py-2 pr-4">{a.email}</td>
                    <td className="py-2 pr-4">{a.graduation_year}</td>
                    <td className="py-2 pr-4">{a.current_occupation || "—"}</td>
                    <td className="py-2 pr-4">{a.higher_studies_details || "—"}</td>
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
