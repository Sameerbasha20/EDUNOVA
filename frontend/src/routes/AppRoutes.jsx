import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from '../components/Layout'
import StudentRoutes from '../portals/student/StudentRoutes'
import TeacherRoutes from '../portals/teacher/TeacherRoutes'
import ParentRoutes from '../portals/parent/ParentRoutes'
import AdminRoutes from '../portals/admin/AdminRoutes'
import Home from '../portals/public/Home'
import About from '../portals/public/pages/About'
import Admissions from '../portals/public/pages/Admissions'
import Academics from '../portals/public/pages/Academics'
import Departments from '../portals/public/pages/Departments'
import Faculty from '../portals/public/pages/Faculty'
import Infrastructure from '../portals/public/pages/Infrastructure'
import Facilities from '../portals/public/pages/Facilities'
import LibraryPublic from '../portals/public/pages/LibraryPublic'
import TransportPublic from '../portals/public/pages/TransportPublic'
import HostelPublic from '../portals/public/pages/HostelPublic'
import Sports from '../portals/public/pages/Sports'
import Gallery from '../portals/public/pages/Gallery'
import News from '../portals/public/pages/News'
import Events from '../portals/public/pages/Events'
import Achievements from '../portals/public/pages/Achievements'
import Careers from '../portals/public/pages/Careers'
import Downloads from '../portals/public/pages/Downloads'
import StudentLife from '../portals/public/pages/StudentLife'
import ContactPage from '../portals/public/pages/ContactPage'
import FAQPage from '../portals/public/pages/FAQPage'
import PrivacyPolicy from '../portals/public/pages/PrivacyPolicy'
import Terms from '../portals/public/pages/Terms'
import LoginRolePicker from '../portals/public/pages/LoginRolePicker'
import CMSPageView from '../portals/public/pages/CMSPageView'
import NotFound from '../portals/public/pages/NotFound'

function PublicLayoutRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayoutRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/academics" element={<Academics />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/library" element={<LibraryPublic />} />
        <Route path="/transport" element={<TransportPublic />} />
        <Route path="/hostel" element={<HostelPublic />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/news" element={<News />} />
        <Route path="/events" element={<Events />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/student-life" element={<StudentLife />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<LoginRolePicker />} />
        <Route path="/page/:slug" element={<CMSPageView />} />
      </Route>

      <Route path="/student/*" element={<StudentRoutes />} />
      <Route path="/teacher/*" element={<TeacherRoutes />} />
      <Route path="/parent/*" element={<ParentRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
