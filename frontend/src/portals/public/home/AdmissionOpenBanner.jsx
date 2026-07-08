import { Link } from 'react-router-dom'

export default function AdmissionOpenBanner() {
  return (
    <div className="bg-highlight text-text-primary">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-subheading font-semibold text-sm">
          🎓 Admissions open for the upcoming academic year — limited seats across all programs.
        </p>
        <Link to="/admissions" className="font-subheading font-bold text-sm underline underline-offset-2">
          Apply Now →
        </Link>
      </div>
    </div>
  )
}
