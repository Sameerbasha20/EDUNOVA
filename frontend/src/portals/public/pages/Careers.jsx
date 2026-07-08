import { Link } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Users,
  HeartHandshake,
  BookOpen,
  Send,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'
import { publicImages } from '../../../constants/publicImages'

const fetchJobs =
  cmsApi.getJobPostings || cmsApi.getJobs || cmsApi.getCareers || (async () => [])

const fallbackJobs = [
  {
    id: '1',
    title: 'English Teacher',
    department: 'Academic Affairs',
    description: 'Responsible for classroom teaching, lesson planning, assessments, and student mentoring.',
    is_open: true,
  },
  {
    id: '2',
    title: 'STEM Faculty',
    department: 'Innovation Lab',
    description: 'Guide students in STEM projects, robotics, practical learning, and innovation activities.',
    is_open: true,
  },
  {
    id: '3',
    title: 'Admissions Counsellor',
    department: 'Admissions',
    description: 'Support admission enquiries, parent communication, documentation, and application follow-up.',
    is_open: true,
  },
]

const BENEFITS = [
  {
    title: 'Professional Growth',
    desc: 'Teacher development, training, academic leadership, and career growth opportunities.',
    icon: GraduationCap,
  },
  {
    title: 'Collaborative Culture',
    desc: 'Work with experienced educators, academic leaders, and student-focused teams.',
    icon: Users,
  },
  {
    title: 'Meaningful Impact',
    desc: 'Contribute to the growth, confidence, creativity, and success of students.',
    icon: HeartHandshake,
  },
  {
    title: 'Digital Teaching',
    desc: 'Use smart classrooms, LMS, digital assessments, and modern academic tools.',
    icon: BookOpen,
  },
]

export default function Careers() {
  const { data, loading } = useFetch(fetchJobs, [])
  const jobs = data && data.length > 0 ? data : fallbackJobs

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src={publicImages.campusBuilding2}
          alt="EduNova Careers"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Briefcase size={16} /> Careers
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Build Your Career with EduNova Global Academy
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              Join a future-ready educational institution focused on academic
              excellence, digital learning, innovation, student success, and
              holistic development.
            </p>

            <a href="#open-positions" className="inline-flex items-center gap-2 btn-primary">
              View Open Positions <ArrowRight size={18} />
            </a>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Work With Us
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Join an Institution Built on Excellence and Innovation
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova welcomes passionate teachers, academic leaders, counsellors,
              coordinators, digital learning experts, administration staff, and
              support teams who want to make a meaningful impact.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Our team works together to create a high-quality learning
              environment using academic planning, smart classrooms, digital
              systems, mentoring, innovation, and student-centered education.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Academic and teaching roles',
                'Digital learning and LMS support',
                'Admissions and administration',
                'Student services and operations',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-bg-light rounded-2xl p-4 border border-gray-100">
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
              src={publicImages.edunova}
              alt="EduNova career opportunities"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Shape the Future of Education
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Teach, mentor, lead, innovate, and contribute to student success.
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
                Why Join EduNova
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                A Professional Environment for Educators
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                EduNova supports educators and staff with a collaborative culture,
                professional growth, digital systems, and meaningful work.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ title, desc, icon: Icon }, index) => (
              <FadeIn key={title} delay={index * 50}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <Icon size={26} className="text-primary group-hover:text-white transition-colors" />
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

      <section id="open-positions" className="section">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Open Positions
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Current Career Opportunities
            </h2>
            <p className="font-body text-text-secondary leading-relaxed">
              Explore current openings and connect with the EduNova team.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading careers…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <FadeIn key={job.id || job.title} delay={index * 60}>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                    <Briefcase size={26} className="text-accent" />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-subheading font-bold">
                      {job.is_open === false ? 'Closed' : 'Open'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-subheading font-bold">
                      {job.department?.name || job.department || 'EduNova'}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-primary mb-3">
                    {job.title}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-5">
                    {job.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={16} className="text-accent" />
                      EduNova Campus
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock size={16} className="text-accent" />
                      Full Time
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 font-subheading font-bold text-accent hover:text-primary transition-colors"
                  >
                    Apply / Contact HR <Send size={16} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <Briefcase size={42} className="mx-auto text-highlight mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Ready to Join EduNova?
            </h2>
            <p className="font-body text-blue-100 leading-relaxed mb-8">
              Send your profile to the administration team or contact us for
              current openings in teaching, academic support, administration,
              and campus operations.
            </p>
            <Link to="/contact" className="btn-primary">
              Contact HR Team
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}