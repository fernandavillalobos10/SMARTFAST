import { Bike, ChefHat, Clock, RefreshCw, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AccionesPedido } from '../../components/shared/AccionesPedido'
import { Alert, Badge, Button, Card, EmptyState, EstadoPedidoBadge, PageHeader, Spinner, Table, Td, Th } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { ESTADOS_ACTIVOS, ESTADOS_PEDIDO, TIPOS_ENTREGA } from '../../lib/constants'
import { cn, formatFecha, formatMoney, haceCuanto, mensajeError } from '../../lib/utils'
import { listarPedidosRestaurante, suscribirPedidosRestaurante } from '../../services/pedidos.service'

const REFRESCO_MS = 30_000

const COLUMNA_COLOR = {
  CREADO: 'bg-blue-500',
  ACEPTADO: 'bg-indigo-500',
  EN_PREPARACION: 'bg-amber-500',
  EN_CAMINO: 'bg-purple-500',
}

function TarjetaPedido({ pedido, onCambio, onError }) {
  const domicilio = pedido.tipo_entrega === TIPOS_ENTREGA.DOMICILIO
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/restaurante/pedidos/${pedido.id_pedido}`} className="font-display text-lg font-bold hover:text-brand-600">
          #{pedido.id_pedido}
        </Link>
        <Badge tone={domicilio ? 'purple' : 'slate'}>
          {domicilio ? <Bike className="h-3 w-3" aria-hidden="true" /> : <Store className="h-3 w-3" aria-hidden="true" />}
          {domicilio ? 'Domicilio' : 'Recoger'}
        </Badge>
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
        <Clock className="h-3 w-3" aria-hidden="true" /> {haceCuanto(pedido.fecha_pedido)} · {pedido.nombre_contacto}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {pedido.detalle_pedido.map((d) => (
          <li key={d.id_detalle}>
            <span className="font-semibold">{d.cantidad}×</span> {d.producto?.nombre}
          </li>
        ))}
      </ul>
      {pedido.notas && <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">“{pedido.notas}”</p>}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-semibold">{formatMoney(pedido.total)}</span>
      </div>
      <AccionesPedido pedido={pedido} className="mt-3" onCambio={onCambio} onError={onError} />
    </Card>
  )
}

function Finalizados({ idRestaurante }) {
  const { data, error, loading } = useAsync(
    () => listarPedidosRestaurante(idRestaurante, { estados: ['ENTREGADO', 'CANCELADO'], limite: 50 }),
    [idRestaurante],
  )
  if (loading) return <Spinner />
  if (error) return <Alert type="error">{mensajeError(error)}</Alert>
  if (!data.length) return <EmptyState title="Sin pedidos finalizados" />
  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <Th>Pedido</Th>
            <Th>Fecha</Th>
            <Th>Cliente</Th>
            <Th>Estado</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((p) => (
            <tr key={p.id_pedido}>
              <Td>
                <Link to={`/restaurante/pedidos/${p.id_pedido}`} className="font-semibold hover:text-brand-600">
                  #{p.id_pedido}
                </Link>
              </Td>
              <Td className="whitespace-nowrap">{formatFecha(p.fecha_pedido)}</Td>
              <Td>{p.nombre_contacto}</Td>
              <Td>
                <EstadoPedidoBadge estado={p.estado} />
              </Td>
              <Td className="text-right font-medium">{formatMoney(p.total)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}

export default function PedidosCocina() {
  const { idRestaurante } = useRestaurant()
  const [vista, setVista] = useState('tablero')
  const [errorAccion, setErrorAccion] = useState(null)
  const { data, error, loading, recargar } = useAsync(
    // Los más antiguos primero: es el orden en que la cocina los atiende
    () => listarPedidosRestaurante(idRestaurante, { estados: ESTADOS_ACTIVOS, ascendente: true, limite: 200 }),
    [idRestaurante],
  )

  useEffect(() => {
    const intervalo = setInterval(() => recargar({ silencioso: true }), REFRESCO_MS)
    const desuscribir = suscribirPedidosRestaurante(idRestaurante, () => recargar({ silencioso: true }))
    return () => {
      clearInterval(intervalo)
      desuscribir()
    }
  }, [idRestaurante, recargar])

  const columnas = useMemo(
    () => ESTADOS_ACTIVOS.map((estado) => ({ estado, pedidos: (data ?? []).filter((p) => p.estado === estado) })),
    [data],
  )

  const alCambiar = async () => {
    setErrorAccion(null)
    await recargar({ silencioso: true })
  }

  return (
    <>
      <PageHeader
        title="Cocina"
        description="Acepta, prepara y despacha los pedidos. El stock se descuenta al aceptar."
        action={
          <>
            <div className="flex rounded-xl bg-slate-100 p-1">
              {[
                ['tablero', 'En curso'],
                ['finalizados', 'Finalizados'],
              ].map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVista(v)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium',
                    vista === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {vista === 'tablero' && (
              <Button variant="secondary" onClick={() => recargar({ silencioso: true })}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
              </Button>
            )}
          </>
        }
      />

      {errorAccion && (
        <Alert type="error" className="mb-4">
          {errorAccion}
        </Alert>
      )}

      {vista === 'finalizados' ? (
        <Finalizados idRestaurante={idRestaurante} />
      ) : loading ? (
        <Spinner label="Cargando pedidos..." />
      ) : error ? (
        <Alert type="error">{mensajeError(error)}</Alert>
      ) : !data.length ? (
        <EmptyState icon={ChefHat} title="No hay pedidos en curso" description="Los nuevos pedidos aparecerán aquí automáticamente." />
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4 xl:overflow-visible">
          {columnas.map(({ estado, pedidos }) => (
            <section key={estado} className="w-[85vw] max-w-sm shrink-0 snap-start sm:w-80 xl:w-auto xl:max-w-none" aria-label={ESTADOS_PEDIDO[estado].label}>
              <header className="mb-3 flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', COLUMNA_COLOR[estado])} aria-hidden="true" />
                <h2 className="text-sm font-semibold">{ESTADOS_PEDIDO[estado].label}</h2>
                <span className="rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-700">{pedidos.length}</span>
              </header>
              <div className="space-y-3">
                {pedidos.map((p) => (
                  <TarjetaPedido key={p.id_pedido} pedido={p} onCambio={alCambiar} onError={setErrorAccion} />
                ))}
                {!pedidos.length && <p className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">Sin pedidos</p>}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
