import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";

const FIELDS = [
  ["Employee ID", "employee_code"],
  ["Department", "department"],
  ["Qualification", "qualification"],
  ["Specialization", "specialization"],
  ["Phone", "phone_number"],
  ["Date of joining", "date_of_joining"],
];

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setTeacher(null);
    setError(false);
    api.get(`/admin-portal/teachers/${id}/`).then(({ data }) => setTeacher(data)).catch(() => setError(true));
  }, [id]);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin/teachers")} className="flex items-center gap-1 text-sm text-ink-secondary hover:underline">
        <ArrowLeft size={16} /> Back to all teachers
      </button>
      {error ? (
        <Card><p className="text-sm text-ink-secondary">Teacher not found.</p></Card>
      ) : !teacher ? (
        <Loader rows={4} />
      ) : (
        <>
          <Card>
            <SectionTitle action={<Badge tone={teacher.is_active ? "green" : "red"}>{teacher.is_active ? "Active" : "Disabled"}</Badge>}>
              {teacher.name}
            </SectionTitle>
            <dl className="grid sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-ink-secondary uppercase tracking-wide">Email</dt>
                <dd className="text-sm font-medium mt-0.5">{teacher.email}</dd>
              </div>
              {FIELDS.map(([label, key]) => (
                <div key={key}>
                  <dt className="text-xs text-ink-secondary uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm font-medium mt-0.5">{teacher[key] || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <SectionTitle>Class & subject allocations</SectionTitle>
            {teacher.classes?.length ? (
              <div className="divide-y divide-slate-100">
                {teacher.classes.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-primary">{c.class_name} · {c.subject_name}</p>
                    <span className="text-xs text-ink-secondary">{c.student_count} students</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Not allocated to any class yet." />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
