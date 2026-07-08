import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle } from "../components/Common";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin-portal/reports/").then(({ data }) => setData(data)).catch(() => setData({}));
  }, []);

  if (!data) return <Loader rows={4} />;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <SectionTitle>Attendance by class</SectionTitle>
        {!data.attendance_by_class?.length ? <EmptyState label="No attendance data yet." /> : (
          <div className="space-y-2">
            {data.attendance_by_class.map((r) => (
              <div key={r.class_name} className="flex justify-between text-sm">
                <span>{r.class_name}</span><span className="font-semibold">{r.attendance_pct}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>Fee collection by month</SectionTitle>
        {!data.fee_collection_by_month?.length ? <EmptyState label="No payment data yet." /> : (
          <div className="space-y-2">
            {data.fee_collection_by_month.map((r) => (
              <div key={r.month} className="flex justify-between text-sm">
                <span>{r.month}</span><span className="font-semibold">₹{r.total}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>Average marks by subject</SectionTitle>
        {!data.average_marks_by_subject?.length ? <EmptyState label="No results data yet." /> : (
          <div className="space-y-2">
            {data.average_marks_by_subject.map((r) => (
              <div key={r.subject_name} className="flex justify-between text-sm">
                <span>{r.subject_name}</span><span className="font-semibold">{r.average_marks}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
