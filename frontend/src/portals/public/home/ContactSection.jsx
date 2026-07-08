import { useState } from 'react'
import { cmsApi } from '../../../api/cmsApi'
import FadeIn from '../../../components/FadeIn'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await cmsApi.submitContact(form)
      setStatus('sent')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white">
      <div className="section max-w-2xl">
        <FadeIn>
        <h2 className="font-heading text-3xl font-bold text-center mb-8">Get in Touch</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required placeholder="Your name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body"
          />
          <input
            required type="email" placeholder="Email address" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body"
          />
          <input
            placeholder="Phone (optional)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body"
          />
          <textarea
            required placeholder="Your message" rows={4} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body"
          />
          <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'sent' && <p className="text-success text-sm text-center">Message sent — we'll be in touch soon.</p>}
          {status === 'error' && <p className="text-error text-sm text-center">Something went wrong. Please try again.</p>}
        </form>
        </FadeIn>
      </div>
    </section>
  )
}
