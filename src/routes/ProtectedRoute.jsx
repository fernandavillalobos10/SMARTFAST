import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
