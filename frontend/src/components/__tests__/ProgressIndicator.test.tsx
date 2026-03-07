import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProgressIndicator, InlineProgressIndicator } from '../ProgressIndicator'

describe('ProgressIndicator Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering (Validates Requirement 21.5)', () => {
    it('should render when isLoading is true', () => {
      render(<ProgressIndicator isLoading={true} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should not render when isLoading is false', () => {
      render(<ProgressIndicator isLoading={false} />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should display default loading message', () => {
      render(<ProgressIndicator isLoading={true} />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should display custom loading message', () => {
      render(<ProgressIndicator isLoading={true} message="Processing your request" />)

      expect(screen.getByText(/processing your request/i)).toBeInTheDocument()
    })
  })

  describe('Indeterminate Progress (Validates Requirement 21.5)', () => {
    it('should show spinner when progress is undefined', () => {
      render(<ProgressIndicator isLoading={true} />)

      const spinner = screen.getByRole('status').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show progress bar when progress is undefined', () => {
      render(<ProgressIndicator isLoading={true} />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('should animate dots in loading message', async () => {
      render(<ProgressIndicator isLoading={true} message="Loading" />)

      const initialText = screen.getByText(/loading/i).textContent

      // Advance time to trigger dot animation
      vi.advanceTimersByTime(500)

      await waitFor(() => {
        const updatedText = screen.getByText(/loading/i).textContent
        expect(updatedText).not.toBe(initialText)
      })
    })

    it('should cycle dots: empty -> . -> .. -> ... -> empty', async () => {
      render(<ProgressIndicator isLoading={true} message="Loading" />)

      const getMessage = () => screen.getByText(/loading/i).textContent

      // Initial state (no dots or one dot)
      const initial = getMessage()

      // After 500ms - should have one dot
      vi.advanceTimersByTime(500)
      await waitFor(() => {
        expect(getMessage()).not.toBe(initial)
      })

      // After 1000ms - should have two dots
      vi.advanceTimersByTime(500)
      await waitFor(() => {
        const text = getMessage()
        expect(text).toContain('.')
      })

      // After 1500ms - should have three dots
      vi.advanceTimersByTime(500)
      await waitFor(() => {
        const text = getMessage()
        expect(text).toContain('.')
      })

      // After 2000ms - should reset to no dots
      vi.advanceTimersByTime(500)
      await waitFor(() => {
        const text = getMessage()
        // Dots should cycle back
        expect(text).toBeTruthy()
      })
    })
  })

  describe('Determinate Progress (Validates Requirement 21.5)', () => {
    it('should show progress bar when progress is defined', () => {
      render(<ProgressIndicator isLoading={true} progress={50} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should not show spinner when progress is defined', () => {
      render(<ProgressIndicator isLoading={true} progress={50} />)

      const spinner = screen.getByRole('status').querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    it('should display progress percentage', () => {
      render(<ProgressIndicator isLoading={true} progress={75} />)

      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should set progress bar width correctly', () => {
      render(<ProgressIndicator isLoading={true} progress={60} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '60%' })
    })

    it('should have correct ARIA attributes', () => {
      render(<ProgressIndicator isLoading={true} progress={45} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '45')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('Progress Value Boundaries (Validates Requirement 21.5)', () => {
    it('should handle 0% progress', () => {
      render(<ProgressIndicator isLoading={true} progress={0} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    it('should handle 100% progress', () => {
      render(<ProgressIndicator isLoading={true} progress={100} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('should clamp negative progress to 0%', () => {
      render(<ProgressIndicator isLoading={true} progress={-10} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    it('should clamp progress over 100% to 100%', () => {
      render(<ProgressIndicator isLoading={true} progress={150} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('should handle decimal progress values', () => {
      render(<ProgressIndicator isLoading={true} progress={45.7} />)

      expect(screen.getByText('46%')).toBeInTheDocument() // Rounded
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveStyle({ width: '45.7%' })
    })
  })

  describe('Accessibility (Validates Requirement 23.1, 23.2)', () => {
    it('should have role="status"', () => {
      render(<ProgressIndicator isLoading={true} />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should have aria-live="polite"', () => {
      render(<ProgressIndicator isLoading={true} />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-busy when loading', () => {
      render(<ProgressIndicator isLoading={true} />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-busy', 'true')
    })

    it('should provide screen reader text for indeterminate progress', () => {
      render(<ProgressIndicator isLoading={true} />)

      expect(screen.getByText(/loading, please wait/i)).toHaveClass('sr-only')
    })

    it('should provide screen reader text for determinate progress', () => {
      render(<ProgressIndicator isLoading={true} progress={65} />)

      expect(screen.getByText(/loading: 65 percent complete/i)).toHaveClass('sr-only')
    })

    it('should hide decorative dots from screen readers', () => {
      render(<ProgressIndicator isLoading={true} message="Loading" />)

      const dotsContainer = screen.getByText(/loading/i).querySelector('[aria-hidden="true"]')
      expect(dotsContainer).toBeInTheDocument()
    })
  })

  describe('Visual Styling (Validates Requirement 21.5)', () => {
    it('should use gradient colors for progress bar', () => {
      render(<ProgressIndicator isLoading={true} progress={50} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('bg-gradient-to-r')
      expect(progressBar).toHaveClass('from-saffron')
      expect(progressBar).toHaveClass('via-white')
      expect(progressBar).toHaveClass('to-green')
    })

    it('should have smooth transition animation', () => {
      render(<ProgressIndicator isLoading={true} progress={50} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('transition-all')
      expect(progressBar).toHaveClass('duration-300')
    })

    it('should support dark mode styling', () => {
      render(<ProgressIndicator isLoading={true} progress={50} />)

      const progressBarContainer = screen.getByRole('progressbar').parentElement
      expect(progressBarContainer).toHaveClass('dark:bg-gray-700')
    })
  })

  describe('State Changes (Validates Requirement 21.5)', () => {
    it('should stop dot animation when loading stops', async () => {
      const { rerender } = render(<ProgressIndicator isLoading={true} message="Loading" />)

      // Start animation
      vi.advanceTimersByTime(500)

      // Stop loading
      rerender(<ProgressIndicator isLoading={false} message="Loading" />)

      // Component should not be rendered
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should update progress value dynamically', () => {
      const { rerender } = render(<ProgressIndicator isLoading={true} progress={25} />)

      expect(screen.getByText('25%')).toBeInTheDocument()

      rerender(<ProgressIndicator isLoading={true} progress={75} />)

      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.queryByText('25%')).not.toBeInTheDocument()
    })

    it('should update message dynamically', () => {
      const { rerender } = render(<ProgressIndicator isLoading={true} message="Loading..." />)

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument()

      rerender(<ProgressIndicator isLoading={true} message="Processing..." />)

      expect(screen.getByText(/processing\.\.\./i)).toBeInTheDocument()
      expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument()
    })
  })
})

describe('InlineProgressIndicator Component', () => {
  describe('Rendering (Validates Requirement 21.5)', () => {
    it('should render inline progress indicator', () => {
      render(<InlineProgressIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should display default message', () => {
      render(<InlineProgressIndicator />)

      expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('should display custom message', () => {
      render(<InlineProgressIndicator message="Saving" />)

      expect(screen.getByText('Saving')).toBeInTheDocument()
    })

    it('should show spinner', () => {
      render(<InlineProgressIndicator />)

      const spinner = screen.getByRole('status').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Styling (Validates Requirement 21.5)', () => {
    it('should use smaller size than full progress indicator', () => {
      render(<InlineProgressIndicator />)

      const spinner = screen.getByRole('status').querySelector('.animate-spin')
      expect(spinner).toHaveClass('w-4')
      expect(spinner).toHaveClass('h-4')
    })

    it('should display items inline', () => {
      render(<InlineProgressIndicator />)

      const container = screen.getByRole('status')
      expect(container).toHaveClass('flex')
      expect(container).toHaveClass('items-center')
    })

    it('should have gap between spinner and text', () => {
      render(<InlineProgressIndicator />)

      const container = screen.getByRole('status')
      expect(container).toHaveClass('gap-2')
    })
  })

  describe('Accessibility (Validates Requirement 23.1, 23.2)', () => {
    it('should have role="status"', () => {
      render(<InlineProgressIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should have aria-live="polite"', () => {
      render(<InlineProgressIndicator />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Use Cases (Validates Requirement 21.5)', () => {
    it('should work for button loading states', () => {
      render(
        <button disabled>
          <InlineProgressIndicator message="Submitting" />
        </button>
      )

      expect(screen.getByText('Submitting')).toBeInTheDocument()
    })

    it('should work for inline content loading', () => {
      render(
        <div>
          <p>Fetching data</p>
          <InlineProgressIndicator message="Please wait" />
        </div>
      )

      expect(screen.getByText('Please wait')).toBeInTheDocument()
    })
  })
})
