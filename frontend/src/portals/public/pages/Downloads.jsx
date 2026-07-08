import { Link } from 'react-router-dom'
import {
  Download,
  FileText,
  BookOpen,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'
import { publicImages } from '../../../constants/publicImages'

const DOWNLOADS = [
  {
    title: 'Admission Prospectus',
    filename: 'edunova-admission-prospectus.txt',
    desc: 'Complete information about EduNova programs, admission process, academic structure, and campus facilities.',
    type: 'TXT',
    icon: FileText,
    content:
      'EduNova Global Academy Admission Prospectus\n\nPrograms: Pre Primary, Middle School, High School, Senior Secondary, CBSE, Cambridge Curriculum, International Programs, STEM Education, Skill Development.\n\nAdmission Process: Online registration, application review, confirmation, document verification, and onboarding.',
  },
  {
    title: 'Fee Structure',
    filename: 'edunova-fee-structure.txt',
    desc: 'Class-wise fee details, payment schedule, transport fee, hostel fee, and scholarship information.',
    type: 'TXT',
    icon: ClipboardList,
    content:
      'EduNova Global Academy Fee Structure\n\nThis document includes tuition fee, transport fee, hostel fee, scholarship information, and payment schedule. Final fee values should be updated by the administration team.',
  },
  {
    title: 'Academic Calendar',
    filename: 'edunova-academic-calendar.txt',
    desc: 'Important dates, exam schedule, events, holidays, activities, and academic planning information.',
    type: 'TXT',
    icon: BookOpen,
    content:
      'EduNova Global Academy Academic Calendar\n\nIncludes academic sessions, examination windows, holidays, events, sports day, parent meetings, result dates, and student activities.',
  },
  {
    title: 'Parent Handbook',
    filename: 'edunova-parent-handbook.txt',
    desc: 'Guidelines for parents about communication, attendance, homework, assessments, and student support.',
    type: 'TXT',
    icon: ShieldCheck,
    content:
      'EduNova Global Academy Parent Handbook\n\nGuidelines for attendance, homework, assignments, fee payments, teacher communication, PTM booking, transport, student support, and school policies.',
  },
]

export default function Downloads() {
  const downloadFile = (item) => {
    const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = item.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src={publicImages.library1}
          alt="EduNova Downloads"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Download size={16} /> Downloads
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Important Documents and Academic Resources
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              Access admission documents, academic resources, parent guides,
              circulars, calendars, and school-related downloads.
            </p>

            <Link to="/admissions" className="inline-flex items-center gap-2 btn-primary">
              Start Admission <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Resource Center
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Everything Parents and Students Need in One Place
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova’s download center provides important documents for
              admissions, academics, fees, school policies, parent communication,
              and student support.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Admission forms and prospectus',
                'Academic calendars and notices',
                'Parent handbook and guidelines',
                'Fee structure and document checklist',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-bg-light rounded-2xl p-4 border border-gray-100"
                >
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-text-primary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={publicImages.tabletLearning}
              alt="EduNova digital downloads"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Digital Resource Access
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Important school documents, academic files, and parent resources.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Available Downloads
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Download School Resources
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                These documents help parents and students understand admissions,
                academics, policies, and campus processes.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOWNLOADS.map(({ title, desc, type, icon: Icon, ...item }, index) => (
              <FadeIn key={title} delay={index * 50}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <Icon size={26} className="text-primary group-hover:text-white transition-colors" />
                  </div>

                  <span className="inline-block bg-accent/10 text-accent text-xs font-subheading font-bold px-3 py-1 rounded-full mb-3">
                    {type}
                  </span>

                  <h3 className="font-subheading font-bold text-primary text-lg mb-2">
                    {title}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-5">
                    {desc}
                  </p>

                  <button
                    type="button"
                    onClick={() => downloadFile({ title, desc, type, icon: Icon, ...item })}
                    className="inline-flex items-center justify-center gap-2 btn-primary w-full"
                  >
                    Download <Download size={16} />
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}