import { MapPin, Phone, RefreshCw, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AccionesPedido } from '../../components/shared/AccionesPedido'
import { Alert, Button, Card, EmptyState, EstadoEntregaBadge, PageHeader, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { ESTADOS_ENTREGA } from '../../lib/constants'
import { cn, formatMoney, haceCuanto, mensajeError } from '../../lib/utils'
import { listarEntregas } from '../../services/pedidos.service'

const ACTIVAS = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO']

const FILTROS = [
  { valor: 'ACTIVAS', label: 'Activas' },
  ...Object.entries(ESTADOS_ENTREGA).map(([valor, { label }]) => ({ valor, label })),
  { valor: 'TODAS', label: 'Todas' },
]

export default function EntregasList() {
  const { idRestaurante } = useRestaurant()
  const [filtro, setFiltro] = useState('ACTIVAS')
  const [errorAccion, setErrorAccion] = useState(null)
  const { data, error, loading, recargar } = useAsync(
    () => listarEntregas(idRestaurante, { estado: ['ACTIVAS', 'TODAS'].includes(filtro) ? undefined : filtro }),
    [idRestaurante, filtro],
  )
  const entregas = filtro === 'ACTIVAS' ? data?.filter((e) => ACTIVAS.includes(e.estado_entrega)) : data

  return (
    <>
      <PageHeader
        title="Entregas"
        description="Pedidos a domicilio del restaurante. Cada acción actualiza también el pedido."
        action={
          <Button variant="secondary" onClick={() => recargar({ silencioso: true })}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
          </Button>
        }
      />

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar entregas">
        {FILTROS.map(({ valor, label }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium',
              filtro === valor ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {errorAccion && (
        <Alert type="error" className="mb-4">
          {errorAccion}
        </Alert>
      )}
      {error && <Alert type="error">{mensajeError(error)}</Alert>}

      {loading ? (
        <Spinner />
      ) : entregas?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entregas.map((e) => (
            <Card key={e.id_entrega} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/restaurante/entregas/${e.id_entrega}`} className="font-display text-lg font-bold hover:text-brand-600">
                  Pedido #{e.pedido.id_pedido}
                </Link>
                <EstadoEntregaBadge estado={e.estado_entrega} />
              </div>
              <p className="text-xs text-slate-500">
                {haceCuanto(e.pedido.fecha_pedido)} · {formatMoney(e.pedido.total)}
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.direccion_entrega)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-600 hover:underline"
                  >
                    {e.direccion_entrega}
                  </a>
                </p>
                <p className="flex gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>
                    {e.pedido.nombre_contacto} ·{' '}
                    <a href={`tel:${e.pedido.telefono_contacto}`} className="text-brand-600 hover:underline">
                      {e.pedido.telefono_contacto}
                    </a>
                  </span>
                </p>
              </div>
              {e.pedido.estado === 'CREADO' && (
                <p className="mt-3 text-xs text-slate-500">El pedido aún no ha sido aceptado por cocina.</p>
              )}
              <AccionesPedido
                pedido={e.pedido}
                className="mt-auto pt-4"
                onCambio={() => {
                  setErrorAccion(null)
                  return recargar({ silencioso: true })
                }}
                onError={setErrorAccion}
              />
            </Card>
          ))}
        </div>
      ) : (
        !error && <EmptyState icon={Truck} title="No hay entregas" description="Las entregas se crean con cada pedido a domicilio." />
      )}
    </>
  )
}
