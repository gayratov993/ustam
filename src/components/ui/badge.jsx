import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800 dark:bg-primary-500/15 dark:text-primary-300',
        success: 'bg-success/10 text-green-700 dark:bg-green-500/15 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
        outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
        accent: 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300',
        slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
