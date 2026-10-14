import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'
import { profilesApi } from '../profile/profileApi'

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  tagTypes: ['Reviews'],
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
      invalidatesTags: ['Reviews'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(profilesApi.util.invalidateTags(['Profile']))
        } catch {
          // xato bo'lsa profil keshini yangilash shart emas
        }
      },
    }),
  }),
})

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApi
