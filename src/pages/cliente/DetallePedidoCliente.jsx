import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AccionesPedido } from '../../components/shared/AccionesPedido'
import { DatosEntrega, EstadoProgreso, HistorialTimeline, ResumenItems } from '../../components/shared/PedidoDetalle'
import { Alert, Button, Card, CardBody, EstadoPedidoBadge, PageHeader, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { formatFecha, mensajeError } from '../../lib/utils'
import { obtenerPedido } from '../../services/pedidos.service'

export default function DetallePedidoCliente() {
  const { id } = useParams()
  const { data: pedido, error, loading, recargar } = useAsync(() => obtenerPedido(id), [id])
  const [errorAccion, setErrorAccion] = useState(null)

  if (loading) return <Spinner />
  if (error) return <Alert type="error">{mensajeError(error)}</Alert>
  if (!pedido) return <Alert type="warning">No encontramos este pedido.</Alert>

  return (
    <>
      <Button as={Link} to="/mis-pedidos" variant="ghost" size="sm" className="-ml-3 mb-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Mis pedidos
      </Button>
      <PageHeader
        title={`Pedido #${pedido.id_pedido}`}
        description={`${pedido.restaurante?.nombre} · ${formatFecha(pedido.fecha_pedido)}`}
        action={
          <>
            <EstadoPedidoBadge estado={pedido.estado} className="self-center text-sm" />
            <Button variant="secondary" size="sm" onClick={() => recargar({ silencioso: true })}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardBody>
            <EstadoProgreso pedido={pedido} />
          </CardBody>
        </Card>
        {errorAccion && <Alert type="error">{errorAccion}</Alert>}
        <AccionesPedido
          pedido={pedido}
          modo="cliente"
          onCambio={() => recargar({ silencioso: true })}
          onError={setErrorAccion}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <ResumenItems pedido={pedido} />
          <div className="space-y-6">
            <DatosEntrega pedido={pedido} mostrarRestaurante />
            <HistorialTimeline historial={pedido.historial} />
          </div>
        </div>
      </div>
    </>
  )
}
