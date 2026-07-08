import { UserPlus, GraduationCap, Users, Wallet, CalendarClock, LibraryBig } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, StatCard } from "../components/Common";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin-portal/dashboard/").then(({ data }) => setData(data)).catch(() => setData(null));
  }, []);

  if (!data) return <Loader rows={5} />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserPlus} label="Pending Admissions" value={data.pending_admissions} accent="orange" />
        <StatCard icon={GraduationCap} label="Students" value={data.total_students} accent="blue" />
        <StatCard icon={Users} label="Teachers" value={data.total_teachers} accent="green" />
        <StatCard icon={Users} label="Parents" value={data.total_parents} accent="gold" />
        <StatCard icon={Wallet} label="Fees Collected (This Month)" value={`₹${data.fee_collected_this_month}`} accent="green" />
        <StatCard icon={CalendarClock} label="Open Leave Requests" value={data.open_leaves} accent="orange" />
        <StatCard icon={LibraryBig} label="Library Books Out" value={data.library_books_out} accent="blue" />
        <StatCard icon={Users} label="Employees" value={data.total_employees} accent="blue" />
      </div>

      <Card>
        <SectionTitle>Recent admissions</SectionTitle>
        {data.recent_admissions.length === 0 ? (
          <EmptyState label="No admission applications yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recent_admissions.map((a) => (
              <div key={a.registration_number} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-primary">{a.applicant_name}</p>
                  <p className="text-xs text-ink-secondary">{a.registration_number} · {a.target_class}</p>
                </div>
                <Badge tone={a.status === "Confirmed" ? "green" : a.status === "Rejected" ? "red" : "orange"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
