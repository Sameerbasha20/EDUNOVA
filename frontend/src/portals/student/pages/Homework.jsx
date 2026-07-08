import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Homework() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/student/homework/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={4} />;

  const filtered = items.filter((h) =>
    filter === "all" ? true : filter === "overdue" ? h.is_overdue : !h.is_overdue
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          ["all", "All"],
          ["upcoming", "Upcoming"],
          ["overdue", "Overdue"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key ? "bg-academic-blue text-white" : "bg-white text-ink-secondary shadow-card"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-semibold">{h.title}</p>
                  <p className="text-xs text-ink-secondary mb-2">{h.subject_name} · {h.teacher_name}</p>
                </div>
                <Badge tone={h.is_overdue ? "red" : "green"}>{h.is_overdue ? "Overdue" : "On track"}</Badge>
              </div>
              <p className="text-sm text-ink-primary/90 mb-3">{h.description}</p>
              <div className="flex justify-between text-xs text-ink-secondary">
                <span>Assigned {h.assigned_date}</span>
                <span>Due {h.due_date}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState label="Nothing here for this filter." />
      )}
    </div>
  );
}
