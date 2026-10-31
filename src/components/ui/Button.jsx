import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'danger-ghost': 'text-red-600 hover:bg-red-50',
  dark: 'bg-slate-900 text-white hover:bg-slate-800',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9',
}

export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type,
  ...props
}) {
  const isButton = Component === 'button'
  return (
    <Component
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={isButton ? disabled || loading : undefined}
      type={isButton ? (type ?? 'button') : undefined}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  )
}
