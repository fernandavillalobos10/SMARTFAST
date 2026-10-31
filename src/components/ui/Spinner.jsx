import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Spinner({ className, label = 'Cargando...' }) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-2 py-12 text-sm text-slate-500', className)}>
      <LoaderCircle className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}
