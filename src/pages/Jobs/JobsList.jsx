import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Briefcase } from 'lucide-react'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { JobCard } from '@/components/job/JobCard'
import { useGetJobsQuery, useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'

function JobsList() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [city, setCity] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(search, 400)
  const { data: jobs, isLoading, isFetching, error } = useGetJobsQuery({
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    city: city || undefined,
    status: 'open',
    sort,
  })
  const { data: categories } = useGetCategoriesQuery()

  const cities = [...new Set((jobs ?? []).map((j) => j.city).filter(Boolean))]

  return (
    <div className="container-app py-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('jobs.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('jobs.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.filter')}
        </Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="card sticky top-20 space-y-4 p-5">
            <div>
              <Label>{t('common.search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('jobs.searchPlaceholder')}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>{t('jobs.detail.category')}</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">{t('jobs.allCategories')}</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat[`name_${i18n.language}`] || cat.name_uz}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t('auth.city')}</Label>
              <Select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{t('jobs.allCities')}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>{t('jobs.sort')}</Label>
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">{t('jobs.sortNewest')}</option>
                <option value="price_high">{t('jobs.sortPriceHigh')}</option>
                <option value="price_low">{t('jobs.sortPriceLow')}</option>
              </Select>
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <EmptyState
              icon={Briefcase}
              title={t('common.noData')}
              description={error ? error.message || JSON.stringify(error) : t('common.tryAgain')}
            />
          ) : (
            <div className={`space-y-4 ${isFetching ? 'opacity-60' : ''}`}>
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsList
