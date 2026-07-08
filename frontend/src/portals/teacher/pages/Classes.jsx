import { ClipboardCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Classes() {
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    api.get("/teacher/classes/").then(({ data }) => setClasses(data)).catch(() => setClasses([]));
  }, []);

  if (!classes) return <Loader rows={4} />;
  if (!classes.length) return <EmptyState label="No classes allocated to you yet." />;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {classes.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-heading font-semibold">{c.class_name}</p>
              <p className="text-sm text-ink-secondary">{c.subject_name}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-secondary bg-surface-light rounded-full px-2.5 py-1">
              <Users size={12} /> {c.student_count}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/teacher/attendance?class_id=${c.class_id}`}
              className="flex-1 text-center text-sm font-medium text-white bg-academic-blue rounded-xl py-2 hover:bg-academic-blue/90"
            >
              Mark attendance
            </Link>
            <Link
              to={`/teacher/performance?class_id=${c.class_id}&subject_id=${c.subject_id}`}
              className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-academic-blue border border-academic-blue/30 rounded-xl py-2 hover:bg-academic-blue/5"
            >
              <ClipboardCheck size={14} /> Performance
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
