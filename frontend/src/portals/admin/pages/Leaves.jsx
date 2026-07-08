import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";

export default function Leaves() {
  const [items, setItems] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/admin-portal/leaves/?status=${statusFilter}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }
  useEffect(() => { load(); }, [statusFilter]);

  async function decide(id, decision) {
    try {
      await api.post(`/admin-portal/leaves/${id}/decide/`, { decision });
      setToast(`Leave ${decision.toLowerCase()}.`);
      load();
    } catch { setToast("Could not update leave."); }
  }

  return (
    <Card>
      <SectionTitle
        action={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
            {["Pending", "Approved", "Rejected", ""].map((s) => <option key={s} value={s}>{s || "All"}</option>)}
          </select>
        }
      >
        Leave requests
      </SectionTitle>
      {!items ? <Loader rows={4} /> : items.length === 0 ? <EmptyState label="No leave requests in this status." /> : (
        <div className="divide-y divide-slate-100">
          {items.map((l) => (
            <div key={l.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink-primary">{l.applicant_name} — {l.leave_type}</p>
                <p className="text-xs text-ink-secondary">{l.start_date} → {l.end_date}: {l.reason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={l.status === "Approved" ? "green" : l.status === "Rejected" ? "red" : "orange"}>{l.status}</Badge>
                {l.status === "Pending" && (
                  <>
                    <button onClick={() => decide(l.id, "Approved")} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">Approve</button>
                    <button onClick={() => decide(l.id, "Rejected")} className="text-xs bg-red-50 text-danger px-2 py-1 rounded-lg">Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </Card>
  );
}
