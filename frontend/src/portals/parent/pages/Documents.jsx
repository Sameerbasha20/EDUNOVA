import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Documents() {
  const { activeChildId } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setItems(null);
    api.get(`/parent/documents/?child_id=${activeChildId}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view documents." />;
  if (!items) return <Loader rows={3} />;

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState label="No certificates or documents issued yet." />
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((d) => (
            <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="py-3 flex items-center gap-3 hover:bg-gray-50 -mx-5 px-5">
              <FileText size={18} className="text-academic-green" />
              <div>
                <p className="font-medium text-ink-primary">{d.certificate_type}</p>
                <p className="text-xs text-ink-secondary">Issued {d.issued_date}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
