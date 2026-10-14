import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { RatingStars } from '@/components/rating/RatingStars'
import { CategoryIcon } from '@/components/shared/CategoryIcon'

function WorkerCard({ worker, index = 0 }) {
  const { t, i18n } = useTranslation()
  const rating = worker.rating || { avg_rating: 0, review_count: 0 }
  const isNew = (rating.review_count ?? 0) === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/workers/${worker.id}`}>
        <Card className="group text-center transition-shadow hover:shadow-lift">
          <div className="mb-3 flex h-5 items-center justify-between">
            {isNew ? (
              <Badge variant="accent">{t('worker.newWorker')}</Badge>
            ) : null}
          </div>
          <div className="mb-3 flex justify-center">
            <Avatar src={worker.avatar_url} name={worker.full_name} size="lg" />
          </div>
          <h3 className="font-bold text-slate-900 transition group-hover:text-primary-600 dark:text-white">
            {worker.full_name}
          </h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            {worker.city || '—'}
          </p>
          {worker.categories?.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
              {worker.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <CategoryIcon name={cat.icon} className="h-3 w-3" />
                  {cat[`name_${i18n.language}`] || cat.name_uz}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5">
            <RatingStars value={Math.round(rating.avg_rating)} readOnly size="sm" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {rating.avg_rating || '—'}
            </span>
            <span className="text-xs text-slate-400">
              ({rating.review_count || 0})
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export { WorkerCard }
