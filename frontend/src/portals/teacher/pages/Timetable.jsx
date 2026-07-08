import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    api.get("/teacher/timetable/").then(({ data }) => setEntries(data)).catch(() => setEntries([]));
  }, []);

  if (!entries) return <Loader rows={6} />;
  if (!entries.length) return <EmptyState label="No timetable assigned yet." />;

  const byDay = DAYS.map((day) => ({
    day,
    periods: entries.filter((e) => e.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {byDay.map(({ day, periods }) => (
        <Card key={day}>
          <p className="font-heading font-semibold mb-3">{day}</p>
          {periods.length ? (
            <ul className="space-y-2">
              {periods.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-surface-light px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{p.class_name}</p>
                    <p className="text-xs text-ink-secondary">{p.subject_name}</p>
                  </div>
                  <span className="text-xs font-numeric text-academic-blue whitespace-nowrap">
                    {p.start_time.slice(0, 5)}–{p.end_time.slice(0, 5)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-secondary">No periods scheduled.</p>
          )}
        </Card>
      ))}
    </div>
  );
}
