import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

export default function TestimonialsCarousel() {
  const { data: testimonials, loading } = useFetch(cmsApi.getTestimonials, [])
  const [index, setIndex] = useState(0)
  const count = testimonials?.length || 0

  // Auto-advance every 6s, pauses cleanly on unmount / when there's only 1 item.
  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => clearInterval(timer)
  }, [count])

  const goTo = (i) => setIndex(((i % count) + count) % count)

  return (
    <section className="bg-secondary/5">
      <div className="section">
        <FadeIn><h2 className="font-heading text-3xl font-bold text-center mb-10">What Our Community Says</h2></FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading testimonials…</p>
        ) : count === 0 ? (
          <p className="text-center text-text-secondary">Testimonials coming soon.</p>
        ) : (
          <div className="max-w-2xl mx-auto relative">
            <div className="card text-center py-10 px-8">
              <Quote size={32} className="text-secondary/40 mx-auto mb-4" />
              <p className="font-body text-lg text-text-primary italic mb-6">
                "{testimonials[index].message}"
              </p>
              <p className="font-subheading font-bold">{testimonials[index].author_name}</p>
              <p className="text-sm text-text-secondary">{testimonials[index].role}</p>
            </div>

            {count > 1 && (
              <>
                <button
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous testimonial"
                  className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => goTo(index + 1)}
                  aria-label="Next testimonial"
                  className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-secondary' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
