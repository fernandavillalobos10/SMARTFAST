import { useState } from 'react'
import { ACCION_ESTADO, ESTADOS_PEDIDO, puedeCancelar, siguienteEstado } from '../../lib/constants'
import { cn, mensajeError } from '../../lib/utils'
import { cambiarEstadoPedido } from '../../services/pedidos.service'
import { Button } from '../ui'
import { ConfirmDialog } from './ConfirmDialog'

// Botones de avance/cancelación de un pedido. Toda la lógica (stock, entregas,
// historial, permisos) vive en la función SQL cambiar_estado_pedido.
// modo "cliente": solo permite cancelar mientras el pedido está CREADO.
export function AccionesPedido({ pedido, modo = 'restaurante', size = 'sm', className, onCambio, onError }) {
  const [enviando, setEnviando] = useState(null)
  const [confirmarCancelar, setConfirmarCancelar] = useState(false)

  const siguiente = modo === 'restaurante' ? siguienteEstado(pedido) : null
  const cancelable = modo === 'restaurante' ? puedeCancelar(pedido.estado) : pedido.estado === 'CREADO'

  const cambiar = async (estado, comentario) => {
    setEnviando(estado)
    try {
      await cambiarEstadoPedido(pedido.id_pedido, estado, comentario || null)
      setConfirmarCancelar(false)
      await onCambio?.(estado)
    } catch (e) {
      onError?.(mensajeError(e))
    } finally {
      setEnviando(null)
    }
  }

  if (!siguiente && !cancelable) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {siguiente && (
        <Button size={size} loading={enviando === siguiente} disabled={!!enviando} onClick={() => cambiar(siguiente)}>
          {ACCION_ESTADO[siguiente]}
        </Button>
      )}
      {cancelable && (
        <Button size={size} variant="danger-ghost" disabled={!!enviando} onClick={() => setConfirmarCancelar(true)}>
          Cancelar pedido
        </Button>
      )}
      <ConfirmDialog
        open={confirmarCancelar}
        title={`¿Cancelar el pedido #${pedido.id_pedido}?`}
        description={
          pedido.estado === 'CREADO'
            ? 'Esta acción no se puede deshacer.'
            : `El pedido está "${ESTADOS_PEDIDO[pedido.estado].label}". El stock descontado se devolverá al inventario.`
        }
        confirmLabel="Sí, cancelar"
        variant="danger"
        conComentario={modo === 'restaurante'}
        loading={enviando === 'CANCELADO'}
        onConfirm={(comentario) => cambiar('CANCELADO', comentario)}
        onClose={() => setConfirmarCancelar(false)}
      />
    </div>
  )
}
