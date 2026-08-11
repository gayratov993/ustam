import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-50 p-6 text-center dark:bg-[#0B1120]">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Nimanidir noto‘g‘ri ketdi
          </h1>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            {this.state.error?.message || 'Kutilmagan xatolik yuz berdi'}
          </p>
          <button
            onClick={this.handleReload}
            className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Qayta yuklash
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
