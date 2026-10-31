import { Navigate, Outlet } from 'react-router-dom'
import { Alert, Button, FullPageSpinner } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { rutaInicio } from '../hooks/useRole'
import { ROLES } from '../lib/constants'
import { mensajeError } from '../lib/utils'

export function PerfilError() {
  const { errorPerfil, refrescarPerfil, signOut } = useAuth()
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-4">
      <Alert type="error" title="No pudimos cargar tu perfil">
        {mensajeError(errorPerfil, 'Tu cuenta no tiene un perfil en la tabla usuarios.')}
      </Alert>
      <div className="flex gap-2">
        <Button onClick={refrescarPerfil}>Reintentar</Button>
        <Button variant="secondary" onClick={signOut}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

// Usar dentro de <ProtectedRoute>. Un PROPIETARIO sin restaurante asignado no
// puede entrar al panel (la BD también lo impide con un CHECK).
export function RoleGuard({ roles }) {
  const { perfil, restaurante, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!perfil) return <PerfilError />
  if (!roles.includes(perfil.rol)) return <Navigate to={rutaInicio(perfil.rol)} replace />
  if (perfil.rol === ROLES.PROPIETARIO && !restaurante) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Alert type="warning" title="Sin restaurante asignado">
          Tu usuario es propietario pero no tiene un restaurante vinculado. Pide a un administrador que lo asigne.
        </Alert>
      </div>
    )
  }
  return <Outlet />
}

export function HomeRedirect() {
  const { session, perfil, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (session && !perfil) return <PerfilError />
  return <Navigate to={rutaInicio(perfil?.rol)} replace />
}
