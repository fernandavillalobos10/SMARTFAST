import { Minus, Package, Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Badge, Button, Card, EmptyState, Input, PageHeader, Select, Spinner, Table, Td, Th } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { STOCK_BAJO } from '../../lib/constants'
import { cn, formatMoney, mensajeError } from '../../lib/utils'
import { actualizarProducto, listarProductosRestaurante } from '../../services/restaurante.service'

const FILTROS = {
  activos: { label: 'Activos', fn: (p) => p.activo },
  disponibles: { label: 'Disponibles', fn: (p) => p.activo && p.disponible },
  no_disponibles: { label: 'No disponibles', fn: (p) => p.activo && !p.disponible },
  stock_bajo: { label: 'Stock bajo', fn: (p) => p.activo && p.stock < STOCK_BAJO },
  inactivos: { label: 'Inactivos (eliminados)', fn: (p) => !p.activo },
  todos: { label: 'Todos', fn: () => true },
}

function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-brand-500' : 'bg-slate-200',
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

function StockControl({ producto, onCambiar, disabled }) {
  const [valor, setValor] = useState(String(producto.stock))
  const [prev, setPrev] = useState(producto.stock)
  if (producto.stock !== prev) {
    setPrev(producto.stock)
    setValor(String(producto.stock))
  }
  const guardar = (n) => {
    const stock = Math.max(0, Number.parseInt(n, 10) || 0)
    setValor(String(stock))
    if (stock !== producto.stock) onCambiar(stock)
  }
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled || producto.stock <= 0} onClick={() => guardar(producto.stock - 1)} aria-label="Restar stock">
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <input
        type="number"
        min="0"
        value={valor}
        disabled={disabled}
        onChange={(e) => setValor(e.target.value)}
        onBlur={(e) => guardar(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label={`Stock de ${producto.nombre}`}
        className={cn(
          'h-8 w-16 rounded-lg border-0 text-center text-sm font-semibold ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-500',
          producto.stock === 0 ? 'text-red-600' : producto.stock < STOCK_BAJO ? 'text-amber-700' : 'text-slate-900',
        )}
      />
      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled} onClick={() => guardar(producto.stock + 1)} aria-label="Sumar stock">
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export default function Productos() {
  const { idRestaurante } = useRestaurant()
  const { data, error, loading, setData } = useAsync(() => listarProductosRestaurante(idRestaurante), [idRestaurante])
  const [filtro, setFiltro] = useState('activos')
  const [busqueda, setBusqueda] = useState('')
  const [guardando, setGuardando] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)

  const productos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (data ?? []).filter(FILTROS[filtro].fn).filter((p) => !q || `${p.nombre} ${p.categoria ?? ''}`.toLowerCase().includes(q))
  }, [data, filtro, busqueda])

  const actualizar = async (producto, cambios) => {
    setGuardando(producto.id_producto)
    setErrorAccion(null)
    try {
      const actualizado = await actualizarProducto(producto.id_producto, cambios)
      setData((lista) => lista.map((p) => (p.id_producto === actualizado.id_producto ? actualizado : p)))
    } catch (e) {
      setErrorAccion(mensajeError(e))
    } finally {
      setGuardando(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Productos"
        description="Gestiona tu menú, precios e inventario."
        action={
          <Button as={Link} to="/restaurante/productos/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input aria-label="Buscar" placeholder="Buscar por nombre o categoría" inputClassName="pl-10" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <Select aria-label="Filtrar" className="sm:w-56" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          {Object.entries(FILTROS).map(([k, f]) => (
            <option key={k} value={k}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {(error || errorAccion) && <Alert type="error" className="mb-4">{mensajeError(error ?? errorAccion)}</Alert>}

      {loading ? (
        <Spinner />
      ) : productos.length ? (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th>Precio</Th>
                <Th>Stock</Th>
                <Th>Disponible</Th>
                <Th>Activo</Th>
                <Th className="sr-only">Acciones</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productos.map((p) => (
                <tr key={p.id_producto} className={cn(!p.activo && 'opacity-60')}>
                  <Td className="min-w-48">
                    <p className="font-semibold text-slate-900">{p.nombre}</p>
                    {p.categoria && <Badge className="mt-1">{p.categoria}</Badge>}
                  </Td>
                  <Td className="whitespace-nowrap font-medium">{formatMoney(p.precio)}</Td>
                  <Td>
                    <StockControl producto={p} disabled={guardando === p.id_producto} onCambiar={(stock) => actualizar(p, { stock })} />
                  </Td>
                  <Td>
                    <Toggle label={`Disponible: ${p.nombre}`} checked={p.disponible} disabled={guardando === p.id_producto} onChange={(v) => actualizar(p, { disponible: v })} />
                  </Td>
                  <Td>
                    <Toggle label={`Activo: ${p.nombre}`} checked={p.activo} disabled={guardando === p.id_producto} onChange={(v) => actualizar(p, { activo: v })} />
                  </Td>
                  <Td className="text-right">
                    <Button as={Link} to={`/restaurante/productos/${p.id_producto}`} variant="ghost" size="icon" aria-label={`Editar ${p.nombre}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        !error && (
          <EmptyState
            icon={Package}
            title={data?.length ? 'Ningún producto coincide' : 'Aún no tienes productos'}
            description={data?.length ? 'Cambia el filtro o la búsqueda.' : 'Crea tu primer producto para que aparezca en el menú.'}
            action={
              !data?.length && (
                <Button as={Link} to="/restaurante/productos/nuevo">
                  Crear producto
                </Button>
              )
            }
          />
        )
      )}
      <p className="mt-4 text-xs text-slate-500">
        “Disponible” controla si se puede pedir hoy. “Activo” desactivado equivale a eliminarlo del menú (se conserva por el historial de pedidos).
      </p>
    </>
  )
}
