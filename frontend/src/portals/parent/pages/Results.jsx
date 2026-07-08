import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Results() {
  const { activeChildId } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setItems(null);
    api.get(`/parent/results/?child_id=${activeChildId}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view results." />;
  if (!items) return <Loader rows={4} />;

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState label="No results published yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((r) => (
            <div key={r.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink-primary">{r.exam?.exam_name}</p>
                <p className="text-xs text-ink-secondary">{r.exam?.subject_name}</p>
              </div>
              <div className="text-right">
                <p className="font-numeric font-bold text-ink-primary">
                  {r.marks_obtained}/{r.exam?.max_marks} ({r.percentage}%)
                </p>
                <Badge tone={r.grade_letter === "F" ? "red" : "green"}>Grade {r.grade_letter}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
