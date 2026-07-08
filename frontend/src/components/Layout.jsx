import Nav from './Nav'
import Footer from './Footer'
import ScrollProgress from './ScrollProgress'
import BackToTop from './BackToTop'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  )
}
