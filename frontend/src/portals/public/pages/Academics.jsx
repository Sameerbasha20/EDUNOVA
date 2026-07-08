import { Link } from 'react-router-dom'
import {
  GraduationCap,
  BookOpen,
  Globe2,
  Atom,
  Brain,
  School,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const PROGRAMS = [
  {
    title: 'Pre Primary',
    desc: 'Foundational learning through play, communication, creativity, motor skills, and early confidence building.',
    icon: School,
  },
  {
    title: 'Middle School',
    desc: 'Concept-based learning with strong academic foundations, projects, activities, and digital classroom support.',
    icon: BookOpen,
  },
  {
    title: 'High School',
    desc: 'Structured academic preparation with subject mastery, assessments, mentoring, and performance tracking.',
    icon: GraduationCap,
  },
  {
    title: 'Senior Secondary',
    desc: 'Focused academic pathways for higher education readiness, competitive preparation, and career direction.',
    icon: Brain,
  },
  {
    title: 'Cambridge Curriculum',
    desc: 'International learning approach with inquiry-based education, global exposure, and skill-based assessment.',
    icon: Globe2,
  },
  {
    title: 'CBSE',
    desc: 'National curriculum with strong academic structure, board exam preparation, and continuous evaluation.',
    icon: CheckCircle2,
  },
  {
    title: 'International Programs',
    desc: 'Global learning opportunities, digital exposure, leadership activities, and future-ready academic experiences.',
    icon: Globe2,
  },
  {
    title: 'STEM Education',
    desc: 'Science, technology, engineering, and mathematics learning through projects, labs, robotics, and innovation.',
    icon: Atom,
  },
  {
    title: 'Skill Development',
    desc: 'Communication, leadership, problem-solving, creativity, digital literacy, and life skills for every learner.',
    icon: Sparkles,
  },
]

const HIGHLIGHTS = [
  'CBSE and Cambridge curriculum options',
  'AI-powered learning analytics',
  'Digital classrooms and online assessments',
  'STEM, robotics, and innovation-focused learning',
  'Personalized student progress monitoring',
  'Career guidance and skill development',
]

export default function Academics() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/student.jpeg"
          alt="EduNova academic programs"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <GraduationCap size={16} /> Academics at EduNova
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Academic Programs Designed for Future-Ready Learners
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              From Pre-Primary to Senior Secondary, EduNova Global Academy offers
              CBSE, Cambridge, International Programs, STEM Education, and Skill
              Development pathways supported by digital learning systems.
            </p>

            <Link
              to="/admissions"
              className="inline-flex items-center gap-2 btn-primary"
            >
              Apply for Admission <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Academic Excellence
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              A Complete Learning Journey from Foundation to Future
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova Global Academy combines academic excellence with
              technology-driven education through smart classrooms, learning
              management systems, online assessments, digital libraries, student
              analytics, and complete academic support.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Our programs support every stage of student growth — from early
              learning and middle school foundations to board exam preparation,
              STEM learning, leadership development, and global curriculum exposure.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-bg-light rounded-2xl p-4 border border-gray-100"
                >
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-text-primary">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-accent/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/Campus.jpeg"
                alt="EduNova classroom learning"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  Smart Academic Ecosystem
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Digital classrooms, online assessments, learning analytics,
                  STEM education, and personalized academic progress.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Programs */}
      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Our Academic Programs
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Programs for Every Stage of Learning
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                The client requirement includes Pre Primary, Middle School, High
                School, Senior Secondary, Cambridge Curriculum, CBSE, International
                Programs, STEM Education, and Skill Development programs. 
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map(({ title, desc, icon: Icon }, index) => (
              <FadeIn key={title} delay={index * 50}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <Icon
                      size={27}
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

      {/* Learning Approach */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/building.jpeg"
              alt="EduNova academic infrastructure"
              className="w-full h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Learning Beyond Classrooms
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Innovation labs, robotics, digital library, science labs, and
                skill-building activities.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Teaching Methodology
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Technology-Driven Learning with Strong Academic Foundations
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova integrates classroom teaching with AI-powered academic
              management systems, cloud technologies, online learning platforms,
              digital assessments, student analytics, and parent engagement
              systems.
            </p>

            <div className="space-y-4">
              {[
                'Smart classroom-based learning',
                'Continuous assessment and progress tracking',
                'Project-based STEM and robotics exposure',
                'Digital learning resources and LMS support',
                'Student mentoring and parent engagement',
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
              to="/facilities"
              className="inline-flex items-center gap-2 btn-outline mt-8"
            >
              View Facilities <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Start Your Academic Journey with EduNova
            </h2>

            <p className="font-body text-blue-100 leading-relaxed mb-8">
              Choose a future-ready academic environment built on excellence,
              innovation, discipline, creativity, and digital transformation.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions" className="btn-primary">
                Start Application
              </Link>

              <Link
                to="/contact"
                className="border-2 border-white text-white font-subheading font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                Contact Admissions
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}