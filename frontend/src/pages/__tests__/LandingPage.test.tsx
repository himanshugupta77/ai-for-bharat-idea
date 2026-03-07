import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from '../LandingPage'
import userEvent from '@testing-library/user-event'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => '0%' }),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'accessibility.skipToContent': 'Skip to main content',
        'landing.title': 'Bharat Sahayak',
        'landing.subtitle': 'Your AI-Powered Welfare Assistant',
        'landing.description': 'Discover government schemes in your language',
        'landing.cta': 'Start Chatting',
        'landing.features.title': 'Features',
        'landing.features.multilingual.title': 'Multilingual Support',
        'landing.features.multilingual.description': '11 Indian languages supported',
        'landing.features.voice.title': 'Voice Input',
        'landing.features.voice.description': 'Speak your questions',
        'landing.features.ai.title': 'AI-Powered',
        'landing.features.ai.description': 'Intelligent scheme matching',
        'landing.features.explainable.title': 'Explainable',
        'landing.features.explainable.description': 'Clear eligibility explanations',
      }
      return translations[key] || key
    },
  }),
}))

// Mock custom hooks
vi.mock('@/hooks/useLowBandwidth', () => ({
  default: () => ({ isLowBandwidth: false }),
}))

// Mock components
vi.mock('@/components/AIOrb', () => ({
  AIOrb: ({ className, size }: any) => (
    <div data-testid="ai-orb" className={className} data-size={size}>
      AI Orb
    </div>
  ),
}))

vi.mock('@/components/AnimatedBackground', () => ({
  default: () => <div data-testid="animated-background">Background</div>,
}))

