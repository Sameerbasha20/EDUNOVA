import { Menu } from "lucide-react";

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-surface-light/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden text-ink-primary">
          <Menu size={22} />
        </button>
        <h1 className="font-heading text-xl font-semibold text-ink-primary truncate">{title}</h1>
      </div>
    </header>
  );
}
