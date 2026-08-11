import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
} from '@/features/notifications/notificationsApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelativeTime } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const TYPE_STYLES = {
  new_application: 'default',
  application_accepted: 'success',
  application_rejected: 'danger',
}

function Notifications() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: notifications, isLoading } = useGetNotificationsQuery(
    { userId: user?.id },
    { skip: !user }
  )
  const [markAllRead] = useMarkAllReadMutation()
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <div className="container-app max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('notifications.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {unreadCount} — {t('notifications.unread')}
          </p>
        </div>
        {notifications?.some((n) => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={() => markAllRead({ userId: user.id })}>
            <CheckCheck className="h-4 w-4" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-slate-400">{t('common.loading')}</p>
      ) : !notifications?.length ? (
        <EmptyState icon={BellOff} title={t('notifications.empty')} description="" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Card className={cn('flex items-start gap-3 p-4', !n.is_read && 'border-primary-300 bg-primary-50/40 dark:border-primary-500/40 dark:bg-primary-500/5')}>
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={TYPE_STYLES[n.type] || 'default'}>
                      {t(`notifications.types.${n.type}`)}
                    </Badge>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t(`notifications.types.${n.type}`)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
