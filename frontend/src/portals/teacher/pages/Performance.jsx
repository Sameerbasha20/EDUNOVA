import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import api from "../lib/api";

export default function Performance() {
  const [params] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(params.get("class_id") || "");
  const [subjectId, setSubjectId] = useState(params.get("subject_id") || "");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/teacher/classes/").then(({ data }) => {
      setClasses(data);
      if (!classId && data.length) {
        setClassId(String(data[0].class_id));
        setSubjectId(String(data[0].subject_id));
      }
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    setData(null);
    api
      .get("/teacher/performance/", { params: { class_id: classId, subject_id: subjectId } })
      .then(({ data }) => setData(data));
  }, [classId, subjectId]);

  const chartData = data?.students.map((s) => ({ name: s.name.split(" ")[0], marks: s.average_marks || 0 })) || [];

  return (
    <div className="space-y-4">
      <select
        value={`${classId}:${subjectId}`}
        onChange={(e) => {
          const [c, s] = e.target.value.split(":");
          setClassId(c);
          setSubjectId(s);
        }}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
      >
        {classes.map((c) => (
          <option key={c.id} value={`${c.class_id}:${c.subject_id}`}>{c.class_name} — {c.subject_name}</option>
        ))}
      </select>

      {!data ? (
        <Loader rows={4} />
      ) : data.students.length ? (
        <>
          <Card>
            <SectionTitle>Class average: {data.class_average ?? "—"}%</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="marks" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle>Per-student breakdown</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-secondary text-xs uppercase tracking-wide">
                    <th className="py-2">Student</th>
                    <th className="py-2">Avg. marks</th>
                    <th className="py-2">Exams taken</th>
                    <th className="py-2">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.students.map((s) => (
                    <tr key={s.student_id}>
                      <td className="py-2.5 font-medium">{s.name}</td>
                      <td className="py-2.5 font-numeric">{s.average_marks ?? "—"}%</td>
                      <td className="py-2.5">{s.exams_taken}</td>
                      <td className="py-2.5 font-numeric">{s.attendance_percentage != null ? `${s.attendance_percentage}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <EmptyState label="No results recorded for this class/subject yet." />
      )}
    </div>
  );
}
