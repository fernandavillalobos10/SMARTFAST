import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TipoEntregaSelector } from '../../components/shared/TipoEntregaSelector'
import { Button, Card, CardBody, CardHeader, EmptyState, PageHeader } from '../../components/ui'
import { useCart } from '../../hooks/useCart'
import { formatMoney } from '../../lib/utils'

export function ResumenCarrito({ carrito, children }) {
  return (
    <Card>
      <CardHeader title="Resumen" description={carrito.restaurante?.nombre} />
      <CardBody className="space-y-4">
        {children}
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <dt>Subtotal ({carrito.cantidadTotal} productos)</dt>
            <dd>{formatMoney(carrito.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-slate-600">
            <dt>Envío</dt>
            <dd>{carrito.costoEnvio ? formatMoney(carrito.costoEnvio) : 'Gratis'}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
            <dt>Total</dt>
            <dd>{formatMoney(carrito.total)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  )
}

export default function Carrito() {
  const carrito = useCart()

  if (!carrito.items.length) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Tu carrito está vacío"
        description="Añade productos desde el menú para hacer tu pedido."
        action={
          <Button as={Link} to="/catalogo">
            Ver menú
          </Button>
        }
      />
    )
  }

  return (
    <>
      <PageHeader title="Carrito" description={`Pedido de ${carrito.restaurante.nombre}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <ul className="divide-y divide-slate-100">
            {carrito.items.map((item) => (
              <li key={item.id_producto} className="flex gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-300">
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{item.nombre}</p>
                    <p className="text-sm text-slate-500">{formatMoney(item.precio)} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl ring-1 ring-slate-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => carrito.actualizarCantidad(item.id_producto, item.cantidad - 1)}
                        aria-label={`Quitar uno de ${item.nombre}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                        {item.cantidad}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => carrito.actualizarCantidad(item.id_producto, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock}
                        aria-label={`Añadir uno de ${item.nombre}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="w-24 text-right font-semibold">{formatMoney(item.precio * item.cantidad)}</span>
                    <Button
                      variant="danger-ghost"
                      size="icon"
                      onClick={() => carrito.quitar(item.id_producto)}
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-100 p-4">
            <Button as={Link} to="/catalogo" variant="ghost" size="sm">
              Seguir comprando
            </Button>
            <Button variant="danger-ghost" size="sm" onClick={carrito.vaciar}>
              Vaciar carrito
            </Button>
          </div>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <ResumenCarrito carrito={carrito}>
            <TipoEntregaSelector
              value={carrito.tipoEntrega}
              onChange={carrito.setTipoEntrega}
              costoEnvio={carrito.restaurante.costo_envio_base}
            />
          </ResumenCarrito>
          <Button as={Link} to="/checkout" size="lg" className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    </>
  )
}
