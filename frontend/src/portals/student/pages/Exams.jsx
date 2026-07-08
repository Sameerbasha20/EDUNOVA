import { Download, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import api from "../lib/api";

export default function Exams() {
  const [exams, setExams] = useState(null);
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    api.get("/student/exams/").then(({ data }) => setExams(data)).catch(() => setExams([]));
    api.get("/student/hall-tickets/").then(({ data }) => setTickets(data)).catch(() => setTickets([]));
  }, []);

  if (!exams || !tickets) return <Loader rows={4} />;

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Exam schedule</SectionTitle>
        {exams.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-secondary text-xs uppercase tracking-wide">
                  <th className="py-2">Exam</th>
                  <th className="py-2">Subject</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Max marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 font-medium">{e.exam_name}</td>
                    <td className="py-2.5">{e.subject_name}</td>
                    <td className="py-2.5"><Badge tone="blue">{e.exam_type}</Badge></td>
                    <td className="py-2.5">{e.exam_date}</td>
                    <td className="py-2.5">{e.duration_minutes} min</td>
                    <td className="py-2.5">{e.max_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState label="No exams scheduled for your class yet." />
        )}
      </Card>

      <Card>
        <SectionTitle>Hall tickets</SectionTitle>
        {tickets.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-academic-blue/10 text-academic-blue flex items-center justify-center">
                    <Ticket size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.exam.exam_name}</p>
                    <p className="text-xs text-ink-secondary font-numeric">{t.ticket_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={t.is_verified ? "green" : "gold"}>{t.is_verified ? "Verified" : "Pending"}</Badge>
                  <button className="text-academic-blue" title="Download">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="Hall tickets will appear here once issued." />
        )}
      </Card>
    </div>
  );
}
