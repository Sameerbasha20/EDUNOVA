import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/": "Dashboard",
  "/attendance": "Attendance",
  "/timetable": "Timetable",
  "/homework": "Homework",
  "/assignments": "Assignments",
  "/lms": "Learning Management System",
  "/exams": "Exams & Hall Tickets",
  "/results": "Results & Report Cards",
  "/fees": "Fee Payments",
  "/library": "Library",
  "/certificates": "Certificates & Downloads",
  "/announcements": "Announcements",
  "/events": "Events",
  "/profile": "My Profile",
  "/support": "Support",
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-surface-light">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar title={TITLES[pathname] || "Student Portal"} onMenuClick={() => setOpen(true)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
