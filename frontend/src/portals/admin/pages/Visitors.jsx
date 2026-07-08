import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, Toast, Badge } from "../components/Common";

export default function Visitors() {
  const [visitors, setVisitors] = useState(null);
  const [form, setForm] = useState({ visitor_name: "", purpose: "", host_user_id: "", id_proof_type: "Aadhaar" });
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [toast, setToast] = useState("");

  function load() {
    api.get(`/admin-portal/visitors/${showOpenOnly ? "?open=true" : ""}`).then(({ data }) => setVisitors(data)).catch(() => setVisitors([]));
  }
  useEffect(() => { load(); }, [showOpenOnly]);

  async function checkIn(e) {
    e.preventDefault();
    try {
      await api.post("/admin-portal/visitors/", form);
      setForm({ visitor_name: "", purpose: "", host_user_id: "", id_proof_type: "Aadhaar" });
      setToast("Visitor checked in.");
      load();
    } catch { setToast("Could not check in visitor."); }
  }

  async function checkOut(id) {
    try {
      await api.post(`/admin-portal/visitors/${id}/checkout/`, {});
      setToast("Visitor checked out.");
      load();
    } catch { setToast("Could not check out visitor."); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Check in a visitor</SectionTitle>
        <form onSubmit={checkIn} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input required placeholder="Visitor name" value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required placeholder="Purpose of visit" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Host (staff user ID, optional)" value={form.host_user_id} onChange={(e) => setForm({ ...form, host_user_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.id_proof_type} onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option>Aadhaar</option><option>Driving License</option><option>Passport</option><option>Voter ID</option><option>Other</option>
          </select>
          <button className="sm:col-span-2 lg:col-span-4 bg-academic-blue text-white rounded-xl py-2 font-medium">Check in</button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Visitor log</SectionTitle>
          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={showOpenOnly} onChange={(e) => setShowOpenOnly(e.target.checked)} />
            On-campus only
          </label>
        </div>
        {visitors === null ? <Loader /> : visitors.length === 0 ? <EmptyState label="No visitors logged yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Visitor</th><th className="py-2 pr-4">Purpose</th><th className="py-2 pr-4">Host</th><th className="py-2 pr-4">Check-in</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4"></th>
              </tr></thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4">{v.visitor_name}</td>
                    <td className="py-2 pr-4">{v.purpose}</td>
                    <td className="py-2 pr-4">{v.host_name || "—"}</td>
                    <td className="py-2 pr-4">{new Date(v.check_in_time).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      {v.check_out_time ? <Badge tone="slate">Checked out</Badge> : <Badge tone="green">On campus</Badge>}
                    </td>
                    <td className="py-2 pr-4">
                      {!v.check_out_time && (
                        <button onClick={() => checkOut(v.id)} className="text-danger text-xs font-medium hover:underline">Check out</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
