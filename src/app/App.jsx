import { AppRoutes } from '@/routes/AppRoutes'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { ThemeProvider } from '@/features/theme/themeContext'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
