import { Link } from 'react-router-dom'
import { Newspaper, CalendarDays, ArrowRight, Bell, Sparkles } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const fetchNews = cmsApi.getNews

const fallbackNews = [
  {
    id: '1',
    title: 'EduNova Launches Digital Learning Enhancement Program',
    content: 'EduNova Global Academy continues its digital transformation with smart classrooms, online assessments, and learning analytics.',
    published_date: '2026-06-10',
    cover_image: '/Campus.jpeg',
  },
  {
    id: '2',
    title: 'Students Participate in STEM and Robotics Innovation Week',
    content: 'Students explored robotics, innovation challenges, project-based learning, and collaborative STEM activities.',
    published_date: '2026-06-18',
    cover_image: '/student.jpeg',
  },
  {
    id: '3',
    title: 'Academic Excellence Program Announced for Board Preparation',
    content: 'EduNova introduces structured academic support, mentoring, and exam readiness programs for senior students.',
    published_date: '2026-06-25',
    cover_image: '/building.jpeg',
  },
]

export default function News() {
  const { data, loading } = useFetch(fetchNews, [])
  const posts = data && data.length > 0 ? data : fallbackNews
  const featured = posts[0]
  const remaining = posts.slice(1)

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/building.jpeg"
          alt="EduNova News"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Newspaper size={16} /> Latest News
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Latest Updates from EduNova Global Academy
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              Stay updated with academic announcements, campus developments,
              student activities, innovation updates, and institutional news.
            </p>

            <Link to="/events" className="inline-flex items-center gap-2 btn-primary">
              View Events <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        {loading ? (
          <p className="text-center text-text-secondary">Loading news…</p>
        ) : (
          <>
            <FadeIn>
              <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={featured.cover_image || featured.image || '/Campus.jpeg'}
                    alt={featured.title}
                    className="w-full h-[420px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                    <p className="font-subheading font-bold text-accent text-sm mb-1">
                      Featured News
                    </p>
                    <h2 className="font-heading font-bold text-primary text-xl">
                      {featured.title}
                    </h2>
                  </div>
                </div>

                <div>
                  <p className="inline-flex items-center gap-2 font-subheading font-semibold text-accent uppercase text-sm mb-4 bg-accent/10 px-4 py-2 rounded-full">
                    <Bell size={15} /> Announcement
                  </p>

                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                    {featured.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-5">
                    <CalendarDays size={17} />
                    {featured.published_date || featured.date || 'Latest Update'}
                  </div>

                  <p className="font-body text-text-secondary leading-relaxed mb-7">
                    {featured.content || featured.description}
                  </p>

                  <Link to="/contact" className="inline-flex items-center gap-2 btn-outline">
                    Contact Office <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {remaining.map((post, index) => (
                <FadeIn key={post.id || post.title} delay={index * 60}>
                  <article className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.cover_image || post.image || '/student.jpeg'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                        <CalendarDays size={15} />
                        {post.published_date || post.date || 'Latest'}
                      </div>

                      <h3 className="font-heading text-xl font-bold text-primary mb-3">
                        {post.title}
                      </h3>

                      <p className="font-body text-sm text-text-secondary leading-relaxed">
                        {post.content || post.description}
                      </p>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <Sparkles size={42} className="mx-auto text-highlight mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Stay Connected with EduNova
            </h2>
            <p className="font-body text-blue-100 leading-relaxed mb-8">
              Follow the latest updates about admissions, academics, campus
              activities, events, achievements, and student development.
            </p>
            <Link to="/contact" className="btn-primary">
              Contact Us
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}