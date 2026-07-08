import { Link } from 'react-router-dom'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

export default function ScholarshipsBanner() {
  const { data: scholarships, loading } = useFetch(cmsApi.getScholarships, [])
  const featured = (scholarships || [])[0]

  return (
    <section className="bg-highlight">
      <FadeIn>
        <div className="section flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              {loading ? 'Scholarships Available' : featured ? featured.name : 'Scholarships Available'}
            </h2>
            <p className="font-body text-text-primary/80 max-w-xl">
              {featured?.description || 'Merit and need-based scholarships available for eligible students.'}
            </p>
          </div>
          <Link to="/admissions" className="btn-primary whitespace-nowrap">View Eligibility</Link>
        </div>
      </FadeIn>
    </section>
  )
}
