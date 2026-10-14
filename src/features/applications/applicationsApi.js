import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'
import { jobsApi } from '../jobs/jobsApi'

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  tagTypes: ['Applications'],
  endpoints: (builder) => ({
    getMyApplications: builder.query({
      queryFn: toResponseArgs(async (sb, { workerId }) => {
        const { data, error } = await sb
          .from('applications')
          .select(
            '*, job:jobs(*, category:categories(name_uz, name_ru, name_en, icon)), worker:profiles!applications_worker_id_fkey(id, full_name, avatar_url)'
          )
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return { data }
      }),
      providesTags: ['Applications'],
    }),

    getJobApplications: builder.query({
      queryFn: toResponseArgs(async (sb, { jobId }) => {
        const { data, error } = await sb
          .from('applications')
          .select(
            '*, worker:profiles!applications_worker_id_fkey(id, full_name, avatar_url, city, district, bio, created_at)'
          )
          .eq('job_id', jobId)
          .order('created_at', { ascending: false })
        if (error) throw error
        const enriched = await Promise.all(
          (data ?? []).map(async (app) => {
            const { data: rating } = await sb.rpc('get_worker_rating', { worker: app.worker_id })
            return { ...app, worker: { ...app.worker, rating: rating?.[0] ?? null } }
          })
        )
        return { data: enriched }
      }),
      providesTags: ['Applications'],
    }),

    createApplication: builder.mutation({
      queryFn: toResponseArgs(async (sb, application) => {
        const { data, error } = await sb
          .from('applications')
          .insert(application)
          .select('*, job:jobs(employer_id, title)')
          .single()
        if (error) throw error
        return { data }
      }),
      invalidatesTags: ['Applications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(jobsApi.util.invalidateTags(['Jobs']))
        } catch {
          // xato bo'lsa joblar keshini yangilash shart emas
        }
      },
    }),

    updateApplication: builder.mutation({
      queryFn: toResponseArgs(async (sb, { id, status }) => {
        const { data, error } = await sb
          .from('applications')
          .update({ status })
          .eq('id', id)
          .select('*, job:jobs(employer_id, title), worker_id')
          .single()
        if (error) throw error
        return { data }
      }),
      invalidatesTags: ['Applications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(jobsApi.util.invalidateTags(['Jobs']))
        } catch {
          // xato bo'lsa joblar keshini yangilash shart emas
        }
      },
    }),
  }),
})

export const {
  useGetMyApplicationsQuery,
  useGetJobApplicationsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
} = applicationsApi
