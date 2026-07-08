import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Fees() {
  const { activeChildId } = useAuth();
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(null);
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/parent/fees/?child_id=${activeChildId}`).then(({ data }) => setData(data)).catch(() => setData({ pending: [], payment_history: [] }));
  }

  useEffect(() => {
    if (!activeChildId) return;
    setData(null);
    load();
  }, [activeChildId]);

  async function pay(feeId) {
    setPaying(feeId);
    try {
      await api.post("/parent/fees/pay/", { child_id: activeChildId, fee_structure_id: feeId, payment_method: "Online" });
      setToast("Payment successful.");
      load();
    } catch {
      setToast("Payment failed. Please try again.");
    } finally {
      setPaying(null);
    }
  }

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view fees." />;
  if (!data) return <Loader rows={4} />;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Pending fees</SectionTitle>
        {data.pending.length === 0 ? (
          <EmptyState label="No pending fees for this term. 🎉" />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.pending.map((f) => (
              <div key={f.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-primary">{f.term_name}</p>
                  <p className="text-xs text-ink-secondary">
                    Tuition ₹{f.tuition_fee} · Transport ₹{f.transport_fee} · Hostel ₹{f.hostel_fee}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-numeric font-bold text-ink-primary mb-1">₹{f.total_amount}</p>
                  <button
                    disabled={paying === f.id}
                    onClick={() => pay(f.id)}
                    className="bg-academic-green text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    {paying === f.id ? "Processing…" : "Pay now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Payment history</SectionTitle>
        {data.payment_history.length === 0 ? (
          <EmptyState label="No payments recorded yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.payment_history.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-primary">{p.fee_structure_detail?.term_name}</p>
                  <p className="text-xs text-ink-secondary">{p.transaction_id} · {new Date(p.paid_at).toLocaleDateString()}</p>
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
