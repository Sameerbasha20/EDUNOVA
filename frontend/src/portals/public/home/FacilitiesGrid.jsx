import {
  Monitor,
  FlaskConical,
  Cpu,
  Lightbulb,
  Bot,
  BookOpenText,
  Dumbbell,
  Stethoscope,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import FadeIn from '../../../components/FadeIn'

const FACILITIES = [
  { name: 'Smart Classrooms', icon: Monitor, desc: 'Technology-enabled digital classrooms for interactive learning.' },
  { name: 'Science Labs', icon: FlaskConical, desc: 'Modern science labs for practical experiments and innovation.' },
  { name: 'Computer Labs', icon: Cpu, desc: 'Advanced computer labs supporting digital learning and coding.' },
  { name: 'Innovation Centers', icon: Lightbulb, desc: 'Creative spaces for research, projects, and future-ready learning.' },
  { name: 'Robotics Lab', icon: Bot, desc: 'Robotics and STEM learning for problem-solving skills.' },
  { name: 'Digital Library', icon: BookOpenText, desc: 'Digital resources, e-books, and academic learning support.' },
  { name: 'Sports Complex', icon: Dumbbell, desc: 'Sports facilities for physical development and discipline.' },
  { name: 'Medical Center', icon: Stethoscope, desc: 'Health support and student wellness facilities on campus.' },
]

export default function FacilitiesGrid() {
  return (
    <section className="bg-bg-light">
      <div className="section">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Content */}
          <FadeIn>
            <div>
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Campus Facilities
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-text-primary">
                Modern Facilities for Smart, Safe, and Holistic Learning
              </h2>

              <p className="font-body text-text-secondary leading-relaxed mb-6">
                EduNova Global Academy provides smart classrooms, science labs,
                computer labs, innovation centers, digital library, sports complex,
                medical center, and student-focused learning spaces.
              </p>

              <Link
                to="/facilities"
                className="inline-flex items-center gap-2 btn-outline"
              >
                Explore Facilities <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>

          {/* Right Image */}
          <FadeIn delay={100}>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-36 h-36 bg-highlight/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-secondary/20 rounded-full blur-2xl" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
                <img
                  src="/building.jpeg"
                  alt="EduNova modern campus facilities"
                  className="w-full h-[400px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                  <h3 className="font-heading font-bold text-primary text-lg mb-1">
                    100% Digital Campus
                  </h3>
                  <p className="font-body text-sm text-text-secondary">
                    Smart classrooms, innovation labs, digital library, and
                    technology-enabled academic infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Facility Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {FACILITIES.map(({ name, icon: Icon, desc }, i) => (
            <FadeIn key={name} delay={i * 50}>
              <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-13 h-13 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                  <Icon
                    size={24}
                    className="text-secondary group-hover:text-white transition-colors"
                  />
                </div>

                <h3 className="font-subheading font-bold text-primary mb-2">
                  {name}
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
  )
}