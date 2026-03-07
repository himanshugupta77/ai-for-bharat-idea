import { motion, AnimatePresence } from 'framer-motion'
import { useLowBandwidth } from '../hooks'

/**
 * Low Bandwidth Mode Toggle Component
 * 
 * Provides a UI control for users to manually enable/disable low bandwidth mode.
 * Shows a suggestion banner when slow connection is detected.
 */
export function LowBandwidthToggle() {
  const { 
    isLowBandwidth, 
    toggleLowBandwidth, 
    showSuggestion, 
    enableLowBandwidth,
    dismissSuggestion 
  } = useLowBandwidth()

  return (
    <>
      {/* Suggestion Banner */}
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
            role="alert"
            aria-live="polite"
          >
            <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl" aria-hidden="true">
                  📶
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1">
                    Slow Connection Detected
                  </h3>
                  <p className="text-xs text-orange-800 dark:text-orange-300 mb-3">
                    Enable low bandwidth mode for a faster experience with reduced animations and compressed media.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        enableLowBandwidth()
                        dismissSuggestion()
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors duration-200"
                      aria-label="Enable low bandwidth mode"
                    >
                      Enable
                    </button>
                    <button
                      onClick={dismissSuggestion}
                      className="px-3 py-1 text-xs font-semibold bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 text-orange-900 dark:text-orange-200 rounded transition-colors duration-200"
                      aria-label="Dismiss suggestion"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <button
                  onClick={dismissSuggestion}
                  className="flex-shrink-0 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors duration-200"
                  aria-label="Close suggestion"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={toggleLowBandwidth}
        className={`fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 ${
          isLowBandwidth
            ? 'bg-green-500/90 border-green-600 hover:bg-green-600'
            : 'bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800'
        }`}
        aria-label={`Low bandwidth mode is ${isLowBandwidth ? 'enabled' : 'disabled'}. Click to ${isLowBandwidth ? 'disable' : 'enable'}.`}
        aria-pressed={isLowBandwidth}
        title={`Low bandwidth mode: ${isLowBandwidth ? 'ON' : 'OFF'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {isLowBandwidth ? '🐌' : '🚀'}
          </span>
          <span className={`text-xs font-semibold ${
            isLowBandwidth ? 'text-white' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {isLowBandwidth ? 'Low' : 'Normal'}
          </span>
        </div>
      </button>
    </>
  )
}
