import { Component, ErrorInfo, ReactNode } from 'react'
import { GlassCard } from './GlassCard'
import { GlassButton } from './GlassButton'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary component catches React errors and displays user-friendly error messages
 * Implements Requirements 20.1, 20.2
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-saffron via-white to-green">
          <GlassCard className="max-w-lg w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
                Please try again.
              </p>

              {/* Error Details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-xs font-mono text-left overflow-auto max-h-48">
                    <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-red-700 dark:text-red-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <GlassButton
                  onClick={this.handleReset}
                  className="px-6 py-3"
                  aria-label="Try again"
                >
                  Try Again
                </GlassButton>
                <GlassButton
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3"
                  aria-label="Go to home page"
                >
                  Go to Home
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}
