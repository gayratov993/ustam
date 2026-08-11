import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { WorkerCard } from '@/components/worker/WorkerCard'
import { useGetWorkersQuery } from '@/features/profile/profileApi'
import { useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import { useDebounce } from '@/hooks/useDebounce'

function WorkersList() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { data: workers, isLoading } = useGetWorkersQuery({
    search: debouncedSearch,
    categoryId: categoryId || undefined,
  })
  const { data: categories } = useGetCategoriesQuery()

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          {t('nav.workers')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('landing.statsWorkers')}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_280px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('workers.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t('jobs.allCategories')}</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat[`name_${i18n.language}`] || cat.name_uz}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : !workers?.length ? (
        <EmptyState icon={UserRound} title={t('common.noData')} description="" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker, i) => (
            <WorkerCard key={worker.id} worker={worker} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default WorkersList
