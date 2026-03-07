// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ',
  or: 'ଓଡ଼ିଆ',
} as const

export const MAX_MESSAGE_LENGTH = 1000
export const MAX_AUDIO_DURATION = 60 // seconds
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB

export const SESSION_STORAGE_KEY = 'bharat-sahayak-session'
export const LANGUAGE_STORAGE_KEY = 'bharat-sahayak-language'
export const THEME_STORAGE_KEY = 'bharat-sahayak-theme'
export const LOW_BANDWIDTH_STORAGE_KEY = 'bharat-sahayak-low-bandwidth'

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 400,
} as const

export const AUDIO_CONFIG = {
  sampleRate: 16000,
  format: 'webm',
  silenceThreshold: 2000, // 2 seconds
} as const
