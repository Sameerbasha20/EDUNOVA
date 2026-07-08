import { BedDouble } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, EmptyState, Loader } from "../components/Common";
import api from "../lib/api";

export default function Hostel() {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    api.get("/student/hostel/").then(({ data }) => setRoom(data)).catch(() => setRoom(null));
  }, []);

  if (room === null) return <Loader rows={2} />;
  if (!room || !room.room_number) return <EmptyState label="You are not currently allocated a hostel room." />;

  return (
    <Card className="max-w-md flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-academic-blue/10 text-academic-blue flex items-center justify-center">
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
