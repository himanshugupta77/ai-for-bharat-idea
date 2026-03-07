import { useState, useEffect } from 'react'
import { LOW_BANDWIDTH_STORAGE_KEY } from '@/utils/constants'
import { detectSlowConnection } from '@/utils/helpers'

/**
 * Hook to detect and manage low bandwidth mode
 * 
 * Features:
 * - Auto-detects slow connections using Network Information API
 * - Manual toggle for user control
 * - Persists preference in localStorage
 * - Adds 'low-bandwidth' class to body for CSS targeting
 * - Suggests enabling low bandwidth mode when slow connection detected
 */
const useLowBandwidth = () => {
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(() => {
    const stored = localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)
    if (stored) return stored === 'true'

    // Auto-detect slow connection on first load
    return detectSlowConnection()
  })

  const [showSuggestion, setShowSuggestion] = useState<boolean>(false)

  useEffect(() => {
    // Persist preference
    localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, String(isLowBandwidth))

    // Add/remove class from body for CSS targeting
    if (isLowBandwidth) {
      document.body.classList.add('low-bandwidth')
    } else {
      document.body.classList.remove('low-bandwidth')
    }
  }, [isLowBandwidth])

  useEffect(() => {
    // Check if we should suggest enabling low bandwidth mode
    const stored = localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)
    const hasUserPreference = stored !== null
    
    if (!hasUserPreference && detectSlowConnection() && !isLowBandwidth) {
      // Show suggestion if slow connection detected and user hasn't set preference
      setShowSuggestion(true)
    }

    // Listen for connection changes
    const connection = (navigator as { connection?: { addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).connection
    if (connection) {
      const handleConnectionChange = () => {
        const isSlowNow = detectSlowConnection()
        if (isSlowNow && !isLowBandwidth && !hasUserPreference) {
          setShowSuggestion(true)
        }
      }

      connection.addEventListener('change', handleConnectionChange)
      return () => connection.removeEventListener('change', handleConnectionChange)
    }
  }, [isLowBandwidth])

  const toggleLowBandwidth = () => setIsLowBandwidth(prev => !prev)
  
  const enableLowBandwidth = () => setIsLowBandwidth(true)
  
  const disableLowBandwidth = () => setIsLowBandwidth(false)
  
  const dismissSuggestion = () => setShowSuggestion(false)

  return { 
    isLowBandwidth, 
    toggleLowBandwidth,
    enableLowBandwidth,
    disableLowBandwidth,
    showSuggestion,
    dismissSuggestion
  }
}

export default useLowBandwidth
