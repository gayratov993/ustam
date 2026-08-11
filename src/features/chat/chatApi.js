import { createApi } from '@reduxjs/toolkit/query/react'
import { toResponseArgs } from '../../lib/supabaseUtils'

export const chatApi = createApi({
  reducerPath: 'chatApi',
  tagTypes: ['Messages'],
  endpoints: (builder) => ({
    getConversations: builder.query({
      queryFn: toResponseArgs(async (sb, { userId }) => {
        const { data, error } = await sb
          .from('messages')
          .select(
            '*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)'
          )
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(200)
        if (error) throw error
        const map = new Map()
        for (const msg of data ?? []) {
          const other = msg.sender_id === userId ? msg.receiver : msg.sender
          const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
          if (!map.has(otherId)) {
            map.set(otherId, {
              id: otherId,
              lastMessage: msg,
              name: other?.full_name ?? 'Foydalanuvchi',
              avatar: other?.avatar_url ?? null,
            })
          }
        }
        return { data: Array.from(map.values()) }
      }),
      providesTags: ['Messages'],
    }),

    getMessages: builder.query({
      queryFn: toResponseArgs(async (sb, { userId, otherId }) => {
        const { data, error } = await sb
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: true })
        if (error) throw error
        return { data }
      }),
      providesTags: ['Messages'],
    }),

    getChatUser: builder.query({
      queryFn: toResponseArgs(async (sb, { id }) => {
        const { data, error } = await sb
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', id)
          .maybeSingle()
        if (error) throw error
        return { data }
      }),
    }),

    sendMessage: builder.mutation({
      queryFn: toResponseArgs(async (sb, message) => {
        return sb.from('messages').insert(message).select().single()
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
})

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetChatUserQuery,
  useSendMessageMutation,
} = chatApi
