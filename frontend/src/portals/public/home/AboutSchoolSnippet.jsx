import { Link } from 'react-router-dom'
import FadeIn from '../../../components/FadeIn'

export default function AboutSchoolSnippet() {
  return (
    <section className="bg-white">
      <div className="section grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-2">
              About EduNova
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-text-primary">
              One of India's Leading Educational Institutions
            </h2>

            <p className="font-body text-text-secondary mb-6 leading-relaxed">
              EduNova Global Academy integrates classroom learning with artificial
              intelligence, cloud technologies, online learning platforms, digital
              assessments, and parent engagement systems — while emphasizing
              academic excellence, leadership, creativity, and lifelong learning.
            </p>

            <Link to="/about" className="btn-outline">
              Read Our Full Story
            </Link>
          </div>
        </FadeIn>

        {/* Right Image */}
        <FadeIn delay={0.15}>
          <div className="relative">
            <div className="absolute -top-5 -left-5 w-32 h-32 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-5 -right-5 w-40 h-40 bg-secondary/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img
                src="/Campus.jpeg"
                alt="EduNova Global Academy Campus"
                className="w-full h-[380px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
                <p className="font-heading font-bold text-primary text-lg">
                  A Future-Ready Learning Campus
                </p>
                <p className="font-body text-sm text-text-secondary">
                  Smart classrooms, digital learning, innovation labs, and student-focused education.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}