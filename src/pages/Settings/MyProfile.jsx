import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function MyProfile() {
  const { user, profile, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/auth/login" replace />
  if (profile?.role === 'worker') {
    return <Navigate to={`/workers/${profile?.id || user.id}`} replace />
  }
  return <Navigate to="/settings" replace />
}

export default MyProfile
