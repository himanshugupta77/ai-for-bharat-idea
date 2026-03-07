import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassCard } from './GlassCard'
import { GlassButton } from './GlassButton'

const PRIVACY_NOTICE_KEY = 'bharat-sahayak-privacy-notice-seen'

export function PrivacyNotice() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the privacy notice
    const hasSeenNotice = localStorage.getItem(PRIVACY_NOTICE_KEY)
    if (!hasSeenNotice) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(PRIVACY_NOTICE_KEY, 'true')
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-notice-title"
    >
      <GlassCard className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2
                id="privacy-notice-title"
                className="text-xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {t('session.privacyNotice')}
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {t('session.privacyNoticeMessage')}
              </p>
            </div>
          </div>

          <div className="bg-white/30 dark:bg-gray-800/30 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {t('session.dataRetention')}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {t('session.dataRetentionPolicy')}
            </p>

            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Automatic deletion after 24 hours</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Only essential information collected</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>No permanent storage of personal information</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Clear your session anytime</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Encrypted data at rest and in transit</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <GlassButton
              onClick={handleAccept}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold"
            >
              I Understand
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
