import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  tagTypes: ['Jobs', 'Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      queryFn: toResponseArgs(async (sb) => {
        const { data, error } = await sb.from('categories').select('*').order('name_uz')
        if (error) throw error
        return { data }
      }),
      providesTags: ['Categories'],
    }),

    getJobs: builder.query({
      queryFn: toResponseArgs(
        async (sb, { search, categoryId, city, status = 'open', sort = 'newest' } = {}) => {
          let query = sb
            .from('jobs')
            .select(
              '*, employer:profiles!jobs_employer_id_fkey(id, full_name, avatar_url, city, district), category:categories(id, name_uz, name_ru, name_en, icon)'
            )
            .order('created_at', { ascending: false })
          if (status) query = query.eq('status', status)
          if (categoryId) query = query.eq('category_id', categoryId)
          if (city) query = query.eq('city', city)
          if (search) query = query.ilike('title', `%${search}%`)
          const { data, error } = await query
          if (error) throw error
          let result = data ?? []
          if (sort === 'price_high') result = [...result].sort((a, b) => b.price - a.price)
          if (sort === 'price_low') result = [...result].sort((a, b) => a.price - b.price)
          return { data: result }
        }
      ),
      providesTags: ['Jobs'],
    }),

    getJob: builder.query({
      queryFn: toResponseArgs(async (sb, { id }) => {
        const { data, error } = await sb
          .from('jobs')
          .select(
            '*, employer:profiles!jobs_employer_id_fkey(id, full_name, avatar_url, city, district, phone, created_at), category:categories(id, name_uz, name_ru, name_en, icon)'
          )
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        return { data }
      }),
      providesTags: ['Jobs'],
    }),

    getMyJobs: builder.query({
      queryFn: toResponseArgs(async (sb, { employerId }) => {
        const { data, error } = await sb
          .from('jobs')
          .select(
            '*, employer:profiles!jobs_employer_id_fkey(id, full_name, avatar_url), category:categories(id, name_uz, name_ru, name_en, icon)'
          )
          .eq('employer_id', employerId)
          .order('created_at', { ascending: false })
        if (error) throw error
        const withCounts = await Promise.all(
          (data ?? []).map(async (job) => {
            const { count } = await sb
              .from('applications')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id)
            return { ...job, application_count: count ?? 0 }
          })
        )
        return { data: withCounts }
      }),
      providesTags: ['Jobs'],
    }),

    createJob: builder.mutation({
      queryFn: toResponseArgs(async (sb, job) => {
        return sb.from('jobs').insert(job).select().single()
      }),
      invalidatesTags: ['Jobs'],
    }),

    updateJob: builder.mutation({
      queryFn: toResponseArgs(async (sb, { id, ...data }) => {
        return sb.from('jobs').update(data).eq('id', id).select().single()
      }),
      invalidatesTags: ['Jobs'],
    }),

    deleteJob: builder.mutation({
      queryFn: toResponseArgs(async (sb, { id }) => {
        return sb.from('jobs').delete().eq('id', id)
      }),
      invalidatesTags: ['Jobs'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetJobsQuery,
  useGetJobQuery,
  useGetMyJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobsApi
