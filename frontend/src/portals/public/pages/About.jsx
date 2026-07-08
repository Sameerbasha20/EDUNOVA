import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const FEATURES = [
  {
    title: 'Academic Excellence',
    desc: 'CBSE and Cambridge curriculum with digital assessments, progress tracking, and strong academic planning.',
    icon: GraduationCap,
  },
  {
    title: 'Student Focused',
    desc: 'A learning environment focused on confidence, creativity, discipline, leadership, and lifelong learning.',
    icon: Users,
  },
  {
    title: 'Modern Campus',
    desc: 'Smart classrooms, science labs, computer labs, innovation centers, sports, and medical support.',
    icon: Building2,
  },
  {
    title: 'Digital Learning',
    desc: 'AI-powered learning analytics, LMS, online assessments, parent engagement, and digital campus systems.',
    icon: BookOpen,
  },
]

export default function About() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/Campus.jpeg"
          alt="EduNova Global Academy Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Sparkles size={15} /> About EduNova Global Academy
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Building Future-Ready Learners Through Excellence and Innovation
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova Global Academy integrates classroom learning with artificial
              intelligence, cloud technologies, online learning platforms, digital
              assessments, and parent engagement systems while emphasizing academic
              excellence, leadership, creativity, and lifelong learning.
            </p>

            <Link to="/admissions" className="inline-flex items-center gap-2 btn-primary">
              Start Application <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Introduction */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
              Who We Are
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              One of India's Leading Educational Institutions
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova Global Academy is a premium educational institution
              delivering world-class education through modern teaching
              methodologies, digital classrooms, and advanced academic management
              systems.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              The academy combines academic excellence with technology-driven
              education by providing smart classrooms, learning management systems,
              online assessments, digital libraries, student analytics, and complete
              ERP solutions.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-bg-light rounded-2xl p-5 border border-gray-100">
                <p className="font-numbers text-3xl font-extrabold text-primary">
                  6,500+
                </p>
                <p className="text-sm text-text-secondary">Students</p>
              </div>

              <div className="bg-bg-light rounded-2xl p-5 border border-gray-100">
                <p className="font-numbers text-3xl font-extrabold text-accent">
                  350+
                </p>
                <p className="text-sm text-text-secondary">Teachers</p>
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
                alt="EduNova Global Academy"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  Future-Ready Education
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Smart classrooms, digital learning, innovation labs, and holistic student development.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Vision Mission */}
      <section className="bg-bg-light">
        <div className="section grid md:grid-cols-2 gap-6">
          <FadeIn>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <ShieldCheck size={28} className="text-accent" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-primary mb-3">
                Our Mission
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                To provide high-quality education through modern digital learning
                environments that inspire creativity, leadership, innovation, and
                lifelong learning.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
                <GraduationCap size={28} className="text-secondary" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-primary mb-3">
                Our Vision
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                To become one of Asia's most innovative educational institutions by
                integrating technology, academic excellence, and holistic student
                development.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Why Choose EduNova
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              A Complete Digital Learning Ecosystem
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              EduNova brings together academics, technology, campus life,
              communication, assessments, and student support in one connected
              educational environment.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ title, desc, icon: Icon }, index) => (
            <FadeIn key={title} delay={index * 60}>
              <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Icon
                    size={24}
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>

                <h3 className="font-subheading font-bold text-primary mb-2">
                  {title}
                </h3>

                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  {desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Campus */}
      <section className="bg-bg-light">
        <div className="section grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/building.jpeg"
                alt="EduNova campus building"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div>
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Our Campus
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
                Designed for Learning, Growth, and Innovation
              </h2>

              <p className="font-body text-text-secondary leading-relaxed mb-6">
                Our campus provides a safe, modern, and engaging environment with
                smart classrooms, laboratories, digital library, sports areas,
                student activity spaces, and technology-enabled academic systems.
              </p>

              <Link to="/facilities" className="inline-flex items-center gap-2 btn-outline">
                Explore Facilities <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}