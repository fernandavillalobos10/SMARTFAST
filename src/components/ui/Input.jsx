import { useId } from 'react'
import { cn } from '../../lib/utils'

const fieldBase =
  'block w-full rounded-xl border-0 bg-white px-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 ' +
  'placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-500'

function Field({ id, label, error, hint, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

function useFieldProps(id, error) {
  const generated = useId()
  const fieldId = id ?? generated
  return {
    fieldId,
    aria: {
      id: fieldId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${fieldId}-error` : undefined,
    },
  }
}

export function Input({ label, error, hint, className, inputClassName, id, ref, ...props }) {
  const { fieldId, aria } = useFieldProps(id, error)
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} className={className}>
      <input
        ref={ref}
        className={cn(fieldBase, 'h-10', error && 'ring-red-400 focus:ring-red-500', inputClassName)}
        {...aria}
        {...props}
      />
    </Field>
  )
}

export function Textarea({ label, error, hint, className, id, rows = 3, ref, ...props }) {
  const { fieldId, aria } = useFieldProps(id, error)
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} className={className}>
      <textarea
        ref={ref}
        rows={rows}
        className={cn(fieldBase, 'py-2.5', error && 'ring-red-400 focus:ring-red-500')}
        {...aria}
        {...props}
      />
    </Field>
  )
}

export function Select({ label, error, hint, className, id, children, ref, ...props }) {
  const { fieldId, aria } = useFieldProps(id, error)
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} className={className}>
      <select ref={ref} className={cn(fieldBase, 'h-10 pr-8')} {...aria} {...props}>
        {children}
      </select>
    </Field>
  )
}
