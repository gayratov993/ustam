import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import { authApi } from '../features/auth/authApi'
import { jobsApi } from '../features/jobs/jobsApi'
import { applicationsApi } from '../features/applications/applicationsApi'
import { reviewsApi } from '../features/ratings/reviewsApi'
import { notificationsApi } from '../features/notifications/notificationsApi'
import { chatApi } from '../features/chat/chatApi'
import { profilesApi } from '../features/profile/profileApi'
import { workerAdsApi } from '../features/ads/workerAdsApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [profilesApi.reducerPath]: profilesApi.reducer,
    [workerAdsApi.reducerPath]: workerAdsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApi.middleware,
      jobsApi.middleware,
      applicationsApi.middleware,
      reviewsApi.middleware,
      notificationsApi.middleware,
      chatApi.middleware,
      profilesApi.middleware,
      workerAdsApi.middleware
    ),
})

setupListeners(store.dispatch)
