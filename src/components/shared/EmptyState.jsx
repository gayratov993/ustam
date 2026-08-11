import { motion } from 'framer-motion'

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action}
    </motion.div>
  )
}

export { EmptyState }
