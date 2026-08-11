import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { loginSchema } from '@/utils/validators'
import { useLoginMutation } from '@/features/auth/authApi'
import { useState } from 'react'

function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [login, { isLoading, error }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (values) => {
    const res = await login(values)
    if (!res.error) {
      navigate(from, { replace: true })
    }
  }

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error.data?.message || error.message || t('common.error')}
          </motion.div>
        )}

        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{t(errors.email.message)}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">{t('auth.password')}</Label>
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

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          {t('auth.login')}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('auth.register')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Login
