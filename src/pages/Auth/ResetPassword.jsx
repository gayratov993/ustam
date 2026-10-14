import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { resetPasswordSchema } from '@/utils/validators'
import { useUpdatePasswordMutation } from '@/features/auth/authApi'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient'

function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [updatePassword, { isLoading, error }] = useUpdatePasswordMutation()
  const [status, setStatus] = useState('checking')
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('invalid')
      return
    }
    const sb = getSupabase()
    let active = true

    const check = async () => {
      const { data } = await sb.auth.getSession()
      if (active) setStatus(data.session ? 'ready' : 'invalid')
    }
    check()

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (active && (event === 'PASSWORD_RECOVERY' || session)) setStatus('ready')
    })

    const timer = setTimeout(check, 2500)

    return () => {
      active = false
      clearTimeout(timer)
      sub.subscription.unsubscribe()
    }
  }, [])

  const onSubmit = async (values) => {
    const res = await updatePassword(values)
    if (!res.error) setDone(true)
  }

  if (done) {
    return (
      <AuthLayout title={t('auth.resetTitle')}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('auth.passwordUpdated')}</p>
          <Button className="mt-2 w-full" onClick={() => navigate('/auth/login', { replace: true })}>
            {t('auth.login')}
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      {status === 'invalid' ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('auth.resetInvalid')}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error.data?.message || error.message || t('common.error')}
            </div>
          )}
          <div>
            <Label htmlFor="password">{t('auth.newPassword')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{t(errors.password.message)}</p>
            )}
          </div>
          <Button type="submit" className="w-full" loading={isLoading} disabled={status === 'checking'}>
            {t('auth.updatePassword')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
