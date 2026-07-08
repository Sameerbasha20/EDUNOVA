import { BookOpenCheck, CalendarCheck2, ScrollText, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Badge, Card, EmptyState, Loader, SectionTitle, StatCard } from "../components/Common";
import IdCard from "../components/IdCard";
import api from "../lib/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/student/dashboard/"), api.get("/student/profile/")])
      .then(([d, p]) => {
        setData(d.data);
        setProfile(p.data);
      })
      .catch(() => setError("Couldn't load your dashboard. Pull down to retry or check your connection."));
  }, []);

  if (error) return <EmptyState label={error} />;
  if (!data) return <Loader rows={5} />;

  const trend = [...data.recent_results].reverse().map((r, i) => ({
    name: r.exam?.exam_name?.slice(0, 10) || `Exam ${i + 1}`,
    marks: Number(r.percentage ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard
            icon={CalendarCheck2}
            label="Attendance"
            value={data.attendance_percentage != null ? `${data.attendance_percentage}%` : "—"}
            accent="green"
            sub="This academic year"
          />
          <StatCard
            icon={BookOpenCheck}
            label="Assignments due"
            value={data.assignments_due.length}
            accent="orange"
            sub="Upcoming deadlines"
          />
          <StatCard
            icon={ScrollText}
            label="Upcoming exams"
            value={data.upcoming_exams.length}
            accent="blue"
            sub="Scheduled ahead"
          />
          <StatCard
            icon={Wallet}
            label="Pending fees"
            value={data.pending_fees.length}
            accent="red"
            sub={data.pending_fees.length ? "Action needed" : "All clear"}
          />
        </div>
        <div className="flex justify-center lg:justify-end">
          <IdCard profile={profile} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle action={<Link to="/student/results" className="text-sm text-academic-blue hover:underline">View all</Link>}>
            Recent exam performance
          </SectionTitle>
          {trend.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                <Line type="monotone" dataKey="marks" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState label="No results published yet." />
          )}
        </Card>

        <Card>
          <SectionTitle action={<Link to="/student/announcements" className="text-sm text-academic-blue hover:underline">View all</Link>}>
            Announcements
          </SectionTitle>
          {data.announcements.length ? (
            <ul className="space-y-3">
              {data.announcements.slice(0, 4).map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-ink-primary">{a.title}</p>
                  <p className="text-ink-secondary text-xs line-clamp-2">{a.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No announcements right now." />
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle action={<Link to="/student/homework" className="text-sm text-academic-blue hover:underline">View all</Link>}>
            Homework due soon
          </SectionTitle>
          {data.homework_due.length ? (
            <ul className="divide-y divide-slate-100">
              {data.homework_due.map((h) => (
                <li key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-ink-secondary">{h.subject_name}</p>
                  </div>
                  <Badge tone={h.is_overdue ? "red" : "blue"}>{h.due_date}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No homework pending. Nice work!" />
          )}
        </Card>

        <Card>
          <SectionTitle action={<Link to="/student/exams" className="text-sm text-academic-blue hover:underline">View all</Link>}>
            Upcoming exams
          </SectionTitle>
          {data.upcoming_exams.length ? (
            <ul className="divide-y divide-slate-100">
              {data.upcoming_exams.map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{e.exam_name}</p>
                    <p className="text-xs text-ink-secondary">{e.subject_name} · {e.exam_type}</p>
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
    </div>
  );
}
