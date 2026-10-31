import { cn } from '../../lib/utils'

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-slate-100 text-sm', className)}>{children}</table>
    </div>
  )
}

export function Th({ className, ...props }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }) {
  return <td className={cn('px-4 py-3 align-middle text-slate-700', className)} {...props} />
}
