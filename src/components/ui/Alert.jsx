import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/utils'

const styles = {
  error: { box: 'bg-red-50 text-red-800 ring-red-200', Icon: CircleAlert },
  success: { box: 'bg-emerald-50 text-emerald-800 ring-emerald-200', Icon: CircleCheck },
  warning: { box: 'bg-amber-50 text-amber-900 ring-amber-200', Icon: TriangleAlert },
  info: { box: 'bg-blue-50 text-blue-800 ring-blue-200', Icon: Info },
}

export function Alert({ type = 'info', title, children, className }) {
  const { box, Icon } = styles[type]
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl p-3.5 text-sm ring-1 ring-inset', box, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  )
}
