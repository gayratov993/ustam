import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Briefcase, LayoutDashboard, Bell, Megaphone, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useGetNotificationsQuery } from '@/features/notifications/notificationsApi'
import { useGetUnreadCountQuery } from '@/features/chat/chatApi'

function BottomNav() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: notifications } = useGetNotificationsQuery(
    { userId: user?.id },
    { skip: !user }
  )
  const unread = notifications?.filter((n) => !n.is_read).length || 0
  const { data: unreadMessages = 0 } = useGetUnreadCountQuery(
    { userId: user?.id },
    { skip: !user, pollingInterval: 30000 }
  )

  const items = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/jobs', label: t('nav.jobs'), icon: Briefcase, end: false },
    { to: '/ads', label: t('nav.ads'), icon: Megaphone, end: false },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, end: false },
    { to: '/chat', label: t('nav.chat'), icon: MessageSquare, end: false, badge: unreadMessages },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell, end: false, badge: unread },
  ]

  return (
    <nav className="mobile-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/95 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      <div className="grid grid-cols-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="relative flex flex-col items-center gap-0.5 py-2.5"
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition',
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-400'
                    )}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-gradient-to-r from-primary-600 to-accent-600"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
