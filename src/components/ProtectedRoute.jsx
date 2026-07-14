import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'

/**
 * Protege una ruta privada.
 * - Si no está autenticado: redirige a /login (preservando la ruta).
 * - Si adminOnly=true y el usuario no es ADMIN: redirige a /.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isHydrated, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (!isHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
