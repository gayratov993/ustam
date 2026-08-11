import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Inbox, Wallet, Check, X, MapPin, Star } from 'lucide-react'
import { useGetJobApplicationsQuery, useUpdateApplicationMutation } from '@/features/applications/applicationsApi'
import { useGetJobQuery } from '@/features/jobs/jobsApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { RatingStars } from '@/components/rating/RatingStars'
import { ReviewForm } from '@/components/rating/ReviewForm'
import { Modal } from '@/components/ui/modal'
import { formatRelativeTime, formatPrice } from '@/utils/formatters'
import { useAuth } from '@/hooks/useAuth'

function JobApplications() {
  const { jobId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reviewTarget, setReviewTarget] = useState(null)
  const { data: job } = useGetJobQuery({ id: jobId }, { skip: !jobId })
  const { data: applications, isLoading } = useGetJobApplicationsQuery(
    { jobId },
    { skip: !jobId }
  )
  const [updateApplication, { isLoading: updating }] = useUpdateApplicationMutation()

  const handleStatus = async (appId, status) => {
    await updateApplication({ id: appId, status })
  }

  const jobCompleted = job?.status === 'completed'

  return (
    <div className="container-app py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          {t('applications.received')}
        </h1>
        {job && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            <Link to={`/jobs/${job.id}`} className="font-semibold text-primary-600 hover:underline">
              {job.title}
            </Link>
            {' • '}
            {formatPrice(job.price, job.price_type)}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !applications?.length ? (
        <EmptyState icon={Inbox} title={t('applications.noApplications')} description="" />
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <Link to={`/workers/${app.worker_id}`} className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar src={app.worker?.avatar_url} name={app.worker?.full_name} size="lg" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {app.worker?.full_name || '—'}
                        </h3>
                        <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'danger'}>
                          {t(`applications.${app.status}`)}
                        </Badge>
                      </div>
                      {app.worker?.rating && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <RatingStars value={Math.round(app.worker.rating.avg_rating || 0)} readOnly size="sm" />
                          <span className="text-xs text-slate-400">
                            {app.worker.rating.avg_rating || '—'} ({app.worker.rating.review_count || 0})
                          </span>
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.worker?.city || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" />
                          {formatPrice(app.proposed_price)}
                        </span>
                        <span>{formatRelativeTime(app.created_at)}</span>
                      </div>
                    </div>
                  </Link>

                  {app.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={updating}
                        onClick={() => handleStatus(app.id, 'accepted')}
                      >
                        <Check className="h-4 w-4" />
                        {t('applications.accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating}
                        onClick={() => handleStatus(app.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                        {t('applications.reject')}
                      </Button>
                    </div>
                  )}
                  {app.status === 'accepted' && jobCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-amber-400 text-amber-600 hover:bg-amber-50 dark:text-amber-400"
                      onClick={() => setReviewTarget(app)}
                    >
                      <Star className="h-4 w-4" />
                      {t('worker.rating')}
                    </Button>
                  )}
                </div>
                {app.message && (
                  <p className="mt-3 rounded-xl bg-surface-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    "{app.message}"
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        title={t('worker.rating')}
      >
        {reviewTarget && (
          <ReviewForm
            jobId={jobId}
            reviewerId={user?.id}
            revieweeId={reviewTarget.worker_id}
            onDone={() => setReviewTarget(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default JobApplications
