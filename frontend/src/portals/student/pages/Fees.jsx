import { CreditCard, ReceiptText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import api from "../lib/api";

const METHOD_LABEL = { NetBanking: "Net Banking", Card: "Card", UPI: "UPI" };

export default function Fees() {
  const [data, setData] = useState(null);
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/student/fees/").then(({ data }) => setData(data)).catch(() => setData({ pending: [], payment_history: [] }));
  }
  useEffect(load, []);

  if (!data) return <Loader rows={4} />;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Pending fees</SectionTitle>
        {data.pending.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.pending.map((fs) => (
              <div key={fs.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium mb-1">{fs.term_name}</p>
                <p className="font-numeric text-2xl font-bold text-academic-blue mb-3">
                  ₹{Number(fs.total_amount).toLocaleString("en-IN")}
                </p>
                <div className="text-xs text-ink-secondary space-y-0.5 mb-3">
                  <p>Tuition: ₹{Number(fs.tuition_fee).toLocaleString("en-IN")}</p>
                  {Number(fs.transport_fee) > 0 && <p>Transport: ₹{Number(fs.transport_fee).toLocaleString("en-IN")}</p>}
                  {Number(fs.hostel_fee) > 0 && <p>Hostel: ₹{Number(fs.hostel_fee).toLocaleString("en-IN")}</p>}
                </div>
                <button
                  onClick={() => setActive(fs)}
                  className="w-full flex items-center justify-center gap-2 bg-academic-orange text-white rounded-xl py-2 text-sm font-medium hover:bg-academic-orange/90"
                >
                  <CreditCard size={14} /> Pay now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="You're all caught up — no pending fees 🎉" />
        )}
      </Card>

      <Card>
        <SectionTitle>Payment history</SectionTitle>
        {data.payment_history.length ? (
          <div className="divide-y divide-slate-100">
            {data.payment_history.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ReceiptText size={14} className="text-ink-secondary" />
                  <div>
                    <p className="font-medium">{p.fee_structure_detail?.term_name}</p>
                    <p className="text-xs text-ink-secondary font-numeric">{p.transaction_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-numeric font-semibold">₹{Number(p.amount_paid).toLocaleString("en-IN")}</p>
                  <Badge tone={p.status === "Success" ? "green" : p.status === "Pending" ? "gold" : "red"}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="No payment history yet." />
        )}
      </Card>

      {active && (
        <CheckoutModal
          fee={active}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            setToast("Payment initiated — check status under payment history.");
            load();
          }}
        />
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

function CheckoutModal({ fee, onClose, onDone }) {
  const [method, setMethod] = useState("UPI");
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      await api.post("/student/fees/pay/", { fee_structure_id: fee.id, payment_method: method });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-sm p-6 shadow-raised">
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-semibold">Pay {fee.term_name}</p>
          <button onClick={onClose} className="text-ink-secondary"><X size={18} /></button>
        </div>
        <p className="font-numeric text-3xl font-bold text-academic-blue mb-4">
          ₹{Number(fee.total_amount).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-ink-secondary mb-2">Choose a payment method</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(METHOD_LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                method === key ? "border-academic-blue bg-academic-blue/5 text-academic-blue" : "border-slate-200 text-ink-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={pay}
          disabled={busy}
          className="w-full bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60"
        >
          {busy ? "Redirecting to gateway…" : "Proceed to pay"}
        </button>
        <p className="text-[11px] text-ink-secondary text-center mt-2">
          Demo checkout — wire your real payment gateway's redirect/webhook here.
        </p>
      </div>
    </div>
  );
}