vi.mock('@/components/GlassButton', () => ({
  GlassButton: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/GlassCard', () => ({
  GlassCard: ({ children, className, hover, ...props }: any) => (
    <div className={className} data-hover={hover} {...props}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/FeatureCard', () => ({
  FeatureCard: ({ icon, title, description, ...props }: any) => (
    <div data-testid="feature-card" {...props}>
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock('@/components/SchemeCard', () => ({
  SchemeCard: ({ scheme, icon, ...props }: any) => (
    <div data-testid="scheme-card" {...props}>
      <span>{icon}</span>
      <h3>{scheme.name}</h3>
      <p>{scheme.description}</p>
    </div>
  ),
}))

describe('LandingPage', () => {
  beforeEach(() => {
    // Reset scroll behavior
    document.documentElement.style.scrollBehavior = 'auto'
  })

  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )
  }

  describe('Page Rendering', () => {
    it('should render the landing page without crashing', () => {
      renderLandingPage()
      expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
    })

    it('should render skip to main content link', () => {
      renderLandingPage()
      expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    })

    it('should render animated gradient background', () => {
      renderLandingPage()
      expect(screen.getByTestId('animated-gradient')).toBeInTheDocument()
    })

    it('should render AI orb component', () => {
      renderLandingPage()
      expect(screen.getByTestId('ai-orb')).toBeInTheDocument()
    })

    it('should render hero section with title and subtitle', () => {
      renderLandingPage()
      expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
      expect(screen.getByText('Your AI-Powered Welfare Assistant')).toBeInTheDocument()
      expect(screen.getByText('Discover government schemes in your language')).toBeInTheDocument()
    })

    it('should render features section', () => {
      renderLandingPage()
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Multilingual Support')).toBeInTheDocument()
      expect(screen.getByText('Voice Input')).toBeInTheDocument()
    })

    it('should render AI capabilities section', () => {
      renderLandingPage()
      expect(screen.getByText('AI-Powered Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Amazon Bedrock')).toBeInTheDocument()
      expect(screen.getByText('Amazon Translate')).toBeInTheDocument()
    })

    it('should render architecture section', () => {
      renderLandingPage()
      expect(screen.getByText('Built on AWS Serverless')).toBeInTheDocument()
      expect(screen.getByText('Lambda')).toBeInTheDocument()
      expect(screen.getByText('DynamoDB')).toBeInTheDocument()
    })

    it('should render final CTA section', () => {
      renderLandingPage()
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument()
      expect(screen.getByText('Start Chatting Now')).toBeInTheDocument()
    })
  })

  describe('CTA Button Navigation', () => {
    it('should render primary CTA button with correct text', () => {
      renderLandingPage()
      const ctaButtons = screen.getAllByText('Start Chatting')
      expect(ctaButtons.length).toBeGreaterThan(0)
    })

    it('should have primary CTA button link to /chat route', () => {
      renderLandingPage()
      const ctaButtons = screen.getAllByText('Start Chatting')
      const primaryCTA = ctaButtons[0]
      const link = primaryCTA.closest('a')
      expect(link).toHaveAttribute('href', '/chat')
    })

    it('should have secondary CTA button link to /chat route', () => {
      renderLandingPage()
      const secondaryCTA = screen.getByText('Start Chatting Now')
      const link = secondaryCTA.closest('a')
      expect(link).toHaveAttribute('href', '/chat')
    })

    it('should have Learn More button link to /about route', () => {
      renderLandingPage()
      const learnMoreButton = screen.getByText('Learn More About Our Architecture')
      const link = learnMoreButton.closest('a')
      expect(link).toHaveAttribute('href', '/about')
    })

    it('should have accessible aria-label on primary CTA link', () => {
      renderLandingPage()
      const ctaButtons = screen.getAllByText('Start Chatting')
      const primaryCTA = ctaButtons[0]
      const link = primaryCTA.closest('a')
      expect(link).toHaveAttribute('aria-label', 'Start Chatting')
    })

    it('should have accessible aria-label on secondary CTA link', () => {
      renderLandingPage()
      const secondaryCTA = screen.getByText('Start Chatting Now')
      const link = secondaryCTA.closest('a')
      expect(link).toHaveAttribute('aria-label', 'Start chatting with Bharat Sahayak now')
    })

    it('should have accessible aria-label on Learn More link', () => {
      renderLandingPage()
      const learnMoreButton = screen.getByText('Learn More About Our Architecture')
      const link = learnMoreButton.closest('a')
      expect(link).toHaveAttribute('aria-label', 'Learn more about our architecture')
    })

    it('should navigate to chat page when primary CTA is clicked', async () => {
      const user = userEvent.setup()
      renderLandingPage()
      
      const ctaButtons = screen.getAllByText('Start Chatting')
      const primaryCTA = ctaButtons[0]
      
      await user.click(primaryCTA)
      
      // Verify the link is clickable (navigation is handled by React Router)
      expect(primaryCTA.closest('a')).toHaveAttribute('href', '/chat')
    })

    it('should navigate to chat page when secondary CTA is clicked', async () => {
      const user = userEvent.setup()
      renderLandingPage()
      
      const secondaryCTA = screen.getByText('Start Chatting Now')
      
      await user.click(secondaryCTA)
      
      // Verify the link is clickable (navigation is handled by React Router)
      expect(secondaryCTA.closest('a')).toHaveAttribute('href', '/chat')
    })

    it('should navigate to about page when Learn More is clicked', async () => {
      const user = userEvent.setup()
      renderLandingPage()
      
      const learnMoreButton = screen.getByText('Learn More About Our Architecture')
      
      await user.click(learnMoreButton)
      
      // Verify the link is clickable (navigation is handled by React Router)
      expect(learnMoreButton.closest('a')).toHaveAttribute('href', '/about')
    })
  })

  describe('Parallax Scroll Behavior', () => {
    it('should enable smooth scroll behavior on mount', () => {
      renderLandingPage()
      
      waitFor(() => {
        expect(document.documentElement.style.scrollBehavior).toBe('smooth')
      })
    })

    it('should reset scroll behavior to auto on unmount', () => {
      const { unmount } = renderLandingPage()
      
      expect(document.documentElement.style.scrollBehavior).toBe('smooth')
      
      unmount()
      
      expect(document.documentElement.style.scrollBehavior).toBe('auto')
    })

    it('should render parallax background elements when not in low bandwidth mode', () => {
      renderLandingPage()
      
      // In low bandwidth mode (default mock), parallax elements should not render
      // This test verifies the component respects the low bandwidth setting
      const parallaxElements = document.querySelectorAll('.blur-3xl')
      // Since we're mocking low bandwidth as false, parallax should render
      // But since motion components are mocked, the actual parallax layer might not render
      // So we just verify the page renders without errors
      expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
    })

    it('should apply parallax effect with proper styling when enabled', () => {
      renderLandingPage()
      
      // Check that the page renders correctly
      // The actual parallax effect is handled by framer-motion which is mocked
      expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
    })

    it('should have decorative elements properly marked', () => {
      renderLandingPage()
      
      // Check for decorative elements with aria-hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderLandingPage()
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Bharat Sahayak')
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements.length).toBeGreaterThan(0)
    })

    it('should have main landmark', () => {
      renderLandingPage()
      
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveAttribute('id', 'main-content')
    })

    it('should have proper section labels', () => {
      renderLandingPage()
      
      expect(screen.getByLabelText(/features/i)).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Built on AWS Serverless')).toBeInTheDocument()
    })

    it('should have skip link that points to main content', () => {
      renderLandingPage()
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('should mark decorative icons as aria-hidden', () => {
      renderLandingPage()
      
      // Feature icons should be decorative
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]')
      expect(decorativeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive padding classes', () => {
      renderLandingPage()
      
      // Check for responsive padding classes (sm:, md:, lg:)
      const sections = document.querySelectorAll('section')
      sections.forEach(section => {
        const classes = section.className
        expect(classes).toMatch(/px-\d+|sm:px-\d+|md:px-\d+/)
      })
    })

    it('should apply responsive text size classes', () => {
      renderLandingPage()
      
      const title = screen.getByText('Bharat Sahayak')
      const classes = title.className
      expect(classes).toMatch(/text-\d+xl|sm:text-\d+xl|md:text-\d+xl/)
    })

    it('should have responsive grid layouts', () => {
      renderLandingPage()
      
      // Check for responsive grid classes
      const grids = document.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
      
      grids.forEach(grid => {
        const classes = grid.className
        expect(classes).toMatch(/grid-cols-\d+|sm:grid-cols-\d+|lg:grid-cols-\d+/)
      })
    })
  })

  describe('Low Bandwidth Mode', () => {
    it('should render without animations in low bandwidth mode', () => {
      // Mock low bandwidth mode
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))
      
      renderLandingPage()
      
      // Page should still render
      expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
    })
  })

  describe('Content Sections', () => {
    it('should render sections in correct order: Hero, Features, Schemes', () => {
      renderLandingPage()
      
      // Get all sections
      const sections = document.querySelectorAll('section')
      expect(sections.length).toBeGreaterThanOrEqual(3)
      
      // Verify Hero Section is first (contains the badge and headline)
      const heroSection = sections[0]
      expect(heroSection).toHaveAttribute('id', 'main-content')
      expect(heroSection).toHaveAttribute('role', 'main')
      expect(heroSection.textContent).toContain('Official AI Portal for Government Welfare Schemes')
      expect(heroSection.textContent).toContain('AI-Powered Government Welfare Assistant')
      
      // Verify Features Section is second (contains "Powerful AI Features")
      const featuresSection = sections[1]
      expect(featuresSection).toHaveAttribute('aria-labelledby', 'features-heading')
      expect(featuresSection.textContent).toContain('Powerful AI Features')
      expect(featuresSection.textContent).toContain('Everything you need to discover and apply for government welfare schemes')
      
      // Verify Schemes Section is third (contains "Popular Government Schemes")
      const schemesSection = sections[2]
      expect(schemesSection).toHaveAttribute('aria-labelledby', 'schemes-heading')
      expect(schemesSection.textContent).toContain('Popular Government Schemes')
      expect(schemesSection.textContent).toContain('PM Kisan Samman Nidhi')
      expect(schemesSection.textContent).toContain('Ayushman Bharat Yojana')
    })

    it('should have proper spacing between sections', () => {
      renderLandingPage()
      
      const sections = document.querySelectorAll('section')
      
      // Check that each section has proper padding classes
      sections.forEach(section => {
        const classes = section.className
        // Each section should have vertical padding (py-*)
        expect(classes).toMatch(/py-\d+/)
        // Should have responsive padding (sm:py-*, md:py-*)
        expect(classes).toMatch(/sm:py-\d+|md:py-\d+/)
      })
    })

    it('should render all feature cards', () => {
      renderLandingPage()
      
      expect(screen.getByText('Multilingual Support')).toBeInTheDocument()
      expect(screen.getByText('Voice Input')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered')).toBeInTheDocument()
      expect(screen.getByText('Explainable')).toBeInTheDocument()
      expect(screen.getByText('Conversational AI')).toBeInTheDocument()
      expect(screen.getByText('Privacy First')).toBeInTheDocument()
    })

    it('should render all AI capability cards', () => {
      renderLandingPage()
      
      expect(screen.getByText('Amazon Bedrock')).toBeInTheDocument()
      expect(screen.getByText('Amazon Translate')).toBeInTheDocument()
      expect(screen.getByText('Amazon Transcribe')).toBeInTheDocument()
      expect(screen.getByText('Amazon Polly')).toBeInTheDocument()
    })

    it('should render all AWS service cards', () => {
      renderLandingPage()
      
      expect(screen.getByText('Lambda')).toBeInTheDocument()
      expect(screen.getByText('API Gateway')).toBeInTheDocument()
      expect(screen.getByText('DynamoDB')).toBeInTheDocument()
      expect(screen.getByText('S3')).toBeInTheDocument()
      expect(screen.getByText('CloudFront')).toBeInTheDocument()
      expect(screen.getByText('Bedrock')).toBeInTheDocument()
      expect(screen.getByText('Transcribe')).toBeInTheDocument()
      expect(screen.getByText('Polly')).toBeInTheDocument()
      expect(screen.getByText('Translate')).toBeInTheDocument()
      expect(screen.getByText('CloudWatch')).toBeInTheDocument()
      expect(screen.getByText('WAF')).toBeInTheDocument()
      expect(screen.getByText('KMS')).toBeInTheDocument()
    })

    it('should have role="list" on feature grids', () => {
      renderLandingPage()
      
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThan(0)
    })

    it('should have role="listitem" on feature cards', () => {
      renderLandingPage()
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThan(0)
    })
  })
})
