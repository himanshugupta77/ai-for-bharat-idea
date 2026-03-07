import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useSession from '../useSession'
import { SESSION_STORAGE_KEY } from '@/utils/constants'
import * as helpers from '@/utils/helpers'
import * as apiModule from '@/utils/api'

// Mock dependencies
vi.mock('@/utils/helpers', () => ({
  generateId: vi.fn(() => 'mock-session-id')
}))

vi.mock('@/utils/api', () => ({
  api: {
    getSessionInfo: vi.fn(),
    deleteSession: vi.fn()
  }
}))

describe('useSession', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Session Initialization', () => {
    it('should generate a new session ID if none exists in localStorage', () => {
      const { result } = renderHook(() => useSession())
      
      expect(result.current.sessionId).toBe('mock-session-id')
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe('mock-session-id')
    })

    it('should use existing session ID from localStorage', () => {
      const existingSessionId = 'existing-session-123'
      localStorage.setItem(SESSION_STORAGE_KEY, existingSessionId)
      
      const { result } = renderHook(() => useSession())
      
      expect(result.current.sessionId).toBe(existingSessionId)
    })

    it('should persist session ID to localStorage on mount', () => {
      renderHook(() => useSession())
      
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe('mock-session-id')
    })
  })

  describe('clearSession', () => {
    it('should generate a new session ID when cleared', () => {
      const { result } = renderHook(() => useSession())
      const initialSessionId = result.current.sessionId
      
      // Mock a different ID for the new session
      vi.mocked(helpers.generateId).mockReturnValueOnce('new-session-id')
      
      act(() => {
        result.current.clearSession()
      })
      
      expect(result.current.sessionId).toBe('new-session-id')
      expect(result.current.sessionId).not.toBe(initialSessionId)
    })

    it('should update localStorage with new session ID', () => {
      const { result } = renderHook(() => useSession())
      
      vi.mocked(helpers.generateId).mockReturnValueOnce('new-session-id')
      
      act(() => {
        result.current.clearSession()
      })
      
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe('new-session-id')
    })

    it('should reset session info and expiring state', () => {
      const { result } = renderHook(() => useSession())
      
      // Set some session info first
      act(() => {
        result.current.sessionInfo = {
          sessionId: 'test',
          exists: true,
          expired: false,
          timeRemainingSeconds: 3600,
          showExpirationWarning: false,
          messageCount: 5
        } as any
      })
      
      vi.mocked(helpers.generateId).mockReturnValueOnce('new-session-id')
      
      act(() => {
        result.current.clearSession()
      })
      
      expect(result.current.sessionInfo).toBeNull()
      expect(result.current.isExpiring).toBe(false)
    })
  })

  describe('checkSessionExpiration', () => {
    it('should fetch session info from API', async () => {
      const mockSessionInfo = {
        sessionId: 'mock-session-id',
        exists: true,
        expired: false,
        timeRemainingSeconds: 3600,
        showExpirationWarning: false,
        messageCount: 3
      }
      
      vi.mocked(apiModule.api.getSessionInfo).mockResolvedValueOnce(mockSessionInfo)
      
      const { result } = renderHook(() => useSession())
      
      await act(async () => {
        await result.current.checkSessionExpiration()
      })
      
      expect(apiModule.api.getSessionInfo).toHaveBeenCalledWith('mock-session-id')
      expect(result.current.sessionInfo).toEqual(mockSessionInfo)
    })

    it('should set isExpiring when showExpirationWarning is true', async () => {
      const mockSessionInfo = {
        sessionId: 'mock-session-id',
        exists: true,
        expired: false,
        timeRemainingSeconds: 300,
        showExpirationWarning: true,
        messageCount: 10
      }
      
      vi.mocked(apiModule.api.getSessionInfo).mockResolvedValueOnce(mockSessionInfo)
      
      const { result } = renderHook(() => useSession())
      
      await act(async () => {
        await result.current.checkSessionExpiration()
      })
      
      expect(result.current.isExpiring).toBe(true)
    })

    it('should clear session if expired', async () => {
      const mockSessionInfo = {
        sessionId: 'mock-session-id',
        exists: true,
        expired: true,
        timeRemainingSeconds: 0,
        showExpirationWarning: false,
        messageCount: 5
      }
      
      vi.mocked(apiModule.api.getSessionInfo).mockResolvedValueOnce(mockSessionInfo)
      vi.mocked(helpers.generateId).mockReturnValueOnce('new-session-after-expiry')
      
      const { result } = renderHook(() => useSession())
      
      await act(async () => {
        await result.current.checkSessionExpiration()
      })
      
      expect(result.current.sessionId).toBe('new-session-after-expiry')
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(apiModule.api.getSessionInfo).mockRejectedValueOnce(new Error('Network error'))
      
      const { result } = renderHook(() => useSession())
      
      await act(async () => {
        await result.current.checkSessionExpiration()
      })
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to check session expiration:',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('deleteSession', () => {
    it('should call API to delete session', async () => {
      vi.mocked(apiModule.api.deleteSession).mockResolvedValueOnce(undefined)
      vi.mocked(helpers.generateId).mockReturnValueOnce('new-session-after-delete')
      
      const { result } = renderHook(() => useSession())
      
      await act(async () => {
        await result.current.deleteSession()
      })
      
      expect(apiModule.api.deleteSession).toHaveBeenCalledWith('mock-session-id')
      expect(result.current.sessionId).toBe('new-session-after-delete')
    })

    it('should throw error if API call fails', async () => {
      const error = new Error('Delete failed')
      vi.mocked(apiModule.api.deleteSession).mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useSession())
      
      await expect(async () => {
        await act(async () => {
          await result.current.deleteSession()
        })
      }).rejects.toThrow('Delete failed')
    })

    it('should log error to console on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Delete failed')
      
      vi.mocked(apiModule.api.deleteSession).mockRejectedValueOnce(error)
      
      const { result } = renderHook(() => useSession())
      
      try {
        await act(async () => {
          await result.current.deleteSession()
        })
      } catch (e) {
        // Expected to throw
      }
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete session:', error)
      
      consoleErrorSpy.mockRestore()
    })
  })
})
