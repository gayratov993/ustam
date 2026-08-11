import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Inbox, Wallet, Clock, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetMyApplicationsQuery } from '@/features/applications/applicationsApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatPrice, formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  cancelled: 'slate',
}

function MyApplications() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const { data: applications, isLoading } = useGetMyApplicationsQuery(
    { workerId: user?.id },
    { skip: !user }
  )

  const filtered = useMemo(() => {
    const apps = applications ?? []
    return filter === 'all' ? apps : apps.filter((a) => a.status === filter)
  }, [applications, filter])

  const tabs = ['all', 'pending', 'accepted', 'rejected', 'cancelled']

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          {t('applications.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('applications.subtitle')}</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition',
              filter === tab
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {t(`applications.${tab}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState icon={Inbox} title={t('applications.noApplications')} description="" />
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge variant={STATUS_STYLES[app.status] || 'default'}>
                      {t(`applications.${app.status}`)}
                    </Badge>
                    <Link to={`/jobs/${app.job_id}`}>
                      <h3 className="mt-2 font-bold text-slate-900 transition hover:text-primary-600 dark:text-white">
                        {app.job?.title}
                      </h3>
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" />
                        {formatPrice(app.proposed_price, app.job?.price_type)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRelativeTime(app.created_at)}
                      </span>
                      {app.job?.category && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {app.job.category[`name_${i18n.language}`] || app.job.category.name_uz}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/jobs/${app.job_id}`}>
                    <Button size="sm" variant="outline">
                      {t('common.view')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplications
