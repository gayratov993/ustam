import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, Clock, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { formatPrice, formatRelativeTime } from '@/utils/formatters'

const STATUS_STYLES = {
  open: 'success',
  in_progress: 'warning',
  completed: 'slate',
  cancelled: 'danger',
}

function JobCard({ job, index = 0 }) {
  const { t, i18n } = useTranslation()
  const categoryName = job.category
    ? job.category[`name_${i18n.language}`] || job.category.name_uz
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/jobs/${job.id}`}>
        <Card className="group cursor-pointer transition-shadow hover:shadow-lift">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {job.category && (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <CategoryIcon name={job.category.icon} className="h-5 w-5" />
                </span>
              )}
              <div>
                <h3 className="line-clamp-1 font-bold text-slate-900 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{categoryName}</p>
              </div>
            </div>
            <Badge variant={STATUS_STYLES[job.status] || 'default'}>
              {t(`jobs.${job.status}`)}
            </Badge>
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {job.description}
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.city || '—'}
              {job.district ? `, ${job.district}` : ''}
            </span>
            {job.date_needed && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {job.date_needed}
              </span>
            )}
            {job.workers_needed > 1 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {job.workers_needed} {t('jobs.workers')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
              <Wallet className="h-4 w-4" />
              {formatPrice(job.price, job.price_type)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{formatRelativeTime(job.created_at)}</span>
              <Avatar src={job.employer?.avatar_url} name={job.employer?.full_name} size="sm" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export { JobCard }
