import { useState, useEffect } from 'react'
import { THEME_STORAGE_KEY } from '@/utils/constants'

/**
 * Hook to manage dark mode toggle
 */
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) return stored === 'dark'

    // Default to light mode for better visibility of saffron-white-green gradient
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(prev => !prev)

  return { isDarkMode, toggleTheme }
}

export default useTheme
