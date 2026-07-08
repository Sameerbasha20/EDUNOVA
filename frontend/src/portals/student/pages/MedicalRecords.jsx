import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function MedicalRecords() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    api.get("/student/medical-records/").then(({ data }) => setLogs(data)).catch(() => setLogs([]));
  }, []);

  if (logs === null) return <Loader rows={3} />;
  if (!logs.length) return <EmptyState label="No medical visits on record." />;

  return (
    <div className="space-y-3">
      {logs.map((l) => (
        <Card key={l.id} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-danger flex items-center justify-center shrink-0">
            <Stethoscope size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">{l.symptoms}</p>
            <p className="text-xs text-ink-secondary mt-0.5">Treatment: {l.treatment_given}</p>
            {l.doctor_notes && <p className="text-xs text-ink-secondary mt-0.5">Notes: {l.doctor_notes}</p>}
            <p className="text-xs text-ink-secondary mt-1">{l.visit_date}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
