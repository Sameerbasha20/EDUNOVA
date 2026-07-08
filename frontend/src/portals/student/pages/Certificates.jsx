import { Download, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Certificates() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/student/certificates/").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);

  if (!items) return <Loader rows={3} />;
  if (!items.length) return <EmptyState label="No certificates issued yet." />;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((c) => (
        <Card key={c.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academic-gold/20 text-amber-600 flex items-center justify-center">
              <ScrollText size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">{c.certificate_type}</p>
              <p className="text-xs text-ink-secondary">Issued {c.issued_date}</p>
            </div>
          </div>
          <a
            href={c.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-academic-blue"
            title="Download"
          >
            <Download size={18} />
          </a>
        </Card>
      ))}
    </div>
  );
}
