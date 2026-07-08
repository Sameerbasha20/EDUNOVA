import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Mail,
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const FALLBACK_LEADERSHIP = [
  {
    id: 'principal',
    name: 'Dr. Meera Sharma',
    designation: 'Principal',
    bio: 'Academic leader focused on digital education, student excellence, innovation, and holistic learning.',
    photo: '/EduNova.jpeg',
  },
  {
    id: 'academic-director',
    name: 'Mr. Arvind Rao',
    designation: 'Academic Director',
    bio: 'Leads curriculum planning, academic quality, assessment strategy, and teacher development programs.',
    photo: '/student.jpeg',
  },
  {
    id: 'cambridge-coordinator',
    name: 'Ms. Nandita Iyer',
    designation: 'Cambridge Coordinator',
    bio: 'Supports international curriculum delivery, inquiry-based learning, and global academic standards.',
    photo: '/Campus.jpeg',
  },
  {
    id: 'stem-head',
    name: 'Mr. Rohan Kapoor',
    designation: 'Head of STEM & Innovation',
    bio: 'Guides robotics, STEM education, innovation projects, student research, and future skills.',
    photo: '/building.jpeg',
  },
]

const FACULTY_STRENGTHS = [
  {
    title: 'Experienced Educators',
    desc: 'Qualified teachers with strong academic experience and subject expertise.',
    icon: Users,
  },
  {
    title: 'Digital Teaching',
    desc: 'Faculty trained for smart classrooms, LMS, digital assessments, and online learning tools.',
    icon: BookOpen,
  },
  {
    title: 'Student Mentoring',
    desc: 'Personalized guidance, academic support, counselling, and performance monitoring.',
    icon: ShieldCheck,
  },
  {
    title: 'Innovation Culture',
    desc: 'Teachers encourage robotics, STEM learning, projects, creativity, and leadership.',
    icon: Lightbulb,
  },
]

export default function Faculty() {
  const { data: leadership, loading } = useFetch(cmsApi.getLeadership, [])

  const members =
    leadership && leadership.length > 0
      ? leadership.map((item, index) => ({
          ...item,
          photo: item.photo || FALLBACK_LEADERSHIP[index % FALLBACK_LEADERSHIP.length].photo,
          bio:
            item.bio ||
            'Dedicated academic leader supporting EduNova Global Academy’s student-centered learning ecosystem.',
        }))
      : FALLBACK_LEADERSHIP

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/student.jpeg"
          alt="EduNova Faculty and Leadership"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <GraduationCap size={16} /> Faculty & Leadership
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Guided by Experienced Educators and Academic Leaders
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova Global Academy is led by experienced educators who combine
              strong academic foundations with digital teaching, student mentoring,
              innovation, and holistic development.
            </p>

            <Link to="/contact" className="inline-flex items-center gap-2 btn-primary">
              Contact Academic Office <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Our Educators
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              350+ Experienced Teachers Supporting Every Learner
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova’s faculty team includes experienced teachers, academic
              coordinators, department heads, digital learning mentors, and
              student support leaders.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              The teaching approach combines classroom instruction, digital
              learning tools, continuous assessments, student analytics, parent
              communication, STEM activities, and personalized guidance.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-bg-light rounded-2xl p-5 border border-gray-100">
                <p className="font-numbers text-3xl font-extrabold text-primary">
                  350+
                </p>
                <p className="text-sm text-text-secondary">Teachers</p>
              </div>

              <div className="bg-bg-light rounded-2xl p-5 border border-gray-100">
                <p className="font-numbers text-3xl font-extrabold text-accent">
                  25+
                </p>
                <p className="text-sm text-text-secondary">Departments</p>
              </div>

              <div className="bg-bg-light rounded-2xl p-5 border border-gray-100">
                <p className="font-numbers text-3xl font-extrabold text-secondary">
                  98%
                </p>
                <p className="text-sm text-text-secondary">Board Results</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-secondary/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/EduNova.jpeg"
                alt="EduNova leadership"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  Academic Leadership
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Strong leadership, teacher development, digital learning, and
                  student-centered academic planning.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Strengths */}
      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Faculty Strengths
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Teaching Excellence with Digital Innovation
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                Our faculty support academics, digital learning, mentoring,
                examinations, co-curricular development, and student success.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FACULTY_STRENGTHS.map(({ title, desc, icon: Icon }, index) => (
              <FadeIn key={title} delay={index * 50}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <Icon
                      size={26}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>

                  <h3 className="font-subheading font-bold text-primary text-lg mb-2">
                    {title}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Leadership Team
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Meet Our Academic Leadership
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              EduNova is led by academic professionals committed to excellence,
              innovation, discipline, creativity, and lifelong learning.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading faculty…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member, index) => (
              <FadeIn key={member.id || member.name} delay={index * 50}>
                <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-subheading font-bold text-white text-lg">
                        {member.name}
                      </p>
                      <p className="font-body text-sm text-white/85">
                        {member.designation}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      {member.bio}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-accent font-subheading font-bold text-sm">
                      <Mail size={16} />
                      Academic Office
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Award size={32} className="text-highlight" />
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Learn from Dedicated Teachers and Mentors
            </h2>

            <p className="font-body text-blue-100 leading-relaxed mb-8">
              EduNova’s faculty are committed to academic excellence, digital
              learning, student growth, creativity, and future-ready education.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions" className="btn-primary">
                Apply Now
              </Link>

              <Link
                to="/academics"
                className="border-2 border-white text-white font-subheading font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                View Academics
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}