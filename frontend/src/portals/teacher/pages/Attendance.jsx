import { Check, CheckCheck, Clock3, HeartPulse, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import api from "../lib/api";

const CYCLE = ["Present", "Absent", "Late", "Medical_Leave"];
const STYLE = {
  Present: { label: "Present", tone: "green", icon: Check },
  Absent: { label: "Absent", tone: "red", icon: X },
  Late: { label: "Late", tone: "gold", icon: Clock3 },
  Medical_Leave: { label: "Medical", tone: "blue", icon: HeartPulse },
};

export default function Attendance() {
  const [params] = useSearchParams();
  const [classes, setClasses] = useState(null);
  const [classId, setClassId] = useState(params.get("class_id") || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get("/teacher/classes/").then(({ data }) => {
      setClasses(data);
      if (!classId && data.length) setClassId(String(data[0].class_id));
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    setRows(null);
    api
      .get("/teacher/attendance/", { params: { class_id: classId, date } })
      .then(({ data }) => setRows(data.records));
  }, [classId, date]);

  function cycle(idx) {
    setRows((prev) => {
      const copy = [...prev];
      const current = copy[idx].status;
      const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length] || "Present";
      copy[idx] = { ...copy[idx], status: current ? next : "Present" };
      return copy;
    });
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, status: "Present" })));
  }

  async function save() {
    setSaving(true);
    try {
      const { data } = await api.post("/teacher/attendance/", {
        class_id: classId,
        date,
        records: rows.map((r) => ({ student: r.student, status: r.status || "Present", remarks: r.remarks })),
      });
      setToast(data.detail);
    } finally {
      setSaving(false);
    }
  }

  const allMarked = rows && rows.every((r) => r.status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
        >
          {(classes || []).map((c) => (
            <option key={c.id} value={c.class_id}>{c.class_name} — {c.subject_name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring outline-none"
        />
        {rows && (
          <button onClick={markAllPresent} className="text-sm font-medium text-academic-blue hover:underline">
            Mark all present
          </button>
        )}
      </div>

      <Card>
        <SectionTitle
          action={
            <Badge tone={allMarked ? "green" : "gold"}>
              {allMarked ? "All students marked" : "Some students unmarked"}
            </Badge>
          }
        >
          Tap a student's status to cycle Present → Absent → Late → Medical
        </SectionTitle>

        {!rows ? (
          <Loader rows={4} />
        ) : rows.length ? (
          <div className="grid sm:grid-cols-2 gap-2">
            {rows.map((r, idx) => {
              const style = STYLE[r.status] || null;
              const Icon = style?.icon;
              return (
                <button
                  key={r.student}
                  onClick={() => cycle(idx)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left hover:border-academic-blue/40 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{r.student_name}</p>
                    <p className="text-xs text-ink-secondary font-numeric">{r.admission_number}</p>
                  </div>
                  {style ? (
                    <Badge tone={style.tone}>
                      <span className="flex items-center gap-1">
                        <Icon size={12} /> {style.label}
                      </span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-secondary">Tap to mark</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState label="No students enrolled in this class." />
        )}

        {rows && rows.length > 0 && (
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-academic-blue text-white rounded-xl py-2.5 font-medium hover:bg-academic-blue/90 disabled:opacity-60"
          >
            <CheckCheck size={16} /> {saving ? "Saving…" : "Save attendance"}
          </button>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
