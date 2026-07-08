import { Bus, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader, SectionTitle } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Transport() {
  const { activeChildId } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setData(null);
    api.get(`/parent/transport/?child_id=${activeChildId}`).then(({ data }) => setData(data)).catch(() => setData({ allocation: null, last_location: null }));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view transport info." />;
  if (!data) return <Loader rows={3} />;
  if (!data.allocation) return <EmptyState label="No bus/route has been assigned to this child yet." />;

  const a = data.allocation;
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle>
          <span className="flex items-center gap-2"><Bus size={18} /> Route details</span>
        </SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><p className="text-ink-secondary text-xs uppercase">Vehicle</p><p className="font-semibold">{a.vehicle_number}</p></div>
          <div><p className="text-ink-secondary text-xs uppercase">Route</p><p className="font-semibold">{a.route_name}</p></div>
          <div><p className="text-ink-secondary text-xs uppercase">Pickup point</p><p className="font-semibold">{a.pickup_point || "—"}</p></div>
          <div><p className="text-ink-secondary text-xs uppercase">Driver</p><p className="font-semibold flex items-center gap-1"><User size={14}/> {a.driver_name || "Not assigned"}</p></div>
          <div><p className="text-ink-secondary text-xs uppercase">Status</p><p className="font-semibold">{a.maintenance_status}</p></div>
        </div>
      </Card>
      <Card>
        <SectionTitle><span className="flex items-center gap-2"><MapPin size={18}/> Last known location</span></SectionTitle>
        {data.last_location ? (
          <p className="text-sm text-ink-primary">
            Lat {data.last_location.latitude}, Lng {data.last_location.longitude} — updated{" "}
            {new Date(data.last_location.updated_at).toLocaleString()}
          </p>
        ) : (
          <EmptyState label="No live GPS ping received yet for this vehicle." />
        )}
      </Card>
    </div>
  );
}
