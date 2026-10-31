import { Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function Logo({ to = '/', className }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2 font-display text-lg font-bold text-slate-900', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm shadow-brand-500/40">
        <Zap className="h-4 w-4 fill-current" aria-hidden="true" />
      </span>
      <span>
        Smart<span className="text-brand-500">Fast</span>
      </span>
    </Link>
  )
}
