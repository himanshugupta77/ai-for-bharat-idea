import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY } from '@/utils/constants'
import type { SupportedLanguage } from '@/types'

/**
 * Hook to manage selected language state
 */
const useLanguage = () => {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return (stored as SupportedLanguage) || 'en'
  })

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
    // Change i18n language to trigger re-render with new translations
    i18n.changeLanguage(language)
  }, [language, i18n])

  return { language, setLanguage }
}

export default useLanguage
