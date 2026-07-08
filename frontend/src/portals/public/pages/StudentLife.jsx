import { Link } from 'react-router-dom'
import {
  Users,
  Trophy,
  Lightbulb,
  Palette,
  Heart,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'
import { publicImages } from '../../../constants/publicImages'

const LIFE_ITEMS = [
  {
    title: 'Clubs and Activities',
    desc: 'Student clubs, leadership activities, creativity sessions, and group learning experiences.',
    icon: Users,
  },
  {
    title: 'Sports and Fitness',
    desc: 'Sports, wellness, physical education, teamwork, and confidence-building activities.',
    icon: Trophy,
  },
  {
    title: 'STEM and Innovation',
    desc: 'Robotics, science projects, digital learning, innovation fairs, and practical demonstrations.',
    icon: Lightbulb,
  },
  {
    title: 'Arts and Creativity',
    desc: 'Creative expression through arts, performances, painting, competitions, and cultural programs.',
    icon: Palette,
  },
  {
    title: 'Student Wellbeing',
    desc: 'A safe and supportive campus environment that encourages confidence and personal growth.',
    icon: Heart,
  },
  {
    title: 'Learning Culture',
    desc: 'Reading, collaboration, academic discipline, curiosity, and lifelong learning habits.',
    icon: BookOpen,
  },
]

export default function StudentLife() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <video
          src={publicImages.walkingVideo}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-primary/25" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Users size={16} /> Student Life
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              A Vibrant Campus Life Beyond Classrooms
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova encourages leadership, creativity, teamwork, sports,
              robotics, arts, STEM fairs, student clubs, events, and holistic
              personal development.
            </p>

            <Link to="/admissions" className="inline-flex items-center gap-2 btn-primary">
              Join EduNova <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Campus Experience
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Students Grow Through Academics, Creativity, and Community
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              Student life at EduNova is designed to help learners build
              confidence, leadership, discipline, creativity, social skills, and
              emotional strength.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              Beyond academics, students participate in sports, robotics clubs,
              arts, STEM fairs, cultural events, innovation activities, and
              student leadership opportunities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Sports, arts, and student clubs',
                'Robotics, STEM fairs, and innovation',
                'Leadership and teamwork activities',
                'Safe and student-focused campus culture',
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
              src={publicImages.student1}
              alt="EduNova student life"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Student-Centered Campus Culture
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Learning, friendship, leadership, innovation, and confidence.
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
                Life at EduNova
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Activities that Build Future-Ready Students
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                Student life combines academics, sports, culture, digital
                exposure, teamwork, and creative learning.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIFE_ITEMS.map(({ title, desc, icon: Icon }, index) => (
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

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={publicImages.physics2}
              alt="Students explaining physics model"
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Innovation and Creativity
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Practical Learning Through Projects and Activities
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova students participate in science models, digital learning,
              project presentations, robotics activities, teamwork sessions, and
              creative programs that build confidence and problem-solving skills.
            </p>

            <Link to="/gallery" className="inline-flex items-center gap-2 btn-outline">
              View Gallery <ArrowRight size={18} />
            </Link>
          </div>
        </FadeIn>
      </section>
    </main>
  )
}