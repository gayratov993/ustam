import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import { useSetWorkerCategoriesMutation } from '@/features/profile/profileApi'
import { useUpdateProfileMutation } from '@/features/auth/authApi'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { cn } from '@/lib/utils'

function Onboarding() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: categories, isLoading: catsLoading } = useGetCategoriesQuery()
  const [setWorkerCategories, { isLoading: savingCats }] = useSetWorkerCategoriesMutation()
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation()

  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    district: profile?.district || '',
    bio: profile?.bio || '',
  })

  const isWorker = profile?.role === 'worker'
  const saving = savingCats || savingProfile

  const toggleCategory = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (isWorker) {
      await setWorkerCategories({ workerId: user.id, categoryIds: selected })
    }
    await updateProfile({ id: user.id, ...form })
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout title={t('auth.onboarding')} subtitle={t('auth.onboardingSubtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t('auth.fullName')}</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>{t('auth.phone')}</Label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+998 90 123 45 67"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('auth.city')}</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Toshkent"
            />
          </div>
          <div>
            <Label>{t('auth.district')}</Label>
            <Input
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="Chilonzor"
            />
          </div>
        </div>

        {isWorker && (
          <>
            <div>
              <Label>{t('auth.selectCategories')}</Label>
              {catsLoading ? (
                <p className="text-sm text-slate-400">{t('common.loading')}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories?.map((cat) => {
                    const isSelected = selected.includes(cat.id)
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
                          className={cn('h-4 w-4', isSelected ? 'text-primary-600' : 'text-slate-400')}
                        />
                        <span className="flex-1 truncate">
                          {cat[`name_${i18n.language}`] || cat.name_uz}
                        </span>
                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div>
          <Label>{t('auth.bio')}</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tajribangiz haqida..."
          />
        </div>

        <motion.div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')} className="flex-1">
            {t('auth.skip')}
          </Button>
          <Button type="submit" className="flex-1" loading={saving}>
            {t('common.save')}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  )
}

export default Onboarding
