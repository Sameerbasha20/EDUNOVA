import { Quote, GraduationCap } from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

export default function PrincipalMessage() {
  return (
    <section className="bg-bg-light">
      <div className="section">
        <div className="grid lg:grid-cols-3 gap-10 items-center">
          {/* Principal Image */}
          <FadeIn>
            <div className="relative">
              <div className="absolute -top-5 -left-5 w-32 h-32 bg-highlight/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-5 -right-5 w-36 h-36 bg-accent/20 rounded-full blur-2xl" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white bg-white">
                <img
                  src="/EduNova.jpeg"
                  alt="Principal of EduNova Global Academy"
                  className="w-full h-[390px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                      <GraduationCap size={22} className="text-accent" />
                    </div>

                    <div>
                      <p className="font-subheading font-bold text-primary">
                        Dr. Meera Sharma
                      </p>
                      <p className="font-body text-sm text-text-secondary">
                        Principal, EduNova Global Academy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Message Content */}
          <FadeIn delay={100}>
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 relative">
              <div className="absolute -top-6 left-8 w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
                <Quote size={28} className="text-white" />
              </div>

              <p className="font-subheading font-semibold text-accent uppercase text-sm mb-4 mt-5">
                A Message from the Principal
              </p>

              <blockquote className="font-heading text-2xl md:text-3xl text-text-primary leading-snug mb-6">
                “Our mission is to nurture curious, confident learners equipped
                for a rapidly changing world — through academic rigor,
                technology, and genuine care for every student.”
              </blockquote>

              <p className="font-body text-text-secondary leading-relaxed mb-6">
                At EduNova Global Academy, we believe education must prepare
                students not only for examinations, but also for leadership,
                innovation, creativity, digital confidence, and lifelong success.
                Our learning ecosystem combines strong academic foundations with
                modern technology, values, and personal mentoring.
              </p>

              <div className="border-l-4 border-accent pl-5">
                <p className="font-subheading font-bold text-text-primary text-lg">
                  Dr. Meera Sharma
                </p>
                <p className="font-body text-sm text-text-secondary">
                  Principal, EduNova Global Academy
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}