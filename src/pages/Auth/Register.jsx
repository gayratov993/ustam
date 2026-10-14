import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Hammer, BriefcaseBusiness } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { registerSchema } from '@/utils/validators'
import { useRegisterMutation, useUpdateProfileMutation } from '@/features/auth/authApi'
import { cn } from '@/lib/utils'

const ROLES = [
  { key: 'worker', icon: Hammer, titleKey: 'auth.roleWorker' },
  { key: 'employer', icon: BriefcaseBusiness, titleKey: 'auth.roleEmployer' },
]

function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const [updateProfile] = useUpdateProfileMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [role, setRole] = useState('worker')

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    const res = await register({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      role,
    })
    if (res.error) return
    const userId = res.data?.session?.user?.id
    if (userId) {
      await updateProfile({ id: userId, role })
      navigate('/auth/onboarding', { replace: true })
    } else {
      setConfirmed(true)
    }
  }

  if (confirmed) {
    return (
      <AuthLayout title={t('auth.registerTitle')} subtitle="">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-xl bg-green-50 px-4 py-8 text-center text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400"
        >
          <CheckCircle2 className="h-10 w-10" />
          <p className="font-semibold">{t('auth.confirmEmailSent')}</p>
          <Link
            to="/auth/login"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('auth.login')}
          </Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
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
          <Label>{t('auth.roleSelect')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setRole(r.key)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition',
                  role === r.key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'border-slate-200 text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
                )}
              >
                <r.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{t(r.titleKey)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="fullName">{t('auth.fullName')}</Label>
          <Input id="fullName" placeholder="Ali Valiyev" {...registerField('fullName')} />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{t(errors.fullName.message)}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...registerField('email')}
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
              {...registerField('password')}
              className="pr-10"
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

        <Button type="submit" className="w-full" loading={isLoading}>
          {t('auth.register')}
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t('auth.haveAccount')}{' '}
          <Link
            to="/auth/login"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register
