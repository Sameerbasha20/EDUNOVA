import FadeIn from '../../../components/FadeIn'

const STEPS = [
  ['1', 'Submit Online Registration', 'Fill in student and parent details on the Admissions page.'],
  ['2', 'Application Review', 'Our admissions team verifies details and documents.'],
  ['3', 'Approval & Credentials', 'On approval, student and parent portal logins are issued.'],
  ['4', 'Fee Payment & Confirmation', 'Complete fee payment to confirm the admission.'],
]

export default function AdmissionProcessSteps() {
  return (
    <section className="section">
      <FadeIn><h2 className="font-heading text-3xl font-bold text-center mb-10">Admission Process</h2></FadeIn>
      <div className="grid md:grid-cols-4 gap-6">
        {STEPS.map(([num, title, desc]) => (
          <div key={num} className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent text-white font-heading font-bold flex items-center justify-center mb-3">
              {num}
            </div>
            <h3 className="font-subheading font-bold mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
