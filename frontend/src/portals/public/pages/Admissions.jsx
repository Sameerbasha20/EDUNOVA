import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { admissionsApi } from '../../../api/admissionsApi'
import AdmissionProcessSteps from '../home/AdmissionProcessSteps'
import ScholarshipsBanner from '../home/ScholarshipsBanner'
import FadeIn from '../../../components/FadeIn'

const EMPTY_FORM = {
  applicant_name: '',
  date_of_birth: '',
  gender: '',
  target_class: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  address: '',
  scholarship_applied: false,
}

const CLASSES = [
  'Pre Primary',
  'Middle School',
  'High School',
  'Senior Secondary',
  'Cambridge Curriculum',
  'CBSE',
  'International Programs',
  'STEM Education',
  'Skill Development',
]

const REQUIRED_DOCS = [
  'Student birth certificate or valid ID proof',
  'Previous academic records, if applicable',
  'Parent / Guardian contact details',
  'Address and emergency contact information',
]

const ADMISSION_FEATURES = [
  {
    title: 'Online Registration',
    desc: 'Submit the admission enquiry form digitally from anywhere.',
    icon: FileText,
  },
  {
    title: 'Admin Review',
    desc: 'Admissions team reviews every application carefully.',
    icon: ShieldCheck,
  },
  {
    title: 'Confirmation',
    desc: 'Receive registration number and application status updates.',
    icon: Mail,
  },
  {
    title: 'Student Onboarding',
    desc: 'Selected applicants move to student profile and class allocation.',
    icon: Users,
  },
]

