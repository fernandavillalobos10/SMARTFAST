import { zodResolver } from '@hookform/resolvers/zod'
import { ChefHat, CircleDollarSign, PackageX, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, CardBody, CardHeader, Input, PageHeader, Spinner, Textarea } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { ESTADOS_ACTIVOS, ESTADOS_PEDIDO } from '../../lib/constants'
import { formatMoney, mensajeError } from '../../lib/utils'
import { actualizarRestaurante, resumenRestaurante } from '../../services/restaurante.service'
import { restauranteSchema } from '../../utils/validators'

function Stat({ icon: Icon, label, value, to }) {
  const contenido = (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="truncate font-display text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  )
  return to ? <Link to={to}>{contenido}</Link> : contenido
}

function DatosRestaurante({ restaurante, onGuardado }) {
  const [mensaje, setMensaje] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(restauranteSchema),
    defaultValues: {
      nombre: restaurante.nombre ?? '',
      descripcion: restaurante.descripcion ?? '',
      direccion: restaurante.direccion ?? '',
      telefono: restaurante.telefono ?? '',
      costo_envio_base: restaurante.costo_envio_base ?? 0,
    },
  })

  const onSubmit = async (valores) => {
    setMensaje(null)
    try {
      await actualizarRestaurante(restaurante.id_restaurante, valores)
      reset(valores)
      setMensaje({ type: 'success', texto: 'Datos guardados' })
      onGuardado()
    } catch (e) {
      setMensaje({ type: 'error', texto: mensajeError(e) })
    }
  }

  return (
    <Card>
      <CardHeader title="Datos del restaurante" description="Se muestran a los clientes en el menú." />
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          {mensaje && (
            <Alert type={mensaje.type} className="sm:col-span-2">
              {mensaje.texto}
            </Alert>
          )}
          <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
          <Input
            label="Costo de envío base"
            type="number"
            step="0.01"
            min="0"
            error={errors.costo_envio_base?.message}
            {...register('costo_envio_base')}
          />
          <Input label="Dirección" error={errors.direccion?.message} {...register('direccion')} />
          <Input label="Teléfono" type="tel" error={errors.telefono?.message} {...register('telefono')} />
          <Textarea className="sm:col-span-2" label="Descripción" rows={2} error={errors.descripcion?.message} {...register('descripcion')} />
          <div className="sm:col-span-2">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default function Dashboard() {
  const { restaurante, idRestaurante, refrescarRestaurante } = useRestaurant()
  const { data, error, loading } = useAsync(() => resumenRestaurante(idRestaurante), [idRestaurante])

  const activos = data ? ESTADOS_ACTIVOS.reduce((s, e) => s + data.porEstado[e], 0) : 0

  return (
    <>
      <PageHeader
        title={`Hola, ${restaurante.nombre}`}
        description="Resumen de la operación de hoy."
        action={
          <Button as={Link} to="/restaurante/cocina">
            <ChefHat className="h-4 w-4" aria-hidden="true" /> Ir a cocina
          </Button>
        }
      />
      {error && <Alert type="error">{mensajeError(error)}</Alert>}
      {loading ? (
        <Spinner />
      ) : (
        data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat icon={Receipt} label="Pedidos de hoy" value={data.pedidosHoy} />
              <Stat icon={ChefHat} label="Pedidos activos" value={activos} to="/restaurante/cocina" />
              <Stat icon={CircleDollarSign} label="Ventas entregadas hoy" value={formatMoney(data.ventasHoy)} />
              <Stat icon={PackageX} label="Productos con stock bajo" value={data.stockBajo.length} to="/restaurante/productos" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader title="Pedidos en curso" />
                <CardBody className="space-y-3">
                  {ESTADOS_ACTIVOS.map((estado) => (
                    <div key={estado} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{ESTADOS_PEDIDO[estado].label}</span>
                      <span className="font-semibold">{data.porEstado[estado]}</span>
                    </div>
                  ))}
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Stock bajo" description="Productos activos con menos de 5 unidades." />
                <CardBody>
                  {data.stockBajo.length ? (
                    <ul className="space-y-2 text-sm">
                      {data.stockBajo.map((p) => (
                        <li key={p.id_producto} className="flex justify-between">
                          <Link to={`/restaurante/productos/${p.id_producto}`} className="hover:text-brand-600">
                            {p.nombre}
                          </Link>
                          <span className={p.stock === 0 ? 'font-semibold text-red-600' : 'font-semibold text-amber-700'}>
                            {p.stock}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Todo en orden 👌</p>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )
      )}
      <div className="mt-6">
        <DatosRestaurante key={restaurante.id_restaurante} restaurante={restaurante} onGuardado={refrescarRestaurante} />
      </div>
    </>
  )
}
