import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="section text-center py-32">
      <h1 className="font-heading text-5xl font-bold text-primary mb-4">404</h1>
      <p className="text-text-secondary mb-6">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}
