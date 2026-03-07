import { useState, useEffect, useCallback } from 'react'
import { SESSION_STORAGE_KEY } from '@/utils/constants'
import { generateId } from '@/utils/helpers'
import { api } from '@/utils/api'

interface SessionInfo {
  sessionId: string
  exists: boolean
  expired: boolean
  timeRemainingSeconds: number
  showExpirationWarning: boolean
  messageCount: number
}

/**
 * Hook to manage session ID and expiration in localStorage
 */
const useSession = () => {
  const [sessionId, setSessionId] = useState<string>(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    return stored || generateId()
  })
  
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isExpiring, setIsExpiring] = useState(false)

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }, [sessionId])

  const clearSession = useCallback(() => {
    const newSessionId = generateId()
    setSessionId(newSessionId)
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId)
    setSessionInfo(null)
    setIsExpiring(false)
  }, [])
  
  const checkSessionExpiration = useCallback(async () => {
    try {
      const info = await api.getSessionInfo(sessionId)
      setSessionInfo(info)
      setIsExpiring(info.showExpirationWarning)
      
      // If session is expired, clear it
      if (info.expired) {
        clearSession()
      }
    } catch (error) {
      console.error('Failed to check session expiration:', error)
    }
  }, [sessionId, clearSession])
  
  const deleteSession = useCallback(async () => {
    try {
      await api.deleteSession(sessionId)
      clearSession()
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw error
    }
  }, [sessionId, clearSession])

  return { 
    sessionId, 
    clearSession, 
    deleteSession,
    checkSessionExpiration,
    sessionInfo,
    isExpiring
  }
}

export default useSession
