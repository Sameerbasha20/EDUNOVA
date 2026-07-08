import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Clock, Users, ArrowRight, Sparkles } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const fetchEvents = cmsApi.getEvents

const fallbackEvents = [
  {
    id: '1',
    title: 'STEM Innovation Fair',
    description: 'Students present robotics, science, technology, and innovation projects.',
    event_date: '2026-07-12',
    venue: 'Innovation Center',
    cover_image: '/student.jpeg',
  },
  {
    id: '2',
    title: 'Annual Sports Day',
    description: 'A celebration of fitness, discipline, teamwork, sportsmanship, and student achievement.',
    event_date: '2026-08-05',
    venue: 'EduNova Sports Ground',
    cover_image: '/Campus.jpeg',
  },
  {
    id: '3',
    title: 'Parent Orientation Program',
    description: 'Orientation for parents about digital learning, LMS, assessments, and communication systems.',
    event_date: '2026-08-20',
    venue: 'Main Auditorium',
    cover_image: '/building.jpeg',
  },
]

export default function Events() {
  const { data, loading } = useFetch(fetchEvents, [])
  const events = data && data.length > 0 ? data : fallbackEvents

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/exterior.jpeg"
          alt="EduNova Events"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <CalendarDays size={16} /> Events
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Campus Events that Inspire Learning and Leadership
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova hosts academic programs, STEM fairs, sports events,
              cultural activities, orientations, workshops, and student
              development events.
            </p>

            <Link to="/gallery" className="inline-flex items-center gap-2 btn-primary">
              View Gallery <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-accent uppercase text-sm mb-3 bg-accent/10 px-4 py-2 rounded-full">
              <Sparkles size={15} /> Upcoming & Recent Events
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Events that Shape Student Experience
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              Events at EduNova support academics, creativity, leadership,
              innovation, sportsmanship, and parent engagement.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading events…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <FadeIn key={event.id || event.title} delay={index * 60}>
                <article className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={event.cover_image || event.image || '/Campus.jpeg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-heading font-bold text-white text-xl drop-shadow">
                        {event.title}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <CalendarDays size={16} className="text-accent" />
                        {event.event_date || event.date || 'Upcoming'}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin size={16} className="text-accent" />
                        {event.venue || 'EduNova Campus'}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock size={16} className="text-accent" />
                        School Event
                      </div>
                    </div>

                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className="bg-bg-light">
        <div className="section grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/student.jpeg"
                alt="EduNova student events"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div>
              <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
                Event Culture
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
                More Than Academics
              </h2>
              <p className="font-body text-text-secondary leading-relaxed mb-6">
                Events help students develop communication, leadership,
                creativity, teamwork, confidence, and real-world exposure.
              </p>

              <div className="space-y-4">
                {[
                  'Academic and STEM events',
                  'Sports and cultural programs',
                  'Parent orientation and workshops',
                  'Student leadership activities',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users size={17} className="text-secondary" />
                    </div>
                    <p className="font-body text-text-primary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}