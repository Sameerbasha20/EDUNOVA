import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router does not reset scroll position on navigation by default —
 * without this, clicking a link while scrolled halfway down a long page
 * (e.g. the homepage) lands on the new page still scrolled down, which
 * reads as broken. Mount once near the root, inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Set scrollTop directly rather than window.scrollTo — this project's
    // global `html { scroll-behavior: smooth }` (index.css) would otherwise
    // turn every route change into a slow animated scroll back to the top.
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}
