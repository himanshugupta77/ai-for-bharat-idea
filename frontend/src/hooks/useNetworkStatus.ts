import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  effectiveType?: string
}

interface NetworkConnection {
  effectiveType: string
  saveData: boolean
  addEventListener: (type: string, listener: () => void) => void
  removeEventListener: (type: string, listener: () => void) => void
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection
  mozConnection?: NetworkConnection
  webkitConnection?: NetworkConnection
}

/**
 * Hook to monitor network connection status
 * Implements Requirements 20.3, 20.4
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [effectiveType, setEffectiveType] = useState<string | undefined>()

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection quality using Network Information API
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection

    if (connection) {
      const updateConnectionInfo = () => {
        const type = connection.effectiveType
        setEffectiveType(type)
        
        // Consider 'slow-2g' and '2g' as slow connections
        setIsSlowConnection(
          type === 'slow-2g' || 
          type === '2g' || 
          connection.saveData === true
        )
      }

      updateConnectionInfo()
      connection.addEventListener('change', updateConnectionInfo)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isSlowConnection, effectiveType }
}
