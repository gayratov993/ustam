import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Inbox,
  UsersRound,
  Plus,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Wallet,
  CalendarDays,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useGetMyJobsQuery,
  useDeleteJobMutation,
} from '@/features/jobs/jobsApi'
import { StatCard } from '@/components/worker/StatCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatPrice, formatDate } from '@/utils/formatters'
import { getCategoryName } from '@/components/shared/CategoryIcon'

const STATUS_STYLES = {
  open: 'success',
  in_progress: 'warning',
  completed: 'slate',
  cancelled: 'danger',
}

function EmployerDashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: jobs, isLoading } = useGetMyJobsQuery(
    { employerId: user?.id },
    { skip: !user }
  )
  const [deleteJob] = useDeleteJobMutation()

  const activeJobs = (jobs ?? []).filter((j) => j.status === 'open')
  const totalApplications = (jobs ?? []).reduce((s, j) => s + (j.application_count || 0), 0)
  const hired = (jobs ?? []).reduce((s, j) => s + (j.accepted_count || 0), 0)

  const handleDelete = async (id) => {
    if (window.confirm(t('common.delete') + '?')) {
      await deleteJob({ id })
    }
  }

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t('employer.dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.full_name}</p>
        </div>
        <Button onClick={() => navigate('/jobs/new')}>
          <Plus className="h-4 w-4" />
          {t('employer.createJob')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Briefcase} label={t('employer.activeJobs')} value={activeJobs.length} />
        <StatCard icon={Inbox} label={t('employer.totalApplications')} value={totalApplications} />
        <StatCard icon={UsersRound} label={t('employer.hired')} value={hired} />
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : !jobs?.length ? (
          <EmptyState
            icon={Briefcase}
            title={t('employer.noJobs')}
            description=""
            action={
              <Button onClick={() => navigate('/jobs/new')}>
                <Plus className="h-4 w-4" />
                {t('employer.createJob')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant={STATUS_STYLES[job.status] || 'default'}>
                          {t(`jobs.${job.status}`)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {job.category ? getCategoryName(job.category, i18n.language) : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.city || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" />
                          {formatPrice(job.price, job.price_type)}
                        </span>
                        {job.date_needed && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(job.date_needed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {job.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Inbox className="h-4 w-4" />
                      {job.application_count || 0} {t('jobs.applications')}
                    </span>
                    <Link
                      to={`/applications/job/${job.id}`}
                      className="text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {t('employer.viewApplications')} →
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployerDashboard
