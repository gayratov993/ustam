import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn('input-base', className)}
    {...props}
  />
))
Input.displayName = 'Input'

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('input-base min-h-[100px] resize-y', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

const Label = forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('label-base', className)} {...props} />
))
Label.displayName = 'Label'

export { Input, Textarea, Label }
