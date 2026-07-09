import {
  LayoutDashboard, UserPlus, Users, School, BookOpen, Wallet, Bus,
  LibraryBig, Megaphone, CalendarClock, BarChart3, ShieldCheck, LogOut, X, Database,
  BedDouble, Boxes, ScanFace, GraduationCap, Stethoscope, Trophy,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/admissions", label: "Admissions", icon: UserPlus },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/teachers", label: "Teachers", icon: BookOpen },
  { to: "/admin/classes", label: "Classes & Subjects", icon: School },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/exam-results", label: "Rank Lists & Report Cards", icon: Trophy },
  { to: "/admin/transport", label: "Transport", icon: Bus },
  { to: "/admin/library", label: "Library", icon: LibraryBig },
  { to: "/admin/hostel", label: "Hostel", icon: BedDouble },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/visitors", label: "Visitor Management", icon: ScanFace },
  { to: "/admin/alumni", label: "Alumni Registry", icon: GraduationCap },
  { to: "/admin/medical-records", label: "Medical Records", icon: Stethoscope },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/leaves", label: "Leave Approvals", icon: CalendarClock },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/audit-log", label: "Audit Log", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings & Backup", icon: Database },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 bg-bg-dark text-white flex flex-col
        transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academic-gold flex items-center justify-center font-heading font-bold text-academic-blue">E</div>
            <div>
              <p className="font-heading font-semibold leading-tight">EduNova</p>
              <p className="text-xs text-white/60 font-sub">Admin Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70"><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sub font-medium transition-colors
                ${isActive ? "bg-white text-bg-dark shadow-raised" : "text-white/80 hover:bg-white/10"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-academic-gold flex items-center justify-center text-sm font-bold text-academic-blue">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
