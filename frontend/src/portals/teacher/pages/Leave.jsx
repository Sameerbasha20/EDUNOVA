import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, Toast } from "../components/Common";
import api from "../lib/api";

const STATUS_TONE = { Pending: "gold", Approved: "green", Rejected: "red" };

export default function Leave() {
  const [items, setItems] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/teacher/leaves/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }
  useEffect(load, []);

  if (!items) return <Loader rows={3} />;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-academic-blue text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-academic-blue/90"
      >
        <Plus size={16} /> Apply for leave
      </button>

      {items.length ? (
        <div className="space-y-3">
          {items.map((l) => (
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{l.leave_type} leave</p>
                <p className="text-xs text-ink-secondary">{l.start_date} → {l.end_date}</p>
                <p className="text-sm text-ink-secondary mt-1">{l.reason}</p>
              </div>
              <Badge tone={STATUS_TONE[l.status]}>
                {l.status === "Pending" ? "Admin approval pending" : l.status}
              </Badge>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="No leave requests yet." />
      )}

      {showForm && (
        <LeaveForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setToast("Leave request submitted — pending admin approval.");
            load();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function LeaveForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    leave_type: "Casual",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    reason: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/teacher/leaves/", form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't submit leave request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md p-6 shadow-raised">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">Apply for leave</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        {error && <div className="mb-3 text-sm text-danger bg-red-50 rounded-xl px-3 py-2">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <select value={form.leave_type} onChange={(e) => setForm((f) => ({ ...f, leave_type: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none">
            <option>Casual</option>
            <option>Sick</option>
            <option>Earned</option>
            <option>Academic</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none" />
            <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none" />
          </div>
          <textarea required rows={3} placeholder="Reason" value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-ring outline-none resize-none" />
          <button disabled={busy} className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60">
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </div>
  );
}
