import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassButton } from './GlassButton'

interface ClearSessionButtonProps {
  onClearSession: () => void
  disabled?: boolean
}

export function ClearSessionButton({ onClearSession, disabled = false }: ClearSessionButtonProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onClearSession()
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('session.clearSessionConfirm')}
        </span>
        <button
          onClick={handleConfirm}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          aria-label={t('common.yes')}
        >
          {t('common.yes')}
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          aria-label={t('common.no')}
        >
          {t('common.no')}
        </button>
      </div>
    )
  }

  return (
    <GlassButton
      onClick={handleClick}
      disabled={disabled}
      className="flex items-center space-x-2 px-4 py-2 text-sm"
      aria-label={t('session.clearSession')}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      <span>{t('session.clearSession')}</span>
    </GlassButton>
  )
}
