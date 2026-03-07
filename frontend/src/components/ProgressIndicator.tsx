import { useEffect, useState } from 'react'

interface ProgressIndicatorProps {
  isLoading: boolean
  message?: string
  progress?: number // 0-100, undefined for indeterminate
}

/**
 * ProgressIndicator shows loading state for long-running operations
 * Implements Requirements 20.5
 */
export function ProgressIndicator({
  isLoading,
  message = 'Loading...',
  progress,
}: ProgressIndicatorProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-6"
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Progress bar or spinner */}
      {progress !== undefined ? (
        // Determinate progress bar
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-saffron via-white to-green transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            {Math.round(progress)}%
          </p>
        </div>
      ) : (
        // Indeterminate spinner
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div
            className="absolute inset-0 border-4 border-transparent border-t-saffron rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Loading message */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {message}
        <span className="inline-block w-8 text-left" aria-hidden="true">
          {dots}
        </span>
      </p>

      {/* Screen reader text */}
      <span className="sr-only">
        {progress !== undefined
          ? `Loading: ${Math.round(progress)} percent complete`
          : 'Loading, please wait'}
      </span>
    </div>
  )
}

/**
 * Inline progress indicator for smaller spaces
 */
export function InlineProgressIndicator({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-saffron rounded-full animate-spin" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  )
}
