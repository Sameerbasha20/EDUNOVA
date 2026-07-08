import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, Toast } from "../components/Common";
import api from "../lib/api";

export default function Assignments() {
  const [items, setItems] = useState(null);
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/student/assignments/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }

  useEffect(load, []);

  if (!items) return <Loader rows={4} />;
  if (!items.length) return <EmptyState label="No assignments posted for your class yet." />;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((a) => {
          const submitted = !!a.my_submission;
          const overdue = new Date(a.due_date) < new Date();
          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-heading font-semibold">{a.title}</p>
                  <p className="text-xs text-ink-secondary">{a.subject_name} · {a.max_marks} marks</p>
                </div>
                {submitted ? (
                  <Badge tone="green">Submitted</Badge>
                ) : overdue ? (
                  <Badge tone="red">Overdue</Badge>
                ) : (
                  <Badge tone="blue">Pending</Badge>
                )}
              </div>
              <p className="text-sm text-ink-primary/90 mb-3">{a.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-secondary">Due {new Date(a.due_date).toLocaleString()}</span>
                {submitted ? (
                  a.my_submission.marks_obtained != null ? (
                    <span className="text-sm font-numeric font-semibold text-academic-green">
                      {a.my_submission.marks_obtained}/{a.max_marks}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-secondary flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-academic-green" /> Awaiting evaluation
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => setActive(a)}
                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-academic-blue px-3 py-1.5 rounded-lg hover:bg-academic-blue/90"
                  >
                    <UploadCloud size={14} /> Submit
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {active && (
        <SubmitModal
          assignment={active}
          onClose={() => setActive(null)}
          onSubmitted={() => {
            setActive(null);
            setToast("Assignment submitted — your teacher has been notified.");
            load();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function SubmitModal({ assignment, onClose, onSubmitted }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/student/assignments/${assignment.id}/submit/`, { submission_url: url });
      onSubmitted();
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't submit. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card p-6 w-full max-w-md shadow-raised">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">Submit: {assignment.title}</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-danger bg-red-50 rounded-xl px-3 py-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-ink-secondary">
            Upload your file to the school's <code>assignmentsubmissions</code> storage bucket first,
            then paste the resulting URL here.
          </p>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…/assignmentsubmissions/your-file.pdf"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none"
          />
          <button
            disabled={busy}
            className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}
