import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card p-5', className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mb-4 flex items-start justify-between gap-3', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-bold text-slate-900 dark:text-white', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
