import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { Loader } from '@/components/ui/loader'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { setSession, setProfile, logout, setLoading } from '@/features/auth/authSlice'
import { clearToast } from '@/features/ui/uiSlice'

function Toast() {
  const toast = useSelector((state) => state.ui.toast)
  const dispatch = useDispatch()
  if (!toast) return null
  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info
  const colors =
    toast.type === 'success'
      ? 'text-green-600'
      : toast.type === 'error'
        ? 'text-red-600'
        : 'text-primary-600'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
      >
        <button
          onClick={() => dispatch(clearToast())}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-lift dark:border-slate-700 dark:bg-slate-800"
        >
          <Icon className={`h-5 w-5 ${colors}`} />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {toast.message}
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function useSessionManager() {
  const dispatch = useDispatch()
  const userId = useSelector((state) => state.auth.user?.id)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      dispatch(setLoading(false))
      return
    }
    const sb = getSupabase()
    dispatch(setLoading(true))

    sb.auth
      .getSession()
      .then(({ data }) => {
        dispatch(setSession(data.session))
        if (data.session?.user) {
          return sb
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle()
        }
        return null
      })
      .then((res) => {
        if (res && !res.error) dispatch(setProfile(res.data))
        dispatch(setLoading(false))
      })
      .catch(() => dispatch(setLoading(false)))

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
      if (!session) dispatch(logout())
    })

    return () => listener.subscription.unsubscribe()
  }, [dispatch])

  useEffect(() => {
    if (!userId) return
    const sb = getSupabase()
    let cancelled = false
    sb.from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then((res) => {
        if (!cancelled && !res.error) dispatch(setProfile(res.data))
      })
    return () => {
      cancelled = true
    }
  }, [userId, dispatch])
}

function AnimatedOutlet() {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

function AppLayout() {
  useSessionManager()
  const isLoading = useSelector((state) => state.auth.isLoading)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
      <BottomNav />
      <Toast />
    </div>
  )
}

export { AppLayout, Toast }
