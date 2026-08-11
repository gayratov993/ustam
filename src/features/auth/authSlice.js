import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload?.user ?? null
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.profile = null
      state.error = null
    },
  },
})

export const {
  setSession,
  setProfile,
  setLoading,
  setError,
  clearError,
  logout,
} = authSlice.actions

export default authSlice.reducer
