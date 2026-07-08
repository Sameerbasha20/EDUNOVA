import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader } from "../components/Common";

export default function Notifications() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/parent/notifications/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={4} />;

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState label="No notifications yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((n) => (
            <div key={n.id} className="py-4">
              <p className="font-semibold text-ink-primary">{n.title}</p>
              <p className="text-sm text-ink-primary mt-1">{n.message}</p>
              <p className="text-xs text-ink-secondary mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
