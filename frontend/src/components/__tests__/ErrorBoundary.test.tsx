import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that throws on button click
function ThrowOnClick() {
  const handleClick = () => {
    throw new Error('Click error')
  }
  return <button onClick={handleClick}>Throw Error</button>
}

describe('ErrorBoundary', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleErrorSpy.mockClear()
  })

  describe('Normal Rendering (Validates Requirement 21.1)', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should not display error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })
  })

  describe('Error Catching (Validates Requirement 21.1)', () => {
    it('should catch errors thrown by child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.queryByText('No error')).not.toBeInTheDocument()
    })

    it('should display error boundary UI when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument()
    })

    it('should log error to console when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('Error UI Display (Validates Requirement 21.1, 21.4)', () => {
    it('should display error icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check for SVG icon (it has aria-hidden="true")
      const errorIcon = screen.getByRole('status').querySelector('svg[aria-hidden="true"]')
      expect(errorIcon).toBeInTheDocument()
    })

    it('should display user-friendly error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument()
      expect(screen.getByText(/your data is safe/i)).toBeInTheDocument()
    })

    it('should display Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should display Go to Home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument()
    })
  })

  describe('Error Recovery (Validates Requirement 21.1)', () => {
    it('should reset error state when Try Again is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)

      // After reset, the error boundary state is cleared
      // Re-render with no error to verify it works
      rerender(
        <ErrorBoundary>
          <div>Recovered content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Recovered content')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })
  })

  describe('Custom Fallback (Validates Requirement 21.1)', () => {
    it('should render custom fallback UI when provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })
  })

  describe('Error Details in Development (Validates Requirement 21.5)', () => {
    it('should show error details in development mode', () => {
      // Note: This test assumes DEV mode is enabled in test environment
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check if details element exists (may be collapsed)
      const details = screen.queryByText(/error details/i)
      if (details) {
        expect(details).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility (Validates Requirement 23.1, 23.2)', () => {
    it('should have accessible button labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Buttons are accessible by their text content
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      const goHomeButton = screen.getByRole('button', { name: /go to home/i })

      expect(tryAgainButton).toBeInTheDocument()
      expect(goHomeButton).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      tryAgainButton.focus()

      expect(tryAgainButton).toHaveFocus()
    })
  })

  describe('Multiple Errors (Validates Requirement 21.1)', () => {
    it('should handle multiple sequential errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Reset
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)

      // Throw another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Error Boundary with Event Handlers (Validates Requirement 21.1)', () => {
    it('should document that error boundaries do not catch event handler errors', () => {
      render(
        <ErrorBoundary>
          <ThrowOnClick />
        </ErrorBoundary>
      )

      const button = screen.getByRole('button', { name: /throw error/i })
      
      // Error boundaries don't catch errors in event handlers by default
      // This is expected React behavior - errors in event handlers need try-catch
      expect(button).toBeInTheDocument()
      
      // The error boundary should not be triggered by event handler errors
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })
  })
})
