import { useParams } from 'react-router-dom'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'

// Generic renderer for static long-form pages backed by apps.cms.CMSPage:
// About, Privacy Policy, Terms, Student Life, Infrastructure, Facilities,
// Sports, Careers intro, Library/Transport/Hostel public info.
export default function CMSPageView({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam
  const { data: page, loading, error } = useFetch(() => cmsApi.getPage(slug), [slug])

  if (loading) return <div className="section"><p className="text-text-secondary">Loading…</p></div>
  if (error || !page) return <div className="section"><p className="text-text-secondary">This page hasn't been published yet.</p></div>

  return (
    <div className="section max-w-3xl">
      <h1 className="font-heading text-4xl font-bold mb-6">{page.title}</h1>
      <div className="font-body text-text-primary leading-relaxed whitespace-pre-line">
        {page.content_html}
      </div>
    </div>
  )
}
