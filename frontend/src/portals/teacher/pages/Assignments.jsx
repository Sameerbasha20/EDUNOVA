import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, Toast } from "../components/Common";
import api from "../lib/api";

export default function Assignments() {
  const [items, setItems] = useState(null);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [grading, setGrading] = useState(null);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/teacher/assignments/").then(({ data }) => setItems(data)).catch(() => setItems([]));
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
        <Plus size={16} /> New assignment
      </button>

      {items.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-heading font-semibold">{a.title}</p>
                <Badge tone="blue">{a.class_name}</Badge>
              </div>
              <p className="text-xs text-ink-secondary mb-2">{a.subject_name} · {a.max_marks} marks</p>
              <p className="text-sm text-ink-primary/90 mb-3">{a.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-secondary">
                  {a.graded_count}/{a.submission_count} graded
                </span>
                <button
                  onClick={() => setGrading(a)}
                  className="text-sm font-medium text-academic-blue hover:underline"
                >
                  View submissions →
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="No assignments created yet." />
      )}

      {showForm && (
        <AssignmentForm
          classes={classes}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setToast("Assignment created.");
            load();
          }}
        />
      )}
      {grading && (
        <GradingDrawer
          assignment={grading}
          onClose={() => setGrading(null)}
          onGraded={() => {
            load();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function AssignmentForm({ classes, onClose, onSaved }) {
  const [form, setForm] = useState({
    class_id: classes[0]?.class_id || "",
    subject_id: classes[0]?.subject_id || "",
    title: "", description: "", file_url: "", max_marks: 100,
    due_date: new Date().toISOString().slice(0, 16),
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
      await api.post("/teacher/assignments/", { ...form, due_date: new Date(form.due_date).toISOString() });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't save assignment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md p-6 shadow-raised max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">New assignment</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-danger bg-red-50 rounded-xl px-3 py-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <select
            value={form.class_id}
            onChange={(e) => pickClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.class_id}>{c.class_name} — {c.subject_name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
          />
          <textarea
            required
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none resize-none"
          />
          <input
            placeholder="Attachment URL (optional)"
            value={form.file_url}
            onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-secondary">Max marks</label>
              <input
                type="number"
                value={form.max_marks}
                onChange={(e) => setForm((f) => ({ ...f, max_marks: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-ink-secondary">Due</label>
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
              />
            </div>
          </div>
          <button
            disabled={busy}
            className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Create assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GradingDrawer({ assignment, onClose, onGraded }) {
  const [subs, setSubs] = useState(null);

  function load() {
    api.get(`/teacher/assignments/${assignment.id}/submissions/`).then(({ data }) => setSubs(data));
  }
  useEffect(load, [assignment.id]);

  async function grade(sub, marks, feedback) {
    await api.patch(`/teacher/assignments/${assignment.id}/submissions/${sub.id}/`, {
      marks_obtained: marks, teacher_feedback: feedback,
    });
    load();
    onGraded();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 shadow-raised">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">{assignment.title} — submissions</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        {!subs ? (
          <Loader rows={3} />
        ) : subs.length ? (
          <div className="space-y-3">
            {subs.map((s) => (
              <SubmissionRow key={s.id} sub={s} maxMarks={assignment.max_marks} onGrade={grade} />
            ))}
          </div>
        ) : (
          <EmptyState label="No submissions yet." />
        )}
      </div>
    </div>
  );
}

function SubmissionRow({ sub, maxMarks, onGrade }) {
  const [marks, setMarks] = useState(sub.marks_obtained ?? "");
  const [feedback, setFeedback] = useState(sub.teacher_feedback ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{sub.student_name}</p>
          <p className="text-xs text-ink-secondary font-numeric">{sub.admission_number}</p>
        </div>
        <a href={sub.submission_url} target="_blank" rel="noreferrer" className="text-xs text-academic-blue hover:underline">
          View file
        </a>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          max={maxMarks}
          placeholder={`/ ${maxMarks}`}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus-ring outline-none"
        />
        <input
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus-ring outline-none"
        />
      </div>
      <button
        disabled={saving || marks === ""}
        onClick={async () => {
          setSaving(true);
          await onGrade(sub, marks, feedback);
          setSaving(false);
        }}
        className="text-xs font-medium bg-academic-blue text-white rounded-lg px-3 py-1.5 hover:bg-academic-blue/90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save grade"}
      </button>
    </div>
  );
}
