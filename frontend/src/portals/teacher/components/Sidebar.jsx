import {
  BookOpenCheck, CalendarCheck2, ClipboardList, FileStack, GraduationCap,
  Home, LayoutGrid, LibraryBig, LogOut, Mail, Megaphone, NotebookPen,
  ScrollText, User, Users, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/teacher", label: "Dashboard", icon: Home, end: true },
  { to: "/teacher/profile", label: "Profile", icon: User },
  { to: "/teacher/classes", label: "Class Management", icon: LayoutGrid },
  { to: "/teacher/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/teacher/homework", label: "Homework", icon: NotebookPen },
  { to: "/teacher/assignments", label: "Assignments", icon: BookOpenCheck },
  { to: "/teacher/question-bank", label: "Question Bank", icon: FileStack },
  { to: "/teacher/exams", label: "Exam Creation", icon: ScrollText },
  { to: "/teacher/marks-entry", label: "Marks Entry", icon: ClipboardList },
  { to: "/teacher/performance", label: "Student Performance", icon: GraduationCap },
  { to: "/teacher/messages", label: "Messages", icon: Mail },
  { to: "/teacher/documents", label: "Documents", icon: FileStack },
  { to: "/teacher/timetable", label: "Timetable", icon: ClipboardList },
  { to: "/teacher/notices", label: "Notice Board", icon: Megaphone },
  { to: "/teacher/leave", label: "Leave Management", icon: Users },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 bg-academic-blue text-white flex flex-col
        transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academic-gold flex items-center justify-center font-heading font-bold text-academic-blue">
              E
            </div>
            <div>
              <p className="font-heading font-semibold leading-tight">EduNova</p>
              <p className="text-xs text-white/60 font-sub">Teacher Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70">
            <X size={20} />
          </button>
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
                ${isActive ? "bg-white text-academic-blue shadow-raised" : "text-white/80 hover:bg-white/10"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-academic-green flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || "T"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
