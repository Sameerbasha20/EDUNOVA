import { useEffect, useState } from "react";
import api from "../lib/api";
import { Badge, Card, EmptyState, Loader, SectionTitle, Toast } from "../components/Common";
import { useAuth } from "../context/AuthContext";

const TONE = { Scheduled: "blue", Completed: "green", Cancelled: "red" };

export default function PtmBooking() {
  const { activeChildId } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [bookings, setBookings] = useState(null);
  const [form, setForm] = useState({ teacher_id: "", meeting_date: "", time_slot: "", parent_notes: "" });
  const [toast, setToast] = useState("");

  function load() {
    api.get("/parent/ptm/").then(({ data }) => setBookings(data)).catch(() => setBookings([]));
  }

  useEffect(() => {
    api.get("/parent/teachers/").then(({ data }) => setTeachers(data)).catch(() => setTeachers([]));
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/parent/ptm/", { ...form, student_id: activeChildId });
      setToast("Meeting requested.");
      setForm({ teacher_id: "", meeting_date: "", time_slot: "", parent_notes: "" });
      load();
    } catch {
      setToast("Could not book meeting.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>Book a parent-teacher meeting</SectionTitle>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <select required value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subject_name}</option>)}
          </select>
          <input required type="time" value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="Notes for the teacher (optional)" value={form.parent_notes} onChange={(e) => setForm({ ...form, parent_notes: e.target.value })} className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={2} />
          <button className="sm:col-span-2 bg-academic-green text-white rounded-xl py-2.5 font-medium">Request meeting</button>
        </form>
      </Card>

      <Card>
        <SectionTitle>Your bookings</SectionTitle>
        {!bookings ? <Loader rows={3} /> : bookings.length === 0 ? (
          <EmptyState label="No meetings booked yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-primary">{b.teacher_name}</p>
                  <p className="text-xs text-ink-secondary">{b.meeting_date} at {b.time_slot}</p>
                </div>
                <Badge tone={TONE[b.status] || "slate"}>{b.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
