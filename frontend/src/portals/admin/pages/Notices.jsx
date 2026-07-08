import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Notices() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ recipient_type: "All", target_class_id: "", title: "", message: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/admin-portal/notices/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }
  useEffect(() => { load(); }, []);

  async function send(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/notices/", form);
      setToast("Notice broadcast.");
      setForm({ recipient_type: "All", target_class_id: "", title: "", message: "" });
      load();
    } catch { setToast("Could not send notice."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Broadcast a notice</SectionTitle>
        <form onSubmit={send} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={form.recipient_type} onChange={(e) => setForm({ ...form, recipient_type: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              {["All", "Student", "Teacher", "Parent", "Employee"].map((r) => <option key={r}>{r}</option>)}
            </select>
            <input placeholder="Target class ID (optional)" value={form.target_class_id} onChange={(e) => setForm({ ...form, target_class_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <textarea required placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} />
          <button className="bg-academic-blue text-white rounded-xl py-2 px-6 font-medium">Broadcast</button>
        </form>
      </Card>
      <Card>
        <SectionTitle>Sent notices</SectionTitle>
        {!items ? <Loader rows={3} /> : items.length === 0 ? <EmptyState label="No notices sent yet." /> : (
          <div className="divide-y divide-slate-100">
            {items.map((n) => (
              <div key={n.id} className="py-3">
                <p className="font-medium text-ink-primary">{n.title}</p>
                <p className="text-xs text-ink-secondary">{n.recipient_type} · {new Date(n.created_at).toLocaleString()}</p>
                <p className="text-sm text-ink-primary mt-1">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
