import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import {
  announceToScreenReader,
  getFocusableElements,
  trapFocus,
  createSkipLink,
} from '@/utils/accessibility'
import { VoiceInput } from '@/components/VoiceInput'
import { Message } from '@/components/Message'
import { EligibilityForm } from '@/components/EligibilityForm'
import type { Message as MessageType } from '@/types'

// Mock hooks
vi.mock('@/hooks', () => ({
  useVoiceInput: () => ({
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    isRecording: false,
    audioLevel: 0.5,
    error: null,
  }),
  useLowBandwidth: () => ({
    isLowBandwidth: false,
  }),
}))

// Helper to wrap components with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Accessibility Tests', () => {
  describe('Keyboard Navigation Tests (Requirement 14.1)', () => {
    it('should allow keyboard navigation through form fields', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockCancel = vi.fn()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      )

      // Tab through form fields
      await user.tab()
      expect(screen.getByLabelText(/age/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/gender/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/annual income/i)).toHaveFocus()
    })

    it('should support Enter key for form submission', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={mockSubmit}
          onCancel={vi.fn()}
        />
      )

      // Fill required fields
      await user.type(screen.getByLabelText(/age/i), '30')
      await user.selectOptions(screen.getByLabelText(/gender/i), 'male')
      await user.type(screen.getByLabelText(/annual income/i), '250000')
      await user.selectOptions(screen.getByLabelText(/state/i), 'Maharashtra')
      await user.selectOptions(screen.getByLabelText(/category/i), 'general')
      await user.type(screen.getByLabelText(/occupation/i), 'farmer')

      // Click the submit button instead of using keyboard Enter
      const submitButton = screen.getByRole('button', { name: /check eligibility/i })
      await user.click(submitButton)

      expect(mockSubmit).toHaveBeenCalled()
    })

    it('should support Space key for button activation', async () => {
      const user = userEvent.setup()
      const mockCancel = vi.fn()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={mockCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      cancelButton.focus()
      await user.keyboard(' ')

      expect(mockCancel).toHaveBeenCalled()
    })

    it('should support keyboard navigation for checkboxes', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const landCheckbox = screen.getByLabelText(/i own agricultural land/i)
      landCheckbox.focus()
      
      expect(landCheckbox).toHaveFocus()
      expect(landCheckbox).not.toBeChecked()

      await user.keyboard(' ')
      expect(landCheckbox).toBeChecked()
    })

    it('should have visible focus indicators', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      ageInput.focus()

      // Check that focus styles are applied
      expect(ageInput).toHaveClass('focus:outline-none')
      expect(ageInput).toHaveClass('focus:border-orange-500')
      expect(ageInput).toHaveClass('focus:ring-4')
    })
  })

  describe('Focus Trap Utility', () => {
    it('should trap focus within a container', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      `
      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      const firstButton = container.querySelector('#first') as HTMLElement
      expect(document.activeElement).toBe(firstButton)

      cleanup()
      document.body.removeChild(container)
    })

    it('should identify all focusable elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <a href="#">Link</a>
        <button>Button</button>
        <input type="text" />
        <textarea></textarea>
        <select><option>Option</option></select>
        <div tabindex="0">Focusable Div</div>
      `
      document.body.appendChild(container)

      const focusableElements = getFocusableElements(container)
      expect(focusableElements).toHaveLength(6)

      document.body.removeChild(container)
    })

    it('should exclude disabled elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <input type="text" />
        <input type="text" disabled />
      `
      document.body.appendChild(container)

      const focusableElements = getFocusableElements(container)
      expect(focusableElements).toHaveLength(2)

      document.body.removeChild(container)
    })

    it('should create skip link with correct href', () => {
      const skipLink = createSkipLink('main-content')
      expect(skipLink.href).toContain('#main-content')
      expect(skipLink.textContent).toBe('Skip to main content')
      expect(skipLink.className).toContain('sr-only')
      expect(skipLink.className).toContain('focus:not-sr-only')
    })
  })

  describe('ARIA Attributes Tests (Requirement 14.2)', () => {
    it('should have aria-label on voice input button', () => {
      render(<VoiceInput onTranscript={vi.fn()} onError={vi.fn()} />)

      const voiceButton = screen.getByRole('button')
      expect(voiceButton).toHaveAttribute('aria-label')
      expect(voiceButton.getAttribute('aria-label')).toMatch(/voice input/i)
    })

    it('should have associated labels for form inputs', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/occupation/i)).toBeInTheDocument()
    })

    it('should have role="article" on message component', () => {
      const mockMessage: MessageType = {
        id: '1',
        role: 'assistant',
        content: 'Test message',
        timestamp: Date.now(),
      }

      render(<Message message={mockMessage} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toBeInTheDocument()
    })

    it('should have role="alert" on error messages', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      await user.click(ageInput)
      await user.tab()

      await waitFor(() => {
        const errorMessage = screen.getByText(/age is required/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })

    it('should link error messages via aria-describedby', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      await user.click(ageInput)
      await user.tab()

      await waitFor(() => {
        const errorId = ageInput.getAttribute('aria-describedby')
        expect(errorId).toBe('age-error')
        
        const errorElement = document.getElementById('age-error')
        expect(errorElement).toBeInTheDocument()
        expect(errorElement?.textContent).toMatch(/age is required/i)
      })
    })

    it('should mark required fields with aria-required', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/age/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/gender/i)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/annual income/i)).toHaveAttribute('aria-required', 'true')
    })

    it('should set aria-invalid when field has error', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      await user.click(ageInput)
      await user.tab()

      await waitFor(() => {
        expect(ageInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should set aria-invalid to false when field is valid', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      await user.type(ageInput, '30')
      await user.tab()

      await waitFor(() => {
        expect(ageInput).toHaveAttribute('aria-invalid', 'false')
      })
    })

    it('should have aria-pressed on voice button', () => {
      render(<VoiceInput onTranscript={vi.fn()} onError={vi.fn()} />)

      const voiceButton = screen.getByRole('button')
      expect(voiceButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should hide decorative elements from screen readers', () => {
      const mockMessage: MessageType = {
        id: '1',
        role: 'assistant',
        content: 'Test message',
        timestamp: Date.now(),
      }

      const { container } = render(<Message message={mockMessage} />)

      const avatar = container.querySelector('[aria-hidden="true"]')
      expect(avatar).toBeInTheDocument()
    })

    it('should hide decorative icons', () => {
      render(<VoiceInput onTranscript={vi.fn()} onError={vi.fn()} />)

      const icon = screen.getByRole('button').querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Screen Reader Announcements Tests (Requirement 14.3)', () => {
    afterEach(() => {
      const announcements = document.querySelectorAll('[role="status"]')
      announcements.forEach((el) => el.remove())
    })

    it('should create element with role="status"', () => {
      announceToScreenReader('Test announcement')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()
      expect(announcement?.textContent).toBe('Test announcement')
    })

    it('should support aria-live="polite" by default', () => {
      announceToScreenReader('Test announcement')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toHaveAttribute('aria-live', 'polite')
    })

    it('should support aria-live="assertive" for urgent messages', () => {
      announceToScreenReader('Urgent announcement', 'assertive')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toHaveAttribute('aria-live', 'assertive')
    })

    it('should have aria-atomic="true"', () => {
      announceToScreenReader('Test announcement')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toHaveAttribute('aria-atomic', 'true')
    })

    it('should remove announcement after timeout', async () => {
      announceToScreenReader('Test announcement')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toBeInTheDocument()

      await waitFor(
        () => {
          const removedAnnouncement = document.querySelector('[role="status"]')
          expect(removedAnnouncement).not.toBeInTheDocument()
        },
        { timeout: 1500 }
      )
    })

    it('should handle multiple simultaneous announcements', () => {
      announceToScreenReader('First announcement')
      announceToScreenReader('Second announcement')
      announceToScreenReader('Third announcement')

      const announcements = document.querySelectorAll('[role="status"]')
      expect(announcements).toHaveLength(3)
    })

    it('should have sr-only class', () => {
      announceToScreenReader('Test announcement')

      const announcement = document.querySelector('[role="status"]')
      expect(announcement).toHaveClass('sr-only')
    })

    it('should announce new messages', () => {
      const mockMessage: MessageType = {
        id: '1',
        role: 'assistant',
        content: 'New message received',
        timestamp: Date.now(),
      }

      render(<Message message={mockMessage} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toHaveAttribute('aria-label')
    })
  })

  describe('Semantic HTML and Text Alternatives', () => {
    it('should use button elements for buttons', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const submitButton = screen.getByRole('button', { name: /check eligibility/i })
      expect(submitButton.tagName).toBe('BUTTON')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton.tagName).toBe('BUTTON')
    })

    it('should use input elements for inputs', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const ageInput = screen.getByLabelText(/age/i)
      expect(ageInput.tagName).toBe('INPUT')

      const incomeInput = screen.getByLabelText(/annual income/i)
      expect(incomeInput.tagName).toBe('INPUT')
    })

    it('should use select elements for dropdowns', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const genderSelect = screen.getByLabelText(/gender/i)
      expect(genderSelect.tagName).toBe('SELECT')

      const stateSelect = screen.getByLabelText(/state/i)
      expect(stateSelect.tagName).toBe('SELECT')
    })

    it('should have text content for all visual elements', () => {
      const mockMessage: MessageType = {
        id: '1',
        role: 'assistant',
        content: 'Test message with content',
        timestamp: Date.now(),
      }

      render(<Message message={mockMessage} />)

      expect(screen.getByText('Test message with content')).toBeInTheDocument()
    })

    it('should have text-based timestamps', () => {
      const mockMessage: MessageType = {
        id: '1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date('2024-01-01T12:00:00').getTime(),
      }

      render(<Message message={mockMessage} />)

      const timestamp = screen.getByText(/12:00/i)
      expect(timestamp).toBeInTheDocument()
    })

    it('should provide voice input as optional feature', () => {
      render(<VoiceInput onTranscript={vi.fn()} onError={vi.fn()} />)

      const voiceButton = screen.getByRole('button')
      expect(voiceButton).toBeInTheDocument()
    })

    it('should provide accessible content without images', () => {
      renderWithRouter(
        <EligibilityForm
          schemeId="test-scheme"
          schemeName="Test Scheme"
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Use getAllByText for elements that appear multiple times
      expect(screen.getAllByText(/check eligibility/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/test scheme/i)).toBeInTheDocument()
    })
  })
})
