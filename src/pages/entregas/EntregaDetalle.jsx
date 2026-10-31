import { useParams } from 'react-router-dom'
import { Alert, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { mensajeError } from '../../lib/utils'
import { obtenerEntrega } from '../../services/pedidos.service'
import { VistaPedidoRestaurante } from '../restaurante/DetallePedidoRestaurante'

export default function EntregaDetalle() {
  const { id } = useParams()
  const { data: entrega, error, loading } = useAsync(() => obtenerEntrega(id), [id])

  if (loading) return <Spinner />
  if (error) return <Alert type="error">{mensajeError(error)}</Alert>
  if (!entrega) return <Alert type="warning">Entrega no encontrada.</Alert>
  return <VistaPedidoRestaurante idPedido={entrega.id_pedido} volverA="/restaurante/entregas" volverLabel="Entregas" />
}
