import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import api from "../lib/api";

const STATUS_TONE = { Present: "green", Absent: "red", Late: "gold", Medical_Leave: "blue" };
const COLORS = { Present: "#10B981", Absent: "#DC2626", Late: "#FBBF24", "Medical Leave": "#1E3A8A" };

export default function Attendance() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/student/attendance/", { params: { month } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [month]);

  const pieData = data
    ? [
        { name: "Present", value: data.summary.present },
        { name: "Absent", value: data.summary.absent },
        { name: "Late", value: data.summary.late },
        { name: "Medical Leave", value: data.summary.medical_leave },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-ink-secondary text-sm">Track your day-by-day attendance record.</p>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
        />
      </div>

      {loading ? (
        <Loader rows={4} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center">
            <p className="font-numeric text-4xl font-bold text-academic-blue">
              {data.summary.percentage != null ? `${data.summary.percentage}%` : "—"}
            </p>
            <p className="text-ink-secondary text-sm mb-3">This month's attendance</p>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState label="No attendance marked this month." />
            )}
          </Card>

          <Card className="lg:col-span-2">
            <SectionTitle>Daily record — {month}</SectionTitle>
            {data.records.length ? (
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                {data.records.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                    <span>{r.date}</span>
                    <div className="flex items-center gap-2">
                      {r.remarks && <span className="text-xs text-ink-secondary">{r.remarks}</span>}
                      <Badge tone={STATUS_TONE[r.status] || "slate"}>{r.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No attendance records for this month." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
