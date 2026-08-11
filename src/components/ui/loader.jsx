import { Loader2 } from 'lucide-react'

function Loader({ label = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export { Loader }
