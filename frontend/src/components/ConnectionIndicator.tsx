import { useNetworkStatus } from '../hooks/useNetworkStatus'

/**
 * ConnectionIndicator shows the current network connection status
 * Implements Requirements 20.3, 20.4
 */
export function ConnectionIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus()

  // Don't show anything if connection is good
  if (isOnline && !isSlowConnection) {
    return null
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
      role="alert"
      aria-live="polite"
    >
      {!isOnline ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span>No internet connection. Please check your network.</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span>Slow connection detected. Some features may be limited.</span>
        </div>
      )}
    </div>
  )
}
