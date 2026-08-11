import { cn } from '@/lib/utils'

function Avatar({ src, name, size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  }
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part?.[0] || '')
    .join('')
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 font-semibold text-white',
        sizes[size],
        className
      )}
    >
      {initials || '?'}
    </div>
  )
}

export { Avatar }
