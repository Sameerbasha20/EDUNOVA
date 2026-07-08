import { Link } from 'react-router-dom'
import {
  Building2,
  GraduationCap,
  UserRoundCheck,
  Bus,
  Library,
  Wallet,
  Calculator,
  Users,
  Monitor,
  FileCheck2,
  Trophy,
  Home,
  Stethoscope,
  Microscope,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const FALLBACK_DEPARTMENTS = [
  {
    name: 'Academic Affairs',
    description: 'Manages curriculum planning, academic standards, learning outcomes, and academic operations.',
    icon: GraduationCap,
  },
  {
    name: 'Admissions',
    description: 'Handles admission enquiries, online registrations, application review, and student onboarding.',
    icon: UserRoundCheck,
  },
  {
    name: 'Student Services',
    description: 'Supports student welfare, counselling, mentoring, documentation, and campus assistance.',
    icon: Users,
  },
  {
    name: 'Transport',
    description: 'Manages school buses, routes, GPS tracking, drivers, pickup points, and student allocation.',
    icon: Bus,
  },
  {
    name: 'Library',
    description: 'Maintains physical books, digital library resources, e-books, issue/return, and reading support.',
    icon: Library,
  },
  {
    name: 'Finance',
    description: 'Handles financial planning, fee structures, payments, reporting, and institutional budgeting.',
    icon: Wallet,
  },
  {
    name: 'Accounts',
    description: 'Manages fee records, receipts, payroll coordination, invoices, and financial documentation.',
    icon: Calculator,
  },
  {
    name: 'Human Resources',
    description: 'Handles recruitment, staff records, payroll support, leaves, employee onboarding, and policies.',
    icon: Users,
  },
  {
    name: 'IT Department',
    description: 'Maintains digital campus systems, LMS, ERP, security, devices, and technical support.',
    icon: Monitor,
  },
  {
    name: 'Examination Cell',
    description: 'Handles exam schedules, hall tickets, marks entry, results, report cards, and certificates.',
    icon: FileCheck2,
  },
  {
    name: 'Sports',
    description: 'Promotes physical education, sports activities, tournaments, discipline, and team development.',
    icon: Trophy,
  },
  {
    name: 'Hostel',
    description: 'Manages hostel facilities, rooms, wardens, student safety, occupancy, and residential support.',
    icon: Home,
  },
  {
    name: 'Medical Center',
    description: 'Provides student health support, medical logs, wellness checks, and emergency care assistance.',
    icon: Stethoscope,
  },
  {
    name: 'Research',
    description: 'Encourages academic research, innovation projects, student inquiry, and faculty development.',
    icon: Microscope,
  },
  {
    name: 'Innovation Lab',
    description: 'Supports STEM learning, robotics, creative projects, technology experiments, and future skills.',
    icon: Lightbulb,
  },
]

const ICON_MAP = {
  'Academic Affairs': GraduationCap,
  Admissions: UserRoundCheck,
  'Student Services': Users,
  Transport: Bus,
  Library,
  Finance: Wallet,
  Accounts: Calculator,
  'Human Resources': Users,
  HR: Users,
  'IT Department': Monitor,
  'Examination Cell': FileCheck2,
  Sports: Trophy,
  Hostel: Home,
  'Medical Center': Stethoscope,
  Research: Microscope,
  'Innovation Lab': Lightbulb,
}

export default function Departments() {
  const { data: departments, loading } = useFetch(cmsApi.getDepartments, [])

  const departmentsToShow =
    departments && departments.length > 0
      ? departments.map((department) => ({
          ...department,
          icon: ICON_MAP[department.name] || Building2,
          description:
            department.description ||
            'Dedicated department supporting EduNova Global Academy operations and student success.',
        }))
      : FALLBACK_DEPARTMENTS

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/building.jpeg"
          alt="EduNova departments"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Building2 size={16} /> Academy Departments
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Organized Departments for a Complete School Ecosystem
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova Global Academy is supported by dedicated academic,
              administrative, student service, technology, transport, library,
              hostel, sports, medical, research, and innovation departments.
            </p>

            <Link to="/contact" className="inline-flex items-center gap-2 btn-primary">
              Contact Administration <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Department Structure
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Every Department Works Together for Student Success
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              A successful digital academy needs more than classrooms. EduNova
              connects academic operations, admissions, student services, finance,
              transport, library, hostel, sports, medical support, IT, research,
              and innovation through a coordinated school management ecosystem.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Each department supports a specific part of the student journey,
              ensuring transparent communication, smooth operations, safe campus
              services, and high-quality academic delivery.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Academic and administrative coordination',
                'Digital ERP-supported operations',
                'Student services and parent communication',
                'Campus safety, transport, and support systems',
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
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-secondary/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/Campus.jpeg"
                alt="EduNova campus departments"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  Connected Campus Operations
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Academic, student, administrative, and support departments
                  working together through digital systems.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Departments Grid */}
      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Our Departments
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Departments Supporting the EduNova Ecosystem
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                Explore the key departments responsible for academics,
                administration, campus operations, student support, safety,
                innovation, and digital transformation.
              </p>
            </div>
          </FadeIn>

          {loading ? (
            <p className="text-center text-text-secondary">Loading departments…</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentsToShow.map(({ id, name, description, icon: Icon }, index) => (
                <FadeIn key={id || name} delay={index * 40}>
                  <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                      <Icon
                        size={27}
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>

                    <h3 className="font-subheading font-bold text-primary text-lg mb-2">
                      {name}
                    </h3>

                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      {description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Department Support */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/student.jpeg"
              alt="EduNova student services"
              className="w-full h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Student-Centered Support
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Every department contributes to student safety, growth, academic
                excellence, and campus experience.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Integrated Operations
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Digital Coordination Across All Departments
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova’s department structure is designed to support a complete
              school ERP and learning management ecosystem. Departments can
              coordinate admissions, academics, attendance, examinations, library,
              transport, hostel, HR, finance, communication, notifications, and
              reports through connected digital workflows.
            </p>

            <div className="space-y-4">
              {[
                'Centralized academic and administrative workflows',
                'Student, parent, teacher, and admin coordination',
                'Digital records, reports, notices, and communication',
                'Campus operations connected with ERP modules',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle2 size={17} className="text-secondary" />
                  </div>
                  <p className="font-body text-text-primary">{item}</p>
                </div>
              ))}
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 btn-outline mt-8"
            >
              Contact Office <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Need Help from a Specific Department?
            </h2>

            <p className="font-body text-blue-100 leading-relaxed mb-8">
              Contact EduNova Global Academy for admissions, academic support,
              transport, library, finance, student services, or campus operations.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>

              <Link
                to="/admissions"
                className="border-2 border-white text-white font-subheading font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}