import { Link } from 'react-router-dom'
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import { cmsApi } from '../../../api/cmsApi'
import { useFetch } from '../../../components/useFetch'
import FadeIn from '../../../components/FadeIn'

const fallbackImages = [
  {
    id: 'campus',
    image: '/Campus.jpeg',
    caption: 'EduNova Campus',
  },
  {
    id: 'building',
    image: '/building.jpeg',
    caption: 'School Building',
  },
  {
    id: 'exterior',
    image: '/exterior.jpeg',
    caption: 'Campus Exterior',
  },
  {
    id: 'students',
    image: '/student.jpeg',
    caption: 'Students at EduNova',
  },
  {
    id: 'edunova',
    image: '/EduNova.jpeg',
    caption: 'EduNova Global Academy',
  },
  {
    id: 'campus-life',
    image: '/Campus.jpeg',
    caption: 'Campus Life',
  },
  {
    id: 'learning',
    image: '/student.jpeg',
    caption: 'Digital Learning',
  },
  {
    id: 'infrastructure',
    image: '/building.jpeg',
    caption: 'Modern Infrastructure',
  },
]

export default function CampusGallery() {
  const { data: albums, loading } = useFetch(cmsApi.getGalleryAlbums, [])

  const previewImages = (albums || [])
    .flatMap((album) => album.images || [])
    .slice(0, 8)

  const imagesToShow = previewImages.length > 0 ? previewImages : fallbackImages

  return (
    <section className="bg-white">
      <div className="section">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <FadeIn>
            <div>
              <p className="inline-flex items-center gap-2 font-subheading font-semibold text-accent uppercase text-sm mb-3 bg-accent/10 px-4 py-2 rounded-full">
                <ImageIcon size={15} /> Campus Gallery
              </p>

              <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-3">
                Explore Life at EduNova
              </h2>

              <p className="font-body text-text-secondary max-w-2xl leading-relaxed">
                A glimpse of our smart classrooms, modern infrastructure, student
                activities, digital learning spaces, and vibrant academy campus.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 font-subheading font-bold text-accent hover:text-primary transition-colors"
            >
              View All Gallery <ArrowRight size={18} />
            </Link>
          </FadeIn>
        </div>

        {loading ? (
          <p className="text-text-secondary">Loading gallery…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagesToShow.map((img, index) => (
              <FadeIn key={img.id || index} delay={index * 40}>
                <div
                  className={`group relative overflow-hidden rounded-2xl shadow-md border border-gray-100 ${
                    index === 0 || index === 5
                      ? 'md:col-span-2 md:row-span-2'
                      : ''
                  }`}
                >
                  <img
                    src={img.image}
                    alt={img.caption || 'EduNova Campus Gallery'}
                    className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                      index === 0 || index === 5
                        ? 'h-[260px] md:h-[420px]'
                        : 'h-[180px] md:h-[200px]'
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-primary/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-subheading font-bold text-white text-sm md:text-base drop-shadow">
                      {img.caption || 'EduNova Campus'}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}