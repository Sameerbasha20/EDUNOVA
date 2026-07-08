import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, Loader, SectionTitle } from "../components/Common";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/parent/profile/").then(({ data }) => setProfile(data)).catch(() => setProfile(null));
  }, []);

  if (!profile) return <Loader rows={3} />;

  return (
    <Card>
      <SectionTitle>My profile</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div><p className="text-ink-secondary text-xs uppercase">Name</p><p className="font-semibold">{profile.name}</p></div>
        <div><p className="text-ink-secondary text-xs uppercase">Email</p><p className="font-semibold">{profile.email}</p></div>
        <div><p className="text-ink-secondary text-xs uppercase">Phone</p><p className="font-semibold">{profile.phone_number || "—"}</p></div>
        <div><p className="text-ink-secondary text-xs uppercase">Address</p><p className="font-semibold">{profile.address || "—"}</p></div>
      </div>
      <div className="mt-6">
        <p className="text-ink-secondary text-xs uppercase mb-2">Children</p>
        <ul className="space-y-1">
          {profile.children?.map((c) => (
            <li key={c.id} className="text-sm text-ink-primary">{c.name} — {c.admission_number}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
