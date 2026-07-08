import FadeIn from '../../../components/FadeIn'

export default function FacultyHighlight() {
  return (
    <section className="section text-center">
      <FadeIn>
        <h2 className="font-heading text-3xl font-bold mb-3">Experienced, Dedicated Faculty</h2>
        <p className="font-body text-text-secondary max-w-2xl mx-auto mb-6">
          350+ teachers trained in modern pedagogy, digital classrooms, and
          personalized learning approaches — committed to every student's growth.
        </p>
        <a href="/faculty" className="btn-outline">Meet Our Faculty</a>
      </FadeIn>
    </section>
  )
}
