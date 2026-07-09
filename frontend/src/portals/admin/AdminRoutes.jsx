import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PortalNotFound from "../../components/PortalNotFound";

import Dashboard from "./pages/Dashboard";
import Admissions from "./pages/Admissions";
import Users from "./pages/Users";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Teachers from "./pages/Teachers";
import TeacherDetail from "./pages/TeacherDetail";
import Classes from "./pages/Classes";
import Fees from "./pages/Fees";
import Transport from "./pages/Transport";
import Library from "./pages/Library";
import Notices from "./pages/Notices";
import Leaves from "./pages/Leaves";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import Settings from "./pages/Settings";
import Hostel from "./pages/Hostel";
import Inventory from "./pages/Inventory";
import Visitors from "./pages/Visitors";
import Alumni from "./pages/Alumni";
import MedicalRecords from "./pages/MedicalRecords";
import ExamResults from "./pages/ExamResults";

export default function AdminRoutes() {
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
          <Route path="admissions" element={<Admissions />} />
          <Route path="users" element={<Users />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="teachers/:id" element={<TeacherDetail />} />
          <Route path="classes" element={<Classes />} />
          <Route path="fees" element={<Fees />} />
          <Route path="transport" element={<Transport />} />
          <Route path="library" element={<Library />} />
          <Route path="notices" element={<Notices />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="alumni" element={<Alumni />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="exam-results" element={<ExamResults />} />
          <Route path="*" element={<PortalNotFound homePath="/admin" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
