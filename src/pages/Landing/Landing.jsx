import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  UserCheck,
  Star,
  Hammer,
  BriefcaseBusiness,
  ClipboardList,
  ShieldCheck,
  Bell,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useCountUp } from '@/hooks/useCountUp'
import { RatingStars } from '@/components/rating/RatingStars'
import { useAuth } from '@/hooks/useAuth'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

function Hero() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-500/10" />
      <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl dark:bg-accent-500/10" />

      <div className="container-app relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <motion.div initial="initial" animate="animate" variants={{ animate: { opacity: 1, y: 0 } }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {t('app.tagline')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            {t('landing.heroTitle1')}{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {t('landing.heroTitle2')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-lg text-lg text-slate-600 dark:text-slate-300"
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to={isAuthenticated ? '/jobs' : '/auth/register'}>
              <Button size="lg">
                <Hammer className="h-5 w-5" />
                {t('landing.ctaWorker')}
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/jobs/new' : '/auth/register'}>
              <Button size="lg" variant="outline">
                <BriefcaseBusiness className="h-5 w-5" />
                {t('landing.ctaEmployer')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  )
}

function HeroPreview() {
  const { t } = useTranslation()
  return (
    <div className="relative mx-auto max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lift dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary-50 p-3 dark:bg-primary-500/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm dark:bg-slate-800">
            <Search className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {t('landing.heroTitle1').split(' ')[0]} — 1 kun
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toshkent, Chilonzor</p>
          </div>
          <span className="text-sm font-bold text-primary-600">250 so'm</span>
        </div>

        <div className="space-y-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
              <Avatar name={i === 0 ? 'Ali' : 'Jasur'} size="md" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {i === 0 ? 'Ali Karimov' : 'Jasur Toshpulatov'}
                </p>
                <RatingStars value={5} readOnly size="sm" />
              </div>
              <Button size="sm" variant={i === 0 ? 'default' : 'outline'}>
                <UserCheck className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute -left-6 -top-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lift dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">4.8</p>
            <p className="text-[10px] text-slate-400">127 {t('worker.reviews').toLowerCase()}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5 }}
        className="absolute -bottom-6 -right-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lift dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <p className="text-xs font-semibold text-slate-900 dark:text-white">+2</p>
        </div>
      </motion.div>
    </div>
  )
}

function Stats() {
  const { t } = useTranslation()
  const stats = [
    { value: 12500, label: t('landing.statsWorkers') },
    { value: 8300, label: t('landing.statsJobs') },
    { value: 21400, label: t('landing.statsCompleted') },
    { value: 86, label: t('landing.statsCities') },
  ]
  return (
    <section className="border-y border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="container-app grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
        {stats.map((stat, i) => (
          <StatItem key={i} {...stat} delay={i * 0.05} />
        ))}
      </div>
    </section>
  )
}

function StatItem({ value, label, delay }) {
  const ref = useCountUp(value, { duration: 1600 })
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <p ref={ref} className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
        0
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  )
}

function HowItWorks() {
  const { t } = useTranslation()
  const steps = [
    { icon: ClipboardList, title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { icon: Search, title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { icon: UserCheck, title: t('landing.step3Title'), desc: t('landing.step3Desc') },
  ]
  return (
    <section className="container-app py-16 lg:py-20">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {t('landing.howItWorks')}
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('landing.howItWorksSub')}</p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            {...fadeUp}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-3xl border border-slate-200/70 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="absolute right-4 top-4 text-5xl font-black text-slate-100 dark:text-slate-800">
              {i + 1}
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white">
              <step.icon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  const { t } = useTranslation()
  const workerFeatures = [
    { icon: ClipboardList, text: t('landing.workerFeature1') },
    { icon: Star, text: t('landing.workerFeature2') },
    { icon: TrendingUp, text: t('landing.workerFeature3') },
  ]
  const employerFeatures = [
    { icon: BriefcaseBusiness, text: t('landing.employerFeature1') },
    { icon: ShieldCheck, text: t('landing.employerFeature2') },
    { icon: Bell, text: t('landing.employerFeature3') },
  ]
  return (
    <section className="bg-white py-16 dark:bg-slate-900 lg:py-20">
      <div className="container-app grid gap-8 lg:grid-cols-2">
        <motion.div {...fadeUp} className="rounded-3xl bg-gradient-to-br from-primary-600 to-accent-600 p-7 text-white shadow-lift sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Hammer className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{t('landing.forWorkers')}</h3>
          </div>
          <ul className="space-y-3.5">
            {workerFeatures.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-3xl border border-slate-200/70 p-7 dark:border-slate-800 sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/15">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('landing.forEmployers')}
            </h3>
          </div>
          <ul className="space-y-3.5">
            {employerFeatures.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.text}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

function Testimonials() {
  const { t } = useTranslation()
  const reviews = [
    { name: 'Sardor M.', text: t('landing.review1'), rating: 5 },
    { name: 'Gulnora A.', text: t('landing.review2'), rating: 5 },
    { name: 'Bekzod R.', text: t('landing.review3'), rating: 4 },
  ]
  return (
    <section className="container-app py-16 lg:py-20">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {t('landing.reviews')}
        </h2>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            {...fadeUp}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-slate-200/70 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <RatingStars value={review.rating} readOnly />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">"{review.text}"</p>
            <div className="mt-4 flex items-center gap-2.5">
              <Avatar name={review.name} size="sm" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {review.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  const { t } = useTranslation()
  return (
    <section className="container-app pb-20">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-10 text-center text-white shadow-lift sm:p-14"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <h2 className="text-3xl font-extrabold sm:text-4xl">{t('landing.getStarted')}</h2>
        <p className="mx-auto mt-2 max-w-md text-white/80">{t('app.tagline')}</p>
        <Link to="/auth/register" className="mt-6 inline-block">
          <Button size="lg" variant="secondary" className="bg-white text-primary-700 hover:bg-white/90">
            {t('nav.register')}
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}

function Landing() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
    </>
  )
}

export default Landing
