import { Award, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import api from "../lib/api";

export default function Results() {
  const [results, setResults] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);

  useEffect(() => {
    api.get("/student/results/").then(({ data }) => setResults(data)).catch(() => setResults([]));
  }, []);

  async function viewReportCard(examName) {
    setLoadingCard(true);
    try {
      const { data } = await api.get(`/student/report-card/?exam_name=${encodeURIComponent(examName)}`);
      setReportCard(data);
    } finally {
      setLoadingCard(false);
    }
  }

  if (!results) return <Loader rows={4} />;
  if (!results.length) return <EmptyState label="No results published yet." />;

  const examNames = [...new Set(results.map((r) => r.exam.exam_name))];

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Report card</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {examNames.map((name) => (
            <button
              key={name}
              onClick={() => viewReportCard(name)}
              className="text-sm font-medium text-academic-blue border border-academic-blue/30 rounded-full px-4 py-1.5 hover:bg-academic-blue/5"
            >
              {name}
            </button>
          ))}
        </div>
        {loadingCard && <p className="text-sm text-ink-secondary mt-3">Loading…</p>}
        {reportCard && reportCard.subjects?.length > 0 && (
          <div className="border border-slate-100 rounded-2xl p-6 mt-4 print:border-0">
            <div className="text-center mb-6">
              <p className="font-heading text-xl font-bold text-academic-blue">EduNova Global Academy</p>
              <p className="text-sm text-ink-secondary">Report Card — {reportCard.exam_name}</p>
              <p className="font-semibold mt-2">{reportCard.student_name}</p>
            </div>
            {reportCard.is_complete === false && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2 mb-4">
                Only {reportCard.subjects.length} of {reportCard.expected_subject_count} subjects have marks entered so far — this report card isn't final yet.
              </div>
            )}
            <table className="w-full text-sm mb-4">
              <thead><tr className="text-left text-ink-secondary border-b border-slate-100">
                <th className="py-2 pr-4">Subject</th><th className="py-2 pr-4">Marks</th><th className="py-2 pr-4">Out of</th><th className="py-2 pr-4">Grade</th>
              </tr></thead>
              <tbody>
                {reportCard.subjects.map((s, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2 pr-4">{s.subject_name}</td>
                    <td className="py-2 pr-4">{s.marks_obtained}</td>
                    <td className="py-2 pr-4">{s.max_marks}</td>
                    <td className="py-2 pr-4">{s.grade_letter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div><p className="text-xs text-ink-secondary uppercase">Total</p><p className="font-bold text-lg">{reportCard.total_marks} / {reportCard.max_total}</p></div>
              <div><p className="text-xs text-ink-secondary uppercase">Percentage</p><p className="font-bold text-lg">{reportCard.percentage}%</p></div>
              <div><p className="text-xs text-ink-secondary uppercase">Grade</p><p className="font-bold text-lg">{reportCard.overall_grade}</p></div>
            </div>
            <button onClick={() => window.print()} className="mt-4 w-full bg-academic-green text-white rounded-xl py-2 font-medium flex items-center justify-center gap-2 print:hidden">
              <Printer size={16} /> Print
            </button>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
      {results.map((r) => (
        <Card key={r.id}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-heading font-semibold">{r.exam.exam_name}</p>
              <p className="text-xs text-ink-secondary">{r.exam.subject_name}</p>
            </div>
            {r.rank_position && (
              <Badge tone="gold">
                <span className="flex items-center gap-1"><Award size={12} /> Rank {r.rank_position}</span>
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-numeric text-xl font-bold text-academic-blue">
                {r.marks_obtained}/{r.exam.max_marks}
              </p>
              <p className="text-xs text-ink-secondary">Marks</p>
            </div>
            <div>
              <p className="font-numeric text-xl font-bold text-academic-green">{r.percentage}%</p>
              <p className="text-xs text-ink-secondary">Percentage</p>
            </div>
            <div>
              <p className="font-numeric text-xl font-bold text-academic-orange">{r.grade_letter || "—"}</p>
              <p className="text-xs text-ink-secondary">Grade</p>
            </div>
          </div>
          {r.remarks && <p className="text-xs text-ink-secondary mt-3 italic">"{r.remarks}"</p>}
        </Card>
      ))}
      </div>
    </div>
  );
}
