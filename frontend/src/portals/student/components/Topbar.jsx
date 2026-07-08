import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Topbar({ title, onMenuClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api
      .get("/student/announcements/")
      .then(({ data }) => setCount(data.length))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-surface-light/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-ink-primary">
          <Menu size={22} />
        </button>
        <h1 className="font-heading text-xl font-semibold text-ink-primary">{title}</h1>
      </div>
      <Link
        to="/student/announcements"
        className="relative w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-ink-secondary hover:text-academic-blue transition-colors focus-ring"
        aria-label="Announcements"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-academic-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </header>
  );
}
