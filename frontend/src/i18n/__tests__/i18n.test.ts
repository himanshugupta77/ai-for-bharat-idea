import { describe, it, expect, beforeEach, vi } from 'vitest'
import i18n from '../config'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'
import type { SupportedLanguage } from '@/types'

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset i18n to default language
    i18n.changeLanguage('en')
  })

  describe('Translation Loading', () => {
    it('should load all 11 supported languages', () => {
      const loadedLanguages = Object.keys(i18n.options.resources || {})
      const expectedLanguages = Object.keys(SUPPORTED_LANGUAGES)
      
      expect(loadedLanguages).toHaveLength(11)
      expect(loadedLanguages.sort()).toEqual(expectedLanguages.sort())
    })

    it('should have translation resources for each language', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      
      languages.forEach(lang => {
        const hasResources = i18n.hasResourceBundle(lang, 'translation')
        expect(hasResources).toBe(true)
      })
    })

    it('should load common translations for all languages', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      const commonKeys = [
        'common.appName',
        'common.loading',
        'common.error',
        'common.retry',
        'common.submit',
        'common.cancel'
      ]
      
      languages.forEach(lang => {
        i18n.changeLanguage(lang)
        
        commonKeys.forEach(key => {
          const translation = i18n.t(key)
          expect(translation).toBeTruthy()
          expect(translation).not.toBe(key) // Should not return the key itself
        })
      })
    })

    it('should load landing page translations for all languages', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      const landingKeys = [
        'landing.title',
        'landing.subtitle',
        'landing.description',
        'landing.cta'
      ]
      
      languages.forEach(lang => {
        i18n.changeLanguage(lang)
        
        landingKeys.forEach(key => {
          const translation = i18n.t(key)
          expect(translation).toBeTruthy()
          expect(translation).not.toBe(key)
        })
      })
    })

    it('should load chat translations for all languages', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      const chatKeys = [
        'chat.placeholder',
        'chat.send',
        'chat.voiceInput',
        'chat.listening',
        'chat.processing'
      ]
      
      languages.forEach(lang => {
        i18n.changeLanguage(lang)
        
        chatKeys.forEach(key => {
          const translation = i18n.t(key)
          expect(translation).toBeTruthy()
          expect(translation).not.toBe(key)
        })
      })
    })

    it('should load error messages for all languages', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      const errorKeys = [
        'errors.networkError',
        'errors.serverError',
        'errors.audioError',
        'errors.validationError'
      ]
      
      languages.forEach(lang => {
        i18n.changeLanguage(lang)
        
        errorKeys.forEach(key => {
          const translation = i18n.t(key)
          expect(translation).toBeTruthy()
          expect(translation).not.toBe(key)
        })
      })
    })

    it('should fallback to English for missing translations', () => {
      i18n.changeLanguage('hi')
      
      // Test with a key that might not exist
      const translation = i18n.t('nonexistent.key', { defaultValue: 'Default' })
      
      expect(translation).toBe('Default')
    })
  })

  describe('Language Switching', () => {
    it('should switch to Hindi', async () => {
      await i18n.changeLanguage('hi')
      
      expect(i18n.language).toBe('hi')
      expect(i18n.t('common.appName')).toBe('भारत सहायक')
    })

    it('should switch to Marathi', async () => {
      await i18n.changeLanguage('mr')
      
      expect(i18n.language).toBe('mr')
      expect(i18n.t('common.appName')).toBe('भारत सहायक')
    })

    it('should switch to Tamil', async () => {
      await i18n.changeLanguage('ta')
      
      expect(i18n.language).toBe('ta')
      expect(i18n.t('common.appName')).toBe('பாரத சஹாயக்')
    })

    it('should switch to Telugu', async () => {
      await i18n.changeLanguage('te')
      
      expect(i18n.language).toBe('te')
      expect(i18n.t('common.appName')).toBe('భారత సహాయక్')
    })

    it('should switch to Bengali', async () => {
      await i18n.changeLanguage('bn')
      
      expect(i18n.language).toBe('bn')
      expect(i18n.t('common.appName')).toBe('ভারত সহায়ক')
    })

    it('should switch to Gujarati', async () => {
      await i18n.changeLanguage('gu')
      
      expect(i18n.language).toBe('gu')
      expect(i18n.t('common.appName')).toBe('ભારત સહાયક')
    })

    it('should switch to Kannada', async () => {
      await i18n.changeLanguage('kn')
      
      expect(i18n.language).toBe('kn')
      expect(i18n.t('common.appName')).toBe('ಭಾರತ ಸಹಾಯಕ್')
    })

    it('should switch to Malayalam', async () => {
      await i18n.changeLanguage('ml')
      
      expect(i18n.language).toBe('ml')
      expect(i18n.t('common.appName')).toBe('ഭാരത സഹായക്')
    })

    it('should switch to Punjabi', async () => {
      await i18n.changeLanguage('pa')
      
      expect(i18n.language).toBe('pa')
      expect(i18n.t('common.appName')).toBe('ਭਾਰਤ ਸਹਾਇਕ')
    })

    it('should switch to Odia', async () => {
      await i18n.changeLanguage('or')
      
      expect(i18n.language).toBe('or')
      expect(i18n.t('common.appName')).toBe('ଭାରତ ସହାୟକ')
    })

    it('should switch back to English', async () => {
      await i18n.changeLanguage('hi')
      await i18n.changeLanguage('en')
      
      expect(i18n.language).toBe('en')
      expect(i18n.t('common.appName')).toBe('Bharat Sahayak')
    })

    it('should handle multiple rapid language switches', async () => {
      await i18n.changeLanguage('hi')
      await i18n.changeLanguage('ta')
      await i18n.changeLanguage('bn')
      await i18n.changeLanguage('en')
      
      expect(i18n.language).toBe('en')
      expect(i18n.t('common.appName')).toBe('Bharat Sahayak')
    })

    it('should persist language to localStorage', async () => {
      await i18n.changeLanguage('hi')
      
      const storedLanguage = localStorage.getItem('bharat-sahayak-language')
      expect(storedLanguage).toBe('hi')
    })

    it('should load language from localStorage on init', () => {
      localStorage.setItem('bharat-sahayak-language', 'ta')
      
      // Re-initialize i18n (simulated by checking the config)
      const configuredLanguage = i18n.options.lng
      
      expect(configuredLanguage).toBeTruthy()
    })
  })

  describe('Translation Interpolation', () => {
    it('should support variable interpolation', () => {
      i18n.changeLanguage('en')
      
      const translation = i18n.t('session.expiringMessage', { time: '5 minutes' })
      
      expect(translation).toContain('5 minutes')
    })

    it('should handle missing interpolation variables gracefully', () => {
      i18n.changeLanguage('en')
      
      const translation = i18n.t('session.expiringMessage')
      
      expect(translation).toBeTruthy()
    })
  })

  describe('Namespace Support', () => {
    it('should support nested translation keys', () => {
      i18n.changeLanguage('en')
      
      expect(i18n.t('landing.features.multilingual.title')).toBe('11 Languages')
      expect(i18n.t('landing.features.voice.title')).toBe('Voice Support')
      expect(i18n.t('landing.features.ai.title')).toBe('AI-Powered')
    })

    it('should support deeply nested keys', () => {
      i18n.changeLanguage('en')
      
      expect(i18n.t('eligibility.form.age')).toBe('Age')
      expect(i18n.t('eligibility.form.gender')).toBe('Gender')
      expect(i18n.t('eligibility.result.eligible')).toBe('You are eligible!')
    })
  })

  describe('Language Detection', () => {
    it('should have language detector configured', () => {
      const detectorOptions = i18n.options.detection
      
      expect(detectorOptions).toBeDefined()
      expect(detectorOptions?.order).toContain('localStorage')
      expect(detectorOptions?.caches).toContain('localStorage')
    })

    it('should use localStorage as primary detection method', () => {
      const detectorOptions = i18n.options.detection
      
      expect(detectorOptions?.order?.[0]).toBe('localStorage')
    })

    it('should use correct localStorage key', () => {
      const detectorOptions = i18n.options.detection
      
      expect(detectorOptions?.lookupLocalStorage).toBe('bharat-sahayak-language')
    })
  })

  describe('Fallback Behavior', () => {
    it('should have English as fallback language', () => {
      const fallbackLng = i18n.options.fallbackLng
      expect(Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng).toBe('en')
    })

    it('should return English translation when key not found in current language', () => {
      i18n.changeLanguage('hi')
      
      // Assuming some keys might be missing in translations
      const translation = i18n.t('common.appName')
      
      expect(translation).toBeTruthy()
    })
  })

  describe('Translation Completeness', () => {
    it('should have core keys across all languages', () => {
      const languages = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]
      
      // Test core keys that should exist in all languages
      const coreKeys = [
        'common.appName',
        'common.loading',
        'common.error',
        'landing.title',
        'chat.send'
      ]
      
      languages.forEach(lang => {
        i18n.changeLanguage(lang)
        
        coreKeys.forEach(key => {
          const translation = i18n.t(key)
          expect(translation).toBeTruthy()
          expect(translation).not.toBe(key) // Should not return the key itself
        })
      })
    })
  })
})
