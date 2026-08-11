import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-8xl font-black text-transparent"
        style={{ WebkitTextStroke: '2px #4F46E5' }}
      >
        404
      </motion.div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        {t('notFound.title')}
      </h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">{t('notFound.subtitle')}</p>
      <Link to="/">
        <Button>
          <Home className="h-4 w-4" />
          {t('notFound.back')}
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
