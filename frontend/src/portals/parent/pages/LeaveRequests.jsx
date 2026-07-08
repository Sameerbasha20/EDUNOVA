import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import { useAuth } from "../context/AuthContext";

const TONE = { Pending: "orange", Approved: "green", Rejected: "red" };

export default function LeaveRequests() {
  const { activeChildId } = useAuth();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ leave_type: "Casual", start_date: "", end_date: "", reason: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/parent/leaves/?child_id=${activeChildId}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }

  useEffect(() => {
    if (!activeChildId) return;
    setItems(null);
    load();
  }, [activeChildId]);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/parent/leaves/", { ...form, child_id: activeChildId });
      setToast("Leave request submitted.");
      setForm({ leave_type: "Casual", start_date: "", end_date: "", reason: "" });
      load();
    } catch {
      setToast("Could not submit leave request.");
    }
  }

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to request leave." />;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>New leave request</SectionTitle>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <select
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {["Casual", "Sick", "Earned", "Academic"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <div />
          <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <textarea required placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} />
          <button className="sm:col-span-2 bg-academic-green text-white rounded-xl py-2.5 font-medium">Submit request</button>
        </form>
      </Card>

      <Card>
        <SectionTitle>History</SectionTitle>
        {!items ? <Loader rows={3} /> : items.length === 0 ? (
          <EmptyState label="No leave requests yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((l) => (
              <div key={l.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-primary">{l.leave_type} leave</p>
                  <p className="text-xs text-ink-secondary">{l.start_date} → {l.end_date}</p>
                </div>
                <Badge tone={TONE[l.status] || "slate"}>{l.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
