import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { RatingStars } from '@/components/rating/RatingStars'
import { formatDate } from '@/utils/formatters'

function ReviewCard({ review, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar src={review.reviewer?.avatar_url} name={review.reviewer?.full_name} size="sm" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {review.reviewer?.full_name || '—'}
              </p>
              {review.job && (
                <p className="text-xs text-slate-400">{review.job.title}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
        </div>
        <RatingStars value={review.rating} readOnly size="sm" />
        {review.comment && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
        )}
      </Card>
    </motion.div>
  )
}

export { ReviewCard }
