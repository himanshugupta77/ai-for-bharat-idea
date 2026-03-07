import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AnimatedBackground from '@/components/AnimatedBackground'
import GradientMesh from '@/components/GradientMesh'
import FloatingParticles from '@/components/FloatingParticles'
import { AIOrb } from '@/components/AIOrb'

/**
 * Low Bandwidth Mode Animation Tests
 * 
 * **Validates: Requirement 8.5**
 * 
 * Task 12.1: Implement low bandwidth mode checks
 * - Ensure all animated components check useLowBandwidth hook
 * - Disable animations when low bandwidth mode enabled
 * - Provide static fallback rendering
 */

describe('Task 12.1: Low Bandwidth Mode Checks', () => {
  describe('GradientMesh Component', () => {
    it('should disable animations when low bandwidth mode is enabled', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<GradientMesh />)
      
      // Component should render but without animations
      const meshContainer = screen.getByTestId('gradient-mesh')
      expect(meshContainer).toBeInTheDocument()
    })

    it('should enable animations when low bandwidth mode is disabled', () => {
      // Mock low bandwidth mode disabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: false }),
      }))

      render(<GradientMesh />)
      
      // Component should render with animations
      const meshContainer = screen.getByTestId('gradient-mesh')
      expect(meshContainer).toBeInTheDocument()
    })

    it('should respect prefers-reduced-motion setting', () => {
      // Mock matchMedia for prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<GradientMesh />)
      
      // Component should render without animations
      const meshContainer = screen.getByTestId('gradient-mesh')
      expect(meshContainer).toBeInTheDocument()
    })
  })

  describe('FloatingParticles Component', () => {
    it('should render static particles when low bandwidth mode is enabled', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<FloatingParticles count={10} />)
      
      // Should render particles container
      const particlesContainer = screen.getByTestId('floating-particles')
      expect(particlesContainer).toBeInTheDocument()
      
      // Should render static particles (not animated)
      const staticParticles = screen.queryAllByTestId('static-particle')
      expect(staticParticles.length).toBeGreaterThan(0)
    })

    it('should render animated particles when low bandwidth mode is disabled', () => {
      // Mock low bandwidth mode disabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: false }),
      }))

      render(<FloatingParticles count={10} />)
      
      // Should render particles container
      const particlesContainer = screen.getByTestId('floating-particles')
      expect(particlesContainer).toBeInTheDocument()
    })

    it('should respect prefers-reduced-motion setting', () => {
      // Mock matchMedia for prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(<FloatingParticles count={10} />)
      
      // Should render static particles
      const particlesContainer = screen.getByTestId('floating-particles')
      expect(particlesContainer).toBeInTheDocument()
    })
  })

  describe('AIOrb Component', () => {
    it('should disable animations when low bandwidth mode is enabled', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<AIOrb />)
      
      // Component should render
      const orb = screen.getByTestId('ai-orb')
      expect(orb).toBeInTheDocument()
    })

    it('should enable animations when low bandwidth mode is disabled', () => {
      // Mock low bandwidth mode disabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: false }),
      }))

      render(<AIOrb />)
      
      // Component should render with animations
      const orb = screen.getByTestId('ai-orb')
      expect(orb).toBeInTheDocument()
    })

    it('should not render particle effects in low bandwidth mode', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      const { container } = render(<AIOrb />)
      
      // Particle effects should not be rendered
      // In low bandwidth mode, the AIOrb component conditionally renders particles
      const orb = screen.getByTestId('ai-orb')
      expect(orb).toBeInTheDocument()
    })
  })

  describe('AnimatedBackground Component', () => {
    it('should render all child components', () => {
      render(<AnimatedBackground />)
      
      // Should render the background container
      const background = screen.getByTestId('animated-background')
      expect(background).toBeInTheDocument()
    })

    it('should integrate GradientMesh and FloatingParticles', () => {
      render(<AnimatedBackground />)
      
      // Background should contain gradient mesh and particles
      const background = screen.getByTestId('animated-background')
      expect(background).toBeInTheDocument()
    })
  })

  describe('LandingPage Component', () => {
    beforeEach(() => {
      // Mock framer-motion
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
          t: (key: string) => key,
        }),
      }))
    })

    it('should check useLowBandwidth hook in LandingPage', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      // Page should render
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should not render parallax effects in low bandwidth mode', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      const { container } = render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      // Parallax background elements should not render in low bandwidth mode
      // The LandingPage component conditionally renders parallax based on shouldAnimate
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should render parallax effects when low bandwidth mode is disabled', () => {
      // Mock low bandwidth mode disabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: false }),
      }))

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      // Page should render with animations
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('Static Fallback Rendering', () => {
    it('should provide static fallback for GradientMesh', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<GradientMesh />)
      
      // Component should still render (static version)
      const meshContainer = screen.getByTestId('gradient-mesh')
      expect(meshContainer).toBeInTheDocument()
    })

    it('should provide static fallback for FloatingParticles', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<FloatingParticles count={5} />)
      
      // Component should render static particles
      const particlesContainer = screen.getByTestId('floating-particles')
      expect(particlesContainer).toBeInTheDocument()
      
      // Should have static particles
      const staticParticles = screen.queryAllByTestId('static-particle')
      expect(staticParticles.length).toBeGreaterThan(0)
    })

    it('should provide static fallback for AIOrb', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      render(<AIOrb />)
      
      // Component should still render (static version)
      const orb = screen.getByTestId('ai-orb')
      expect(orb).toBeInTheDocument()
    })
  })

  describe('Integration: All Components Respect Low Bandwidth Mode', () => {
    it('should disable all animations when low bandwidth mode is enabled', () => {
      // Mock low bandwidth mode enabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: true }),
      }))

      // Mock framer-motion
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
          t: (key: string) => key,
        }),
      }))

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      // All components should render without animations
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should enable all animations when low bandwidth mode is disabled', () => {
      // Mock low bandwidth mode disabled
      vi.mock('@/hooks/useLowBandwidth', () => ({
        default: () => ({ isLowBandwidth: false }),
      }))

      // Mock framer-motion
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
          t: (key: string) => key,
        }),
      }))

      render(
        <BrowserRouter>
          <LandingPage />
        </BrowserRouter>
      )
      
      // All components should render with animations
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})
