import { Inbox } from "lucide-react";

const ACCENTS = {
  blue: "bg-academic-blue/10 text-academic-blue",
  green: "bg-academic-green/10 text-academic-green",
  orange: "bg-academic-orange/10 text-academic-orange",
  gold: "bg-academic-gold/20 text-amber-600",
  red: "bg-red-100 text-danger",
};

export function StatCard({ icon: Icon, label, value, accent = "blue", sub }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 flex items-start gap-4 hover:shadow-raised transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ACCENTS[accent] || ACCENTS.blue}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-ink-secondary text-xs font-sub font-medium uppercase tracking-wide">{label}</p>
        <p className="font-numeric text-2xl font-bold text-ink-primary leading-tight">{value}</p>
        {sub && <p className="text-xs text-ink-secondary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-card shadow-card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-heading font-semibold text-ink-primary">{children}</h2>
      {action}
    </div>
  );
}

export function Loader({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl shimmer" />
      ))}
    </div>
  );
}

export function EmptyState({ label = "Nothing here yet." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-ink-secondary">
      <Inbox size={28} className="mb-2 opacity-50" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gold: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>
  );
}

export function Toast({ message, tone = "success", onClose }) {
  if (!message) return null;
  const bg = tone === "success" ? "bg-success" : "bg-danger";
  return (
    <div
      className={`fixed bottom-6 right-6 ${bg} text-white px-4 py-3 rounded-xl shadow-raised z-50 text-sm font-medium animate-[fadeIn_.2s_ease]`}
      onAnimationEnd={() => setTimeout(onClose, 3000)}
    >
      {message}
    </div>
  );
}
