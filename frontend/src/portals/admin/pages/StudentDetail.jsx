import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { Badge, Card, Loader, SectionTitle } from "../components/Common";

const FIELDS = [
  ["Admission number", "admission_number"],
  ["Class", "class_name"],
  ["Roll number", "roll_number"],
  ["Academic year", "academic_year"],
  ["Phone", "phone_number"],
  ["Date of birth", "date_of_birth"],
  ["Gender", "gender"],
  ["Blood group", "blood_group"],
];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setStudent(null);
    setError(false);
    api.get(`/admin-portal/students/${id}/`).then(({ data }) => setStudent(data)).catch(() => setError(true));
  }, [id]);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/admin/students")} className="flex items-center gap-1 text-sm text-ink-secondary hover:underline">
        <ArrowLeft size={16} /> Back to all students
      </button>
      {error ? (
        <Card><p className="text-sm text-ink-secondary">Student not found.</p></Card>
      ) : !student ? (
        <Loader rows={4} />
      ) : (
        <Card>
          <SectionTitle
            action={
              <div className="flex items-center gap-2">
                <Badge tone={student.status === "Active" ? "green" : "red"}>{student.status}</Badge>
                <Badge tone={student.is_active ? "green" : "red"}>{student.is_active ? "Login enabled" : "Login disabled"}</Badge>
              </div>
            }
          >
            {student.name}
          </SectionTitle>
          <dl className="grid sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-ink-secondary uppercase tracking-wide">Email</dt>
              <dd className="text-sm font-medium mt-0.5">{student.email}</dd>
            </div>
            {FIELDS.map(([label, key]) => (
              <div key={key}>
                <dt className="text-xs text-ink-secondary uppercase tracking-wide">{label}</dt>
                <dd className="text-sm font-medium mt-0.5">{student[key] ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
