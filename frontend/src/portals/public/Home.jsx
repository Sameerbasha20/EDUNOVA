import HeroBanner from './home/HeroBanner'
import AdmissionOpenBanner from './home/AdmissionOpenBanner'
import PrincipalMessage from './home/PrincipalMessage'
import AboutSchoolSnippet from './home/AboutSchoolSnippet'
import WhyChooseGrid from './home/WhyChooseGrid'
import AcademicPrograms from './home/AcademicPrograms'
import FacilitiesGrid from './home/FacilitiesGrid'
import AchievementsStrip from './home/AchievementsStrip'
import EventsPreview from './home/EventsPreview'
import LatestNewsPreview from './home/LatestNewsPreview'
import FacultyHighlight from './home/FacultyHighlight'
import CampusGallery from './home/CampusGallery'
import StudentLifePreview from './home/StudentLifePreview'
import TestimonialsCarousel from './home/TestimonialsCarousel'
import AdmissionProcessSteps from './home/AdmissionProcessSteps'
import ScholarshipsBanner from './home/ScholarshipsBanner'
import FAQAccordion from './home/FAQAccordion'
import ContactSection from './home/ContactSection'

// Order matches "Homepage Sections" list in the client requirements doc.
// NOTE: Hero Banner now renders first (right after sticky nav), Admission
// Open Banner second — this was previously reversed; fixed per QA review.
export default function Home() {
  return (
    <>
      <HeroBanner />
      <AdmissionOpenBanner />
      <PrincipalMessage />
      <AboutSchoolSnippet />
      <WhyChooseGrid />
      <AcademicPrograms />
      <FacilitiesGrid />
      <AchievementsStrip />
      <EventsPreview />
      <LatestNewsPreview />
      <FacultyHighlight />
      <CampusGallery />
      <StudentLifePreview />
      <TestimonialsCarousel />
      <AdmissionProcessSteps />
      <ScholarshipsBanner />
      <FAQAccordion />
      <ContactSection />
    </>
  )
}
