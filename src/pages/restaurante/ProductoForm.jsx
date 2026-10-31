import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, CardBody, Input, PageHeader, Spinner, Textarea } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { useRestaurant } from '../../hooks/useRestaurant'
import { mensajeError } from '../../lib/utils'
import { actualizarProducto, crearProducto, obtenerProducto } from '../../services/restaurante.service'
import { productoSchema } from '../../utils/validators'

const VACIO = {
  nombre: '',
  descripcion: '',
  categoria: '',
  precio: '',
  stock: 0,
  imagen_url: '',
  disponible: true,
  activo: true,
}

function aFormulario(producto) {
  return Object.fromEntries(Object.keys(VACIO).map((k) => [k, producto[k] ?? VACIO[k]]))
}

function Formulario({ producto, idRestaurante }) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productoSchema), defaultValues: producto ? aFormulario(producto) : VACIO })

  const onSubmit = async (valores) => {
    setError(null)
    try {
      if (producto) await actualizarProducto(producto.id_producto, valores)
      else await crearProducto(idRestaurante, valores)
      navigate('/restaurante/productos')
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          {error && (
            <Alert type="error" className="sm:col-span-2">
              {error}
            </Alert>
          )}
          <Input className="sm:col-span-2" label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
          <Textarea className="sm:col-span-2" label="Descripción" error={errors.descripcion?.message} {...register('descripcion')} />
          <Input label="Precio" type="number" step="0.01" min="0" inputMode="decimal" error={errors.precio?.message} {...register('precio')} />
          <Input label="Stock" type="number" step="1" min="0" inputMode="numeric" error={errors.stock?.message} {...register('stock')} />
          <Input label="Categoría" placeholder="Hamburguesas, Bebidas..." error={errors.categoria?.message} {...register('categoria')} />
          <Input label="URL de imagen (opcional)" type="url" placeholder="https://..." error={errors.imagen_url?.message} {...register('imagen_url')} />
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:gap-8">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" {...register('disponible')} />
              Disponible para pedir
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" {...register('activo')} />
              Activo en el menú
            </label>
          </div>
        </CardBody>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button as={Link} to="/restaurante/productos" variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </Card>
    </form>
  )
}

export default function ProductoForm() {
  const { id } = useParams()
  const { idRestaurante } = useRestaurant()
  const editando = Boolean(id)
  const { data, error, loading } = useAsync(() => (editando ? obtenerProducto(id) : Promise.resolve(null)), [id])

  return (
    <div className="max-w-2xl">
      <Button as={Link} to="/restaurante/productos" variant="ghost" size="sm" className="-ml-3 mb-2">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Productos
      </Button>
      <PageHeader title={editando ? 'Editar producto' : 'Nuevo producto'} />
      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{mensajeError(error)}</Alert>
      ) : editando && (!data || data.id_restaurante !== idRestaurante) ? (
        <Alert type="warning">Producto no encontrado.</Alert>
      ) : (
        <Formulario key={id ?? 'nuevo'} producto={data} idRestaurante={idRestaurante} />
      )}
    </div>
  )
}
