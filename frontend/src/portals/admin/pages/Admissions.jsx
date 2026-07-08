import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, Toast } from "../components/Common";

const TONE = {
  Registered: "slate", Verification: "blue", Screening: "gold",
  Fee_Pending: "orange", Confirmed: "green", Rejected: "red",
};
const NEXT_LABEL = {
  Registered: "Move to Verification", Verification: "Move to Screening",
  Screening: "Move to Fee Pending", Fee_Pending: "Confirm & generate logins",
};

export default function Admissions() {
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState("");
  const [credentials, setCredentials] = useState(null);

  function load() {
    api.get("/admin-portal/admissions/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function advance(regNo) {
    setBusy(regNo);
    try {
      const { data } = await api.post(`/admin-portal/admissions/${regNo}/action/`, { action: "advance" });
      if (data.credentials) setCredentials(data.credentials);
      setToast(`Application moved to ${data.status}.`);
      load();
    } catch (e) {
      setToast(e?.response?.data?.detail || "Could not advance application.");
    } finally {
      setBusy(null);
    }
  }

  async function reject(regNo) {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    setBusy(regNo);
    try {
      await api.post(`/admin-portal/admissions/${regNo}/action/`, { action: "reject", reason });
      setToast("Application rejected.");
      load();
    } catch {
      setToast("Could not reject application.");
    } finally {
      setBusy(null);
    }
  }

  if (!items) return <Loader rows={5} />;

  return (
    <div className="space-y-4">
      {credentials && (
        <Card className="border-2 border-academic-green">
          <p className="font-semibold text-academic-green mb-2">Accounts created — share these securely with the family:</p>
          <p className="text-sm">Student: <b>{credentials.student_username}</b> / temp password <b>{credentials.student_temp_password}</b></p>
          {credentials.parent_temp_password ? (
            <p className="text-sm">Parent: <b>{credentials.parent_username}</b> / temp password <b>{credentials.parent_temp_password}</b></p>
          ) : (
            <p className="text-sm">Parent account <b>{credentials.parent_username}</b> already existed and was reused.</p>
          )}
          <button onClick={() => setCredentials(null)} className="mt-2 text-xs text-ink-secondary hover:underline">Dismiss</button>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState label="No admission applications yet." />
      ) : (
        items.map((a) => (
          <Card key={a.registration_number}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-primary">{a.applicant_name} <span className="text-xs text-ink-secondary">({a.registration_number})</span></p>
                <p className="text-xs text-ink-secondary">
                  {a.target_class} · Parent: {a.parent_name} ({a.parent_phone}) · Applied {new Date(a.submitted_at).toLocaleDateString()}
                </p>
                {a.rejection_reason && <p className="text-xs text-danger mt-1">Rejected: {a.rejection_reason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={TONE[a.status] || "slate"}>{a.status}</Badge>
                {NEXT_LABEL[a.status] && (
                  <button
                    disabled={busy === a.registration_number}
                    onClick={() => advance(a.registration_number)}
                    className="bg-academic-blue text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    {NEXT_LABEL[a.status]}
                  </button>
                )}
                {!["Confirmed", "Rejected"].includes(a.status) && (
                  <button
                    disabled={busy === a.registration_number}
                    onClick={() => reject(a.registration_number)}
                    className="bg-red-50 text-danger text-sm px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
