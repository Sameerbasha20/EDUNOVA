import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Announcements from "./pages/Announcements";
import Assignments from "./pages/Assignments";
import Attendance from "./pages/Attendance";
import Certificates from "./pages/Certificates";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Homework from "./pages/Homework";
import Hostel from "./pages/Hostel";
import MedicalRecords from "./pages/MedicalRecords";
import Library from "./pages/Library";
import Lms from "./pages/Lms";
import Profile from "./pages/Profile";
import Results from "./pages/Results";
import Support from "./pages/Support";
import Timetable from "./pages/Timetable";
import PortalNotFound from "../../components/PortalNotFound";

export default function StudentRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="homework" element={<Homework />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="lms" element={<Lms />} />
          <Route path="exams" element={<Exams />} />
          <Route path="results" element={<Results />} />
          <Route path="fees" element={<Fees />} />
          <Route path="library" element={<Library />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="events" element={<Events />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<Support />} />
          <Route path="*" element={<PortalNotFound homePath="/student" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
