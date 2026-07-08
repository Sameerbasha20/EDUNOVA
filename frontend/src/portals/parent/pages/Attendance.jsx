import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, StatCard } from "../components/Common";
import { useAuth } from "../context/AuthContext";
import { CalendarCheck } from "lucide-react";

const TONE = { Present: "green", Absent: "red", Late: "orange", Medical_Leave: "gold" };

export default function Attendance() {
  const { activeChildId } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setData(null);
    api.get(`/parent/attendance/?child_id=${activeChildId}`).then(({ data }) => setData(data)).catch(() => setData({ summary: {}, records: [] }));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view attendance." />;
  if (!data) return <Loader rows={5} />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Attendance %" value={data.summary.percentage ?? "—"} accent="green" />
        <StatCard icon={CalendarCheck} label="Present" value={data.summary.present || 0} accent="blue" />
        <StatCard icon={CalendarCheck} label="Absent" value={data.summary.absent || 0} accent="red" />
        <StatCard icon={CalendarCheck} label="Late" value={data.summary.late || 0} accent="orange" />
      </div>
      <Card>
        <SectionTitle>Daily record</SectionTitle>
        {data.records.length === 0 ? (
          <EmptyState label="No attendance records yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.records.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-ink-primary">{r.date}</span>
                <div className="flex items-center gap-2">
                  {r.remarks && <span className="text-xs text-ink-secondary">{r.remarks}</span>}
                  <Badge tone={TONE[r.status] || "slate"}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
