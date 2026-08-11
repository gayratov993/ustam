import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { forgotPasswordSchema } from '@/utils/validators'
import { useResetPasswordMutation } from '@/features/auth/authApi'

function ForgotPassword() {
  const { t } = useTranslation()
  const [reset, { isLoading, error }] = useResetPasswordMutation()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values) => {
    const res = await reset(values)
    if (!res.error) setSent(true)
  }

  return (
    <AuthLayout title={t('auth.forgotPassword')}>
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('auth.resetSent')}</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error.data?.message || error.message}
            </div>
          )}
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{t(errors.email.message)}</p>
            )}
          </div>
          <Button type="submit" className="w-full" loading={isLoading}>
            {t('auth.sendReset')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
