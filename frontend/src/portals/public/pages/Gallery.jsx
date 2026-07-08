import { Link } from 'react-router-dom'
import { Camera, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const fallbackImages = [
  { id: '1', image: '/Campus.jpeg', caption: 'EduNova Campus' },
  { id: '2', image: '/building.jpeg', caption: 'Modern School Building' },
  { id: '3', image: '/student.jpeg', caption: 'Student Learning Experience' },
  { id: '4', image: '/exterior.jpeg', caption: 'Campus Exterior' },
  { id: '5', image: '/EduNova.jpeg', caption: 'EduNova Global Academy' },
  { id: '6', image: '/Campus.jpeg', caption: 'Digital Campus' },
  { id: '7', image: '/student.jpeg', caption: 'Student Life' },
  { id: '8', image: '/building.jpeg', caption: 'Academic Infrastructure' },
]

export default function Gallery() {
  const { data: albums, loading } = useFetch(cmsApi.getGalleryAlbums, [])

  const cmsImages = (albums || [])
    .flatMap((album) => album.images || [])
    .map((img) => ({
      id: img.id,
      image: img.image,
      caption: img.caption || 'EduNova Gallery',
    }))

  const images = cmsImages.length > 0 ? cmsImages : fallbackImages

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden text-white">
        <img
          src="/Campus.jpeg"
          alt="EduNova Gallery"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/35" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 section py-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-highlight uppercase text-sm mb-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur">
              <Camera size={16} /> Campus Gallery
            </p>

            <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl mb-6">
              A Visual Journey Through EduNova Campus Life
            </h1>

            <p className="font-body text-white/90 max-w-2xl text-lg leading-relaxed mb-8">
              Explore our campus, classrooms, students, infrastructure, events,
              achievements, activities, and learning environment.
            </p>

            <Link to="/student-life" className="inline-flex items-center gap-2 btn-primary">
              View Student Life <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="section">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="inline-flex items-center gap-2 font-subheading font-semibold text-accent uppercase text-sm mb-3 bg-accent/10 px-4 py-2 rounded-full">
              <ImageIcon size={15} /> Gallery Highlights
            </p>

            <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Moments from EduNova Global Academy
            </h2>

            <p className="font-body text-text-secondary leading-relaxed">
              A glimpse of our smart classrooms, modern infrastructure, digital
              learning, student activities, academic events, and vibrant campus culture.
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <p className="text-center text-text-secondary">Loading gallery…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <FadeIn key={img.id || index} delay={index * 40}>
                <div
                  className={`group relative overflow-hidden rounded-3xl shadow-md border border-gray-100 ${
                    index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <img
                    src={img.image}
                    alt={img.caption || 'EduNova Gallery'}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                      index === 0 || index === 5
                        ? 'h-[260px] md:h-[430px]'
                        : 'h-[180px] md:h-[205px]'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-subheading font-bold text-white drop-shadow">
                      {img.caption || 'EduNova Campus'}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary text-white">
        <div className="section text-center max-w-4xl">
          <FadeIn>
            <Sparkles size={42} className="mx-auto text-highlight mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Experience the EduNova Environment
            </h2>
            <p className="font-body text-blue-100 leading-relaxed mb-8">
              Our campus is designed for learning, innovation, creativity,
              confidence, leadership, and lifelong student growth.
            </p>
            <Link to="/admissions" className="btn-primary">
              Apply Now
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}