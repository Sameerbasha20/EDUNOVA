import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";

export default function Students() {
  const [students, setStudents] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    api.get("/admin-portal/classes/").then(({ data }) => setClasses(data)).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    setStudents(null);
    api
      .get(`/admin-portal/students/${classFilter ? `?class_id=${classFilter}` : ""}`)
      .then(({ data }) => setStudents(data))
      .catch(() => setStudents([]));
  }, [classFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          action={
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
              ))}
            </select>
          }
        >
          All students
        </SectionTitle>
        {!students ? (
          <Loader rows={5} />
        ) : students.length === 0 ? (
          <EmptyState label="No students found." />
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((s) => (
              <Link
                key={s.id}
                to={`/admin/students/${s.id}`}
                className="py-3 flex items-center justify-between gap-3 -mx-5 px-5 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink-primary truncate">{s.name}</p>
                  <p className="text-xs text-ink-secondary truncate">{s.email} · {s.admission_number}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="blue">{s.class_name || "Not assigned"}</Badge>
                  <Badge tone={s.is_active ? "green" : "red"}>{s.is_active ? "Active" : "Disabled"}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
