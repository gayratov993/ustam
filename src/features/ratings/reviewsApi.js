import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  tagTypes: ['Reviews', 'Profile'],
  endpoints: (builder) => ({
    getReviews: builder.query({
      queryFn: toResponseArgs(async (sb, { revieweeId }) => {
        const { data, error } = await sb
          .from('reviews')
          .select(
            '*, reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url), job:jobs(id, title)'
          )
          .eq('reviewee_id', revieweeId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return { data }
      }),
      providesTags: ['Reviews'],
    }),

    createReview: builder.mutation({
      queryFn: toResponseArgs(async (sb, review) => {
        return sb.from('reviews').insert(review).select().single()
      }),
      invalidatesTags: ['Reviews', 'Profile'],
    }),
  }),
})

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApi
