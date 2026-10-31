import { cn } from '../../lib/utils'

function Chip({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        activo ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  )
}

export function RestaurantSelector({ restaurantes, value, onChange }) {
  if (restaurantes.length < 2) return null
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por restaurante">
      <Chip activo={value == null} onClick={() => onChange(null)}>
        Todos
      </Chip>
      {restaurantes.map((r) => (
        <Chip key={r.id_restaurante} activo={value === r.id_restaurante} onClick={() => onChange(r.id_restaurante)}>
          {r.nombre}
        </Chip>
      ))}
    </div>
  )
}
