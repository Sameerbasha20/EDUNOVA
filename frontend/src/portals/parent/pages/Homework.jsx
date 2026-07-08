import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Homework() {
  const { activeChildId } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setItems(null);
    api.get(`/parent/homework/?child_id=${activeChildId}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view homework." />;
  if (!items) return <Loader rows={4} />;

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState label="No homework assigned yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((h) => (
            <div key={h.id} className="py-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-ink-primary">{h.title}</p>
                <Badge tone={h.is_overdue ? "red" : "green"}>{h.is_overdue ? "Overdue" : "On track"}</Badge>
              </div>
              <p className="text-xs text-ink-secondary mb-2">
                {h.subject_name} · Due {h.due_date}
              </p>
              <p className="text-sm text-ink-primary">{h.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
