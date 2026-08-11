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
import { jobSchema } from '@/utils/validators'
import {
  useCreateJobMutation,
  useUpdateJobMutation,
  useGetCategoriesQuery,
  useGetJobQuery,
} from '@/features/jobs/jobsApi'
import { useAuth } from '@/hooks/useAuth'

function JobForm() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEdit = Boolean(id)

  const { data: categories } = useGetCategoriesQuery()
  const { data: job } = useGetJobQuery({ id }, { skip: !isEdit })
  const [createJob, { isLoading: creating, error: createError }] = useCreateJobMutation()
  const [updateJob, { isLoading: updating, error: updateError }] = useUpdateJobMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(jobSchema) })

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        category_id: job.category_id,
        city: job.city,
        district: job.district,
        price: job.price,
        price_type: job.price_type,
        workers_needed: job.workers_needed,
        date_needed: job.date_needed,
      })
    }
  }, [job, reset])

  const onSubmit = async (values) => {
    const payload = { ...values, date_needed: values.date_needed || null }
    let res
    if (isEdit) {
      res = await updateJob({ id, ...payload })
    } else {
      res = await createJob({ ...payload, employer_id: user.id })
    }
    if (!res.error) {
      const jobId = res.data?.id
      navigate(jobId ? `/jobs/${jobId}` : '/dashboard')
    }
  }

  const isLoadingForm = isEdit && !job

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
          {t(isEdit ? 'jobs.form.editTitle' : 'jobs.form.createTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('jobs.subtitle')}</p>
      </motion.div>

      {isLoadingForm ? (
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
            <Label>{t('jobs.form.title')}</Label>
            <Input placeholder={t('jobs.form.titlePlaceholder')} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{t(errors.title.message)}</p>}
          </div>

          <div>
            <Label>{t('jobs.form.description')}</Label>
            <Textarea
              placeholder={t('jobs.form.descriptionPlaceholder')}
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
              <Label>{t('jobs.form.priceType')}</Label>
              <Select {...register('price_type')}>
                <option value="fixed">{t('jobs.form.fixed')}</option>
                <option value="per_day">{t('jobs.form.per_day')}</option>
                <option value="negotiable">{t('jobs.negotiable')}</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>{t('jobs.form.price')}</Label>
              <Input type="number" min="0" placeholder="100000" {...register('price')} />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{t(errors.price.message)}</p>
              )}
            </div>
            <div>
              <Label>{t('jobs.form.workersNeeded')}</Label>
              <Input
                type="number"
                min="1"
                defaultValue="1"
                {...register('workers_needed')}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>{t('auth.city')}</Label>
              <Input placeholder="Toshkent" {...register('city')} />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">{t(errors.city.message)}</p>
              )}
            </div>
            <div>
              <Label>{t('auth.district')}</Label>
              <Input placeholder="Chilonzor" {...register('district')} />
            </div>
          </div>

          <div>
            <Label>{t('jobs.form.dateNeeded')}</Label>
            <Input type="date" {...register('date_needed')} />
          </div>

          <Button type="submit" size="lg" className="w-full" loading={creating || updating}>
            {t('common.save')}
          </Button>
        </form>
      )}
    </div>
  )
}

export default JobForm
