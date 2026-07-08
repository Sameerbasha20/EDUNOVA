import { Link } from 'react-router-dom'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

export default function LatestNewsPreview() {
  const { data: news, loading } = useFetch(cmsApi.getNews, [])
  const latest = (news || []).slice(0, 3)

  return (
    <section className="bg-white">
      <div className="section">
        <div className="flex items-center justify-between mb-6">
          <FadeIn><h2 className="font-heading text-3xl font-bold">Latest News</h2></FadeIn>
          <Link to="/news" className="font-subheading font-semibold text-accent text-sm">View All →</Link>
        </div>
        {loading ? (
          <p className="text-text-secondary">Loading news…</p>
        ) : latest.length === 0 ? (
          <p className="text-text-secondary">No news posted yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {latest.map((n) => (
              <div key={n.id} className="card">
                <p className="font-subheading text-sm text-text-secondary">{n.published_date}</p>
                <h3 className="font-heading font-bold mt-1">{n.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
