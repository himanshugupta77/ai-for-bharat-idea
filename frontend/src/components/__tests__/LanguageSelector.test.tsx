import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LanguageSelector } from '../LanguageSelector'
import { SUPPORTED_LANGUAGES } from '@/utils/constants'
import type { SupportedLanguage } from '@/types'

// Mock the hooks and i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'accessibility.openLanguageSelector': 'Select language',
        'settings.language': 'Language'
      }
      return translations[key] || key
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en'
    }
  })
}))

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({
    language: 'en' as SupportedLanguage,
    setLanguage: vi.fn()
  })
}))

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render language selector button', () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button', { name: /select language/i })
      expect(button).toBeInTheDocument()
    })

    it('should display current language name', () => {
      render(<LanguageSelector />)
      
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('should display globe icon', () => {
      render(<LanguageSelector />)
      
      expect(screen.getByText('🌐')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Select language')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('should not show dropdown initially', () => {
      render(<LanguageSelector />)
      
      const dropdown = screen.queryByRole('listbox')
      expect(dropdown).not.toBeInTheDocument()
    })
  })

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('should close dropdown when button is clicked again', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      
      // Open dropdown
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      // Close dropdown
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should update aria-expanded when dropdown opens', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('should display all 11 supported languages in dropdown', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options).toHaveLength(11)
      })
    })

    it('should display language names correctly', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        // Use getAllByText for languages that appear multiple times
        Object.values(SUPPORTED_LANGUAGES).forEach(languageName => {
          const elements = screen.getAllByText(languageName)
          expect(elements.length).toBeGreaterThanOrEqual(1)
        })
      })
    })

    it('should highlight current language', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const englishOption = screen.getByRole('option', { name: /English/i })
        expect(englishOption).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should show checkmark for current language', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const englishOption = screen.getByRole('option', { name: /English/i })
        const checkmark = englishOption.querySelector('svg')
        expect(checkmark).toBeInTheDocument()
      })
    })
  })

  describe('Language Selection', () => {
    it('should call setLanguage when a language is selected', async () => {
      const mockSetLanguage = vi.fn()
      
      vi.mocked(await import('@/hooks/useLanguage')).default = () => ({
        language: 'en' as SupportedLanguage,
        setLanguage: mockSetLanguage
      })
      
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const hindiOption = screen.getByText('हिन्दी')
        fireEvent.click(hindiOption)
      })
      
      expect(mockSetLanguage).toHaveBeenCalledWith('hi')
    })

    it('should close dropdown after language selection', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const hindiOption = screen.getByText('हिन्दी')
        fireEvent.click(hindiOption)
      })
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close dropdown on Escape key', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should not close dropdown on other keys', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })
  })

  describe('Click Outside', () => {
    it('should close dropdown when clicking outside', async () => {
      const { container } = render(
        <div>
          <LanguageSelector />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const outsideElement = screen.getByTestId('outside')
      fireEvent.mouseDown(outsideElement)
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should not close dropdown when clicking inside', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      
      const dropdown = screen.getByRole('listbox')
      fireEvent.mouseDown(dropdown)
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper role attributes', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox')
        expect(listbox).toHaveAttribute('aria-label', 'Language')
      })
    })

    it('should have proper option roles', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const options = screen.getAllByRole('option')
        options.forEach(option => {
          expect(option).toHaveAttribute('role', 'option')
          expect(option).toHaveAttribute('aria-selected')
        })
      })
    })

    it('should hide decorative icons from screen readers', () => {
      render(<LanguageSelector />)
      
      const globe = screen.getByText('🌐')
      expect(globe).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Visual Feedback', () => {
    it('should rotate arrow icon when dropdown is open', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      const arrow = button.querySelector('svg')
      
      expect(arrow).not.toHaveClass('rotate-180')
      
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(arrow).toHaveClass('rotate-180')
      })
    })

    it('should apply hover styles to language options', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const hindiOption = screen.getByText('हिन्दी').closest('button')
        expect(hindiOption).toHaveClass('hover:bg-gray-100')
      })
    })

    it('should highlight selected language with gradient background', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const englishOption = screen.getByRole('option', { name: /English/i })
        expect(englishOption).toHaveClass('bg-gradient-to-r')
      })
    })
  })

  describe('Dark Mode Support', () => {
    it('should apply dark mode classes', () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('dark:bg-gray-800/30')
      expect(button).toHaveClass('dark:border-gray-700/30')
    })
  })

  describe('Animation', () => {
    it('should animate dropdown entrance', async () => {
      render(<LanguageSelector />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        const dropdown = screen.getByRole('listbox')
        expect(dropdown).toBeInTheDocument()
        // Framer Motion applies animation classes
      })
    })
  })
})
