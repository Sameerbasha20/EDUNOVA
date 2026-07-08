import { Users, UserCheck, GraduationCap, Monitor, FlaskConical, Cpu, Lightbulb, Trophy, Globe } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'
import CountUp from '../../../components/CountUp'

const ICON_MAP = {
  'Students': Users, 'Employees': UserCheck, 'Teachers': GraduationCap,
  'Smart Classrooms': Monitor, 'Science Labs': FlaskConical, 'Computer Labs': Cpu,
  'Innovation Centers': Lightbulb, 'Board Results': Trophy, 'Digital Campus': Globe,
}

export default function AchievementsStrip() {
  const { data: stats, loading } = useFetch(cmsApi.getStats, [])

  return (
    <section className="bg-primary text-white">
      <div className="section">
        <FadeIn><h2 className="font-heading text-3xl font-bold text-center mb-10">EduNova by the Numbers</h2></FadeIn>
        {loading ? (
          <p className="text-center text-blue-200">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {(stats || []).map((s, i) => {
              const Icon = ICON_MAP[s.label] || Trophy
              return (
                <FadeIn key={s.id} delay={i * 60}>
                  <div>
                    <Icon size={24} className="text-highlight mx-auto mb-2" />
                    <p className="font-numbers text-4xl font-bold text-highlight"><CountUp value={s.value} /></p>
                    <p className="font-subheading text-sm text-blue-100 mt-1">{s.label}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
