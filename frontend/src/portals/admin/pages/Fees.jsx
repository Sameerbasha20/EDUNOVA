import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Fees() {
  const [structures, setStructures] = useState(null);
  const [payments, setPayments] = useState(null);
  const [form, setForm] = useState({ class_id: "", term_name: "", tuition_fee: 0, transport_fee: 0, hostel_fee: 0, total_amount: 0 });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/admin-portal/fee-structures/").then(({ data }) => setStructures(data)).catch(() => setStructures([]));
    api.get("/admin-portal/payments/").then(({ data }) => setPayments(data)).catch(() => setPayments([]));
  }
  useEffect(() => { load(); }, []);

  async function addStructure(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/fee-structures/", form);
      setForm({ class_id: "", term_name: "", tuition_fee: 0, transport_fee: 0, hostel_fee: 0, total_amount: 0 });
      load();
    } catch { setToast("Could not create fee structure."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Create fee structure</SectionTitle>
        <form onSubmit={addStructure} className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input required placeholder="Class ID" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Term name" value={form.term_name} onChange={(e) => setForm({ ...form, term_name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Tuition ₹" value={form.tuition_fee} onChange={(e) => setForm({ ...form, tuition_fee: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Transport ₹" value={form.transport_fee} onChange={(e) => setForm({ ...form, transport_fee: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Hostel ₹" value={form.hostel_fee} onChange={(e) => setForm({ ...form, hostel_fee: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" placeholder="Total ₹" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button className="sm:col-span-3 lg:col-span-6 bg-academic-blue text-white rounded-xl py-2 font-medium">Create</button>
        </form>
        <p className="text-xs text-ink-secondary mt-2">Tip: use the Classes page to find a class's numeric ID.</p>
      </Card>

      <Card>
        <SectionTitle>Fee structures</SectionTitle>
        {!structures ? <Loader rows={3} /> : structures.length === 0 ? <EmptyState label="No fee structures yet." /> : (
          <div className="divide-y divide-slate-100">
            {structures.map((f) => (
              <div key={f.id} className="py-2 text-sm flex justify-between">
                <span>{f.term_name} (Class #{f.class_id})</span>
                <span className="font-numeric font-semibold">₹{f.total_amount}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Recent payments</SectionTitle>
        {!payments ? <Loader rows={3} /> : payments.length === 0 ? <EmptyState label="No payments recorded yet." /> : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{p.student_name}</p>
                  <p className="text-xs text-ink-secondary">{p.term_name} · {p.transaction_id}</p>
                </div>
                <div className="text-right">
                  <p className="font-numeric font-semibold">₹{p.amount_paid}</p>
                  <Badge tone="green">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
