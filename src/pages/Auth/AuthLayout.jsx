import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Header'

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface-50 via-surface-50 to-primary-50/40 px-4 py-10 dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#131033]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            ← {title}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export { AuthLayout }
