import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const profilesApi = createApi({
  reducerPath: 'profilesApi',
  tagTypes: ['Profile', 'WorkerCategories'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      queryFn: toResponseArgs(async (sb, { id }) => {
        const { data: profile, error } = await sb
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        const { data: workerCategories, error: catError } = await sb
          .from('worker_categories')
          .select('category_id, categories(name_uz, name_ru, name_en, icon, id)')
          .eq('worker_id', id)
        if (catError) throw catError
        const { data: rating } = await sb.rpc('get_worker_rating', { worker: id })
        const { data: completedJobs, error: jobsError } = await sb
          .from('applications')
          .select('job:jobs(id, status, title, price, created_at)', { count: 'exact', head: true })
          .eq('worker_id', id)
          .eq('status', 'accepted')
        if (jobsError) throw jobsError
        return {
          data: {
            profile,
            categories: workerCategories?.map((c) => c.categories) ?? [],
            rating: rating?.[0] ?? { avg_rating: 0, review_count: 0 },
            completedJobs: completedJobs?.length ?? 0,
          },
        }
      }),
      providesTags: ['Profile'],
    }),

    getWorkers: builder.query({
      queryFn: toResponseArgs(async (sb, { search, categoryId } = {}) => {
        let query = sb
          .from('profiles')
          .select('*')
          .eq('role', 'worker')
          .order('created_at', { ascending: false })
        if (search) {
          query = query.ilike('full_name', `%${search}%`)
        }
        const { data: workers, error } = await query
        if (error) throw error
        let result = workers ?? []
        if (categoryId) {
          const { data: matches, error: mcError } = await sb
            .from('worker_categories')
            .select('worker_id')
            .eq('category_id', categoryId)
          if (mcError) throw mcError
          const ids = new Set(matches?.map((m) => m.worker_id))
          result = result.filter((w) => ids.has(w.id))
        }
        const enriched = await Promise.all(
          result.map(async (worker) => {
            const { data: rating } = await sb.rpc('get_worker_rating', { worker: worker.id })
            const { data: cats } = await sb
              .from('worker_categories')
              .select('categories(name_uz, name_ru, name_en, icon, id)')
              .eq('worker_id', worker.id)
            return {
              ...worker,
              rating: rating?.[0] ?? { avg_rating: 0, review_count: 0 },
              categories: cats?.map((c) => c.categories) ?? [],
            }
          })
        )
        return { data: enriched }
      }),
    }),

    updateProfile: builder.mutation({
      queryFn: toResponseArgs(async (sb, profile) => {
        const { id, ...data } = profile
        return sb.from('profiles').update(data).eq('id', id)
      }),
      invalidatesTags: ['Profile'],
    }),

    setWorkerCategories: builder.mutation({
      queryFn: toResponseArgs(async (sb, { workerId, categoryIds }) => {
        await sb.from('worker_categories').delete().eq('worker_id', workerId)
        if (categoryIds?.length) {
          const rows = categoryIds.map((category_id) => ({ worker_id: workerId, category_id }))
          const { error } = await sb.from('worker_categories').insert(rows)
          if (error) throw error
        }
        return { data: categoryIds }
      }),
      invalidatesTags: ['WorkerCategories'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useGetWorkersQuery,
  useUpdateProfileMutation,
  useSetWorkerCategoriesMutation,
} = profilesApi
