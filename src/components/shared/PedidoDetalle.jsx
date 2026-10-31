import { Check, MapPin, Phone, Store, User, X } from 'lucide-react'
import { ESTADOS_PEDIDO, TIPO_ENTREGA_LABEL, TIPOS_ENTREGA } from '../../lib/constants'
import { cn, formatFecha, formatMoney } from '../../lib/utils'
import { Badge, Card, CardBody, CardHeader, EstadoEntregaBadge } from '../ui'

function pasosPara(tipoEntrega) {
  return tipoEntrega === TIPOS_ENTREGA.RECOGER
    ? ['CREADO', 'ACEPTADO', 'EN_PREPARACION', 'ENTREGADO']
    : ['CREADO', 'ACEPTADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO']
}

export function EstadoProgreso({ pedido }) {
  if (pedido.estado === 'CANCELADO') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
        <X className="h-5 w-5" aria-hidden="true" /> Este pedido fue cancelado.
      </div>
    )
  }
  const pasos = pasosPara(pedido.tipo_entrega)
  const actual = pasos.indexOf(pedido.estado)
  return (
    <ol className="grid gap-3 sm:flex sm:items-start sm:gap-0" aria-label="Progreso del pedido">
      {pasos.map((paso, i) => {
        const hecho = i <= actual
        return (
          <li key={paso} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
            <div className="flex w-full items-center sm:justify-center">
              <span
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  hecho ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400',
                  i === actual && 'ring-4 ring-brand-100',
                )}
              >
                {hecho ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              {i < pasos.length - 1 && (
                <span
                  className={cn('hidden h-0.5 flex-1 sm:block', i < actual ? 'bg-brand-500' : 'bg-slate-200')}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className={cn('text-sm sm:text-xs', hecho ? 'font-semibold text-slate-900' : 'text-slate-500')}>
              {ESTADOS_PEDIDO[paso].label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function ResumenItems({ pedido }) {
  return (
    <Card>
      <CardHeader title="Productos" />
      <ul className="divide-y divide-slate-100">
        {pedido.detalle_pedido.map((d) => (
          <li key={d.id_detalle} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <span className="min-w-0">
              <span className="font-semibold text-slate-900">{d.cantidad}×</span> {d.producto?.nombre}
              <span className="block text-xs text-slate-500">{formatMoney(d.precio_unitario)} c/u</span>
            </span>
            <span className="font-medium">{formatMoney(d.precio_unitario * d.cantidad)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t border-slate-100 px-5 py-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>Subtotal</dt>
          <dd>{formatMoney(pedido.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>Envío</dt>
          <dd>{formatMoney(pedido.costo_envio)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
          <dt>Total</dt>
          <dd>{formatMoney(pedido.total)}</dd>
        </div>
      </dl>
    </Card>
  )
}

export function DatosEntrega({ pedido, mostrarRestaurante = false }) {
  return (
    <Card>
      <CardHeader
        title="Entrega"
        action={<Badge tone="brand">{TIPO_ENTREGA_LABEL[pedido.tipo_entrega] ?? 'Sin tipo'}</Badge>}
      />
      <CardBody className="space-y-3 text-sm">
        {mostrarRestaurante && (
          <p className="flex gap-2">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              {pedido.restaurante?.nombre}
              {pedido.tipo_entrega === TIPOS_ENTREGA.RECOGER && pedido.restaurante?.direccion && (
                <span className="block text-slate-500">{pedido.restaurante.direccion}</span>
              )}
            </span>
          </p>
        )}
        <p className="flex gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          {pedido.nombre_contacto}
        </p>
        <p className="flex gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <a href={`tel:${pedido.telefono_contacto}`} className="text-brand-600 hover:underline">
            {pedido.telefono_contacto}
          </a>
        </p>
        {pedido.direccion_entrega && (
          <p className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            {pedido.direccion_entrega}
          </p>
        )}
        {pedido.notas && <p className="rounded-xl bg-amber-50 p-3 text-amber-900">“{pedido.notas}”</p>}
        {pedido.entrega && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-slate-600">
            Estado de la entrega: <EstadoEntregaBadge estado={pedido.entrega.estado_entrega} />
            {pedido.entrega.fecha_entrega && <span>· {formatFecha(pedido.entrega.fecha_entrega)}</span>}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export function HistorialTimeline({ historial }) {
  if (!historial?.length) return null
  return (
    <Card>
      <CardHeader title="Historial" />
      <CardBody>
        <ol className="relative space-y-4 border-l border-slate-200 pl-5">
          {historial.map((h) => (
            <li key={h.id_historial} className="relative text-sm">
              <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
              <p className="font-medium text-slate-900">{ESTADOS_PEDIDO[h.estado_nuevo]?.label ?? h.estado_nuevo}</p>
              <p className="text-xs text-slate-500">{formatFecha(h.fecha_cambio)}</p>
              {h.comentario && <p className="mt-1 text-slate-600">{h.comentario}</p>}
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  )
}
