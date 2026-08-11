import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import Landing from '@/pages/Landing/Landing'
import NotFound from '@/pages/NotFound/NotFound'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import RoleSelect from '@/pages/Auth/RoleSelect'
import ForgotPassword from '@/pages/Auth/ForgotPassword'
import Onboarding from '@/pages/Auth/Onboarding'
import JobsList from '@/pages/Jobs/JobsList'
import JobDetail from '@/pages/Jobs/JobDetail'
import JobForm from '@/pages/Jobs/JobForm'
import WorkersList from '@/pages/Workers/WorkersList'
import WorkerProfile from '@/pages/Workers/WorkerProfile'
import WorkerDashboard from '@/pages/Dashboard/WorkerDashboard'
import EmployerDashboard from '@/pages/Dashboard/EmployerDashboard'
import WorkerAdsList from '@/pages/Ads/WorkerAdsList'
import WorkerAdForm from '@/pages/Ads/WorkerAdForm'
import MyAds from '@/pages/Ads/MyAds'
import MyApplications from '@/pages/Applications/MyApplications'
import JobApplications from '@/pages/Applications/JobApplications'
import Notifications from '@/pages/Notifications/Notifications'
import Chat from '@/pages/Chat/Chat'
import Settings from '@/pages/Settings/Settings'
import MyProfile from '@/pages/Settings/MyProfile'

function RequireRoleDashboard() {
  const { profile } = useAuth()
  if (profile?.role === 'employer') return <EmployerDashboard />
  if (profile?.role === 'worker') return <WorkerDashboard />
  return <Navigate to="/jobs" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/role-select" element={<RoleSelect />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/auth/onboarding"
          element={<ProtectedRoute>{<Onboarding />}</ProtectedRoute>}
        />

        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <JobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <JobForm />
            </ProtectedRoute>
          }
        />

        <Route path="/workers" element={<WorkersList />} />
        <Route path="/workers/:id" element={<WorkerProfile />} />

        <Route path="/ads" element={<WorkerAdsList />} />
        <Route
          path="/ads/new"
          element={
            <ProtectedRoute roles={['worker', 'admin']}>
              <WorkerAdForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ads/:id/edit"
          element={
            <ProtectedRoute roles={['worker', 'admin']}>
              <WorkerAdForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ads"
          element={
            <ProtectedRoute roles={['worker', 'admin']}>
              <MyAds />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={<ProtectedRoute>{<RequireRoleDashboard />}</ProtectedRoute>}
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute roles={['worker', 'admin']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/job/:jobId"
          element={
            <ProtectedRoute roles={['employer', 'admin']}>
              <JobApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={<ProtectedRoute>{<Notifications />}</ProtectedRoute>}
        />
        <Route path="/chat" element={<ProtectedRoute>{<Chat />}</ProtectedRoute>} />
        <Route
          path="/settings"
          element={<ProtectedRoute>{<Settings />}</ProtectedRoute>}
        />
        <Route path="/me" element={<ProtectedRoute>{<MyProfile />}</ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export { AppRoutes }
