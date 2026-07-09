import { useEffect, useState } from "react";
import api from "../lib/api";
import AvatarUploader from "../../../components/AvatarUploader";
import { Card, Loader, SectionTitle } from "../components/Common";

const FIELDS = [
  ["Full name", "name"],
  ["Email", "email"],
  ["Phone", "phone_number"],
  ["Employee ID", "employee_code"],
  ["Qualification", "qualification"],
  ["Specialization", "specialization"],
  ["Date of joining", "date_of_joining"],
];

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/teacher/profile/").then(({ data }) => setProfile(data)).catch(() => setProfile(null));
  }, []);

  if (!profile) return <Loader rows={3} />;

  return (
    <Card>
      <SectionTitle>My profile</SectionTitle>
      <AvatarUploader
        api={api}
        avatarUrl={profile.avatar_url}
        name={profile.name}
        onChange={(avatar_url) => setProfile((p) => ({ ...p, avatar_url }))}
      />
      <dl className="grid sm:grid-cols-2 gap-4 mt-6">
        {FIELDS.map(([label, key]) => (
          <div key={key}>
            <dt className="text-xs text-ink-secondary uppercase tracking-wide">{label}</dt>
            <dd className="text-sm font-medium mt-0.5">{profile[key] ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
