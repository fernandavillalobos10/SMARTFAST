import { Plus, Search, UtensilsCrossed } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { RestaurantSelector } from '../../components/shared/RestaurantSelector'
import { Alert, Badge, Button, EmptyState, Input, PageHeader, Spinner } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useCart } from '../../hooks/useCart'
import { STOCK_BAJO } from '../../lib/constants'
import { cn, formatMoney, mensajeError } from '../../lib/utils'
import { listarCatalogo, listarRestaurantesActivos } from '../../services/productos.service'

function ProductoCard({ producto, enCarrito, onAgregar }) {
  const agotado = producto.stock <= 0
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <UtensilsCrossed className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        {producto.categoria && (
          <Badge className="absolute left-3 top-3 bg-white/90 ring-0">{producto.categoria}</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-slate-500">{producto.restaurante.nombre}</p>
        <h3 className="mt-0.5 font-semibold text-slate-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-lg font-bold text-slate-900">{formatMoney(producto.precio)}</p>
            <p className={cn('text-xs', agotado ? 'font-semibold text-red-600' : producto.stock < STOCK_BAJO ? 'text-amber-700' : 'text-slate-500')}>
              {agotado ? 'Agotado' : `${producto.stock} disponibles`}
            </p>
          </div>
          <Button size="sm" onClick={() => onAgregar(producto)} disabled={agotado} aria-label={`Añadir ${producto.nombre}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {enCarrito ? `${enCarrito} en carrito` : 'Añadir'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function Catalogo() {
  const carrito = useCart()
  const productos = useAsync(listarCatalogo, [])
  const restaurantes = useAsync(listarRestaurantesActivos, [])
  const [idRestaurante, setIdRestaurante] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [conflicto, setConflicto] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 2500)
    return () => clearTimeout(t)
  }, [aviso])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (productos.data ?? []).filter(
      (p) =>
        (idRestaurante == null || p.id_restaurante === idRestaurante) &&
        (!q || `${p.nombre} ${p.descripcion ?? ''} ${p.categoria ?? ''}`.toLowerCase().includes(q)),
    )
  }, [productos.data, idRestaurante, busqueda])

  const agregar = (producto) => {
    const r = carrito.agregar(producto)
    if (r.ok) setAviso({ type: 'success', texto: `${producto.nombre} añadido al carrito` })
    else if (r.motivo === 'OTRO_RESTAURANTE') setConflicto({ producto, restauranteActual: r.restauranteActual })
    else setAviso({ type: 'warning', texto: `No hay más stock de ${producto.nombre}` })
  }

  const cantidadEnCarrito = (id) => carrito.items.find((i) => i.id_producto === id)?.cantidad

  return (
    <>
      <PageHeader
        title="Menú"
        description="Elige tus productos. Cada pedido es de un solo restaurante."
        action={
          carrito.cantidadTotal > 0 && (
            <Button as={Link} to="/carrito" variant="dark">
              Ver carrito · {formatMoney(carrito.subtotal)}
            </Button>
          )
        }
      />

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            aria-label="Buscar productos"
            placeholder="Buscar hamburguesa, tacos, bebidas..."
            inputClassName="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {restaurantes.data && (
          <RestaurantSelector restaurantes={restaurantes.data} value={idRestaurante} onChange={setIdRestaurante} />
        )}
      </div>

      {productos.error && <Alert type="error">{mensajeError(productos.error)}</Alert>}
      {productos.loading ? (
        <Spinner label="Cargando menú..." />
      ) : (
        !productos.error &&
        (filtrados.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtrados.map((p) => (
              <ProductoCard key={p.id_producto} producto={p} enCarrito={cantidadEnCarrito(p.id_producto)} onAgregar={agregar} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="No encontramos productos"
            description={busqueda ? 'Prueba con otra búsqueda.' : 'Aún no hay productos disponibles.'}
          />
        ))
      )}

      {aviso && (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm">
          <Alert type={aviso.type} className="shadow-lg">
            {aviso.texto}
          </Alert>
        </div>
      )}

      <ConfirmDialog
        open={!!conflicto}
        title="¿Empezar un nuevo carrito?"
        description={
          conflicto && (
            <>
              Tu carrito tiene productos de <strong>{conflicto.restauranteActual}</strong>. Un pedido solo puede ser de un
              restaurante. Si continúas, se vaciará el carrito y se añadirá{' '}
              <strong>{conflicto.producto.nombre}</strong>.
            </>
          )
        }
        confirmLabel="Vaciar y añadir"
        onConfirm={() => {
          carrito.reemplazarCon(conflicto.producto)
          setAviso({ type: 'success', texto: `${conflicto.producto.nombre} añadido al carrito` })
          setConflicto(null)
        }}
        onClose={() => setConflicto(null)}
      />
    </>
  )
}
