import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { TipoEntregaSelector } from '../../components/shared/TipoEntregaSelector'
import { Alert, Button, Card, CardBody, CardHeader, Input, PageHeader, Textarea } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { TIPOS_ENTREGA } from '../../lib/constants'
import { mensajeError } from '../../lib/utils'
import { crearPedido } from '../../services/pedidos.service'
import { checkoutSchema } from '../../utils/validators'
import { ResumenCarrito } from './Carrito'

export default function Checkout() {
  const carrito = useCart()
  const { session, perfil } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      tipo_entrega: carrito.tipoEntrega,
      nombre_contacto: perfil?.nombre ?? '',
      telefono_contacto: perfil?.telefono ?? '',
      direccion_entrega: '',
      notas: '',
    },
  })
  const tipoEntrega = useWatch({ control, name: 'tipo_entrega' })

  // Si el perfil termina de cargar después de montar, completar los datos vacíos
  useEffect(() => {
    if (!perfil) return
    if (!getValues('nombre_contacto')) setValue('nombre_contacto', perfil.nombre ?? '')
    if (!getValues('telefono_contacto')) setValue('telefono_contacto', perfil.telefono ?? '')
  }, [perfil, getValues, setValue])

  // Mantener el resumen (costo de envío) en sincronía con el formulario
  useEffect(() => {
    if (tipoEntrega !== carrito.tipoEntrega) carrito.setTipoEntrega(tipoEntrega)
  }, [tipoEntrega, carrito])

  if (!carrito.items.length) return <Navigate to="/carrito" replace />

  const onSubmit = async (valores) => {
    setError(null)
    try {
      const idPedido = await crearPedido({
        idRestaurante: carrito.restaurante.id_restaurante,
        tipoEntrega: valores.tipo_entrega,
        nombreContacto: valores.nombre_contacto,
        telefonoContacto: valores.telefono_contacto,
        direccionEntrega: valores.direccion_entrega,
        notas: valores.notas,
        items: carrito.items,
      })
      const resumen = { total: carrito.total, restaurante: carrito.restaurante.nombre, tipoEntrega: valores.tipo_entrega }
      navigate(`/pedido-confirmado/${idPedido}`, { replace: true, state: resumen })
      carrito.vaciar()
    } catch (e) {
      setError(mensajeError(e, 'No se pudo crear el pedido'))
    }
  }

  return (
    <>
      <PageHeader title="Finalizar pedido" description={`Pedido de ${carrito.restaurante.nombre}`} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {!session && (
            <Alert type="info" title="Estás pidiendo como invitado">
              <Link to="/login" state={{ from: '/checkout' }} className="font-semibold underline">
                Inicia sesión
              </Link>{' '}
              para seguir el estado de tus pedidos desde tu cuenta.
            </Alert>
          )}
          {error && <Alert type="error">{error}</Alert>}

          <Card>
            <CardHeader title="¿Cómo lo quieres recibir?" />
            <CardBody className="space-y-4">
              <TipoEntregaSelector
                value={tipoEntrega}
                onChange={(v) => setValue('tipo_entrega', v, { shouldValidate: true })}
                costoEnvio={carrito.restaurante.costo_envio_base}
              />
              {tipoEntrega === TIPOS_ENTREGA.DOMICILIO && (
                <Textarea
                  label="Dirección de entrega"
                  rows={2}
                  placeholder="Calle, número, colonia, referencias"
                  autoComplete="street-address"
                  error={errors.direccion_entrega?.message}
                  {...register('direccion_entrega')}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Datos de contacto" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" autoComplete="name" error={errors.nombre_contacto?.message} {...register('nombre_contacto')} />
              <Input
                label="Teléfono"
                type="tel"
                autoComplete="tel"
                error={errors.telefono_contacto?.message}
                {...register('telefono_contacto')}
              />
              <Textarea
                className="sm:col-span-2"
                label="Notas para el restaurante (opcional)"
                rows={2}
                placeholder="Sin cebolla, timbre descompuesto..."
                error={errors.notas?.message}
                {...register('notas')}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <ResumenCarrito carrito={carrito}>
            <ul className="space-y-1 text-sm text-slate-600">
              {carrito.items.map((i) => (
                <li key={i.id_producto} className="flex justify-between gap-2">
                  <span className="truncate">
                    {i.cantidad}× {i.nombre}
                  </span>
                </li>
              ))}
            </ul>
          </ResumenCarrito>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Confirmar pedido
          </Button>
          <p className="text-center text-xs text-slate-500">Pagas al recibir tu pedido.</p>
        </div>
      </form>
    </>
  )
}
