import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Toast, ToastContainer } from '../Toast'
import type { ToastProps } from '../Toast'

describe('Toast Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const defaultProps: ToastProps = {
    id: 'test-toast',
    type: 'info',
    message: 'Test message',
    onClose: mockOnClose,
  }

  describe('Toast Rendering (Validates Requirement 21.5)', () => {
    it('should render toast with message', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render success toast with green styling', () => {
      render(<Toast {...defaultProps} type="success" />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-green-50')
    })

    it('should render error toast with red styling', () => {
      render(<Toast {...defaultProps} type="error" />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-red-50')
    })

    it('should render warning toast with yellow styling', () => {
      render(<Toast {...defaultProps} type="warning" />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-yellow-50')
    })

    it('should render info toast with blue styling', () => {
      render(<Toast {...defaultProps} type="info" />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('bg-blue-50')
    })
  })

  describe('Toast Icons (Validates Requirement 21.5)', () => {
    it('should display success icon for success toast', () => {
      render(<Toast {...defaultProps} type="success" />)

      const icon = screen.getByRole('alert').querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-green-600')
    })

    it('should display error icon for error toast', () => {
      render(<Toast {...defaultProps} type="error" />)

      const icon = screen.getByRole('alert').querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-red-600')
    })

    it('should display warning icon for warning toast', () => {
      render(<Toast {...defaultProps} type="warning" />)

      const icon = screen.getByRole('alert').querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-yellow-600')
    })

    it('should display info icon for info toast', () => {
      render(<Toast {...defaultProps} type="info" />)

      const icon = screen.getByRole('alert').querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('text-blue-600')
    })
  })

  describe('Toast Auto-Dismiss (Validates Requirement 21.5)', () => {
    it('should auto-dismiss after default duration (5 seconds)', async () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByText('Test message')).toBeInTheDocument()

      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000)

      // Wait for exit animation (300ms)
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast')
      })
    })

    it('should auto-dismiss after custom duration', async () => {
      render(<Toast {...defaultProps} duration={3000} />)

      expect(screen.getByText('Test message')).toBeInTheDocument()

      // Fast-forward time by 3 seconds
      vi.advanceTimersByTime(3000)

      // Wait for exit animation
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast')
      })
    })

    it('should not dismiss before duration expires', () => {
      render(<Toast {...defaultProps} duration={5000} />)

      // Fast-forward time by 2 seconds (less than duration)
      vi.advanceTimersByTime(2000)

      expect(mockOnClose).not.toHaveBeenCalled()
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  describe('Toast Manual Close (Validates Requirement 21.5)', () => {
    it('should close when close button is clicked', async () => {
      render(<Toast {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close notification/i })
      fireEvent.click(closeButton)

      // Wait for exit animation
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('test-toast')
      })
    })

    it('should have accessible close button', () => {
      render(<Toast {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close notification/i })
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
    })
  })

  describe('Toast Accessibility (Validates Requirement 23.1, 23.2)', () => {
    it('should have role="alert"', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have aria-live="polite"', () => {
      render(<Toast {...defaultProps} />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveAttribute('aria-live', 'polite')
    })

    it('should be keyboard accessible', () => {
      render(<Toast {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close notification/i })
      closeButton.focus()

      expect(closeButton).toHaveFocus()
    })
  })

  describe('Toast Animations (Validates Requirement 21.5)', () => {
    it('should have entrance animation classes', () => {
      render(<Toast {...defaultProps} />)

      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('transition-all')
      expect(toast).toHaveClass('duration-300')
    })

    it('should apply exit animation when closing', async () => {
      render(<Toast {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close notification/i })
      fireEvent.click(closeButton)

      // Toast should still be in DOM during exit animation
      expect(screen.getByText('Test message')).toBeInTheDocument()

      // After animation completes, onClose should be called
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Toast Message Content (Validates Requirement 21.4)', () => {
    it('should display short messages', () => {
      render(<Toast {...defaultProps} message="OK" />)

      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should display long messages', () => {
      const longMessage =
        'This is a very long error message that provides detailed information about what went wrong and how to fix it.'

      render(<Toast {...defaultProps} message={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle messages with special characters', () => {
      const message = 'Error: Invalid input! Please try again.'

      render(<Toast {...defaultProps} message={message} />)

      expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('should handle messages with HTML entities', () => {
      const message = 'Income must be ≤ ₹3,00,000'

      render(<Toast {...defaultProps} message={message} />)

      expect(screen.getByText(message)).toBeInTheDocument()
    })
  })
})

describe('ToastContainer Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Container Rendering (Validates Requirement 21.5)', () => {
    it('should render multiple toasts', () => {
      const toasts = [
        { id: '1', type: 'success' as const, message: 'Success message' },
        { id: '2', type: 'error' as const, message: 'Error message' },
        { id: '3', type: 'info' as const, message: 'Info message' },
      ]

      render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })

    it('should render empty container when no toasts', () => {
      const { container } = render(<ToastContainer toasts={[]} onClose={mockOnClose} />)

      const toastContainer = container.querySelector('[aria-live="polite"]')
      expect(toastContainer).toBeInTheDocument()
      expect(toastContainer?.children).toHaveLength(0)
    })

    it('should position container in top-right corner', () => {
      const toasts = [{ id: '1', type: 'info' as const, message: 'Test' }]

      const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      const toastContainer = container.querySelector('[aria-live="polite"]')
      expect(toastContainer).toHaveClass('fixed')
      expect(toastContainer).toHaveClass('top-4')
      expect(toastContainer).toHaveClass('right-4')
    })
  })

  describe('Container Accessibility (Validates Requirement 23.1, 23.2)', () => {
    it('should have aria-live="polite"', () => {
      const toasts = [{ id: '1', type: 'info' as const, message: 'Test' }]

      const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      const toastContainer = container.querySelector('[aria-live="polite"]')
      expect(toastContainer).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-atomic="false"', () => {
      const toasts = [{ id: '1', type: 'info' as const, message: 'Test' }]

      const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      const toastContainer = container.querySelector('[aria-live="polite"]')
      expect(toastContainer).toHaveAttribute('aria-atomic', 'false')
    })
  })

  describe('Container Toast Management (Validates Requirement 21.5)', () => {
    it('should handle adding toasts dynamically', () => {
      const { rerender } = render(
        <ToastContainer toasts={[{ id: '1', type: 'info' as const, message: 'First' }]} onClose={mockOnClose} />
      )

      expect(screen.getByText('First')).toBeInTheDocument()

      rerender(
        <ToastContainer
          toasts={[
            { id: '1', type: 'info' as const, message: 'First' },
            { id: '2', type: 'success' as const, message: 'Second' },
          ]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should handle removing toasts', () => {
      const { rerender } = render(
        <ToastContainer
          toasts={[
            { id: '1', type: 'info' as const, message: 'First' },
            { id: '2', type: 'success' as const, message: 'Second' },
          ]}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()

      rerender(<ToastContainer toasts={[{ id: '2', type: 'success' as const, message: 'Second' }]} onClose={mockOnClose} />)

      expect(screen.queryByText('First')).not.toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })

    it('should stack toasts vertically with gap', () => {
      const toasts = [
        { id: '1', type: 'info' as const, message: 'First' },
        { id: '2', type: 'success' as const, message: 'Second' },
      ]

      const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      const toastContainer = container.querySelector('[aria-live="polite"]')
      expect(toastContainer).toHaveClass('flex')
      expect(toastContainer).toHaveClass('flex-col')
      expect(toastContainer).toHaveClass('gap-3')
    })
  })

  describe('Container Edge Cases (Validates Requirement 21.5)', () => {
    it('should handle many toasts', () => {
      const toasts = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'info' as const,
        message: `Message ${i}`,
      }))

      render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      toasts.forEach((toast) => {
        expect(screen.getByText(toast.message)).toBeInTheDocument()
      })
    })

    it('should handle toasts with same message but different IDs', () => {
      const toasts = [
        { id: '1', type: 'info' as const, message: 'Same message' },
        { id: '2', type: 'info' as const, message: 'Same message' },
      ]

      render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      const messages = screen.getAllByText('Same message')
      expect(messages).toHaveLength(2)
    })

    it('should handle mixed toast types', () => {
      const toasts = [
        { id: '1', type: 'success' as const, message: 'Success' },
        { id: '2', type: 'error' as const, message: 'Error' },
        { id: '3', type: 'warning' as const, message: 'Warning' },
        { id: '4', type: 'info' as const, message: 'Info' },
      ]

      render(<ToastContainer toasts={toasts} onClose={mockOnClose} />)

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Info')).toBeInTheDocument()
    })
  })
})
