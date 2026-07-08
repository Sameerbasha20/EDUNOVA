import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  {
    label: 'Academics',
    items: [
      { to: '/academics', label: 'Academic Programs' },
      { to: '/departments', label: 'Departments' },
      { to: '/faculty', label: 'Faculty' },
      { to: '/achievements', label: 'Achievements' },
    ],
  },
  {
    label: 'Admissions',
    items: [
      { to: '/admissions', label: 'Admissions Process' },
      { to: '/faq', label: 'FAQs' },
      { to: '/downloads', label: 'Downloads' },
    ],
  },
  {
    label: 'Campus Life',
    items: [
      { to: '/infrastructure', label: 'Infrastructure' },
      { to: '/facilities', label: 'Facilities' },
      { to: '/library', label: 'Library' },
      { to: '/transport', label: 'Transport' },
      { to: '/hostel', label: 'Hostel' },
      { to: '/sports', label: 'Sports' },
      { to: '/student-life', label: 'Student Life' },
    ],
  },
  {
    label: 'Media',
    items: [
      { to: '/gallery', label: 'Gallery' },
      { to: '/news', label: 'News' },
      { to: '/events', label: 'Events' },
      { to: '/careers', label: 'Careers' },
    ],
  },
  {
    label: 'Login',
    items: [
      { to: '/student/login', label: 'Student Login' },
      { to: '/teacher/login', label: 'Teacher Login' },
      { to: '/parent/login', label: 'Parent Login' },
      { to: '/admin/login', label: 'Admin Login' },
    ],
  },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `font-subheading text-sm font-semibold transition-colors ${
      isActive ? 'text-accent' : 'text-text-primary hover:text-primary'
    }`

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b transition-all duration-300 ${
        scrolled ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}
      >
        <Link to="/" className="font-heading font-bold text-xl text-primary">
          EduNova <span className="text-accent">Global Academy</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map((item) =>
            item.items ? (
              <div key={item.label} className="relative group">
                <button
                  type="button"
                  className="font-subheading text-sm font-semibold text-text-primary hover:text-primary transition-colors inline-flex items-center gap-1 py-5"
                >
                  {item.label}
                  <ChevronDown size={15} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>

                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
                    {item.items.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl font-subheading text-sm font-semibold transition-colors ${
                            isActive
                              ? 'bg-orange-50 text-accent'
                              : 'text-text-primary hover:bg-blue-50 hover:text-primary'
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            )
          )}

          <Link to="/login" className="font-subheading text-sm font-semibold text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/5 transition-colors">
            Login
          </Link>
          <Link to="/admissions" className="btn-primary !py-2 !px-4 text-sm">
            Apply Now
          </Link>
        </nav>

        <button
          className="lg:hidden text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="lg:hidden px-6 pb-4 bg-white border-t border-gray-100 shadow-lg">
          {NAV_ITEMS.map((item, index) =>
            item.items ? (
              <div key={item.label} className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setMobileDropdown(mobileDropdown === index ? null : index)}
                  className="w-full py-3 flex items-center justify-between font-subheading font-semibold text-text-primary"
                >
                  {item.label}
                  <ChevronDown
                    size={17}
                    className={`transition-transform ${mobileDropdown === index ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobileDropdown === index && (
                  <div className="pb-2 pl-4 flex flex-col gap-1">
                    {item.items.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        onClick={() => {
                          setOpen(false)
                          setMobileDropdown(null)
                        }}
                        className="py-2 px-3 rounded-lg font-subheading text-sm font-semibold text-text-secondary hover:bg-blue-50 hover:text-primary"
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block py-3 font-subheading font-semibold text-text-primary border-b border-gray-100"
              >
                {item.label}
              </NavLink>
            )
          )}

          <Link to="/login" onClick={() => setOpen(false)} className="mt-4 block text-center border border-primary/30 text-primary rounded-full py-2 font-subheading font-semibold text-sm">
            Login
          </Link>
          <Link to="/admissions" onClick={() => setOpen(false)} className="btn-primary mt-3 block text-center">
            Apply Now
          </Link>
        </nav>
      )}
    </header>
  )
}
