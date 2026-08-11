import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useCountUp } from '@/hooks/useCountUp'

function StatCard({ icon: Icon, label, value, sub }) {
  const ref = useCountUp(value)

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            <span ref={ref}>{value.toLocaleString()}</span>
            {sub && <span className="text-base font-semibold text-slate-400"> {sub}</span>}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </Card>
    </motion.div>
  )
}

export { StatCard }
