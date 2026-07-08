import { ShieldCheck, Lock, Users, FileText, Mail } from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const SECTIONS = [
  {
    title: 'Information We Collect',
    icon: FileText,
    points: [
      'Student admission enquiry details',
      'Parent or guardian contact information',
      'Academic and communication-related information',
      'Contact form submissions and support requests',
    ],
  },
  {
    title: 'How We Use Information',
    icon: Users,
    points: [
      'To process admission enquiries',
      'To communicate with parents and guardians',
      'To manage academic, administrative, and student support services',
      'To improve school communication and digital services',
    ],
  },
  {
    title: 'Data Protection',
    icon: Lock,
    points: [
      'Information is handled with confidentiality',
      'Access is limited to authorized school staff',
      'Digital systems are protected using standard security practices',
      'Sensitive information is not publicly shared',
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <main className="bg-white">
      <section className="bg-primary text-white">
        <div className="section py-24">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <ShieldCheck size={16} /> Privacy Policy
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Privacy Policy
            </h1>

            <p className="font-body text-blue-100 max-w-2xl text-lg leading-relaxed">
              EduNova Global Academy respects the privacy of students, parents,
              guardians, staff, and visitors using our digital services.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <FadeIn>
          <div className="max-w-4xl mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
              Our Commitment to Privacy
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              This Privacy Policy explains how EduNova Global Academy collects,
              uses, protects, and manages information submitted through the
              website, admissions forms, contact forms, and digital school
              services. The information shared with the academy is used only for
              academic, administrative, communication, and student support purposes.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {SECTIONS.map(({ title, points, icon: Icon }, index) => (
            <FadeIn key={title} delay={index * 60}>
              <div className="bg-bg-light rounded-3xl p-6 border border-gray-100 h-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon size={26} className="text-primary" />
                </div>

                <h3 className="font-heading text-xl font-bold text-primary mb-4">
                  {title}
                </h3>

                <ul className="space-y-3">
                  {points.map((point) => (
                    <li key={point} className="font-body text-sm text-text-secondary leading-relaxed">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <Mail size={26} className="text-accent" />
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-3">
                  Contact for Privacy Questions
                </h3>

                <p className="font-body text-text-secondary leading-relaxed">
                  For questions about privacy, data usage, admissions data, or
                  parent/student information, please contact the EduNova Global
                  Academy administration office through the Contact page.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  )
}