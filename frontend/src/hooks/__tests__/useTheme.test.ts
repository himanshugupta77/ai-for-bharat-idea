import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useTheme from '../useTheme'
import { THEME_STORAGE_KEY } from '@/utils/constants'

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document.documentElement classes
    document.documentElement.className = ''
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Theme Initialization', () => {
    it('should default to light mode if no preference is stored', () => {
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(false)
    })

    it('should use stored theme from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(true)
    })

    it('should respect system preference when no stored preference exists', () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(true)
    })

    it('should add dark class to document root when dark mode is active', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      
      renderHook(() => useTheme())
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should not add dark class when light mode is active', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
      
      renderHook(() => useTheme())
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should persist theme to localStorage on mount', () => {
      renderHook(() => useTheme())
      
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })
  })

  describe('Theme Toggling', () => {
    it('should toggle from light to dark mode', () => {
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(false)
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.isDarkMode).toBe(true)
    })

    it('should toggle from dark to light mode', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(true)
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.isDarkMode).toBe(false)
    })

    it('should update localStorage when toggling to dark mode', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('should update localStorage when toggling to light mode', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    })

    it('should add dark class to document root when toggling to dark mode', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class from document root when toggling to light mode', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should handle multiple rapid toggles', () => {
      const { result } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme() // dark
        result.current.toggleTheme() // light
        result.current.toggleTheme() // dark
      })
      
      expect(result.current.isDarkMode).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })
  })

  describe('Theme Persistence', () => {
    it('should maintain theme across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      rerender()
      
      expect(result.current.isDarkMode).toBe(true)
    })

    it('should maintain theme across hook unmount and remount', () => {
      const { result, unmount } = renderHook(() => useTheme())
      
      act(() => {
        result.current.toggleTheme()
      })
      
      unmount()
      
      const { result: newResult } = renderHook(() => useTheme())
      
      expect(newResult.current.isDarkMode).toBe(true)
    })
  })

  describe('System Preference Integration', () => {
    it('should prefer stored preference over system preference', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
      
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(false)
    })

    it('should use light mode when system preference is light and no stored preference', () => {
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid stored theme value', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme')
      
      const { result } = renderHook(() => useTheme())
      
      // Should default to system preference or false
      expect(typeof result.current.isDarkMode).toBe('boolean')
    })

    it('should handle toggling when localStorage is unavailable', () => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('localStorage unavailable')
      })
      
      const { result } = renderHook(() => useTheme())
      
      // Should not throw error
      expect(() => {
        act(() => {
          result.current.toggleTheme()
        })
      }).not.toThrow()
      
      Storage.prototype.setItem = originalSetItem
    })
  })
})
