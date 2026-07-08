import { Link } from 'react-router-dom'
import {
  Trophy,
  Dumbbell,
  Medal,
  Users,
  Target,
  ShieldCheck,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const SPORTS = [
  {
    title: 'Indoor & Outdoor Games',
    desc: 'Structured sports activities supporting fitness, discipline, teamwork, and confidence.',
    icon: Trophy,
  },
  {
    title: 'Sports Complex',
    desc: 'Well-planned sports facilities for training, competitions, and physical development.',
    icon: Dumbbell,
  },
  {
    title: 'Inter-School Competitions',
    desc: 'Students are encouraged to participate in events, tournaments, and championship programs.',
    icon: Medal,
  },
  {
    title: 'Team Building',
    desc: 'Sports activities build leadership, responsibility, collaboration, and sportsmanship.',
    icon: Users,
  },
  {
    title: 'Fitness & Wellness',
    desc: 'Physical activities promote health, stamina, discipline, and balanced student life.',
    icon: Target,
  },
  {
    title: 'Safe Training Environment',
    desc: 'Supervised sports activities with safety, guidance, and student wellbeing.',
    icon: ShieldCheck,
  },
]

export default function Sports() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/student.jpeg"
          alt="EduNova Sports"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Trophy size={16} /> Sports & Physical Education
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Building Discipline, Teamwork, Fitness, and Confidence
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova encourages sports, fitness, competitions, teamwork, and
              leadership through structured physical education and campus sports
              facilities.
            </p>

            <Link to="/student-life" className="inline-flex items-center gap-2 btn-primary">
              Explore Student Life <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Sports Culture
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              A Balanced Education Includes Physical Growth
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              Sports at EduNova are designed to develop fitness, discipline,
              leadership, confidence, sportsmanship, teamwork, and emotional
              resilience.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Students participate in physical education, practice sessions,
              indoor and outdoor games, inter-school competitions, sports days,
              and wellness activities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Indoor and outdoor games',
                'Fitness and wellness activities',
                'Inter-school competitions',
                'Leadership through teamwork',
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
              src="/Campus.jpeg"
              alt="EduNova sports campus"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Sports for Holistic Development
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Physical fitness, discipline, teamwork, leadership, and student confidence.
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
                Sports Facilities
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Activities that Shape Confident Students
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                EduNova supports student growth through sports, wellness, fitness,
                competitions, discipline, and teamwork.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPORTS.map(({ title, desc, icon: Icon }, index) => (
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

      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <CalendarDays size={42} className="mx-auto text-highlight mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Sports Day, Competitions, and Wellness Activities
            </h2>
            <p className="font-body text-blue-100 leading-relaxed mb-8">
              EduNova promotes a healthy campus culture where students grow
              physically, mentally, socially, and emotionally.
            </p>
            <Link to="/admissions" className="btn-primary">
              Join EduNova
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}