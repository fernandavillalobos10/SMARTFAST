import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AccionesPedido } from '../../components/shared/AccionesPedido'
import { DatosEntrega, EstadoProgreso, HistorialTimeline, ResumenItems } from '../../components/shared/PedidoDetalle'
import { Alert, Button, Card, CardBody, EstadoPedidoBadge, PageHeader, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { formatFecha, mensajeError } from '../../lib/utils'
import { obtenerPedido } from '../../services/pedidos.service'

// También se usa desde el módulo de entregas (volverA / volverLabel).
export function VistaPedidoRestaurante({ idPedido, volverA = '/restaurante/cocina', volverLabel = 'Cocina' }) {
  const { idRestaurante } = useRestaurant()
  const { data: pedido, error, loading, recargar } = useAsync(() => obtenerPedido(idPedido), [idPedido])
  const [errorAccion, setErrorAccion] = useState(null)

  const volver = (
    <Button as={Link} to={volverA} variant="ghost" size="sm" className="-ml-3 mb-2">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {volverLabel}
    </Button>
  )

  if (loading) return <Spinner />
  if (error) return <Alert type="error">{mensajeError(error)}</Alert>
  if (!pedido || pedido.id_restaurante !== idRestaurante) {
    return (
      <>
        {volver}
        <Alert type="warning">Pedido no encontrado.</Alert>
      </>
    )
  }

  return (
    <>
      {volver}
      <PageHeader
        title={`Pedido #${pedido.id_pedido}`}
        description={`Recibido el ${formatFecha(pedido.fecha_pedido)}`}
        action={<EstadoPedidoBadge estado={pedido.estado} className="self-center text-sm" />}
      />
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-5">
            <EstadoProgreso pedido={pedido} />
            <AccionesPedido
              pedido={pedido}
              size="md"
              onCambio={() => {
                setErrorAccion(null)
                return recargar({ silencioso: true })
              }}
              onError={setErrorAccion}
            />
            {errorAccion && <Alert type="error">{errorAccion}</Alert>}
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <ResumenItems pedido={pedido} />
          <div className="space-y-6">
            <DatosEntrega pedido={pedido} />
            <HistorialTimeline historial={pedido.historial} />
          </div>
        </div>
      </div>
    </>
  )
}

export default function DetallePedidoRestaurante() {
  const { id } = useParams()
  return <VistaPedidoRestaurante idPedido={id} />
}
