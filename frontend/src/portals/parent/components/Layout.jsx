import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/": "Dashboard",
  "/attendance": "Attendance",
  "/homework": "Homework",
  "/results": "Results",
  "/fees": "Fee Payments",
  "/transport": "Bus Tracking",
  "/messages": "Teacher Messages",
  "/notifications": "Notifications",
  "/documents": "Documents",
  "/leaves": "Leave Requests",
  "/ptm": "Parent-Teacher Meetings",
  "/feedback": "Feedback",
  "/profile": "My Profile",
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const sub = pathname.replace(/^\/parent/, "") || "/";

  return (
    <div className="min-h-screen flex bg-surface-light">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar title={TITLES[sub] || "Parent Portal"} onMenuClick={() => setOpen(true)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