export default function Admissions() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const data = await admissionsApi.submit(form)
      setResult(data)
      setStatus('success')
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus('error')
      const apiErrors = err?.response?.data

      setErrorMsg(
        apiErrors
          ? Object.entries(apiErrors)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join(' / ')
          : 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden text-white">
        <img
          src="/Campus.jpeg"
          alt="EduNova admissions"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Sparkles size={15} /> Admissions Open
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Begin Your Child’s Learning Journey at EduNova
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              Complete the online registration form, receive your registration
              number, and allow our admissions team to review your application
              for the upcoming academic year.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#admission-form" className="inline-flex items-center gap-2 btn-primary">
                Apply Now <ArrowRight size={18} />
              </a>

              <Link
                to="/contact"
                className="border-2 border-white text-white font-subheading font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                Contact Admissions
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Intro */}
      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Admission Process
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Simple, Transparent, and Fully Digital Admission Flow
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-6">
              EduNova Global Academy provides a structured admission process for
              Pre Primary, Middle School, High School, Senior Secondary, CBSE,
              Cambridge Curriculum, International Programs, STEM Education, and
              Skill Development programs.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {ADMISSION_FEATURES.map(({ title, desc, icon: Icon }) => (
                <div
                  key={title}
                  className="bg-bg-light rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <Icon size={22} className="text-accent" />
                  </div>

                  <h3 className="font-subheading font-bold text-primary mb-1">
                    {title}
                  </h3>

                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-36 h-36 bg-highlight/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-secondary/20 rounded-full blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/student.jpeg"
                alt="EduNova student admissions"
                className="w-full h-[430px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
                <h3 className="font-heading font-bold text-primary text-lg mb-1">
                  Limited Seats Available
                </h3>
                <p className="font-body text-sm text-text-secondary">
                  Apply early for the upcoming academic year across all programs.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Form Section */}
      <section id="admission-form" className="bg-bg-light">
        <div className="section grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <div className="mb-8">
                  <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-2">
                    Online Registration Form
                  </p>

                  <h2 className="font-heading text-3xl font-bold text-text-primary mb-3">
                    Submit Admission Enquiry
                  </h2>

                  <p className="font-body text-text-secondary leading-relaxed">
                    Fill the form carefully. After submission, you will receive a
                    registration number for future admission tracking.
                  </p>
                </div>

                {status === 'success' && result ? (
                  <div className="rounded-3xl border border-secondary bg-secondary/5 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                      <CheckCircle2 size={30} className="text-secondary" />
                    </div>

                    <h2 className="font-heading text-2xl font-bold text-secondary mb-2">
                      Application Submitted Successfully
                    </h2>

                    <p className="text-text-primary mb-1">
                      Your registration number is:
                    </p>

                    <p className="font-numbers text-3xl font-bold text-primary mb-4">
                      {result.registration_number}
                    </p>

                    <p className="text-sm text-text-secondary leading-relaxed">
                      Save this registration number. A confirmation email/SMS has
                      also been sent to {result.parent_email || 'the registered parent email'}.
                      Our admissions team will review the application and update
                      the status shortly.
                    </p>

                    <button
                      className="btn-outline mt-6"
                      onClick={() => {
                        setStatus('idle')
                        setResult(null)
                      }}
                    >
                      Submit Another Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="font-subheading font-bold text-primary mb-4">
                        Student Details
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          required
                          placeholder="Applicant full name"
                          value={form.applicant_name}
                          onChange={update('applicant_name')}
                          className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />

                        <input
                          required
                          type="date"
                          value={form.date_of_birth}
                          onChange={update('date_of_birth')}
                          className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <select
                        required
                        value={form.gender}
                        onChange={update('gender')}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>

                      <select
                        required
                        value={form.target_class}
                        onChange={update('target_class')}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      >
                        <option value="">Select program / class</option>
                        {CLASSES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                      <h3 className="font-subheading font-bold text-primary mb-4">
                        Parent / Guardian Details
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          required
                          placeholder="Parent / Guardian name"
                          value={form.parent_name}
                          onChange={update('parent_name')}
                          className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />

                        <input
                          required
                          placeholder="Parent phone number"
                          value={form.parent_phone}
                          onChange={update('parent_phone')}
                          className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <input
                      required
                      type="email"
                      placeholder="Parent email address"
                      value={form.parent_email}
                      onChange={update('parent_email')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                    />

                    <textarea
                      required
                      placeholder="Full address"
                      rows={4}
                      value={form.address}
                      onChange={update('address')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                    />

                    <label className="flex items-center gap-3 text-sm text-text-primary bg-bg-light rounded-xl p-4 border border-gray-100">
                      <input
                        type="checkbox"
                        checked={form.scholarship_applied}
                        onChange={update('scholarship_applied')}
                        className="w-4 h-4"
                      />
                      I would like to apply for a scholarship
                    </label>

                    {status === 'error' && (
                      <div className="bg-error/10 text-error text-sm rounded-xl p-4 border border-error/20">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? 'Submitting Application…' : 'Submit Application'}
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right Sidebar */}
          <FadeIn delay={100}>
            <aside className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Phone size={24} className="text-primary" />
                </div>

                <h3 className="font-heading text-xl font-bold text-primary mb-3">
                  Admissions Helpdesk
                </h3>

                <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
                  Need help before submitting your application? Contact our
                  admissions team for guidance.
                </p>

                <Link to="/contact" className="font-subheading font-bold text-accent">
                  Contact Admissions →
                </Link>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <GraduationCap size={24} className="text-accent" />
                </div>

                <h3 className="font-heading text-xl font-bold text-primary mb-4">
                  Required Information
                </h3>

                <div className="space-y-3">
                  {REQUIRED_DOCS.map((doc) => (
                    <div key={doc} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
                      <p className="font-body text-sm text-text-secondary">
                        {doc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary rounded-3xl p-6 text-white shadow-xl">
                <h3 className="font-heading text-xl font-bold mb-3">
                  Track After Submission
                </h3>

                <p className="font-body text-sm text-blue-100 leading-relaxed">
                  Save your registration number after submitting the form. It can
                  be used by the admissions team to review and update your
                  application status.
                </p>
              </div>
            </aside>
          </FadeIn>
        </div>
      </section>

      <AdmissionProcessSteps />
      <ScholarshipsBanner />
    </main>
  )
}