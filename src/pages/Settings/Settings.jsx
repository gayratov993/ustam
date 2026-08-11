import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Camera, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '@/features/auth/authApi'
import { profileSchema } from '@/utils/validators'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Card, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

function Settings() {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()
  const [updateAvatar, { isLoading: uploadingAvatar }] = useUpdateAvatarMutation()
  const [saved, setSaved] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate || '',
      })
    }
  }, [profile, reset])

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  const onAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    await updateAvatar({ userId: user.id, file })
  }

  const onSubmit = async (values) => {
    const res = await updateProfile({ id: user.id, ...values })
    if (!res.error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
        {t('settings.title')}
      </h1>

      <div className="space-y-6">
        <Card>
          <CardTitle className="mb-4">{t('settings.profile')}</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error.data?.message || error.message}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar src={profile?.avatar_url} name={profile?.full_name} size="lg" />
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-soft transition hover:bg-primary-700">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatar}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {profile?.full_name || '—'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                <p className="text-xs text-slate-400">{t(`roles.${profile?.role}`)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('auth.fullName')}</Label>
                <Input {...register('full_name')} />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.full_name.message)}</p>
                )}
              </div>
              <div>
                <Label>{t('auth.phone')}</Label>
                <Input type="tel" {...register('phone')} placeholder="+998 90 123 45 67" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('auth.city')}</Label>
                <Input {...register('city')} placeholder="Toshkent" />
              </div>
              <div>
                <Label>{t('auth.district')}</Label>
                <Input {...register('district')} placeholder="Chilonzor" />
              </div>
            </div>

            <div>
              <Label>{t('auth.bio')}</Label>
              <Textarea {...register('bio')} placeholder={t('auth.bio')} />
            </div>

            <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('settings.saved')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </form>
        </Card>

        <Card>
          <CardTitle className="mb-4">{t('settings.preferences')}</CardTitle>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{t('settings.language')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{i18n.language}</p>
              </div>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{t('settings.theme')}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isDark ? t('settings.dark') : t('settings.light')}
                </p>
              </div>
              <button
                onClick={toggleDark}
                className="relative h-7 w-12 rounded-full bg-slate-200 transition dark:bg-primary-600"
              >
                <motion.span
                  animate={{ x: isDark ? 22 : 2 }}
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Settings
