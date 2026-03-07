import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EligibilityResult } from '../EligibilityResult'
import type { EligibilityResult as EligibilityResultType } from '@/types'

vi.mock('@/hooks', () => ({ useLowBandwidth: () => ({ isLowBandwidth: false }) }))
vi.mock('@/utils/accessibility', () => ({ announceToScreenReader: vi.fn() }))
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    li: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <li {...props}>{children}</li>,
  },
}))

describe('EligibilityResult', () => {
  const mockOnClose = vi.fn()
  const mockOnApply = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const eligibleResult: EligibilityResultType = {
    eligible: true,
    explanation: {
      summary: 'You meet all the eligibility criteria for PM-KISAN scheme.',
      criteria: [
        { criterion: 'Age Requirement', required: 'Must be 18 years or older', userValue: '45 years', met: true },
        { criterion: 'Land Ownership', required: 'Must own agricultural land', userValue: 'Owns 2.5 hectares', met: true },
      ],
    },
    schemeDetails: {
      name: 'PM-KISAN',
      benefits: 'Direct income support of ₹6,000 per year in three equal installments.',
      applicationProcess: ['Visit the official PM-KISAN portal', 'Register with Aadhaar number'],
      requiredDocuments: ['Aadhaar Card', 'Land Ownership Certificate'],
    },
  }

  const notEligibleResult: EligibilityResultType = {
    eligible: false,
    explanation: {
      summary: 'You do not meet some eligibility criteria for PM-KISAN scheme.',
      criteria: [
        { criterion: 'Age Requirement', required: 'Must be 18 years or older', userValue: '45 years', met: true },
        { criterion: 'Land Ownership', required: 'Must own agricultural land', userValue: 'Does not own land', met: false },
      ],
    },
    schemeDetails: {
      name: 'PM-KISAN',
      benefits: 'Direct income support.',
      applicationProcess: [],
      requiredDocuments: [],
    },
  }

  describe('Result Display - Eligible Status (Validates Requirement 5.2)', () => {
    it('should display eligible status with success icon', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      expect(screen.getByText('You are Eligible!')).toBeInTheDocument()
    })

    it('should display scheme name in eligible result', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      expect(screen.getByText('PM-KISAN')).toBeInTheDocument()
    })

    it('should display summary explanation for eligible result', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      expect(screen.getByText('You meet all the eligibility criteria for PM-KISAN scheme.')).toBeInTheDocument()
    })
  })

  describe('Result Display - Not Eligible Status (Validates Requirement 5.2)', () => {
    it('should display not eligible status with error icon', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Not Eligible')).toBeInTheDocument()
    })

    it('should display summary explanation for not eligible result', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('You do not meet some eligibility criteria for PM-KISAN scheme.')).toBeInTheDocument()
    })
  })

  describe('Criteria Checklist Display (Validates Requirement 5.2)', () => {
    it('should display all eligibility criteria', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Age Requirement')).toBeInTheDocument()
      expect(screen.getByText('Land Ownership')).toBeInTheDocument()
    })

    it('should display required values for each criterion', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText(/Must be 18 years or older/i)).toBeInTheDocument()
      expect(screen.getByText(/Must own agricultural land/i)).toBeInTheDocument()
    })

    it('should display user values for each criterion', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText(/45 years/i)).toBeInTheDocument()
      expect(screen.getByText(/Owns 2.5 hectares/i)).toBeInTheDocument()
    })

    it('should display met status badges for all criteria when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      const metBadges = screen.getAllByText('Met')
      expect(metBadges).toHaveLength(2)
    })

    it('should display met and not met status badges correctly', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Met')).toBeInTheDocument()
      expect(screen.getByText('Not Met')).toBeInTheDocument()
    })

    it('should have proper ARIA role for criteria list', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      const criteriaList = screen.getByRole('list', { name: /eligibility criteria checklist/i })
      expect(criteriaList).toBeInTheDocument()
    })
  })

  describe('Scheme Benefits Display (Validates Requirement 5.2)', () => {
    it('should display scheme benefits section when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Scheme Benefits')).toBeInTheDocument()
    })

    it('should display benefits text when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Direct income support of ₹6,000 per year in three equal installments.')).toBeInTheDocument()
    })

    it('should not display scheme benefits section when not eligible', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.queryByText('Scheme Benefits')).not.toBeInTheDocument()
    })
  })

  describe('Application Process Display (Validates Requirement 5.2)', () => {
    it('should display application process section when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('How to Apply')).toBeInTheDocument()
    })

    it('should display all application steps when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Visit the official PM-KISAN portal')).toBeInTheDocument()
      expect(screen.getByText('Register with Aadhaar number')).toBeInTheDocument()
    })

    it('should display application steps as ordered list', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      const stepsList = screen.getByRole('list', { name: /application steps/i })
      expect(stepsList).toBeInTheDocument()
    })

    it('should not display application process when not eligible', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.queryByText('How to Apply')).not.toBeInTheDocument()
    })

    it('should not display application process when eligible but no steps provided', () => {
      const resultWithNoSteps = {
        ...eligibleResult,
        schemeDetails: {
          ...eligibleResult.schemeDetails,
          applicationProcess: [],
        },
      }
      render(<EligibilityResult result={resultWithNoSteps} onClose={mockOnClose} />)
      expect(screen.queryByText('How to Apply')).not.toBeInTheDocument()
    })
  })

  describe('Required Documents Display (Validates Requirement 5.2)', () => {
    it('should display required documents section when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Required Documents')).toBeInTheDocument()
    })

    it('should display all required documents when eligible', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.getByText('Aadhaar Card')).toBeInTheDocument()
      expect(screen.getByText('Land Ownership Certificate')).toBeInTheDocument()
    })

    it('should not display required documents when not eligible', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.queryByText('Required Documents')).not.toBeInTheDocument()
    })

    it('should not display required documents when eligible but no documents provided', () => {
      const resultWithNoDocuments = {
        ...eligibleResult,
        schemeDetails: {
          ...eligibleResult.schemeDetails,
          requiredDocuments: [],
        },
      }
      render(<EligibilityResult result={resultWithNoDocuments} onClose={mockOnClose} />)
      expect(screen.queryByText('Required Documents')).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onClose when Close button clicked', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onApply when Apply Now button clicked', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      fireEvent.click(screen.getByRole('button', { name: /apply now/i }))
      expect(mockOnApply).toHaveBeenCalledTimes(1)
    })

    it('should display Apply Now button when eligible and onApply provided', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
    })

    it('should not display Apply Now button when not eligible', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} onApply={mockOnApply} />)
      expect(screen.queryByRole('button', { name: /apply now/i })).not.toBeInTheDocument()
    })

    it('should not display Apply Now button when eligible but onApply not provided', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      expect(screen.queryByRole('button', { name: /apply now/i })).not.toBeInTheDocument()
    })

    it('should display Try Another Scheme button text when not eligible', () => {
      render(<EligibilityResult result={notEligibleResult} onClose={mockOnClose} />)
      expect(screen.getByRole('button', { name: /try another scheme/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have status role with aria-live assertive', () => {
      render(<EligibilityResult result={eligibleResult} onClose={mockOnClose} />)
      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'assertive')
    })
  })
})
