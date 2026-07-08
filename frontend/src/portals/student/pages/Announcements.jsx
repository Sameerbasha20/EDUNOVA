import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Announcements() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/student/announcements/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={4} />;
  if (!items.length) return <EmptyState label="No announcements right now." />;

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <Card key={a.id} className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-academic-blue/10 text-academic-blue flex items-center justify-center shrink-0">
            <Megaphone size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{a.title}</p>
              <span className="text-xs text-ink-secondary">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-ink-secondary mt-1">{a.message}</p>
            <p className="text-xs text-ink-secondary mt-1">— {a.sender_name}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
