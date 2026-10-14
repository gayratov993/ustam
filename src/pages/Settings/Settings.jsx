import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { AlertCircle, Camera, CheckCircle2, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '@/features/auth/authApi'
import {
  useGetWorkerCategoriesQuery,
  useSetWorkerCategoriesMutation,
} from '@/features/profile/profileApi'
import { useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import { setProfile } from '@/features/auth/authSlice'
import { showToast } from '@/features/ui/uiSlice'
import { profileSchema } from '@/utils/validators'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Card, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useTheme } from '@/features/theme/themeContext'
import { cn } from '@/lib/utils'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024

function Settings() {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const dispatch = useDispatch()
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation()
  const [updateAvatar, { isLoading: uploadingAvatar }] = useUpdateAvatarMutation()
  const [setWorkerCategories, { isLoading: savingCats }] = useSetWorkerCategoriesMutation()
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState(null)
  const [selectedCats, setSelectedCats] = useState([])
  const { isDark, toggle: toggleDark } = useTheme()

  const isWorker = profile?.role === 'worker'

  const { data: categories } = useGetCategoriesQuery()
  const { data: workerCats } = useGetWorkerCategoriesQuery(user?.id, {
    skip: !isWorker || !user?.id,
  })

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
        ...(profile.role === 'worker' ? { hourly_rate: profile.hourly_rate || '' } : {}),
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (workerCats) setSelectedCats(workerCats)
  }, [workerCats])

  const toggleCategory = (id) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )

  const onAvatar = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user) return
    setAvatarError(null)
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('settings.imageOnly'))
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t('settings.imageTooLarge'))
      return
    }
    const res = await updateAvatar({ userId: user.id, file })
    if (res.error) {
      setAvatarError(res.error.message || t('settings.uploadError'))
      return
    }
    if (res.data) dispatch(setProfile(res.data))
    dispatch(showToast({ type: 'success', message: t('settings.avatarUpdated') }))
  }

  const onSubmit = async (values) => {
    const payload = { id: user.id, ...values }
    if (!isWorker) delete payload.hourly_rate
    const res = await updateProfile(payload)
    if (res.error) {
      dispatch(showToast({ type: 'error', message: res.error.message || t('common.error') }))
      return
    }
    if (isWorker) {
      await setWorkerCategories({ workerId: user.id, categoryIds: selectedCats })
    }
    if (res.data) dispatch(setProfile(res.data))
    setSaved(true)
    dispatch(showToast({ type: 'success', message: t('settings.saved') }))
    setTimeout(() => setSaved(false), 2500)
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
                <label
                  className={cn(
                    'absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-soft transition hover:bg-primary-700',
                    uploadingAvatar && 'pointer-events-none opacity-70'
                  )}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatar}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {profile?.full_name || '—'}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                <p className="text-xs text-slate-400">{t(`roles.${profile?.role}`)}</p>
                {avatarError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {avatarError}
                  </p>
                )}
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

            {isWorker && (
              <div>
                <Label>{t('settings.hourlyRate')}</Label>
                <Input type="number" min="0" {...register('hourly_rate')} placeholder="50000" />
                {errors.hourly_rate && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.hourly_rate.message)}</p>
                )}
              </div>
            )}

            {isWorker && (
              <div>
                <Label>{t('settings.specialty')}</Label>
                <p className="mb-2 text-xs text-slate-400">{t('settings.specialtyHint')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories?.map((cat) => {
                    const isSelected = selectedCats.includes(cat.id)
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                            : 'border-slate-200 text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:text-slate-300'
                        )}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isSelected ? 'text-primary-600' : 'text-slate-400'
                          )}
                        />
                        <span className="flex-1 truncate">
                          {cat[`name_${i18n.language}`] || cat.name_uz}
                        </span>
                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <Label>{t('auth.bio')}</Label>
              <Textarea {...register('bio')} placeholder={t('auth.bio')} />
            </div>

            <Button
              type="submit"
              loading={isLoading || savingCats}
              className="w-full sm:w-auto"
            >
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
                type="button"
                onClick={toggleDark}
                role="switch"
                aria-checked={isDark}
                aria-label={t('settings.theme')}
                className="relative h-7 w-12 rounded-full bg-slate-200 transition-colors dark:bg-primary-600"
              >
                <motion.span
                  initial={false}
                  animate={{ x: isDark ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow"
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
