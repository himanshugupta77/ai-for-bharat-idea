import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import AboutPage from '../AboutPage'
import userEvent from '@testing-library/user-event'

// Mock GlassCard component
vi.mock('@/components/GlassCard', () => ({
  GlassCard: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <div className={className} data-testid="glass-card" {...props}>
      {children}
    </div>
  ),
}))

describe('AboutPage', () => {
  const renderAboutPage = () => {
    return render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    // Reset any scroll behavior
    window.scrollTo = vi.fn() as any
  })

  describe('Page Rendering', () => {
    it('should render the about page without crashing', () => {
      renderAboutPage()
      expect(screen.getByText('About Bharat Sahayak')).toBeInTheDocument()
    })

    it('should render skip to main content link', () => {
      renderAboutPage()
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#about-main')
    })

    it('should render page header with title and description', () => {
      renderAboutPage()
      expect(screen.getByText('About Bharat Sahayak')).toBeInTheDocument()
      expect(
        screen.getByText(/An AI-powered, multilingual welfare assistant platform/i)
      ).toBeInTheDocument()
    })

    it('should render all four section navigation buttons', () => {
      renderAboutPage()
      expect(screen.getByText('Architecture')).toBeInTheDocument()
      expect(screen.getByText('AI Transparency')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Bias Prevention')).toBeInTheDocument()
    })

    it('should render all four content sections', () => {
      renderAboutPage()
      expect(screen.getByText('AWS Serverless Architecture')).toBeInTheDocument()
      expect(screen.getByText('AI Transparency & Explainability')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy & Data Handling')).toBeInTheDocument()
      expect(screen.getByText('Bias Prevention & Fairness')).toBeInTheDocument()
    })

    it('should render footer', () => {
      renderAboutPage()
      expect(
        screen.getByText(/Bharat Sahayak is committed to transparency, privacy, and fairness/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Built with ❤️ for India/i)).toBeInTheDocument()
    })
  })

  describe('Section Navigation', () => {
    it('should have architecture section active by default', () => {
      renderAboutPage()
      const architectureButton = screen.getByText('Architecture')
      expect(architectureButton).toHaveClass(/from-orange-500/)
      expect(architectureButton).toHaveAttribute('aria-current', 'page')
    })

    it('should update active section when navigation button is clicked', async () => {
      const user = userEvent.setup()
      renderAboutPage()

      const aiButton = screen.getByText('AI Transparency')
      await user.click(aiButton)

      await waitFor(() => {
        expect(aiButton).toHaveClass(/from-orange-500/)
        expect(aiButton).toHaveAttribute('aria-current', 'page')
      })
    })

    it('should scroll to section when navigation button is clicked', async () => {
      const user = userEvent.setup()
      
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock
      
      renderAboutPage()

      const privacyButton = screen.getByText('Privacy Policy')
      await user.click(privacyButton)

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start',
        })
      })
    })

    it('should have proper aria-labels on navigation buttons', () => {
      renderAboutPage()
      
      expect(screen.getByLabelText('Navigate to Architecture section')).toBeInTheDocument()
      expect(screen.getByLabelText('Navigate to AI Transparency section')).toBeInTheDocument()
      expect(screen.getByLabelText('Navigate to Privacy Policy section')).toBeInTheDocument()
      expect(screen.getByLabelText('Navigate to Bias Prevention section')).toBeInTheDocument()
    })

    it('should update aria-current when switching sections', async () => {
      const user = userEvent.setup()
      renderAboutPage()

      const architectureButton = screen.getByText('Architecture')
      const biasButton = screen.getByText('Bias Prevention')

      expect(architectureButton).toHaveAttribute('aria-current', 'page')
      expect(biasButton).not.toHaveAttribute('aria-current', 'page')

      await user.click(biasButton)

      await waitFor(() => {
        expect(biasButton).toHaveAttribute('aria-current', 'page')
        expect(architectureButton).not.toHaveAttribute('aria-current', 'page')
      })
    })

    it('should handle navigation to all sections', async () => {
      const user = userEvent.setup()
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock
      
      renderAboutPage()

      const sections = [
        { button: 'Architecture', id: 'architecture' },
        { button: 'AI Transparency', id: 'ai' },
        { button: 'Privacy Policy', id: 'privacy' },
        { button: 'Bias Prevention', id: 'bias' },
      ]

      for (const section of sections) {
        scrollIntoViewMock.mockClear()
        const button = screen.getByText(section.button)
        await user.click(button)

        await waitFor(() => {
          expect(scrollIntoViewMock).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Architecture Section Content', () => {
    it('should render architecture diagram', () => {
      renderAboutPage()
      const diagram = screen.getByRole('img', { name: /AWS Serverless Architecture Diagram/i })
      expect(diagram).toBeInTheDocument()
    })

    it('should render architecture diagram with proper SVG structure', () => {
      renderAboutPage()
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 800 600')
    })

    it('should render all architecture layers', () => {
      renderAboutPage()
      expect(screen.getByText('Frontend Layer')).toBeInTheDocument()
      expect(screen.getByText('API Layer')).toBeInTheDocument()
      expect(screen.getByText('Compute Layer')).toBeInTheDocument()
      expect(screen.getByText('AI Services')).toBeInTheDocument()
    })

    it('should render AWS services in architecture description', () => {
      renderAboutPage()
      expect(screen.getByText(/CloudFront CDN for global content delivery/i)).toBeInTheDocument()
      expect(screen.getByText(/S3 for static website hosting/i)).toBeInTheDocument()
      expect(screen.getByText(/API Gateway for RESTful endpoints/i)).toBeInTheDocument()
      expect(screen.getByText(/Lambda functions/i)).toBeInTheDocument()
      // Use getAllByText for services that appear multiple times
      expect(screen.getAllByText(/Amazon Bedrock/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Amazon Transcribe/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Amazon Polly/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Amazon Translate/i).length).toBeGreaterThan(0)
    })

    it('should have proper section heading', () => {
      renderAboutPage()
      const heading = screen.getByRole('heading', { name: 'AWS Serverless Architecture' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('AI Transparency Section Content', () => {
    it('should render rule-based eligibility explanation', () => {
      renderAboutPage()
      expect(screen.getByText('Rule-Based Eligibility Checking')).toBeInTheDocument()
      expect(screen.getByText(/Deterministic Rules/i)).toBeInTheDocument()
      expect(screen.getByText(/Full Explanations/i)).toBeInTheDocument()
      expect(screen.getByText(/No AI Inference/i)).toBeInTheDocument()
      expect(screen.getByText(/Auditable/i)).toBeInTheDocument()
    })

    it('should render AI-assisted conversations explanation', () => {
      renderAboutPage()
      expect(screen.getByText('AI-Assisted Conversations')).toBeInTheDocument()
      expect(screen.getByText(/Context-Aware/i)).toBeInTheDocument()
      expect(screen.getByText(/Scheme Matching/i)).toBeInTheDocument()
      expect(screen.getByText(/Guidance Only/i)).toBeInTheDocument()
      expect(screen.getByText(/Verified Information/i)).toBeInTheDocument()
    })

    it('should render key principle about AI usage', () => {
      renderAboutPage()
      expect(
        screen.getByText(/AI assists with discovery and conversation, but only transparent rules determine eligibility/i)
      ).toBeInTheDocument()
    })

    it('should have proper section heading', () => {
      renderAboutPage()
      const heading = screen.getByRole('heading', { name: 'AI Transparency & Explainability' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('Privacy Policy Section Content', () => {
    it('should render data collection information', () => {
      renderAboutPage()
      expect(screen.getByText('Data Collection')).toBeInTheDocument()
      expect(screen.getByText(/We collect only the minimum data necessary/i)).toBeInTheDocument()
      expect(screen.getByText(/Conversation messages/i)).toBeInTheDocument()
      expect(screen.getByText(/Session ID/i)).toBeInTheDocument()
    })

    it('should render data storage and retention information', () => {
      renderAboutPage()
      expect(screen.getByText('Data Storage & Retention')).toBeInTheDocument()
      expect(screen.getByText(/24-Hour Auto-Delete/i)).toBeInTheDocument()
      expect(screen.getByText(/Encrypted Storage/i)).toBeInTheDocument()
      expect(screen.getByText(/HTTPS Only/i)).toBeInTheDocument()
      expect(screen.getByText(/No Long-Term Storage/i)).toBeInTheDocument()
    })

    it('should render data usage information', () => {
      renderAboutPage()
      expect(screen.getByText('Data Usage')).toBeInTheDocument()
      expect(screen.getByText(/Maintaining conversation context/i)).toBeInTheDocument()
      expect(screen.getByText(/Evaluating scheme eligibility/i)).toBeInTheDocument()
    })

    it('should render user rights information', () => {
      renderAboutPage()
      expect(screen.getByText('Your Rights')).toBeInTheDocument()
      expect(screen.getByText(/Clear your session data anytime/i)).toBeInTheDocument()
      expect(screen.getByText(/No account creation required/i)).toBeInTheDocument()
    })

    it('should render security measures', () => {
      renderAboutPage()
      expect(screen.getByText('Security Measures')).toBeInTheDocument()
      expect(screen.getByText(/AWS WAF protection/i)).toBeInTheDocument()
      // Use getAllByText for text that appears multiple times
      expect(screen.getAllByText(/Rate limiting/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Input sanitization/i)).toBeInTheDocument()
    })

    it('should have proper section heading', () => {
      renderAboutPage()
      const heading = screen.getByRole('heading', { name: 'Privacy Policy & Data Handling' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('Bias Prevention Section Content', () => {
    it('should render fairness principles', () => {
      renderAboutPage()
      expect(screen.getByText('Our Fairness Principles')).toBeInTheDocument()
      expect(screen.getByText(/No Demographic Filtering/i)).toBeInTheDocument()
      expect(screen.getByText(/Transparent Rules Only/i)).toBeInTheDocument()
      expect(screen.getByText(/Equal Language Support/i)).toBeInTheDocument()
      expect(screen.getByText(/Accessibility First/i)).toBeInTheDocument()
    })

    it('should render bias prevention methods', () => {
      renderAboutPage()
      expect(screen.getByText('How We Prevent Bias')).toBeInTheDocument()
      expect(screen.getByText(/In Scheme Recommendations/i)).toBeInTheDocument()
      expect(screen.getByText(/In Eligibility Checking/i)).toBeInTheDocument()
      expect(screen.getByText(/In Language Processing/i)).toBeInTheDocument()
    })

    it('should render continuous monitoring information', () => {
      renderAboutPage()
      expect(screen.getByText('Continuous Monitoring')).toBeInTheDocument()
      expect(screen.getByText(/Regular audits of scheme recommendations/i)).toBeInTheDocument()
      expect(screen.getByText(/Validation that eligibility rules match official criteria/i)).toBeInTheDocument()
    })

    it('should render report concerns section', () => {
      renderAboutPage()
      expect(screen.getByText('Report Concerns')).toBeInTheDocument()
      expect(
        screen.getByText(/If you believe you've experienced bias or unfair treatment/i)
      ).toBeInTheDocument()
    })

    it('should have proper section heading', () => {
      renderAboutPage()
      const heading = screen.getByRole('heading', { name: 'Bias Prevention & Fairness' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderAboutPage()
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('About Bharat Sahayak')
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements.length).toBe(4) // Four main sections
    })

    it('should have main landmark with proper id', () => {
      renderAboutPage()
      
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveAttribute('id', 'about-main')
    })

    it('should have banner landmark', () => {
      renderAboutPage()
      
      const banner = screen.getByRole('banner')
      expect(banner).toBeInTheDocument()
    })

    it('should have navigation landmark with proper label', () => {
      renderAboutPage()
      
      const nav = screen.getByRole('navigation', { name: 'About page sections' })
      expect(nav).toBeInTheDocument()
    })

    it('should have contentinfo landmark', () => {
      renderAboutPage()
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()
    })

    it('should have proper section labels with aria-labelledby', () => {
      renderAboutPage()
      
      const architectureSection = document.getElementById('architecture')
      expect(architectureSection).toHaveAttribute('aria-labelledby', 'architecture-heading')
      
      const aiSection = document.getElementById('ai')
      expect(aiSection).toHaveAttribute('aria-labelledby', 'ai-heading')
      
      const privacySection = document.getElementById('privacy')
      expect(privacySection).toHaveAttribute('aria-labelledby', 'privacy-heading')
      
      const biasSection = document.getElementById('bias')
      expect(biasSection).toHaveAttribute('aria-labelledby', 'bias-heading')
    })

    it('should have skip link with proper class', () => {
      renderAboutPage()
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toHaveClass('skip-link')
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive container classes', () => {
      renderAboutPage()
      
      const container = document.querySelector('.container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('mx-auto', 'px-4', 'py-12', 'max-w-6xl')
    })

    it('should apply responsive text size classes to header', () => {
      renderAboutPage()
      
      const title = screen.getByText('About Bharat Sahayak')
      expect(title.className).toMatch(/text-4xl|md:text-5xl/)
    })

    it('should apply responsive grid layouts', () => {
      renderAboutPage()
      
      const grids = document.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
      
      grids.forEach(grid => {
        expect(grid.className).toMatch(/md:grid-cols-2/)
      })
    })

    it('should have responsive navigation button layout', () => {
      renderAboutPage()
      
      const nav = screen.getByRole('navigation', { name: 'About page sections' })
      expect(nav.className).toMatch(/flex-wrap/)
    })
  })

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on background', () => {
      renderAboutPage()
      
      const background = document.querySelector('.min-h-screen')
      expect(background?.className).toMatch(/dark:from-gray-900/)
    })

    it('should have dark mode classes on text elements', () => {
      renderAboutPage()
      
      const description = screen.getByText(/An AI-powered, multilingual welfare assistant platform/i)
      expect(description.className).toMatch(/dark:text-gray-300/)
    })

    it('should have dark mode classes on navigation buttons', () => {
      renderAboutPage()
      
      const buttons = screen.getAllByRole('button')
      // Check that at least some buttons have dark mode classes (inactive buttons)
      const inactiveButtons = buttons.filter(button => 
        !button.className.includes('from-orange-500')
      )
      
      inactiveButtons.forEach(button => {
        expect(button.className).toMatch(/dark:bg-gray-800|dark:text-gray-300/)
      })
    })
  })

  describe('Interactive Elements', () => {
    it('should have hover effects on navigation buttons', () => {
      renderAboutPage()
      
      const architectureButton = screen.getByText('Architecture')
      expect(architectureButton.className).toMatch(/transition-all/)
    })

    it('should apply scale effect to active button', () => {
      renderAboutPage()
      
      const architectureButton = screen.getByText('Architecture')
      expect(architectureButton.className).toMatch(/scale-105/)
    })

    it('should have proper button styling for inactive buttons', () => {
      renderAboutPage()
      
      const aiButton = screen.getByText('AI Transparency')
      expect(aiButton.className).toMatch(/hover:bg-white/)
    })
  })

  describe('Content Completeness', () => {
    it('should render all GlassCard components', () => {
      renderAboutPage()
      
      const glassCards = screen.getAllByTestId('glass-card')
      expect(glassCards.length).toBe(4) // One for each section
    })

    it('should have proper section IDs for navigation', () => {
      renderAboutPage()
      
      expect(document.getElementById('architecture')).toBeInTheDocument()
      expect(document.getElementById('ai')).toBeInTheDocument()
      expect(document.getElementById('privacy')).toBeInTheDocument()
      expect(document.getElementById('bias')).toBeInTheDocument()
    })

    it('should render all subsections in architecture', () => {
      renderAboutPage()
      
      expect(screen.getByText('Frontend Layer')).toBeInTheDocument()
      expect(screen.getByText('API Layer')).toBeInTheDocument()
      expect(screen.getByText('Compute Layer')).toBeInTheDocument()
      expect(screen.getByText('AI Services')).toBeInTheDocument()
    })

    it('should render all subsections in AI transparency', () => {
      renderAboutPage()
      
      expect(screen.getByText('Rule-Based Eligibility Checking')).toBeInTheDocument()
      expect(screen.getByText('AI-Assisted Conversations')).toBeInTheDocument()
    })

    it('should render all subsections in privacy policy', () => {
      renderAboutPage()
      
      expect(screen.getByText('Data Collection')).toBeInTheDocument()
      expect(screen.getByText('Data Storage & Retention')).toBeInTheDocument()
      expect(screen.getByText('Data Usage')).toBeInTheDocument()
      expect(screen.getByText('Your Rights')).toBeInTheDocument()
      expect(screen.getByText('Security Measures')).toBeInTheDocument()
    })

    it('should render all subsections in bias prevention', () => {
      renderAboutPage()
      
      expect(screen.getByText('Our Fairness Principles')).toBeInTheDocument()
      expect(screen.getByText('How We Prevent Bias')).toBeInTheDocument()
      expect(screen.getByText('Continuous Monitoring')).toBeInTheDocument()
      expect(screen.getByText('Report Concerns')).toBeInTheDocument()
    })
  })
})
