import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-soft hover:shadow-lift hover:opacity-95',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        outline: 'border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
        ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        danger: 'bg-danger text-danger-foreground hover:bg-red-700',
        success: 'bg-success text-success-foreground hover:bg-green-700',
        link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, loading, children, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size, className }))}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
))
Button.displayName = 'Button'

export { Button, buttonVariants }
