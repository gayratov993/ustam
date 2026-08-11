import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Logo } from './Header'

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-auto border-t border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="container-app flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <Logo />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {t('app.name')} — {t('app.tagline')}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/jobs" className="transition hover:text-primary-600">
            {t('nav.jobs')}
          </Link>
          <Link to="/workers" className="transition hover:text-primary-600">
            {t('nav.workers')}
          </Link>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
