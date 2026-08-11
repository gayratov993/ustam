import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, Wallet, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { formatRelativeTime } from '@/utils/formatters'
import { useAuth } from '@/hooks/useAuth'

function priceLabel(ad, t) {
  const num = Number(ad.price)
  if (!num) return t('ads.negotiable')
  const formatted = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(num)
  if (ad.price_type === 'per_hour') return `${formatted} so'm/soat`
  if (ad.price_type === 'per_day') return `${formatted} so'm/kun`
  if (ad.price_type === 'fixed') return `${formatted} so'm`
  return `${formatted} so'm (${t('ads.negotiable')})`
}

function WorkerAdCard({ ad, index = 0 }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const categoryName = ad.category
    ? ad.category[`name_${i18n.language}`] || ad.category.name_uz
    : ''
  const isOwn = user?.id === ad.worker?.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/workers/${ad.worker?.id}`}>
        <Card className="group cursor-pointer transition-shadow hover:shadow-lift">
          <div className="mb-3 flex items-start gap-2">
            {ad.category && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <CategoryIcon name={ad.category.icon} className="h-5 w-5" />
              </span>
            )}
            <div>
              <h3 className="line-clamp-1 font-bold text-slate-900 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                {ad.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{categoryName}</p>
            </div>
          </div>

          {ad.description && (
            <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {ad.description}
            </p>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {ad.city || '—'}
              {ad.district ? `, ${ad.district}` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
              <Wallet className="h-4 w-4" />
              {priceLabel(ad, t)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{formatRelativeTime(ad.created_at)}</span>
              {!isOwn && user && (
                <button
                  type="button"
                  title={t('worker.contact')}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate(`/chat?with=${ad.worker?.id}`)
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}
              <Avatar src={ad.worker?.avatar_url} name={ad.worker?.full_name} size="sm" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export { WorkerAdCard, priceLabel }
