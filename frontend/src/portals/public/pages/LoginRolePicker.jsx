import { GraduationCap, HeartHandshake, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const ROLES = [
  {
    to: '/student/login',
    label: 'Student Login',
    icon: GraduationCap,
    desc: 'Attendance, homework, exams, results, fees & more.',
    color: 'bg-academic-blue',
  },
  {
    to: '/teacher/login',
    label: 'Teacher Login',
    icon: Users,
    desc: 'Classes, attendance, exams, marks entry & messaging.',
    color: 'bg-academic-green',
  },
  {
    to: '/parent/login',
    label: 'Parent Login',
    icon: HeartHandshake,
    desc: "Track your child's progress, fees, transport & more.",
    color: 'bg-academic-green',
  },
  {
    to: '/admin/login',
    label: 'Admin Login',
    icon: ShieldCheck,
    desc: 'Restricted — school administration & operations.',
    color: 'bg-bg-dark',
  },
]

export default function LoginRolePicker() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">Portal Login</h1>
        <p className="text-text-secondary font-body">Choose your role to sign in to your EduNova portal.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {ROLES.map(({ to, label, icon: Icon, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-raised transition-shadow p-6 flex items-start gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shrink-0`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="font-heading font-semibold text-lg text-text-primary group-hover:text-primary transition-colors">
                {label}
              </p>
              <p className="text-sm text-text-secondary font-body mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
