import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isDark: localStorage.getItem('theme') === 'dark',
  modal: null,
  toast: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', state.isDark)
    },
    setTheme: (state, action) => {
      state.isDark = action.payload
      localStorage.setItem('theme', action.payload ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', action.payload)
    },
    openModal: (state, action) => {
      state.modal = action.payload
    },
    closeModal: (state) => {
      state.modal = null
    },
    showToast: (state, action) => {
      state.toast = action.payload
    },
    clearToast: (state) => {
      state.toast = null
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  openModal,
  closeModal,
  showToast,
  clearToast,
} = uiSlice.actions

export default uiSlice.reducer
