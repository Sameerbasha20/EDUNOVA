import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/": "Dashboard",
  "/classes": "Class Management",
  "/attendance": "Attendance",
  "/homework": "Homework",
  "/assignments": "Assignments",
  "/question-bank": "Question Bank",
  "/exams": "Exam Creation",
  "/marks-entry": "Marks Entry",
  "/performance": "Student Performance Analytics",
  "/messages": "Messages",
  "/documents": "Documents",
  "/timetable": "Timetable",
  "/notices": "Notice Board",
  "/leave": "Leave Management",
};

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex bg-surface-light">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar title={TITLES[pathname] || "Teacher Portal"} onMenuClick={() => setOpen(true)} />
        <main className="p-4 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
