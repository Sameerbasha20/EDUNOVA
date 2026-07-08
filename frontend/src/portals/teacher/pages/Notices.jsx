import { Megaphone, Pin } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Notices() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/teacher/notices/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={4} />;
  if (!items.length) return <EmptyState label="No notices posted." />;

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <Card key={n.id} className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-academic-orange/10 text-academic-orange flex items-center justify-center shrink-0">
            <Megaphone size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {n.is_pinned && <Pin size={12} className="text-academic-gold" />}
              <p className="font-medium">{n.title}</p>
              <span className="text-xs text-ink-secondary">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-ink-secondary mt-1">{n.content}</p>
            {n.file_attachment_url && (
              <a href={n.file_attachment_url} target="_blank" rel="noreferrer" className="text-xs text-academic-blue hover:underline">
                View attachment
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
