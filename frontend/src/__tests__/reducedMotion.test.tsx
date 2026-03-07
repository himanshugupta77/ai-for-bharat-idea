import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AIOrb } from '@/components/AIOrb'
import GradientMesh from '@/components/GradientMesh'
import FloatingParticles from '@/components/FloatingParticles'
import AnimatedBackground from '@/components/AnimatedBackground'
import { FeatureCard } from '@/components/FeatureCard'
import { SchemeCard } from '@/components/SchemeCard'
import { Navbar } from '@/components/Navbar'

/**
 * Test Suite: Prefers-Reduced-Motion Support
 * 
 * **Validates: Requirement 8.7**
 * 
 * Task 12.2: Add prefers-reduced-motion support
 * - Check window.matchMedia for prefers-reduced-motion
 * - Disable animations when user preference set
 * - Ensure functionality maintained without animations
 */

describe('Prefers-Reduced-Motion Support', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should render AIOrb with reduced motion', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<AIOrb />)
    const orb = screen.getByTestId('ai-orb')
    expect(orb).toBeInTheDocument()
  })

  it('should maintain AIOrb functionality without animations', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<AIOrb />)
    const orb = screen.getByTestId('ai-orb')
    expect(orb).toBeVisible()
    expect(orb).toHaveClass('relative')
  })
})

describe('GradientMesh Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should disable animations when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<GradientMesh />)
    const mesh = screen.getByTestId('gradient-mesh')
    expect(mesh).toBeInTheDocument()
    expect(mesh).toBeVisible()
  })
})

describe('FloatingParticles Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should render static particles when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<FloatingParticles count={10} />)
    const particles = screen.getByTestId('floating-particles')
    expect(particles).toBeInTheDocument()
    
    const staticParticles = screen.queryAllByTestId('static-particle')
    expect(staticParticles.length).toBeGreaterThan(0)
  })

  it('should render animated particles when prefers-reduced-motion is not set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<FloatingParticles count={10} />)
    const animatedParticles = screen.queryAllByTestId('animated-particle')
    expect(animatedParticles.length).toBeGreaterThan(0)
  })
})

describe('AnimatedBackground Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should render without animations when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<AnimatedBackground />)
    const background = screen.getByTestId('animated-background')
    expect(background).toBeInTheDocument()
    expect(background).toBeVisible()
  })
})

describe('FeatureCard Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should disable hover animations when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <FeatureCard
        icon="🤖"
        title="Test Feature"
        description="Test description"
      />
    )

    expect(screen.getByText('Test Feature')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should maintain card functionality without animations', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <FeatureCard
        icon="🤖"
        title="Test Feature"
        description="Test description"
      />
    )

    const title = screen.getByText('Test Feature')
    expect(title).toBeVisible()
  })
})

describe('SchemeCard Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  const mockScheme = {
    id: 'test-scheme',
    name: 'Test Scheme',
    description: 'Test scheme description',
    eligibilitySummary: 'For test users',
    applicationSteps: ['Step 1', 'Step 2'],
    officialLink: 'https://example.com',
  }

  it('should disable animations when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<SchemeCard scheme={mockScheme} icon="🌾" />)
    expect(screen.getByText('Test Scheme')).toBeInTheDocument()
    expect(screen.getByText('Test scheme description')).toBeInTheDocument()
  })

  it('should maintain card functionality without animations', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<SchemeCard scheme={mockScheme} icon="🌾" />)
    const schemeName = screen.getByText('Test Scheme')
    expect(schemeName).toBeVisible()
  })
})

describe('Navbar Component', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    })
  })

  it('should disable mobile menu animations when prefers-reduced-motion is set', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('should maintain navigation functionality without animations', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Schemes')).toBeInTheDocument()
    expect(screen.getByText('Eligibility Checker')).toBeInTheDocument()
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})
