import { useEffect, useRef } from 'react'

export function useCountUp(target, { duration = 1200, startOnView = true } = {}) {
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !startOnView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.round(eased * target).toLocaleString()
            if (progress < 1) requestAnimationFrame(tick)
            else el.textContent = target.toLocaleString()
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, startOnView])

  return ref
}
