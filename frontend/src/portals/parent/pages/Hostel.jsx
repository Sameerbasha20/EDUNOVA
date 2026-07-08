import { BedDouble } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Card, EmptyState, Loader } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export default function Hostel() {
  const { activeChildId } = useAuth();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (!activeChildId) return;
    setRoom(null);
    api.get(`/parent/hostel/?child_id=${activeChildId}`).then(({ data }) => setRoom(data)).catch(() => setRoom(null));
  }, [activeChildId]);

  if (!activeChildId) return <EmptyState label="Select a child from the top bar to view hostel info." />;
  if (room === null) return <Loader rows={2} />;
  if (!room || !room.room_number) return <EmptyState label="This child is not currently allocated a hostel room." />;

  return (
    <Card className="max-w-md flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-academic-blue/10 text-academic-blue flex items-center justify-center shrink-0">
        <BedDouble size={26} />
      </div>
      <div>
        <p className="font-heading font-semibold text-ink-primary">{room.hostel_name} ({room.type})</p>
        <p className="text-sm text-ink-secondary">Room {room.room_number}</p>
        <p className="text-xs text-ink-secondary mt-1">Allocated since {room.allocated_date}</p>
      </div>
    </Card>
  );
}
