import { CircleCheck } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Button, Card } from '../../components/ui'
import { useRole } from '../../hooks/useRole'
import { TIPO_ENTREGA_LABEL } from '../../lib/constants'
import { formatMoney } from '../../lib/utils'

export default function PedidoConfirmado() {
  const { id } = useParams()
  const { state } = useLocation()
  const { esCliente } = useRole()

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">¡Pedido recibido!</h1>
      <p className="mt-2 text-slate-600">
        Tu número de pedido es <strong className="text-slate-900">#{id}</strong>.
      </p>
      {state && (
        <p className="mt-1 text-sm text-slate-500">
          {state.restaurante} · {TIPO_ENTREGA_LABEL[state.tipoEntrega]} · {formatMoney(state.total)}
        </p>
      )}
      <p className="mt-4 text-sm text-slate-500">
        El restaurante revisará tu pedido en breve.
        {!esCliente && ' Guarda tu número de pedido por si necesitas contactar al restaurante.'}
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {esCliente && (
          <Button as={Link} to={`/mis-pedidos/${id}`}>
            Seguir mi pedido
          </Button>
        )}
        <Button as={Link} to="/catalogo" variant="secondary">
          Volver al menú
        </Button>
      </div>
    </Card>
  )
}
