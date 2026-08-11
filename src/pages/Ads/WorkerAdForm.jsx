import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { workerAdSchema } from '@/utils/validators'
import { useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import {
  useCreateWorkerAdMutation,
  useUpdateWorkerAdMutation,
  useGetMyWorkerAdsQuery,
} from '@/features/ads/workerAdsApi'
import { useAuth } from '@/hooks/useAuth'

function WorkerAdForm() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEdit = Boolean(id)

  const { data: categories } = useGetCategoriesQuery()
  const { data: myAds } = useGetMyWorkerAdsQuery({ workerId: user?.id }, { skip: !user })
  const ad = isEdit ? myAds?.find((a) => a.id === id) : null
  const [createAd, { isLoading: creating, error: createError }] = useCreateWorkerAdMutation()
  const [updateAd, { isLoading: updating, error: updateError }] = useUpdateWorkerAdMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(workerAdSchema) })

  useEffect(() => {
    if (ad) {
      reset({
        title: ad.title,
        description: ad.description,
        category_id: ad.category_id,
        city: ad.city,
        district: ad.district,
        price: ad.price,
        price_type: ad.price_type,
      })
    }
  }, [ad, reset])

  const onSubmit = async (values) => {
    let res
    if (isEdit) {
      res = await updateAd({ id, ...values })
    } else {
      res = await createAd({ ...values, worker_id: user.id })
    }
    if (!res.error) {
      navigate('/ads', { replace: true })
    }
  }

  return (
    <div className="container-app max-w-2xl py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          {t(isEdit ? 'ads.form.editTitle' : 'ads.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('ads.subtitle')}</p>
      </motion.div>

      {isEdit && !ad ? (
        <p className="py-10 text-center text-slate-400">{t('common.loading')}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          {(createError || updateError) && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {createError?.data?.message || updateError?.data?.message || t('common.error')}
            </div>
          )}

          <div>
            <Label>{t('ads.form.title')}</Label>
            <Input placeholder={t('ads.form.titlePlaceholder')} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{t(errors.title.message)}</p>}
          </div>

          <div>
            <Label>{t('ads.form.description')}</Label>
            <Textarea
              placeholder={t('ads.form.descriptionPlaceholder')}
              rows={5}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{t(errors.description.message)}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>{t('jobs.detail.category')}</Label>
              <Select {...register('category_id')}>
                <option value="">{t('jobs.allCategories')}</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat[`name_${i18n.language}`] || cat.name_uz}
                  </option>
                ))}
              </Select>
              {errors.category_id && (
                <p className="mt-1 text-xs text-red-500">{t(errors.category_id.message)}</p>
              )}
            </div>
            <div>
              <Label>{t('ads.form.priceType')}</Label>
              <Select {...register('price_type')}>
                <option value="per_hour">{t('ads.per_hour')}</option>
                <option value="per_day">{t('ads.per_day')}</option>
                <option value="fixed">{t('ads.fixed')}</option>
                <option value="negotiable">{t('ads.negotiable')}</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>{t('ads.form.price')}</Label>
              <Input type="number" min="0" placeholder="100000" {...register('price')} />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{t(errors.price.message)}</p>
              )}
            </div>
            <div>
              <Label>{t('auth.city')}</Label>
              <Input placeholder="Toshkent" {...register('city')} />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">{t(errors.city.message)}</p>
              )}
            </div>
          </div>

          <div>
            <Label>{t('auth.district')}</Label>
            <Input placeholder="Chilonzor" {...register('district')} />
          </div>

          <Button type="submit" size="lg" className="w-full" loading={creating || updating}>
            {t('common.save')}
          </Button>
        </form>
      )}
    </div>
  )
}

export default WorkerAdForm
