import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader } from "../components/Common";

export default function AuditLog() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/admin-portal/audit-log/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={5} />;

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState label="No audit entries yet — every admin action (approvals, user changes, payments, library issue/return) is logged here." />
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((a) => (
            <div key={a.id} className="py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink-primary">{a.action}</span>
                <span className="text-xs text-ink-secondary">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <p className="text-xs text-ink-secondary">
                by {a.actor_name} · {a.target_type} #{a.target_id}
              </p>
              {a.details && Object.keys(a.details).length > 0 && (
                <pre className="text-xs bg-gray-50 rounded-lg p-2 mt-1 overflow-x-auto">{JSON.stringify(a.details)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
