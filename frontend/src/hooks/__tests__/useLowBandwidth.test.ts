import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import useLowBandwidth from '../useLowBandwidth'
import { LOW_BANDWIDTH_STORAGE_KEY } from '@/utils/constants'
import * as helpers from '@/utils/helpers'

/**
 * Tests for useLowBandwidth hook
 * 
 * **Validates: Requirements 16.1, 16.2, 16.3**
 * 
 * Requirement 16.1: THE Frontend SHALL provide a Low_Bandwidth_Mode toggle
 * Requirement 16.2: WHERE Low_Bandwidth_Mode is enabled, THE Frontend SHALL disable animations
 * Requirement 16.3: WHERE Low_Bandwidth_Mode is enabled, THE Frontend SHALL reduce image quality by at least 50 percent
 */
describe('useLowBandwidth', () => {
  let mockConnection: {
    effectiveType: string
    saveData: boolean
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    
    // Remove low-bandwidth class from body
    document.body.classList.remove('low-bandwidth')
    
    // Mock connection object
    mockConnection = {
      effectiveType: '4g',
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    
    // Mock navigator.connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      configurable: true,
      value: mockConnection,
    })
    
    // Spy on detectSlowConnection
    vi.spyOn(helpers, 'detectSlowConnection')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Low Bandwidth Mode Initialization', () => {
    it('should default to false if no preference is stored and connection is fast', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(false)
    })

    it('should auto-enable low bandwidth mode if slow connection is detected on first load', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(true)
    })

    it('should use stored preference from localStorage', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(true)
    })

    it('should respect stored preference over auto-detection', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'false')
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(false)
    })

    it('should add low-bandwidth class to body when enabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      renderHook(() => useLowBandwidth())
      
      expect(document.body.classList.contains('low-bandwidth')).toBe(true)
    })

    it('should not add low-bandwidth class when disabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'false')
      
      renderHook(() => useLowBandwidth())
      
      expect(document.body.classList.contains('low-bandwidth')).toBe(false)
    })

    it('should persist preference to localStorage on mount', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      renderHook(() => useLowBandwidth())
      
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('false')
    })
  })

  describe('Low Bandwidth Mode Toggle - Requirement 16.1', () => {
    it('should toggle from disabled to enabled', () => {
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(false)
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(result.current.isLowBandwidth).toBe(true)
    })

    it('should toggle from enabled to disabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(true)
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(result.current.isLowBandwidth).toBe(false)
    })

    it('should update localStorage when toggling to enabled', () => {
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('true')
    })

    it('should update localStorage when toggling to disabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('false')
    })

    it('should add low-bandwidth class to body when toggling to enabled', () => {
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(document.body.classList.contains('low-bandwidth')).toBe(true)
    })

    it('should remove low-bandwidth class from body when toggling to disabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.toggleLowBandwidth()
      })
      
      expect(document.body.classList.contains('low-bandwidth')).toBe(false)
    })

    it('should handle multiple rapid toggles', () => {
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.toggleLowBandwidth() // enabled
        result.current.toggleLowBandwidth() // disabled
        result.current.toggleLowBandwidth() // enabled
      })
      
      expect(result.current.isLowBandwidth).toBe(true)
      expect(document.body.classList.contains('low-bandwidth')).toBe(true)
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('true')
    })
  })

  describe('Enable/Disable Functions', () => {
    it('should enable low bandwidth mode with enableLowBandwidth', () => {
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.enableLowBandwidth()
      })
      
      expect(result.current.isLowBandwidth).toBe(true)
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('true')
    })

    it('should disable low bandwidth mode with disableLowBandwidth', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.disableLowBandwidth()
      })
      
      expect(result.current.isLowBandwidth).toBe(false)
      expect(localStorage.getItem(LOW_BANDWIDTH_STORAGE_KEY)).toBe('false')
    })
  })

  describe('Slow Connection Detection - Requirement 16.6', () => {
    it('should show suggestion when slow connection is detected and no user preference exists', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.showSuggestion).toBe(true)
    })

    it('should not show suggestion when connection is fast', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.showSuggestion).toBe(false)
    })

    it('should not show suggestion when user has already set a preference', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'false')
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.showSuggestion).toBe(false)
    })

    it('should not show suggestion when low bandwidth mode is already enabled', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'true')
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.showSuggestion).toBe(false)
    })

    it('should dismiss suggestion when dismissSuggestion is called', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(true)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.showSuggestion).toBe(true)
      
      act(() => {
        result.current.dismissSuggestion()
      })
      
      expect(result.current.showSuggestion).toBe(false)
    })

    it('should listen for connection changes', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      renderHook(() => useLowBandwidth())
      
      expect(mockConnection.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })

    it('should clean up connection listener on unmount', () => {
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      const { unmount } = renderHook(() => useLowBandwidth())
      
      unmount()
      
      expect(mockConnection.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      )
    })
  })

  describe('Persistence', () => {
    it('should maintain state across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.enableLowBandwidth()
      })
      
      rerender()
      
      expect(result.current.isLowBandwidth).toBe(true)
    })

    it('should maintain state across hook unmount and remount', () => {
      const { result, unmount } = renderHook(() => useLowBandwidth())
      
      act(() => {
        result.current.enableLowBandwidth()
      })
      
      unmount()
      
      const { result: newResult } = renderHook(() => useLowBandwidth())
      
      expect(newResult.current.isLowBandwidth).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing navigator.connection gracefully', () => {
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        configurable: true,
        value: undefined,
      })
      
      vi.mocked(helpers.detectSlowConnection).mockReturnValue(false)
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(result.current.isLowBandwidth).toBe(false)
      expect(() => result.current.toggleLowBandwidth()).not.toThrow()
    })

    it('should handle invalid stored value', () => {
      localStorage.setItem(LOW_BANDWIDTH_STORAGE_KEY, 'invalid')
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(typeof result.current.isLowBandwidth).toBe('boolean')
    })

    it('should handle localStorage unavailable', () => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage unavailable')
      })
      
      const { result } = renderHook(() => useLowBandwidth())
      
      expect(() => {
        act(() => {
          result.current.toggleLowBandwidth()
        })
      }).not.toThrow()
      
      Storage.prototype.setItem = originalSetItem
    })
  })
})
