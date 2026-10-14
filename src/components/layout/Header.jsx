import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Moon,
  Plus,
  LogOut,
  Settings,
  Bell,
  User,
  LayoutDashboard,
  Sun,
  Megaphone,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLogoutMutation } from '@/features/auth/authApi'
import { useTheme } from '@/features/theme/themeContext'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useGetNotificationsQuery } from '@/features/notifications/notificationsApi'
import { useGetUnreadCountQuery } from '@/features/chat/chatApi'

function Logo({ onClick }) {
  const { t } = useTranslation()
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
          <path
            d="M20 18v16a12 12 0 0 0 24 0V18"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        {t('app.name')}
      </span>
    </Link>
  )
}

function Header() {
  const { t } = useTranslation()
  const { isAuthenticated, user, profile } = useAuth()
  const [logout] = useLogoutMutation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggle: toggleTheme } = useTheme()
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const { data: notifications } = useGetNotificationsQuery(
    { userId: user?.id },
    { skip: !user, pollingInterval: 30000 }
  )
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0
  const { data: unreadMessages = 0 } = useGetUnreadCountQuery(
    { userId: user?.id },
    { skip: !user, pollingInterval: 30000 }
  )

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
      <div className="container-app flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: '/jobs', label: t('nav.jobs'), icon: Briefcase },
            { to: '/ads', label: t('nav.ads'), icon: Megaphone },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
                {t('nav.login')}
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/register')}>
                {t('nav.register')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {profile?.role === 'employer' && (
                <Button size="sm" onClick={() => navigate('/jobs/new')}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('jobs.create')}</span>
                </Button>
              )}
              <Link to="/chat" aria-label={t('nav.chat')} className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>
              <Link to="/notifications" className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-full transition hover:opacity-80"
                >
                  <Avatar src={profile?.avatar_url} name={profile?.full_name} size="md" />
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lift dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {profile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-slate-400">{t(`roles.${profile?.role}`)}</p>
                    </div>
                    <MenuItem icon={LayoutDashboard} label={t('nav.dashboard')} onClick={() => { setMenuOpen(false); navigate('/dashboard') }} />
                    {(profile?.role === 'worker' || profile?.role === 'admin') && (
                      <MenuItem icon={Megaphone} label={t('ads.myAds')} onClick={() => { setMenuOpen(false); navigate('/my-ads') }} />
                    )}
                    <MenuItem icon={User} label={t('nav.profile')} onClick={() => { setMenuOpen(false); navigate('/me') }} />
                    <MenuItem icon={Settings} label={t('nav.settings')} onClick={() => { setMenuOpen(false); navigate('/settings') }} />
                    <MenuItem icon={LogOut} label={t('nav.logout')} onClick={handleLogout} danger />
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-700 ${
        danger ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

export { Header, Logo }
