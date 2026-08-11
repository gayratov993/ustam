import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function MyProfile() {
  const { profile, isLoading } = useAuth()
  if (isLoading) return null
  if (!profile) return <Navigate to="/auth/login" replace />
  return <Navigate to={`/workers/${profile.id}`} replace />
}

export default MyProfile
