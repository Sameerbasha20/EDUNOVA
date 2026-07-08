import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PortalNotFound from "../../components/PortalNotFound";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Homework from "./pages/Homework";
import Results from "./pages/Results";
import Fees from "./pages/Fees";
import Transport from "./pages/Transport";
import Hostel from "./pages/Hostel";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import LeaveRequests from "./pages/LeaveRequests";
import PtmBooking from "./pages/PtmBooking";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";

export default function ParentRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="homework" element={<Homework />} />
          <Route path="results" element={<Results />} />
          <Route path="fees" element={<Fees />} />
          <Route path="transport" element={<Transport />} />
          <Route path="hostel" element={<Hostel />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="documents" element={<Documents />} />
          <Route path="leaves" element={<LeaveRequests />} />
          <Route path="ptm" element={<PtmBooking />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<PortalNotFound homePath="/parent" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
