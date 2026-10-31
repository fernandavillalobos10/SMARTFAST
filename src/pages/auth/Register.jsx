import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Input } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { mensajeError } from '../../lib/utils'
import { registerSchema } from '../../utils/validators'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [correoPendiente, setCorreoPendiente] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: '', correo: '', telefono: '', password: '', confirmar: '' },
  })

  const onSubmit = async (valores) => {
    setError(null)
    try {
      const { session } = await signUp(valores)
      if (session) navigate('/inicio', { replace: true })
      else setCorreoPendiente(valores.correo)
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  if (correoPendiente) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enviamos un enlace de confirmación a <strong className="text-slate-700">{correoPendiente}</strong>. Después
          podrás iniciar sesión.
        </p>
        <Button as={Link} to="/login" className="mt-6">
          Ir a iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-3xl">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Inicia sesión
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        {error && <Alert type="error">{error}</Alert>}
        <Input label="Nombre completo" autoComplete="name" error={errors.nombre?.message} {...register('nombre')} />
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <Input
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar"
            type="password"
            autoComplete="new-password"
            error={errors.confirmar?.message}
            {...register('confirmar')}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Crear cuenta
        </Button>
      </form>
    </>
  )
}
