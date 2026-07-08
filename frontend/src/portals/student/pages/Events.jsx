import { MapPin, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Events() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/student/events/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={3} />;
  if (!items.length) return <EmptyState label="No upcoming events." />;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((e) => (
        <Card key={e.id}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-academic-orange/10 text-academic-orange flex items-center justify-center">
              <PartyPopper size={18} />
            </div>
            <span className="font-numeric text-xs font-semibold text-academic-blue bg-academic-blue/10 px-2 py-1 rounded-lg">
              {e.event_date}
            </span>
          </div>
          <p className="font-heading font-semibold">{e.title}</p>
          <p className="text-sm text-ink-secondary mt-1 mb-2">{e.description}</p>
          <p className="text-xs text-ink-secondary flex items-center gap-1">
            <MapPin size={12} /> {e.venue}
          </p>
        </Card>
      ))}
    </div>
  );
}
