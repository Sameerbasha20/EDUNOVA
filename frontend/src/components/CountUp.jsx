import { useEffect, useRef, useState } from 'react'

/**
 * Animates a stat value like "6,500+" or "98%" counting up from 0 once it
 * scrolls into view. Splits the numeric portion from any prefix/suffix
 * (₹, +, %, commas) so it can animate the number while keeping the rest.
 */
export default function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(null)

  const match = String(value ?? '').match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/)
  const prefix = match?.[1] ?? ''
  const numeric = match ? parseFloat(match[2].replace(/,/g, '')) : null
  const suffix = match?.[3] ?? ''
  const hasCommas = match?.[2]?.includes(',')

  useEffect(() => {
    if (numeric === null) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = Math.round(numeric * eased)
          setDisplay(hasCommas ? current.toLocaleString('en-IN') : current)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [numeric, duration, hasCommas])

  if (numeric === null) {
    return <span ref={ref}>{value}</span>
  }

  return (
    <span ref={ref}>
      {prefix}
      {display === null ? 0 : display}
      {suffix}
    </span>
  )
}
