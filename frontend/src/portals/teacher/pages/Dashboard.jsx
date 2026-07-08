import { AlertTriangle, CheckCircle2, ClipboardCheck, Mail, ScrollText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, EmptyState, Loader, SectionTitle, StatCard } from "../components/Common";
import api from "../lib/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/teacher/dashboard/").then(({ data }) => setData(data)).catch(() => setError("Couldn't load your dashboard."));
  }, []);

  if (error) return <EmptyState label={error} />;
  if (!data) return <Loader rows={5} />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="My classes" value={data.total_classes} accent="blue" />
        <StatCard icon={ClipboardCheck} label="Submissions to grade" value={data.pending_grading} accent="orange" />
        <StatCard icon={ScrollText} label="Upcoming exams" value={data.upcoming_exams.length} accent="green" />
        <StatCard icon={Mail} label="Unread messages" value={data.unread_messages} accent="gold" />
      </div>

      <Card>
        <SectionTitle action={<Link to="/teacher/timetable" className="text-sm text-academic-blue hover:underline">Full timetable</Link>}>
          Today's timetable — {data.today}
        </SectionTitle>
        {data.todays_timetable.length ? (
          <ul className="divide-y divide-slate-100">
            {data.todays_timetable.map((p) => (
              <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{p.class_name} · {p.subject_name}</p>
                </div>
                <span className="font-numeric text-academic-blue">{p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState label="No periods scheduled for today." />
        )}
      </Card>

      <Card>
        <SectionTitle action={<Link to="/teacher/attendance" className="text-sm text-academic-blue hover:underline">Mark attendance</Link>}>
          Today's attendance status
        </SectionTitle>
        {data.attendance_flags.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.attendance_flags.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{f.class_name}</p>
                  <p className="text-xs text-ink-secondary">{f.subject_name} · {f.marked_count}/{f.roster_count} marked</p>
                </div>
                {f.complete ? (
                  <Badge tone="green"><span className="flex items-center gap-1"><CheckCircle2 size={12} /> Synced</span></Badge>
                ) : (
                  <Badge tone="red"><span className="flex items-center gap-1"><AlertTriangle size={12} /> Incomplete</span></Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="No classes scheduled today." />
        )}
      </Card>

      <Card>
        <SectionTitle action={<Link to="/teacher/exams" className="text-sm text-academic-blue hover:underline">View all</Link>}>
          Upcoming exams
        </SectionTitle>
        {data.upcoming_exams.length ? (
          <ul className="divide-y divide-slate-100">
            {data.upcoming_exams.map((e) => (
              <li key={e.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{e.exam_name}</p>
                  <p className="text-xs text-ink-secondary">{e.class_name} · {e.subject_name}</p>
                </div>
                <Badge tone="gold">{e.exam_date}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState label="No exams scheduled." />
        )}
      </Card>
    </div>
  );
}
