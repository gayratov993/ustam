import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader } from '@/components/ui/loader'

function ProtectedRoute({ children, roles = [] }) {
  const { user, profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export { ProtectedRoute }
