import { Link } from 'react-router-dom'
import {
  Bus,
  MapPin,
  ShieldCheck,
  Clock,
  Users,
  Radio,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const TRANSPORT_FEATURES = [
  {
    title: 'School Bus Routes',
    desc: 'Organized route planning covering student pickup and drop points across key locations.',
    icon: Bus,
  },
  {
    title: 'Pickup Points',
    desc: 'Defined pickup and drop locations for safe and systematic student transportation.',
    icon: MapPin,
  },
  {
    title: 'GPS Tracking',
    desc: 'Digital tracking support for route monitoring, safety, and operational visibility.',
    icon: Radio,
  },
  {
    title: 'Student Safety',
    desc: 'Transport operations are planned with safety, supervision, and accountability.',
    icon: ShieldCheck,
  },
  {
    title: 'Timely Service',
    desc: 'Route schedules are managed to support punctuality and smooth school operations.',
    icon: Clock,
  },
  {
    title: 'Transport Allocation',
    desc: 'Students can be allocated to routes, vehicles, and pickup points digitally.',
    icon: Users,
  },
]

export default function TransportPublic() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/exterior.jpeg"
          alt="EduNova transport"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Bus size={16} /> Transport
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Safe and Organized School Transport Services
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova provides organized school transport with route planning,
              pickup points, vehicle allocation, GPS tracking support, and
              student safety-focused operations.
            </p>

            <Link to="/contact" className="inline-flex items-center gap-2 btn-primary">
              Contact Transport Office <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Transport Management
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Designed for Safe Daily Student Commute
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              EduNova’s transport system supports vehicle records, route
              planning, driver details, GPS device mapping, pickup points, and
              student transport allocations.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              The transport module is built to support safety, punctuality,
              monitoring, and communication between school administration,
              parents, drivers, and students.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Bus route and pickup point management',
                'Student transport allocation',
                'GPS tracking support',
                'Safe and timely commute planning',
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
              alt="EduNova transport service"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Safe Campus Connectivity
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Route planning, student allocation, vehicle management, and
                tracking support.
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
                Transport Features
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Transport System Built for Safety and Visibility
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                EduNova transport services are planned to support students,
                parents, drivers, and administration.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRANSPORT_FEATURES.map(({ title, desc, icon: Icon }, index) => (
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