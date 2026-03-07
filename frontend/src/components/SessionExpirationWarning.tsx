import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassCard } from './GlassCard'

interface SessionExpirationWarningProps {
  timeRemainingSeconds: number
  onClearSession: () => void
}

export function SessionExpirationWarning({ 
  timeRemainingSeconds, 
  onClearSession 
}: SessionExpirationWarningProps) {
  const { t } = useTranslation()
  const [timeRemaining, setTimeRemaining] = useState(timeRemainingSeconds)

  useEffect(() => {
    setTimeRemaining(timeRemainingSeconds)
  }, [timeRemainingSeconds])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (timeRemaining <= 0) {
    return null
  }

  return (
    <GlassCard className="mb-4 border-2 border-orange-400 dark:border-orange-500">
      <div 
        className="p-4 flex items-start space-x-3"
        role="alert"
        aria-live="polite"
      >
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {t('session.expiringTitle')}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {t('session.expiringMessage', { time: formatTime(timeRemaining) })}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('session.expiringNote')}
          </p>
        </div>
        <button
          onClick={onClearSession}
          className="flex-shrink-0 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
          aria-label={t('session.clearSession')}
        >
          {t('session.dismiss')}
        </button>
      </div>
    </GlassCard>
  )
}
