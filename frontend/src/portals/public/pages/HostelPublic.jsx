import { Link } from 'react-router-dom'
import {
  Home,
  ShieldCheck,
  Users,
  Bed,
  Utensils,
  Stethoscope,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const HOSTEL_FEATURES = [
  {
    title: 'Secure Hostel Facility',
    desc: 'Safe residential environment with supervision, student support, and managed access.',
    icon: ShieldCheck,
  },
  {
    title: 'Room Management',
    desc: 'Organized room allocation, capacity tracking, occupancy records, and hostel administration.',
    icon: Bed,
  },
  {
    title: 'Warden Support',
    desc: 'Dedicated hostel wardens and staff support student discipline, safety, and daily needs.',
    icon: Users,
  },
  {
    title: 'Dining Support',
    desc: 'Structured dining and student care support for healthy residential campus life.',
    icon: Utensils,
  },
  {
    title: 'Medical Support',
    desc: 'Health and wellness support with medical assistance and emergency coordination.',
    icon: Stethoscope,
  },
  {
    title: 'Study Environment',
    desc: 'A peaceful environment encouraging discipline, academic focus, and personal growth.',
    icon: BookOpen,
  },
]

export default function HostelPublic() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/building.jpeg"
          alt="EduNova hostel"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Home size={16} /> Hostel
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Safe and Supportive Hostel Facilities for Students
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova hostel facilities are designed to provide a safe,
              disciplined, supportive, and student-friendly residential
              environment.
            </p>

            <Link to="/contact" className="inline-flex items-center gap-2 btn-primary">
              Contact Hostel Office <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Residential Campus Life
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              A Safe Environment for Learning, Discipline, and Growth
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              The hostel system supports room allocation, wardens, student
              supervision, occupancy tracking, residential care, safety, and
              student development.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Hostel life at EduNova encourages discipline, academic focus,
              teamwork, self-confidence, and responsible living in a supportive
              campus environment.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Safe and supervised residential facility',
                'Room and occupancy management',
                'Warden and student support',
                'Study-friendly environment',
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
              src="/exterior.jpeg"
              alt="EduNova hostel campus"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Student-Centered Hostel Care
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Safety, supervision, discipline, study support, and residential
                development.
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
                Hostel Services
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Complete Residential Support
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                EduNova hostel facilities support safety, care, study discipline,
                room management, and student wellbeing.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOSTEL_FEATURES.map(({ title, desc, icon: Icon }, index) => (
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