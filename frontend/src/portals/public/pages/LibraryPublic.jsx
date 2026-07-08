import { Link } from 'react-router-dom'
import {
  BookOpenText,
  Search,
  Download,
  Monitor,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import FadeIn from '../../../components/FadeIn'

const LIBRARY_FEATURES = [
  {
    title: 'Physical Books',
    desc: 'A rich collection of academic books, reference materials, fiction, non-fiction, and reading resources.',
    icon: BookOpenText,
  },
  {
    title: 'Digital Library',
    desc: 'Access to e-books, digital learning content, academic resources, and online reading material.',
    icon: Monitor,
  },
  {
    title: 'Book Search',
    desc: 'Students can search books, check availability, and access library resources digitally.',
    icon: Search,
  },
  {
    title: 'Downloads',
    desc: 'Important academic documents, reading materials, assignments, and notices can be made available online.',
    icon: Download,
  },
  {
    title: 'Issue & Return',
    desc: 'Library issue, return, due date, and fine management are handled through digital records.',
    icon: FileText,
  },
  {
    title: 'Reading Culture',
    desc: 'The library encourages reading habits, research skills, curiosity, and lifelong learning.',
    icon: Users,
  },
]

export default function LibraryPublic() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/EduNova.jpeg"
          alt="EduNova digital library"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <BookOpenText size={16} /> Library
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              Digital and Physical Library for Academic Excellence
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              EduNova’s library supports students with physical books, digital
              resources, e-books, academic materials, reading spaces, and
              technology-enabled library services.
            </p>

            <Link to="/downloads" className="inline-flex items-center gap-2 btn-primary">
              View Downloads <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div>
            <p className="font-subheading font-semibold text-accent uppercase text-sm mb-3">
              Knowledge Center
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-5">
              Supporting Reading, Research, and Digital Learning
            </h2>

            <p className="font-body text-text-secondary leading-relaxed mb-5">
              The EduNova library is designed as a learning hub where students
              can explore academic books, digital resources, reference materials,
              research content, and reading programs.
            </p>

            <p className="font-body text-text-secondary leading-relaxed mb-7">
              The digital library supports modern learning through e-resources,
              online content, issue/return tracking, academic downloads, and
              student-friendly access.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Physical and digital book access',
                'Academic references and e-learning resources',
                'Book issue, return, and tracking support',
                'Reading culture and research support',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-bg-light rounded-2xl p-4 border border-gray-100"
                >
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-text-primary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/student.jpeg"
              alt="Students using library resources"
              className="w-full h-[430px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-lg">
              <h3 className="font-heading font-bold text-primary text-lg mb-1">
                Learning Beyond Textbooks
              </h3>
              <p className="font-body text-sm text-text-secondary">
                Encouraging research, reading, curiosity, and lifelong learning.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="bg-bg-light">
        <div className="section">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="font-subheading font-semibold text-secondary uppercase text-sm mb-3">
                Library Services
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Complete Library Management and Learning Support
              </h2>
              <p className="font-body text-text-secondary leading-relaxed">
                The library supports students, teachers, and academic departments
                with organized learning resources.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIBRARY_FEATURES.map(({ title, desc, icon: Icon }, index) => (
              <FadeIn key={title} delay={index * 50}>
                <div className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <Icon size={26} className="text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-subheading font-bold text-primary text-lg mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}