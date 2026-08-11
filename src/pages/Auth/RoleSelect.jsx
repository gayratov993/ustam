import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hammer, BriefcaseBusiness } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { useUpdateProfileMutation } from '@/features/auth/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

function RoleSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile, isLoading } = useAuth()
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation()

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth/login', { replace: true })
    if (!isLoading && profile?.role && profile.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, user, profile, navigate])

  const chooseRole = async (role) => {
    if (!user) return
    await updateProfile({ id: user.id, role })
    navigate('/auth/onboarding')
  }

  const roles = [
    {
      key: 'worker',
      icon: Hammer,
      title: t('auth.roleWorker'),
      desc: t('auth.roleWorkerDesc'),
      gradient: 'from-primary-600 to-accent-600',
    },
    {
      key: 'employer',
      icon: BriefcaseBusiness,
      title: t('auth.roleEmployer'),
      desc: t('auth.roleEmployerDesc'),
      gradient: 'from-amber-500 to-orange-600',
    },
  ]

  return (
    <AuthLayout title={t('auth.roleSelect')} subtitle="">
      <div className="grid gap-3">
        {roles.map((role, i) => (
          <motion.button
            key={role.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={updating}
            onClick={() => chooseRole(role.key)}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-primary-300 hover:shadow-soft dark:border-slate-700 dark:hover:border-primary-500"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white`}
            >
              <role.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{role.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{role.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </AuthLayout>
  )
}

export default RoleSelect
