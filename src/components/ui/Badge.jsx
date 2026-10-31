import { cn } from '../../lib/utils'
import { ESTADOS_ENTREGA, ESTADOS_PEDIDO } from '../../lib/constants'

const tones = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
}

export function Badge({ tone = 'slate', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EstadoPedidoBadge({ estado, className }) {
  const info = ESTADOS_PEDIDO[estado] ?? { label: estado, tone: 'slate' }
  return (
    <Badge tone={info.tone} className={className}>
      {info.label}
    </Badge>
  )
}

export function EstadoEntregaBadge({ estado, className }) {
  const info = ESTADOS_ENTREGA[estado] ?? { label: estado, tone: 'slate' }
  return (
    <Badge tone={info.tone} className={className}>
      {info.label}
    </Badge>
  )
}
