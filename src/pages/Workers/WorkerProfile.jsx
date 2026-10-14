import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  MessageSquare,
  ArrowLeft,
  Briefcase,
  Phone,
  CalendarDays,
  Award,
  FileCheck,
} from 'lucide-react'
import { useGetProfileQuery } from '@/features/profile/profileApi'
import { useGetReviewsQuery } from '@/features/ratings/reviewsApi'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RatingStars, AnimatedRatingValue } from '@/components/rating/RatingStars'
import { ReviewCard } from '@/components/rating/ReviewCard'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { StatCard } from '@/components/worker/StatCard'
import { formatDate } from '@/utils/formatters'
import { EmptyState } from '@/components/shared/EmptyState'

function WorkerProfile() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data, isLoading, error } = useGetProfileQuery({ id }, { skip: !id })
  const { data: reviews } = useGetReviewsQuery({ revieweeId: id }, { skip: !id })

  const isOwnProfile = user?.id === id

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <Skeleton className="h-10 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    )
  }

  const profile = data?.profile
  if (!profile) {
    return (
      <div className="container-app py-8">
        <EmptyState
          icon={Briefcase}
          title={t('common.noData')}
          description={error ? error.message || JSON.stringify(error) : ''}
        />
      </div>
    )
  }

  const rating = data?.rating ?? { avg_rating: 0, review_count: 0 }
  const categories = data?.categories ?? []
  const isNew = (rating.review_count ?? 0) === 0

  return (
    <div className="container-app py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="text-center">
            <div className="relative mx-auto mb-3 w-fit">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {profile.full_name || '—'}
            </h1>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              {profile.city || '—'}
              {profile.district ? `, ${profile.district}` : ''}
            </p>

            <div className="mt-4 flex flex-col items-center gap-1.5">
              {isNew ? (
                <Badge variant="accent">{t('worker.newWorker')}</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <RatingStars value={Math.round(rating.avg_rating)} readOnly />
                  <AnimatedRatingValue value={rating.avg_rating} />
                  <span className="text-xs text-slate-400">
                    ({rating.review_count} {t('worker.reviews').toLowerCase()})
                  </span>
                </div>
              )}
            </div>

            {profile.phone && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                {profile.phone}
              </p>
            )}

            {user && !isOwnProfile && (
              <Button className="mt-5 w-full" onClick={() => navigate(`/chat?with=${id}`)}>
                <MessageSquare className="h-4 w-4" />
                {t('worker.contact')}
              </Button>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={FileCheck} label={t('worker.completedJobs')} value={data?.completedJobs || 0} />
            <StatCard icon={Award} label={t('worker.avgRating')} value={Math.round(rating.avg_rating)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 lg:col-span-2"
        >
          {profile.bio && (
            <Card>
              <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{t('auth.bio')}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.bio}
              </p>
            </Card>
          )}

          {categories.length > 0 && (
            <Card>
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                {t('worker.categories')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                  >
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                    {cat[`name_${i18n.language}`] || cat.name_uz}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">{t('worker.reviews')}</h3>
            {!reviews?.length ? (
              <p className="py-6 text-center text-sm text-slate-400">{t('worker.noReviews')}</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-2 font-bold text-slate-900 dark:text-white">
              {t('worker.completedJobs')}
            </h3>
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-4 w-4" />
              {data?.completedJobs || 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t('nav.home')}: {formatDate(profile.created_at)}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default WorkerProfile
