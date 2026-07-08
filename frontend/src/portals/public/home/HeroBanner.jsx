import { Link } from 'react-router-dom'
import { GraduationCap, Users, Award, Sparkles, ArrowRight } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import CountUp from '../../../components/CountUp'

export default function HeroBanner() {
  const { data: stats } = useFetch(cmsApi.getStats, [])
  const studentStat = stats?.find((s) => s.label === 'Students')
  const teacherStat = stats?.find((s) => s.label === 'Teachers')
  const resultsStat = stats?.find((s) => s.label === 'Board Results')

  return (
    <section className="relative overflow-hidden text-white min-h-[88vh] flex items-center bg-primary">
      <video
        className="absolute inset-0 w-full h-full object-cover brightness-110 contrast-110 saturate-125"
        src="/videos/school-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/82 via-primary/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 via-transparent to-white/5" />
      <div className="absolute inset-0 bg-highlight/10" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-accent/25 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-16 w-96 h-96 bg-highlight/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight mb-5 uppercase tracking-wide text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
            <Sparkles size={15} /> Inspiring Minds. Building Futures.
          </p>

          <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-2xl">
            Where Academic
            <span className="block text-highlight">Excellence Meets</span>
            Digital Innovation
          </h1>

          <p className="font-body text-white mb-8 max-w-xl text-base md:text-lg leading-relaxed drop-shadow-lg">
            CBSE &amp; Cambridge curricula, AI-powered learning analytics, and a
            100% digital campus — educating {studentStat?.value || '6,500+'} students
            across EduNova Global Academy.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/admissions"
              className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-subheading font-bold px-7 py-4 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Start Application <ArrowRight size={18} />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center border border-white/50 bg-white/20 backdrop-blur-md text-white font-subheading font-semibold px-7 py-4 rounded-xl hover:bg-white hover:text-primary transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-5">
          {[
            { Icon: GraduationCap, value: studentStat?.value || '6,500+', label: 'Students across all programs', color: 'text-highlight' },
            { Icon: Users, value: teacherStat?.value || '350+', label: 'Experienced teachers', color: 'text-orange-200', offset: true },
            { Icon: Award, value: resultsStat?.value || '98%', label: 'Board exam results', color: 'text-highlight' },
          ].map(({ Icon, value, label, color, offset }) => (
            <div
              key={label}
              className={`bg-white/22 backdrop-blur-xl border border-white/35 rounded-3xl p-7 flex items-center gap-5 shadow-2xl hover:bg-white/30 transition-all duration-300 ${offset ? 'ml-8' : ''}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon size={32} className={`${color} shrink-0`} />
              </div>
              <div>
                <p className="font-numbers text-3xl font-extrabold"><CountUp value={value} /></p>
                <p className="text-sm text-white">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
