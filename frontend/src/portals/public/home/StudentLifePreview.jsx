import { Link } from 'react-router-dom'
import { ArrowRight, Trophy, Users, Lightbulb, Palette } from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const LIFE_POINTS = [
  {
    title: 'Sports & Fitness',
    desc: 'Activities that build discipline, teamwork, and confidence.',
    icon: Trophy,
  },
  {
    title: 'Clubs & Events',
    desc: 'Student clubs, cultural events, STEM fairs, and competitions.',
    icon: Users,
  },
  {
    title: 'Innovation Culture',
    desc: 'Robotics, projects, leadership activities, and creativity labs.',
    icon: Lightbulb,
  },
  {
    title: 'Arts & Creativity',
    desc: 'A vibrant campus culture supporting expression and talent.',
    icon: Palette,
  },
]

export default function StudentLifePreview() {
  return (
    <section className="bg-white">
      <div className="section grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Student Life
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-text-primary">
              Life at EduNova Goes Beyond Classrooms
            </h2>

            <p className="font-body text-text-secondary mb-6 leading-relaxed">
              Beyond academics — EduNova Global Academy encourages sports,
              robotics club, arts, STEM fairs, leadership activities, and a
              vibrant campus culture that builds creativity, confidence, and
              lifelong learning.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-7">
              {LIFE_POINTS.map(({ title, desc, icon: Icon }, index) => (
                <div
                  key={title}
                  className="bg-bg-light rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Icon size={22} className="text-accent" />
                  </div>

                  <h3 className="font-subheading font-bold text-primary mb-1">
                    {title}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/student-life"
              className="inline-flex items-center gap-2 btn-outline"
            >
              Explore Student Life <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>

        {/* Right Video/Image */}
        <FadeIn delay={100}>
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-accent/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <video
                src="/videos/walking.mp4"
                className="w-full h-[420px] object-cover"
                autoPlay
                muted
                loop
                playsInline
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  A Vibrant Campus Experience
                </h3>

                <p className="font-body text-sm text-text-secondary">
                  Leadership, teamwork, creativity, innovation, and student-focused
                  development in every part of campus life.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}