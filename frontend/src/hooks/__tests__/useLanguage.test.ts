import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useLanguage from '../useLanguage'
import { LANGUAGE_STORAGE_KEY } from '@/utils/constants'
import type { SupportedLanguage } from '@/types'

describe('useLanguage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document.documentElement.lang
    document.documentElement.lang = ''
  })

  describe('Language Initialization', () => {
    it('should default to English if no language is stored', () => {
      const { result } = renderHook(() => useLanguage())
      
      expect(result.current.language).toBe('en')
    })

    it('should use stored language from localStorage', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'hi')
      
      const { result } = renderHook(() => useLanguage())
      
      expect(result.current.language).toBe('hi')
    })

    it('should set document.documentElement.lang on mount', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ta')
      
      renderHook(() => useLanguage())
      
      expect(document.documentElement.lang).toBe('ta')
    })

    it('should persist language to localStorage on mount', () => {
      renderHook(() => useLanguage())
      
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    })
  })

  describe('Language Switching', () => {
    it('should update language when setLanguage is called', () => {
      const { result } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('hi')
      })
      
      expect(result.current.language).toBe('hi')
    })

    it('should persist new language to localStorage', () => {
      const { result } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('mr')
      })
      
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('mr')
    })

    it('should update document.documentElement.lang when language changes', () => {
      const { result } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('te')
      })
      
      expect(document.documentElement.lang).toBe('te')
    })

    it('should handle switching between multiple languages', () => {
      const { result } = renderHook(() => useLanguage())
      
      const languages: SupportedLanguage[] = ['hi', 'ta', 'bn', 'gu', 'kn']
      
      languages.forEach(lang => {
        act(() => {
          result.current.setLanguage(lang)
        })
        
        expect(result.current.language).toBe(lang)
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(lang)
        expect(document.documentElement.lang).toBe(lang)
      })
    })

    it('should support all 11 supported languages', () => {
      const { result } = renderHook(() => useLanguage())
      
      const allLanguages: SupportedLanguage[] = [
        'en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or'
      ]
      
      allLanguages.forEach(lang => {
        act(() => {
          result.current.setLanguage(lang)
        })
        
        expect(result.current.language).toBe(lang)
      })
    })
  })

  describe('Language Persistence', () => {
    it('should maintain language across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('pa')
      })
      
      rerender()
      
      expect(result.current.language).toBe('pa')
    })

    it('should maintain language across hook unmount and remount', () => {
      const { result, unmount } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('or')
      })
      
      unmount()
      
      const { result: newResult } = renderHook(() => useLanguage())
      
      expect(newResult.current.language).toBe('or')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid language changes', () => {
      const { result } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('hi')
        result.current.setLanguage('ta')
        result.current.setLanguage('bn')
      })
      
      expect(result.current.language).toBe('bn')
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('bn')
    })

    it('should handle setting the same language multiple times', () => {
      const { result } = renderHook(() => useLanguage())
      
      act(() => {
        result.current.setLanguage('ml')
        result.current.setLanguage('ml')
        result.current.setLanguage('ml')
      })
      
      expect(result.current.language).toBe('ml')
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ml')
    })
  })
})
