import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Feedback() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ category: "General", feedback_text: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/parent/feedback/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/parent/feedback/", form);
      setToast("Feedback submitted. Thank you!");
      setForm({ category: "General", feedback_text: "" });
      load();
    } catch {
      setToast("Could not submit feedback.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Share feedback with the school</SectionTitle>
        <form onSubmit={submit} className="space-y-4">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {["General", "Academics", "Transport", "Facilities", "Staff", "Fees"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea required value={form.feedback_text} onChange={(e) => setForm({ ...form, feedback_text: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={4} placeholder="What would you like the school to know?" />
          <button className="bg-academic-green text-white rounded-xl py-2.5 px-6 font-medium">Submit feedback</button>
        </form>
      </Card>
      <Card>
        <SectionTitle>Your feedback history</SectionTitle>
        {!items ? <Loader rows={3} /> : items.length === 0 ? (
          <EmptyState label="You haven't submitted any feedback yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((f) => (
              <div key={f.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-ink-primary">{f.category}</span>
                  <Badge tone="slate">{f.status}</Badge>
                </div>
                <p className="text-sm text-ink-primary">{f.feedback_text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
