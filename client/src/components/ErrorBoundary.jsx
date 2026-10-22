import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4">
          <div className="card p-8 max-w-md w-full text-center">
            <svg className="mx-auto h-16 w-16 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-2 text-[var(--text-muted)]">We&apos;re sorry, but an unexpected error occurred.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left text-xs text-[var(--text-subtle)]">
                <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
                <pre className="bg-[var(--bg)] p-3 rounded overflow-auto max-h-60">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="bg-[var(--bg)] p-3 rounded overflow-auto max-h-60 mt-2">{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary