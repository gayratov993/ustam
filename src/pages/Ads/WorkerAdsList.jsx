import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Megaphone } from 'lucide-react'
import { Input, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { WorkerAdCard } from '@/components/worker/WorkerAdCard'
import { useGetWorkerAdsQuery } from '@/features/ads/workerAdsApi'
import { useGetCategoriesQuery } from '@/features/jobs/jobsApi'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'

function WorkerAdsList() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [city, setCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(search, 400)
  const { data: ads, isLoading, isFetching } = useGetWorkerAdsQuery({
    search: debouncedSearch,
    categoryId: categoryId || undefined,
    city: city || undefined,
  })
  const { data: categories } = useGetCategoriesQuery()

  const cities = [...new Set((ads ?? []).map((a) => a.city).filter(Boolean))]

  return (
    <div className="container-app py-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('ads.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('ads.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {user && profile?.role === 'worker' && (
            <Button size="sm" onClick={() => navigate('/ads/new')}>
              {t('ads.create')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('common.filter')}
          </Button>
        </div>
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
                  placeholder={t('ads.searchPlaceholder')}
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
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : !ads?.length ? (
            <EmptyState
              icon={Megaphone}
              title={t('ads.empty')}
              description={t('common.tryAgain')}
            />
          ) : (
            <div className={`space-y-4 ${isFetching ? 'opacity-60' : ''}`}>
              {ads.map((ad, i) => (
                <WorkerAdCard key={ad.id} ad={ad} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkerAdsList
