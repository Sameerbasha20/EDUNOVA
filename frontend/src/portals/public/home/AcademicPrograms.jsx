import { GraduationCap, BookOpen, Sparkles } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

export default function AcademicPrograms() {
  const { data: programs, loading } = useFetch(cmsApi.getAcademicPrograms, [])

  return (
    <section className="bg-bg-light">
      <div className="section">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Image */}
          <FadeIn>
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-highlight/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-accent/20 rounded-full blur-2xl" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
                <img
                  src="/student.jpeg"
                  alt="EduNova students learning in classroom"
                  className="w-full h-[400px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen size={22} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-primary text-lg">
                        Future-Ready Curriculum
                      </h3>
                      <p className="font-body text-sm text-text-secondary">
                        CBSE, Cambridge, STEM, skill development, and digital learning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Content */}
          <FadeIn delay={100}>
            <div>
              <p className="inline-flex items-center gap-2 font-subheading font-semibold text-accent uppercase text-sm mb-3 bg-accent/10 px-4 py-2 rounded-full">
                <Sparkles size={15} /> Academic Excellence
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-text-primary">
                Academic Programs Designed for Every Stage of Learning
              </h2>

              <p className="font-body text-text-secondary leading-relaxed mb-6">
                From Pre-Primary to Senior Secondary, EduNova Global Academy offers
                structured academic programs across CBSE and Cambridge curricula,
                supported by smart classrooms, digital assessments, STEM education,
                and skill development.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="font-numbers text-3xl font-extrabold text-primary">
                    6,500+
                  </p>
                  <p className="font-body text-sm text-text-secondary">
                    Students
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="font-numbers text-3xl font-extrabold text-accent">
                    98%
                  </p>
                  <p className="font-body text-sm text-text-secondary">
                    Board Results
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Program Cards */}
        <FadeIn>
          <h3 className="font-heading text-2xl font-bold text-center mb-2 text-text-primary">
            Explore Our Programs
          </h3>

          <p className="font-body text-text-secondary text-center mb-10">
            From foundational learning to advanced academic pathways.
          </p>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading programs…</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(programs || []).map((p, i) => (
              <FadeIn key={p.id} delay={i * 50}>
                <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                    <GraduationCap
                      size={24}
                      className="text-accent group-hover:text-white transition-colors"
                    />
                  </div>

                  <h3 className="font-subheading font-bold text-primary text-lg mb-2">
                    {p.name}
                  </h3>

                  {p.description && (
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}