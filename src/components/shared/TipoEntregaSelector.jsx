import { Bike, Store } from 'lucide-react'
import { TIPOS_ENTREGA } from '../../lib/constants'
import { cn, formatMoney } from '../../lib/utils'

export function TipoEntregaSelector({ value, onChange, costoEnvio }) {
  const opciones = [
    { valor: TIPOS_ENTREGA.DOMICILIO, label: 'A domicilio', detalle: `Envío ${formatMoney(costoEnvio)}`, icon: Bike },
    { valor: TIPOS_ENTREGA.RECOGER, label: 'Recoger en local', detalle: 'Sin costo de envío', icon: Store },
  ]
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de entrega">
      {opciones.map(({ valor, label, detalle, icon: Icon }) => {
        const activo = value === valor
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(valor)}
            className={cn(
              'flex flex-col items-start gap-1 rounded-xl p-3 text-left ring-1 ring-inset transition-colors',
              activo ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-slate-200 hover:bg-slate-50',
            )}
          >
            <Icon className={cn('h-5 w-5', activo ? 'text-brand-600' : 'text-slate-400')} aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            <span className="text-xs text-slate-500">{detalle}</span>
          </button>
        )
      })}
    </div>
  )
}
