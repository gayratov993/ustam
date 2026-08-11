import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Megaphone, Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { priceLabel } from '@/components/worker/WorkerAdCard'
import { formatRelativeTime } from '@/utils/formatters'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetMyWorkerAdsQuery,
  useDeleteWorkerAdMutation,
} from '@/features/ads/workerAdsApi'

function MyAds() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: ads, isLoading } = useGetMyWorkerAdsQuery(
    { workerId: user?.id },
    { skip: !user }
  )
  const [deleteAd, { isLoading: deleting }] = useDeleteWorkerAdMutation()
  const [deleteId, setDeleteId] = useState(null)

  const onDelete = async () => {
    if (!deleteId) return
    const res = await deleteAd({ id: deleteId })
    if (!res.error) setDeleteId(null)
  }

  return (
    <div className="container-app max-w-3xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('ads.myAds')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('ads.subtitle')}</p>
        </div>
        <Button size="sm" onClick={() => navigate('/ads/new')}>
          <Plus className="h-4 w-4" />
          {t('ads.create')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !ads?.length ? (
        <EmptyState
          icon={Megaphone}
          title={t('ads.myEmpty')}
          description=""
          action={
            <Button size="sm" onClick={() => navigate('/ads/new')}>
              {t('ads.create')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {ads.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {ad.category && (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                        <CategoryIcon name={ad.category.icon} className="h-5 w-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{ad.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ad.city || '—'}
                        {ad.district ? `, ${ad.district}` : ''} • {formatRelativeTime(ad.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={ad.is_active ? 'success' : 'slate'}>
                    {ad.is_active ? t('ads.active') : t('ads.inactive')}
                  </Badge>
                </div>

                {ad.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {ad.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {priceLabel(ad, t)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/ads/${ad.id}/edit`)}>
                      <Pencil className="h-3.5 w-3.5" />
                      {t('common.edit')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(ad.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title={t('common.confirm')}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('ads.confirmDelete')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={onDelete} loading={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default MyAds
