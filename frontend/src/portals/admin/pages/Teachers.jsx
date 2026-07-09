import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";

export default function Teachers() {
  const [teachers, setTeachers] = useState(null);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    api.get("/admin-portal/classes/").then(({ data }) => setClasses(data)).catch(() => setClasses([]));
    api.get("/admin-portal/departments/").then(({ data }) => setDepartments(data)).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    setTeachers(null);
    const params = new URLSearchParams();
    if (classFilter) params.set("class_id", classFilter);
    if (deptFilter) params.set("department", deptFilter);
    const qs = params.toString();
    api.get(`/admin-portal/teachers/${qs ? `?${qs}` : ""}`).then(({ data }) => setTeachers(data)).catch(() => setTeachers([]));
  }, [classFilter, deptFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          action={
            <div className="flex items-center gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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
            </div>
          }
        >
          All teachers
        </SectionTitle>
        {!teachers ? (
          <Loader rows={5} />
        ) : teachers.length === 0 ? (
          <EmptyState label="No teachers found." />
        ) : (
          <div className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <Link
                key={t.id}
                to={`/admin/teachers/${t.id}`}
                className="py-3 flex items-center justify-between gap-3 -mx-5 px-5 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink-primary truncate">{t.name}</p>
                  <p className="text-xs text-ink-secondary truncate">{t.email} · {t.employee_code}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.department && <Badge tone="gold">{t.department}</Badge>}
                  <Badge tone={t.is_active ? "green" : "red"}>{t.is_active ? "Active" : "Disabled"}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
