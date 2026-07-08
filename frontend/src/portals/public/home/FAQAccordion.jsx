import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

export default function FAQAccordion() {
  const { data: faqs, loading } = useFetch(cmsApi.getFAQs, [])
  const [openId, setOpenId] = useState(null)

  return (
    <section className="section max-w-3xl">
      <FadeIn><h2 className="font-heading text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2></FadeIn>
      {loading ? (
        <p className="text-center text-text-secondary">Loading FAQs…</p>
      ) : (
        <div className="space-y-3">
          {(faqs || []).map((f, i) => {
            const isOpen = openId === f.id
            return (
              <FadeIn key={f.id} delay={i * 40}>
                <div className="card cursor-pointer" onClick={() => setOpenId(isOpen ? null : f.id)}>
                  <div className="flex items-center justify-between">
                    <p className="font-subheading font-semibold">{f.question}</p>
                    <ChevronDown
                      size={18}
                      className={`text-text-secondary shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <p className="text-sm text-text-secondary overflow-hidden">{f.answer}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
    </section>
  )
}
