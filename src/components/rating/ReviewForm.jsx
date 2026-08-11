import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { RatingStars } from '@/components/rating/RatingStars'
import { Button } from '@/components/ui/button'
import { Textarea, Label } from '@/components/ui/input'
import { useCreateReviewMutation } from '@/features/ratings/reviewsApi'

function ReviewForm({ jobId, reviewerId, revieweeId, onDone }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [createReview, { isLoading }] = useCreateReviewMutation()

  const submit = async (e) => {
    e.preventDefault()
    const res = await createReview({
      job_id: jobId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating,
      comment: comment || null,
    })
    if (!res.error) onDone?.()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col items-center gap-2 py-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('worker.rating')}
        </p>
        <motion.div whileHover={{ scale: 1.05 }}>
          <RatingStars value={rating} onChange={setRating} size="lg" />
        </motion.div>
        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{rating}.0</p>
      </div>
      <div>
        <Label>{t('worker.reviews')}</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Fikringizni yozing..."
        />
      </div>
      <Button type="submit" className="w-full" loading={isLoading}>
        {t('common.send')}
      </Button>
    </form>
  )
}

export { ReviewForm }
