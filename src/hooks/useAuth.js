import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, profile, isLoading } = useSelector((state) => state.auth)
  return { user, profile, isLoading, isAuthenticated: Boolean(user) }
}
