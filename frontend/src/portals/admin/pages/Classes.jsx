import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Classes() {
  const [classes, setClasses] = useState(null);
  const [subjects, setSubjects] = useState(null);
  const [classForm, setClassForm] = useState({ name: "", section: "", curriculum: "CBSE", room_number: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", subject_code: "", type: "Theory" });
  const [toast, setToast] = useState("");

  function loadClasses() {
    api.get("/admin-portal/classes/").then(({ data }) => setClasses(data)).catch(() => setClasses([]));
  }
  function loadSubjects() {
    api.get("/admin-portal/subjects/").then(({ data }) => setSubjects(data)).catch(() => setSubjects([]));
  }

  useEffect(() => { loadClasses(); loadSubjects(); }, []);

  async function addClass(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/classes/", classForm);
      setClassForm({ name: "", section: "", curriculum: "CBSE", room_number: "" });
      loadClasses();
    } catch { setToast("Could not create class."); }
  }

  async function addSubject(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/subjects/", subjectForm);
      setSubjectForm({ name: "", subject_code: "", type: "Theory" });
      loadSubjects();
    } catch { setToast("Could not create subject."); }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <SectionTitle>Add class</SectionTitle>
          <form onSubmit={addClass} className="grid grid-cols-2 gap-3">
            <input required placeholder="Name (e.g. Grade 6)" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input required placeholder="Section (e.g. A)" value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select value={classForm.curriculum} onChange={(e) => setClassForm({ ...classForm, curriculum: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option>CBSE</option><option>Cambridge</option>
            </select>
            <input placeholder="Room number" value={classForm.room_number} onChange={(e) => setClassForm({ ...classForm, room_number: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="col-span-2 bg-academic-blue text-white rounded-xl py-2 font-medium">Add class</button>
          </form>
        </Card>
        <Card>
          <SectionTitle>All classes</SectionTitle>
          {!classes ? <Loader rows={3} /> : classes.length === 0 ? <EmptyState label="No classes yet." /> : (
            <div className="divide-y divide-slate-100">
              {classes.map((c) => (
                <div key={c.id} className="py-2 text-sm flex justify-between">
                  <span>{c.name}-{c.section}</span>
                  <span className="text-ink-secondary">{c.curriculum} · {c.room_number || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <SectionTitle>Add subject</SectionTitle>
          <form onSubmit={addSubject} className="grid grid-cols-2 gap-3">
            <input required placeholder="Name" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input required placeholder="Subject code" value={subjectForm.subject_code} onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select value={subjectForm.type} onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })} className="col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              {["Theory", "Practical", "Lab", "Skill_Development"].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="col-span-2 bg-academic-blue text-white rounded-xl py-2 font-medium">Add subject</button>
          </form>
        </Card>
        <Card>
          <SectionTitle>All subjects</SectionTitle>
          {!subjects ? <Loader rows={3} /> : subjects.length === 0 ? <EmptyState label="No subjects yet." /> : (
            <div className="divide-y divide-slate-100">
              {subjects.map((s) => (
                <div key={s.id} className="py-2 text-sm flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-ink-secondary">{s.subject_code} · {s.type}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
