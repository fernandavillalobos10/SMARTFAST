import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Input } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { mensajeError } from '../../lib/utils'
import { loginSchema } from '../../utils/validators'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { correo: '', password: '' } })

  const onSubmit = async (valores) => {
    setError(null)
    try {
      await signIn(valores)
      // /inicio espera a que cargue el perfil y redirige según el rol
      navigate(location.state?.from ?? '/inicio', { replace: true })
    } catch (e) {
      setError(mensajeError(e))
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold sm:text-3xl">Inicia sesión</h1>
      <p className="mt-2 text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-brand-600 hover:text-brand-700">
          Regístrate gratis
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {error && <Alert type="error">{error}</Alert>}
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Solo quieres pedir?{' '}
        <Link to="/catalogo" className="font-semibold text-slate-700 hover:text-slate-900">
          Continúa como invitado
        </Link>
      </p>
    </>
  )
}
