import { FileText, PlayCircle, Plus, Radio, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader, Toast } from "../components/Common";
import api from "../lib/api";

const ICONS = { Video_Link: PlayCircle, Recorded_Video_File: Video, PDF_Notes: FileText, Live_Class_URL: Radio };

export default function Documents() {
  const [items, setItems] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/teacher/documents/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }
  useEffect(() => {
    load();
    api.get("/teacher/classes/").then(({ data }) => setClasses(data));
  }, []);

  if (!items) return <Loader rows={4} />;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-academic-blue text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-academic-blue/90"
      >
        <Plus size={16} /> Upload document
      </button>

      {items.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((d) => {
            const Icon = ICONS[d.content_type] || FileText;
            return (
              <Card key={d.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-academic-blue/10 text-academic-blue flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <a href={d.resource_url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate">
                  {d.title}
                </a>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState label="No documents uploaded yet." />
      )}

      {showForm && (
        <DocForm
          classes={classes}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setToast("Document published to the class LMS.");
            load();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function DocForm({ classes, onClose, onSaved }) {
  const [form, setForm] = useState({
    class_id: classes[0]?.class_id || "",
    subject_id: classes[0]?.subject_id || "",
    content_type: "PDF_Notes", title: "", resource_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pickClass(classId) {
    const match = classes.find((c) => String(c.class_id) === classId);
    setForm((f) => ({ ...f, class_id: classId, subject_id: match?.subject_id }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/teacher/documents/", form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't upload document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md p-6 shadow-raised">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">Upload document</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-danger bg-red-50 rounded-xl px-3 py-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <select value={form.class_id} onChange={(e) => pickClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none">
            {classes.map((c) => <option key={c.id} value={c.class_id}>{c.class_name} — {c.subject_name}</option>)}
          </select>
          <select value={form.content_type} onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none">
            <option value="PDF_Notes">PDF notes</option>
            <option value="Video_Link">Video link</option>
            <option value="Recorded_Video_File">Recorded video file</option>
            <option value="Live_Class_URL">Live class URL</option>
          </select>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none" />
          <input required placeholder="Resource URL (upload to lms-resources bucket first)" value={form.resource_url}
            onChange={(e) => setForm((f) => ({ ...f, resource_url: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none" />
          <button disabled={busy} className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60">
            {busy ? "Saving…" : "Publish to class"}
          </button>
        </form>
      </div>
    </div>
  );
}
