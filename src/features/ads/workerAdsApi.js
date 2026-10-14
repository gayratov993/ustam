import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const workerAdsApi = createApi({
  reducerPath: 'workerAdsApi',
  tagTypes: ['WorkerAds'],
  endpoints: (builder) => ({
    getWorkerAds: builder.query({
      queryFn: toResponseArgs(async (sb, { search, categoryId, city } = {}) => {
        let query = sb
          .from('worker_ads')
          .select(
            '*, worker:profiles!worker_ads_worker_id_fkey(id, full_name, avatar_url, city, district), category:categories(id, name_uz, name_ru, name_en, icon)'
          )
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (categoryId) query = query.eq('category_id', categoryId)
        if (city) query = query.eq('city', city)
        if (search) query = query.ilike('title', `%${search}%`)
        const { data, error } = await query
        if (error) throw error
        return { data: data ?? [] }
      }),
      providesTags: ['WorkerAds'],
    }),

    getMyWorkerAds: builder.query({
      queryFn: toResponseArgs(async (sb, { workerId }) => {
        const { data, error } = await sb
          .from('worker_ads')
          .select('*, category:categories(id, name_uz, name_ru, name_en, icon)')
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return { data: data ?? [] }
      }),
      providesTags: ['WorkerAds'],
    }),

    getWorkerAd: builder.query({
      queryFn: toResponseArgs(async (sb, { id }) => {
        const { data, error } = await sb
          .from('worker_ads')
          .select(
            '*, worker:profiles!worker_ads_worker_id_fkey(id, full_name, avatar_url), category:categories(id, name_uz, name_ru, name_en, icon)'
          )
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        return { data }
      }),
      providesTags: ['WorkerAds'],
    }),

    createWorkerAd: builder.mutation({
      queryFn: toResponseArgs(async (sb, ad) =>
        sb.from('worker_ads').insert(ad).select().single()
      ),
      invalidatesTags: ['WorkerAds'],
    }),

    updateWorkerAd: builder.mutation({
      queryFn: toResponseArgs(async (sb, { id, ...data }) =>
        sb.from('worker_ads').update(data).eq('id', id).select().single()
      ),
      invalidatesTags: ['WorkerAds'],
    }),

    deleteWorkerAd: builder.mutation({
      queryFn: toResponseArgs(async (sb, { id }) =>
        sb.from('worker_ads').delete().eq('id', id)
      ),
      invalidatesTags: ['WorkerAds'],
    }),
  }),
})

export const {
  useGetWorkerAdsQuery,
  useGetMyWorkerAdsQuery,
  useGetWorkerAdQuery,
  useCreateWorkerAdMutation,
  useUpdateWorkerAdMutation,
  useDeleteWorkerAdMutation,
} = workerAdsApi
