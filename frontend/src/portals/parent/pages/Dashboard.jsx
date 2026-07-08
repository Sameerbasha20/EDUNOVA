import { CalendarDays, Wallet, Bell, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle, StatCard } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/parent/dashboard/").then(({ data }) => setData(data)).catch(() => setData({ children: [] }));
  }, []);

  if (!data) return <Loader rows={4} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-ink-primary">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-ink-secondary text-sm font-sub">Here's how your family is doing at EduNova.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Children" value={data.children.length} accent="blue" />
        <StatCard
          icon={CalendarDays}
          label="Avg. Attendance"
          value={
            data.children.length
              ? `${Math.round(
                  data.children.reduce((s, c) => s + (c.attendance_percentage || 0), 0) / data.children.length
                )}%`
              : "—"
          }
          accent="green"
        />
        <StatCard
          icon={Wallet}
          label="Pending Fee Items"
          value={data.children.reduce((s, c) => s + (c.pending_fee_items || 0), 0)}
          accent="orange"
        />
        <StatCard icon={Bell} label="Unread Messages" value={data.unread_messages} accent="gold" />
      </div>

      <Card>
        <SectionTitle>Your children</SectionTitle>
        {data.children.length === 0 ? (
          <EmptyState label="No children linked to your account yet. Contact the school office if this looks wrong." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.children.map((c) => (
              <div key={c.id} className="border border-slate-100 rounded-xl p-4">
                <p className="font-semibold text-ink-primary">{c.name}</p>
                <p className="text-xs text-ink-secondary mb-2">
                  {c.admission_number} · {c.class_name}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-ink-secondary">
                    Attendance: <span className="font-semibold text-ink-primary">{c.attendance_percentage ?? "—"}%</span>
                  </span>
                  <span className="text-ink-secondary">
                    Fees due: <span className="font-semibold text-ink-primary">{c.pending_fee_items}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
