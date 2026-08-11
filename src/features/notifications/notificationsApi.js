import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      queryFn: toResponseArgs(async (sb, { userId }) => {
        const { data, error } = await sb
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        return { data }
      }),
      providesTags: ['Notifications'],
    }),

    markAllRead: builder.mutation({
      queryFn: toResponseArgs(async (sb, { userId }) => {
        return sb.from('notifications').update({ is_read: true }).eq('user_id', userId)
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

export const { useGetNotificationsQuery, useMarkAllReadMutation } = notificationsApi
