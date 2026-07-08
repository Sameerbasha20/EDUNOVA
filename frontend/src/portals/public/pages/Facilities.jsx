import { Link } from 'react-router-dom'
import {
  Monitor,
  FlaskConical,
  Cpu,
  Lightbulb,
  Bot,
  BookOpenText,
  Dumbbell,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const FACILITIES = [
  {
    title: 'Smart Classrooms',
    desc: 'Technology-enabled classrooms with digital boards, multimedia learning, and interactive teaching.',
    icon: Monitor,
  },
  {
    title: 'Science Labs',
    desc: 'Modern laboratories for Physics, Chemistry, Biology, practical learning, and experimentation.',
    icon: FlaskConical,
  },
  {
    title: 'Computer Labs',
    desc: 'Advanced computer labs supporting digital literacy, coding, online learning, and academic technology.',
    icon: Cpu,
  },
  {
    title: 'Innovation Centers',
    desc: 'Creative spaces for research, projects, STEM learning, and student innovation.',
    icon: Lightbulb,
  },
  {
    title: 'Robotics Lab',
    desc: 'Hands-on robotics and STEM-based learning to develop problem-solving and technical skills.',
    icon: Bot,
  },
  {
    title: 'Digital Library',
    desc: 'Physical and digital learning resources, e-books, reference materials, and academic support.',
    icon: BookOpenText,
  },
  {
    title: 'Sports Complex',
    desc: 'Facilities for indoor and outdoor sports, fitness, teamwork, discipline, and physical development.',
    icon: Dumbbell,
  },
  {
    title: 'Medical Center',
    desc: 'Student health support, wellness checks, basic medical assistance, and emergency care coordination.',
    icon: Stethoscope,
  },
]

export default function Facilities() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/building.jpeg"
          alt="EduNova campus facilities"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <ShieldCheck size={16} /> Campus Facilities
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Modern Facilities for Smart, Safe, and Holistic Learning
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova Global Academy provides smart classrooms, laboratories,
              innovation centers, robotics lab, digital library, sports complex,
              and student wellness facilities.
            </p>

            <Link to="/admissions" className="inline-flex items-center gap-2 btn-primary">
              Apply Now <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Future-Ready Campus
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Facilities Designed Around Student Growth
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              Our campus facilities support academic learning, practical exposure,
              digital education, innovation, sports, health, safety, and student
              development.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Every facility is designed to help students learn better, explore
              ideas, build confidence, and participate actively in academic and
              co-curricular life.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Smart classrooms and digital boards',
                'Science, computer, robotics, and innovation labs',
                'Digital library and academic resources',
                'Sports, wellness, and medical support',
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
              src="/Campus.jpeg"
              alt="EduNova campus"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                100% Digital Campus Vision
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Smart learning spaces, digital tools, safe campus systems, and
                student-focused facilities.
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
                Facility Highlights
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Complete Campus Facilities
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                EduNova provides academic, digital, sports, health, and innovation
                facilities for a complete learning experience.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACILITIES.map(({ title, desc, icon: Icon }, index) => (
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
    </main>
  )
}