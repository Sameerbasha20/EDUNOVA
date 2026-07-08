import { Link } from 'react-router-dom'
import {
  Building2,
  Monitor,
  FlaskConical,
  Cpu,
  Lightbulb,
  BookOpenText,
  ShieldCheck,
  Wifi,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const INFRA_ITEMS = [
  {
    title: 'Smart Classrooms',
    desc: 'Technology-enabled classrooms for interactive teaching and digital content delivery.',
    icon: Monitor,
  },
  {
    title: 'Science Laboratories',
    desc: 'Well-equipped practical labs supporting physics, chemistry, biology, and applied learning.',
    icon: FlaskConical,
  },
  {
    title: 'Computer Labs',
    desc: 'Modern systems supporting digital literacy, coding, online learning, and academic technology.',
    icon: Cpu,
  },
  {
    title: 'Innovation Centers',
    desc: 'Creative project spaces for robotics, STEM education, research, and student innovation.',
    icon: Lightbulb,
  },
  {
    title: 'Digital Library',
    desc: 'Access to books, e-resources, academic content, reading zones, and digital learning support.',
    icon: BookOpenText,
  },
  {
    title: 'Secure Campus',
    desc: 'Safe campus infrastructure with student monitoring, emergency support, and managed access.',
    icon: ShieldCheck,
  },
]

export default function Infrastructure() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/building.jpeg"
          alt="EduNova infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Building2 size={16} /> Campus Infrastructure
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Modern Infrastructure for Digital and Holistic Learning
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova Global Academy provides smart classrooms, laboratories,
              digital learning spaces, innovation centers, library resources,
              safety systems, and campus-wide academic infrastructure.
            </p>

            <Link to="/facilities" className="inline-flex items-center gap-2 btn-primary">
              Explore Facilities <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Overview */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Future-Ready Campus
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              A Campus Built for Academic Excellence and Innovation
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova’s infrastructure supports a complete digital academic
              ecosystem. The campus is designed for classroom learning, laboratory
              practice, online learning, student collaboration, innovation, sports,
              safety, and student support.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              The infrastructure connects physical learning spaces with modern
              technology, giving students access to smart classrooms, digital
              library resources, STEM labs, innovation spaces, and campus services.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Smart classrooms and digital boards',
                'Science, computer, and innovation labs',
                'Digital library and academic resources',
                'Safe, secure, and student-friendly campus',
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
                alt="EduNova campus"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  100% Digital Campus Vision
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Digital learning, online assessments, smart classrooms, cloud
                  systems, and student engagement tools.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Infrastructure Cards */}
      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Infrastructure Highlights
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Facilities that Support Every Learning Need
              </h2>

              <p className="font-body text-text-secondary leading-relaxed">
                From smart classrooms to innovation labs, EduNova provides a
                modern infrastructure environment for academic growth and student
                development.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INFRA_ITEMS.map(({ title, desc, icon: Icon }, index) => (
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

      {/* Digital Campus */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/exterior.jpeg"
              alt="EduNova exterior infrastructure"
              className="w-full h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Secure and Connected Campus
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Academic spaces, safety systems, digital learning, campus services,
                and technology-enabled student support.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Digital Infrastructure
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Technology-Enabled Learning Environment
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova’s digital infrastructure supports online learning platforms,
              digital assessments, LMS access, student analytics, parent engagement,
              communication systems, and academic reporting.
            </p>

            <div className="space-y-4">
              {[
                'Campus-wide digital learning support',
                'Learning Management System integration',
                'Online assessments and academic analytics',
                'Parent, teacher, and student communication systems',
                'Secure systems for school operations',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Wifi size={17} className="text-secondary" />
                  </div>
                  <p className="font-body text-text-primary">{item}</p>
                </div>
              ))}
            </div>

            <Link
              to="/student-life"
              className="inline-flex items-center gap-2 btn-outline mt-8"
            >
              View Student Life <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Experience a Campus Designed for the Future
            </h2>

            <p className="font-body text-blue-100 leading-relaxed mb-8">
              EduNova combines modern infrastructure, digital systems, academic
              spaces, safety, and student-focused facilities to create a complete
              learning environment.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admissions" className="btn-primary">
                Apply Now
              </Link>

              <Link
                to="/gallery"
                className="border-2 border-white text-white font-subheading font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                View Gallery
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}