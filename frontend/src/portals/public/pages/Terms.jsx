import { FileCheck2, ShieldCheck, GraduationCap, CreditCard, Mail } from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const TERMS = [
  {
    title: 'Website Usage',
    icon: FileCheck2,
    points: [
      'The website is intended for academic, admission, communication, and informational purposes.',
      'Users must provide accurate information in forms and enquiries.',
      'Misuse of the website, forms, or digital services is not allowed.',
    ],
  },
  {
    title: 'Admissions',
    icon: GraduationCap,
    points: [
      'Submitting an admission enquiry does not guarantee admission.',
      'Applications are reviewed by the admissions team.',
      'Final admission depends on eligibility, seat availability, document verification, and academy policies.',
    ],
  },
  {
    title: 'Fees and Payments',
    icon: CreditCard,
    points: [
      'Fee details are subject to official confirmation by the administration office.',
      'Payment schedules, transport fees, hostel fees, and scholarships may vary by program.',
      'Parents should confirm official fee information before making decisions.',
    ],
  },
  {
    title: 'Data and Security',
    icon: ShieldCheck,
    points: [
      'Users are responsible for sharing correct contact and admission details.',
      'EduNova follows standard security and confidentiality practices.',
      'Student, parent, and staff information is handled only for authorized academic and administrative use.',
    ],
  },
]

export default function Terms() {
  return (
    <main className="bg-white">
      <section className="bg-primary text-white">
        <div className="section py-24">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <FileCheck2 size={16} /> Terms & Conditions
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Terms & Conditions
            </h1>

            <p className="font-body text-blue-100 max-w-2xl text-lg leading-relaxed">
              These terms explain the basic rules and conditions for using the
              EduNova Global Academy website and digital services.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <FadeIn>
          <div className="max-w-4xl mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary mb-4">
              General Terms
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              By using the EduNova Global Academy website, users agree to use the
              platform responsibly and provide accurate information when submitting
              admissions, contact, or enquiry forms. The website content is
              provided for informational and communication purposes.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {TERMS.map(({ title, points, icon: Icon }, index) => (
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
                  Contact for Terms Clarification
                </h3>

                <p className="font-body text-text-secondary leading-relaxed">
                  For clarification about admissions, website usage, fee details,
                  privacy, or institutional policies, contact EduNova Global
                  Academy through the Contact page.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  )
}