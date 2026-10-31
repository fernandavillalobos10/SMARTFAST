import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl bg-white shadow-card ring-1 ring-slate-100', className)} {...props} />
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}
