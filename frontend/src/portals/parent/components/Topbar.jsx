import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, onMenuClick }) {
  const { kids, activeChildId, selectChild } = useAuth();
  const [open, setOpen] = useState(false);
  const activeChild = kids.find((k) => String(k.id) === String(activeChildId));

  return (
    <header className="sticky top-0 z-20 bg-surface-light/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden text-ink-primary">
          <Menu size={22} />
        </button>
        <h1 className="font-heading text-xl font-semibold text-ink-primary truncate">{title}</h1>
      </div>

      {kids.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-white shadow-card rounded-xl px-3 py-2 text-sm font-medium text-ink-primary"
          >
            <span className="w-6 h-6 rounded-full bg-academic-green/10 text-academic-green flex items-center justify-center text-xs font-bold">
              {activeChild?.name?.[0]?.toUpperCase() || "C"}
            </span>
            <span className="max-w-[8rem] truncate">{activeChild?.name || "Select child"}</span>
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-30">
              {kids.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    selectChild(k.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    String(k.id) === String(activeChildId) ? "bg-academic-green/10 text-academic-green font-semibold" : "hover:bg-gray-50"
                  }`}
                >
                  {k.name}
                  <span className="block text-xs text-ink-secondary">{k.admission_number}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
