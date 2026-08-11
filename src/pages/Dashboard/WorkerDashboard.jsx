import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  FileCheck,
  Star,
  Send,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGetMyApplicationsQuery } from '@/features/applications/applicationsApi'
import { useGetReviewsQuery } from '@/features/ratings/reviewsApi'
import { useGetMyWorkerAdsQuery } from '@/features/ads/workerAdsApi'
import { StatCard } from '@/components/worker/StatCard'
import { Card, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Megaphone } from 'lucide-react'
import { getCategoryName } from '@/components/shared/CategoryIcon'

const PIE_COLORS = ['#4F46E5', '#16A34A', '#DC2626', '#F59E0B']

function WorkerDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: applications, isLoading } = useGetMyApplicationsQuery(
    { workerId: user?.id },
    { skip: !user }
  )
  const { data: reviews } = useGetReviewsQuery({ revieweeId: user?.id }, { skip: !user })
  const { data: myAds } = useGetMyWorkerAdsQuery({ workerId: user?.id }, { skip: !user })
  const activeAds = myAds?.filter((a) => a.is_active).length ?? 0

  const stats = useMemo(() => {
    const apps = applications ?? []
    const accepted = apps.filter((a) => a.status === 'accepted')
    const rejected = apps.filter((a) => a.status === 'rejected')
    const pending = apps.filter((a) => a.status === 'pending')
    const avgRating = reviews?.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0

    const last30 = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const key = date.toISOString().slice(0, 10)
      return { day: key.slice(5), count: 0 }
    })
    const indexMap = new Map(last30.map((d, i) => [d.day, i]))
    apps.forEach((a) => {
      const key = (a.created_at || '').slice(0, 10)
      if (indexMap.has(key)) last30[indexMap.get(key)].count += 1
    })

    const categoryCounts = {}
    apps.forEach((a) => {
      const name = a.job?.category ? getCategoryName(a.job.category, i18n.language) : '—'
      categoryCounts[name] = (categoryCounts[name] || 0) + 1
    })
    const topCategories = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      total: apps.length,
      accepted: accepted.length,
      rejected: rejected.length,
      pending: pending.length,
      avgRating,
      reviewCount: reviews?.length || 0,
      activity: last30,
      topCategories,
      pieData: [
        { name: t('applications.pending'), value: pending.length },
        { name: t('applications.accepted'), value: accepted.length },
        { name: t('applications.rejected'), value: rejected.length },
      ].filter((d) => d.value > 0),
    }
  }, [applications, reviews, t, i18n.language])

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <Skeleton className="h-10 w-60" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72" />
      </div>
    )
  }

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('worker.dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile?.full_name} • {profile?.city || '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="px-3 py-1.5">
            {stats.avgRating > 0 ? `⭐ ${stats.avgRating}` : t('worker.newWorker')}
          </Badge>
          <Button size="sm" onClick={() => navigate('/ads/new')}>
            <Megaphone className="h-4 w-4" />
            {t('ads.create')}
          </Button>
          {activeAds > 0 && (
            <Link
              to="/my-ads"
              className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              {t('ads.myAds')} ({activeAds}) →
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileCheck} label={t('worker.totalJobs')} value={stats.accepted} />
        <StatCard icon={Star} label={t('worker.avgRating')} value={Number(stats.avgRating) || 0} sub={`(${stats.reviewCount})`} />
        <StatCard icon={Send} label={t('worker.applicationsSent')} value={stats.total} />
        <StatCard icon={CheckCircle2} label={t('worker.acceptedRate')} value={stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0} sub="%" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            {t('worker.monthlyActivity')}
          </CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activity}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} width={24} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fill="url(#activityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4">{t('worker.statistics')}</CardTitle>
          {stats.pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">{t('common.noData')}</p>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {stats.pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">
                {stats.pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i] }}
                      />
                      {d.name}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">{t('worker.topCategories')}</CardTitle>
          {!stats.topCategories.length ? (
            <p className="py-8 text-center text-sm text-slate-400">{t('common.noData')}</p>
          ) : (
            <div className="space-y-3">
              {stats.topCategories.map((cat, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">{cat.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-600"
                      style={{ width: `${Math.min((cat.value / stats.topCategories[0].value) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-3">{t('worker.statistics')}</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-xl bg-surface-50 px-4 py-3 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t('applications.pending')}</span>
              <span className="font-bold text-slate-900 dark:text-white">{stats.pending}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-surface-50 px-4 py-3 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t('applications.accepted')}</span>
              <span className="font-bold text-green-600">{stats.accepted}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-surface-50 px-4 py-3 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t('applications.rejected')}</span>
              <span className="font-bold text-red-600">{stats.rejected}</span>
            </div>
          </div>
          <Link
            to="/applications"
            className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            {t('nav.applications')} →
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default WorkerDashboard
