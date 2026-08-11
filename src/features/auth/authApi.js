import { createApi } from '@reduxjs/toolkit/query/react'
import { getSupabase } from '../../lib/supabaseClient'
import { toResponse, toResponseArgs, normalizeError } from '../../lib/supabaseUtils'

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getSession: builder.query({
      queryFn: async () => {
        const sb = getSupabase()
        const { data } = await sb.auth.getSession()
        const user = data.session?.user ?? null
        if (!user) return { data: { user: null, profile: null } }
        const { data: profile, error } = await sb
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        if (error) return { error: normalizeError(error) }
        return { data: { user, profile } }
      },
      providesTags: ['Profile'],
    }),

    login: builder.mutation({
      queryFn: toResponseArgs((sb, { email, password }) =>
        sb.auth.signInWithPassword({ email, password })
      ),
    }),

    register: builder.mutation({
      queryFn: toResponseArgs((sb, { email, password, fullName, role }) =>
        sb.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        })
      ),
    }),

    logout: builder.mutation({
      queryFn: toResponse((sb) => sb.auth.signOut()),
    }),

    resetPassword: builder.mutation({
      queryFn: toResponseArgs((sb, { email }) =>
        sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
      ),
    }),

    updateProfile: builder.mutation({
      queryFn: toResponseArgs(async (sb, profile) => {
        const { id, ...data } = profile
        return sb.from('profiles').update(data).eq('id', id)
      }),
      invalidatesTags: ['Profile'],
    }),

    updateAvatar: builder.mutation({
      queryFn: toResponseArgs(async (sb, { userId, file }) => {
        const ext = file.name.split('.').pop()
        const path = `${userId}/${Date.now()}.${ext}`
        const { error: upError } = await sb.storage
          .from('avatars')
          .upload(path, file, { upsert: true })
        if (upError) throw upError
        const { data: publicUrl } = sb.storage.from('avatars').getPublicUrl(path)
        return sb.from('profiles').update({ avatar_url: publicUrl.publicUrl }).eq('id', userId)
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const {
  useGetSessionQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
} = authApi
