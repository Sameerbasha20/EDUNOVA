import { useEffect, useState } from "react";
import { Card, Loader } from "../components/Common";
import IdCard from "../components/IdCard";
import api from "../lib/api";

const FIELDS = [
  ["Full name", "name"],
  ["Email", "email"],
  ["Phone", "phone_number"],
  ["Admission number", "admission_number"],
  ["Class", "class_name"],
  ["Date of birth", "date_of_birth"],
  ["Gender", "gender"],
  ["Blood group", "blood_group"],
  ["Status", "status"],
];

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/student/profile/").then(({ data }) => setProfile(data));
  }, []);

  if (!profile) return <Loader rows={4} />;

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <IdCard profile={profile} />
      </div>
      <Card className="lg:col-span-2">
        <p className="font-heading font-semibold mb-4">Personal details</p>
        <dl className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(([label, key]) => (
            <div key={key}>
              <dt className="text-xs text-ink-secondary uppercase tracking-wide">{label}</dt>
              <dd className="text-sm font-medium mt-0.5">{profile[key] ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
