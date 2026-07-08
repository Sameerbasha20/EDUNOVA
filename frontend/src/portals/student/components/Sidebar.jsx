import {
  BookOpenCheck, CalendarDays, ClipboardList, GraduationCap, Home,
  LibraryBig, LogOut, Megaphone, NotebookPen, PartyPopper, ScrollText,
  User, Wallet, LifeBuoy, X, BedDouble, Stethoscope,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/student", label: "Dashboard", icon: Home, end: true },
  { to: "/student/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/student/timetable", label: "Timetable", icon: ClipboardList },
  { to: "/student/homework", label: "Homework", icon: NotebookPen },
  { to: "/student/assignments", label: "Assignments", icon: BookOpenCheck },
  { to: "/student/lms", label: "LMS / Courses", icon: GraduationCap },
  { to: "/student/exams", label: "Exams", icon: ScrollText },
  { to: "/student/results", label: "Results", icon: GraduationCap },
  { to: "/student/fees", label: "Fee Payments", icon: Wallet },
  { to: "/student/library", label: "Library", icon: LibraryBig },
  { to: "/student/hostel", label: "Hostel", icon: BedDouble },
  { to: "/student/medical-records", label: "Medical Records", icon: Stethoscope },
  { to: "/student/certificates", label: "Certificates", icon: ScrollText },
  { to: "/student/announcements", label: "Announcements", icon: Megaphone },
  { to: "/student/events", label: "Events", icon: PartyPopper },
  { to: "/student/profile", label: "Profile", icon: User },
  { to: "/student/support", label: "Support", icon: LifeBuoy },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
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
              <p className="text-xs text-white/60 font-sub">Student Portal</p>
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
              {user?.name?.[0]?.toUpperCase() || "S"}
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
