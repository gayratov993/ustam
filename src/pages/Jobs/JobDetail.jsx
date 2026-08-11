import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Users,
  Wallet,
  CalendarDays,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'
import { useGetJobQuery, useUpdateJobMutation } from '@/features/jobs/jobsApi'
import { useGetMyApplicationsQuery, useCreateApplicationMutation } from '@/features/applications/applicationsApi'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { formatPrice, formatDate, formatRelativeTime } from '@/utils/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { Flag, CheckCircle2 } from 'lucide-react'

function JobDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: job, isLoading } = useGetJobQuery({ id })
  const { data: myApps } = useGetMyApplicationsQuery({ workerId: user?.id }, { skip: !user })
  const [createApplication, { isLoading: applying }] = useCreateApplicationMutation()
  const [updateJob, { isLoading: updatingJob }] = useUpdateJobMutation()
  const [applyOpen, setApplyOpen] = useState(false)

  const alreadyApplied = (myApps ?? []).some((app) => app.job_id === job?.id)
  const isOwner = job && profile && job.employer_id === profile.id
  const canApply = user && profile?.role === 'worker' && !alreadyApplied && !isOwner

  const handleStatusChange = async (status) => {
    await updateJob({ id: job.id, status })
  }

  const handleApply = async (values) => {
    const res = await createApplication({ ...values, job_id: job.id, worker_id: user.id })
    if (!res.error) {
      setApplyOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <Skeleton className="h-10 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container-app py-8">
        <EmptyState icon={MessageSquare} title={t('common.noData')} description="" />
      </div>
    )
  }

  return (
    <div className="container-app py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('jobs.detail.backToJobs')}
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-2"
        >
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {job.category && (
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <CategoryIcon name={job.category.icon} className="h-6 w-6" />
                  </span>
                )}
                <div>
                  <Badge variant={job.status === 'open' ? 'success' : 'slate'}>
                    {t(`jobs.${job.status}`)}
                  </Badge>
                  <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {job.title}
                  </h1>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile icon={MapPin} label={t('jobs.detail.location')} value={`${job.city || '—'}${job.district ? `, ${job.district}` : ''}`} />
              <InfoTile icon={Wallet} label={t('jobs.detail.price')} value={formatPrice(job.price, job.price_type)} highlight />
              <InfoTile icon={CalendarDays} label={t('jobs.detail.dateNeeded')} value={job.date_needed ? formatDate(job.date_needed) : '—'} />
              <InfoTile icon={Users} label={t('jobs.workers')} value={`${job.workers_needed} ${t('jobs.workers')}`} />
            </div>

            <div className="mt-5">
              <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{t('jobs.detail.about')}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {job.description}
              </p>
            </div>
          </Card>

          {isOwner && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('jobs.applications')}</h3>
                <Button size="sm" variant="outline" onClick={() => navigate(`/applications/job/${job.id}`)}>
                  {t('employer.viewApplications')}
                </Button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('jobs.detail.noApplications')}
              </p>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Card>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">{t('jobs.detail.employer')}</h3>
            <div className="flex items-center gap-3">
              <Avatar src={job.employer?.avatar_url} name={job.employer?.full_name} size="lg" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {job.employer?.full_name || '—'}
                </p>
                <p className="text-xs text-slate-400">
                  {t('nav.home')} • {formatRelativeTime(job.created_at)}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {job.employer?.city || job.city || '—'}
              </p>
            </div>
            {profile?.role === 'worker' && user && !isOwner && (
              <Button variant="outline" className="mt-4 w-full" onClick={() => navigate(`/chat?with=${job.employer_id}`)}>
                <MessageSquare className="h-4 w-4" />
                {t('jobs.detail.contact')}
              </Button>
            )}
            {isOwner && job.status !== 'cancelled' && (
              <div className="mt-4 space-y-2">
                {job.status === 'open' && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={updatingJob}
                    onClick={() => handleStatusChange('in_progress')}
                  >
                    <Flag className="h-4 w-4" />
                    {t('jobs.in_progress')}
                  </Button>
                )}
                {job.status === 'in_progress' && (
                  <Button
                    variant="success"
                    className="w-full"
                    disabled={updatingJob}
                    onClick={() => handleStatusChange('completed')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('jobs.completed')}
                  </Button>
                )}
              </div>
            )}
          </Card>

          {canApply ? (
            <Button className="w-full" size="lg" onClick={() => setApplyOpen(true)}>
              {t('jobs.apply')}
            </Button>
          ) : alreadyApplied ? (
            <Button className="w-full" size="lg" variant="success" disabled>
              {t('jobs.applied')} ✓
            </Button>
          ) : !user ? (
            <Link to="/auth/login">
              <Button className="w-full" size="lg">
                {t('jobs.apply')}
              </Button>
            </Link>
          ) : null}
        </motion.div>
      </div>

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={t('jobs.detail.applyTitle')}>
        <ApplyForm jobId={job.id} workerId={user?.id} submitting={applying} onSubmit={handleApply} />
      </Modal>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value, highlight }) {
  return (
    <div className="rounded-2xl bg-surface-50 p-3.5 dark:bg-slate-800">
      <div className={`flex items-center gap-1.5 ${highlight ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function ApplyForm({ onSubmit, submitting, workerId, jobId }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [price, setPrice] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ message, proposed_price: Number(price), worker_id: workerId, job_id: jobId })
      }}
      className="space-y-4"
    >
      <div>
        <Label>{t('jobs.detail.proposedPrice')}</Label>
        <Input
          type="number"
          min="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <Label>{t('jobs.detail.messagePlaceholder')}</Label>
        <Textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('jobs.detail.messagePlaceholder')}
        />
      </div>
      <Button type="submit" className="w-full" loading={submitting}>
        {t('jobs.apply')}
      </Button>
    </form>
  )
}

export default JobDetail
