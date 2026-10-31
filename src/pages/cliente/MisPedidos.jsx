import { ChevronRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, EmptyState, EstadoPedidoBadge, PageHeader, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { TIPO_ENTREGA_LABEL } from '../../lib/constants'
import { formatFecha, formatMoney, mensajeError } from '../../lib/utils'
import { listarMisPedidos } from '../../services/pedidos.service'

export default function MisPedidos() {
  const { perfil } = useAuth()
  const { data, error, loading } = useAsync(() => listarMisPedidos(perfil.id_usuario), [perfil.id_usuario])

  return (
    <>
      <PageHeader title="Mis pedidos" description="Consulta el estado de tus pedidos." />
      {error && <Alert type="error">{mensajeError(error)}</Alert>}
      {loading ? (
        <Spinner />
      ) : data?.length ? (
        <Card>
          <ul className="divide-y divide-slate-100">
            {data.map((p) => (
              <li key={p.id_pedido}>
                <Link
                  to={`/mis-pedidos/${p.id_pedido}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">#{p.id_pedido}</span>
                      <EstadoPedidoBadge estado={p.estado} />
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {p.restaurante?.nombre} · {p.detalle_pedido.reduce((s, d) => s + d.cantidad, 0)} productos ·{' '}
                      {TIPO_ENTREGA_LABEL[p.tipo_entrega]}
                    </p>
                    <p className="text-xs text-slate-400">{formatFecha(p.fecha_pedido)}</p>
                  </div>
                  <span className="font-semibold">{formatMoney(p.total)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !error && (
          <EmptyState
            icon={ClipboardList}
            title="Aún no tienes pedidos"
            description="Cuando hagas tu primer pedido aparecerá aquí."
            action={
              <Button as={Link} to="/catalogo">
                Ver menú
              </Button>
            }
          />
        )
      )}
    </>
  )
}
