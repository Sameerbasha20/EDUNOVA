import { Link } from 'react-router-dom'
import { Award, Trophy, Star, Medal, GraduationCap, ArrowRight, CalendarDays } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'
import { publicImages } from '../../../constants/publicImages'

const fetchAchievements = cmsApi.getAchievements || (async () => [])

const fallbackAchievements = [
  {
    id: '1',
    title: '98% Board Exam Results',
    description:
      'EduNova students continue to perform strongly through academic planning, mentoring, and assessments.',
    achievement_date: '2026-05-15',
    cover_image: publicImages.trophy1,
  },
  {
    id: '2',
    title: 'STEM Innovation Recognition',
    description:
      'Students were recognized for robotics, science projects, creativity, and innovation-based learning.',
    achievement_date: '2026-06-02',
    cover_image: publicImages.physics1,
  },
  {
    id: '3',
    title: 'Digital Campus Excellence',
    description:
      'EduNova strengthened its digital learning ecosystem with LMS, online assessments, and analytics.',
    achievement_date: '2026-06-20',
    cover_image: publicImages.trophy2,
  },
]

const STATS = [
  { label: 'Board Results', value: '98%', icon: Trophy },
  { label: 'Students', value: '6,500+', icon: GraduationCap },
  { label: 'Teachers', value: '350+', icon: Award },
  { label: 'Programs', value: '9+', icon: Star },
]

export default function Achievements() {
  const { data, loading } = useFetch(fetchAchievements, [])
  const achievements = data && data.length > 0 ? data : fallbackAchievements

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/Campus.jpeg"
          alt="EduNova Achievements"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Award size={16} /> Achievements
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Celebrating Excellence in Academics, Innovation, and Student Growth
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova celebrates student success, academic results, innovation,
              STEM participation, leadership, sports, and institutional milestones.
            </p>

            <Link to="/admissions" className="inline-flex items-center gap-2 btn-primary">
              Join EduNova <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {STATS.map(({ label, value, icon: Icon }, index) => (
            <FadeIn key={label} delay={index * 50}>
              <div className="bg-bg-light rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={27} className="text-accent" />
                </div>
                <p className="font-numbers text-4xl font-extrabold text-primary mb-1">
                  {value}
                </p>
                <p className="font-body text-sm text-text-secondary">
                  {label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
              Achievement Highlights
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Milestones that Reflect Our Commitment
            </h2>
            <p className="font-body text-text-secondary leading-relaxed">
              EduNova’s achievements reflect strong academics, digital learning,
              student mentoring, innovation, and holistic development.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading achievements…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((item, index) => (
              <FadeIn key={item.id || item.title} delay={index * 60}>
                <article className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.cover_image || item.image || '/student.jpeg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

                    <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center">
                      <Medal size={24} className="text-accent" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                      <CalendarDays size={16} className="text-accent" />
                      {item.achievement_date || item.date || 'Achievement'}
                    </div>

                    <h3 className="font-heading text-xl font-bold text-primary mb-3">
                      {item.title}
                    </h3>

                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <Trophy size={42} className="mx-auto text-highlight mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Excellence is a Continuous Journey
            </h2>
            <p className="font-body text-blue-100 leading-relaxed mb-8">
              EduNova continues to build future-ready learners through academic
              excellence, innovation, discipline, and strong values.
            </p>
            <Link to="/academics" className="btn-primary">
              View Academics
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}