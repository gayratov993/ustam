import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

function RatingStars({ value = 0, onChange, size = 'md', readOnly = false }) {
  const [hovered, setHovered] = useState(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    setDisplay(value)
  }, [value])

  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' }
  const active = hovered ?? display

  return (
    <div
      className={cn('flex items-center gap-0.5', !readOnly && 'cursor-pointer')}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readOnly}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          className={cn('transition', !readOnly && 'focus:outline-none')}
        >
          <Star
            className={cn(
              sizes[size],
              star <= active
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-slate-300 dark:text-slate-600'
            )}
          />
        </motion.button>
      ))}
    </div>
  )
}

function AnimatedRatingValue({ value }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="text-sm font-bold text-slate-900 dark:text-white"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

export { RatingStars, AnimatedRatingValue }
