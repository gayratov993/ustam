import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'uz', label: 'O‘zbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  useEffect(() => {
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Globe className="h-4 w-4" />
        {current.label}
      </button>
      <AnimatedMenu open={open} onChange={(code) => { i18n.changeLanguage(code); setOpen(false) }} />
    </div>
  )
}

function AnimatedMenu({ open, onChange }) {
  if (!open) return null
  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift dark:border-slate-700 dark:bg-slate-800">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-700 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
