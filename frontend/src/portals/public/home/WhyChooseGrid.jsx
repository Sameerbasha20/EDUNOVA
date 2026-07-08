import {
  Building2, Monitor, Users, Brain, Smartphone, CreditCard,
  ClipboardCheck, BookOpen, Bot, FlaskConical, Compass, HeadphonesIcon,
} from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

// Maps each "Why Choose EduNova" title (from seed data) to a real icon.
// Falls back to a generic icon for any title added later via admin that
// isn't in this map yet, so new content never breaks the layout.
const ICON_MAP = {
  'Smart Campus': Building2,
  'Digital Classrooms': Monitor,
  'Experienced Faculty': Users,
  'AI Learning Analytics': Brain,
  'Parent Mobile App': Smartphone,
  'Online Fee Payments': CreditCard,
  'Digital Attendance': ClipboardCheck,
  'CBSE Curriculum': BookOpen,
  'Robotics Lab': Bot,
  'STEM Education': FlaskConical,
  'Career Counseling': Compass,
  '24x7 Parent Support': HeadphonesIcon,
}

export default function WhyChooseGrid() {
  const { data: items, loading } = useFetch(cmsApi.getWhyChoose, [])

  return (
    <section className="bg-white">
      <div className="section">
        <FadeIn>
          <h2 className="font-heading text-3xl font-bold text-center mb-2">Why Choose EduNova</h2>
          <p className="font-body text-text-secondary text-center mb-10 max-w-xl mx-auto">
            A premium, technology-driven learning environment built around every student.
          </p>
        </FadeIn>
        {loading ? (
          <p className="text-center text-text-secondary">Loading…</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(items || []).map((item, i) => {
              const Icon = ICON_MAP[item.title] || Building2
              return (
                <FadeIn key={item.id} delay={i * 60}>
                  <div className="card h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <h3 className="font-subheading font-bold text-text-primary">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
