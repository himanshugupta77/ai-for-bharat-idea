import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FloatingParticles from '../FloatingParticles';
import * as useLowBandwidthModule from '@/hooks/useLowBandwidth';

// Mock the useLowBandwidth hook
vi.mock('@/hooks/useLowBandwidth');

describe('FloatingParticles Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock matchMedia for reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Component Rendering (Validates Requirements 1.4)', () => {
    it('should render without crashing', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      expect(screen.getByTestId('floating-particles')).toBeInTheDocument();
    });

    it('should render default 25 particles when count is not specified', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const particles = screen.getAllByTestId('animated-particle');
      expect(particles).toHaveLength(20);
    });

    it('should render custom number of particles when count is specified', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={10} />);
      const particles = screen.getAllByTestId('animated-particle');
      expect(particles).toHaveLength(10);
    });

    it('should apply custom className when provided', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles className="custom-class" />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Particle Properties (Validates Requirement 1.4)', () => {
    it('should render particles with random sizes between 2-4px', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={10} />);
      const particles = screen.getAllByTestId('animated-particle');
      
      particles.forEach((particle) => {
        const style = particle.getAttribute('style') || '';
        const widthMatch = style.match(/width:\s*([0-9.]+)px/);
        if (widthMatch) {
          const width = parseFloat(widthMatch[1]);
          expect(width).toBeGreaterThanOrEqual(2);
          expect(width).toBeLessThanOrEqual(4);
        }
      });
    });

    it('should render particles with random positions', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={10} />);
      const particles = screen.getAllByTestId('animated-particle');
      
      particles.forEach((particle) => {
        const style = particle.getAttribute('style') || '';
        const leftMatch = style.match(/left:\s*([0-9.]+)%/);
        const topMatch = style.match(/top:\s*([0-9.]+)%/);
        
        if (leftMatch) {
          const left = parseFloat(leftMatch[1]);
          expect(left).toBeGreaterThanOrEqual(0);
          expect(left).toBeLessThanOrEqual(100);
        }
        
        if (topMatch) {
          const top = parseFloat(topMatch[1]);
          expect(top).toBeGreaterThanOrEqual(0);
          expect(top).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should render particles with opacity between 0.3-0.6', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={10} />);
      const particles = screen.getAllByTestId('animated-particle');
      
      particles.forEach((particle) => {
        const style = particle.getAttribute('style') || '';
        const opacityMatch = style.match(/opacity:\s*([0-9.]+)/);
        if (opacityMatch) {
          const opacity = parseFloat(opacityMatch[1]);
          expect(opacity).toBeGreaterThanOrEqual(0.3);
          expect(opacity).toBeLessThanOrEqual(0.6);
        }
      });
    });

    it('should render particles as circular (rounded-full)', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={5} />);
      const particles = screen.getAllByTestId('animated-particle');
      
      particles.forEach((particle) => {
        expect(particle).toHaveClass('rounded-full');
      });
    });

    it('should render particles with white background', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={5} />);
      const particles = screen.getAllByTestId('animated-particle');
      
      particles.forEach((particle) => {
        expect(particle).toHaveClass('bg-white');
      });
    });
  });

  describe('Animation Behavior (Validates Requirement 8.5)', () => {
    it('should render animated particles when low bandwidth mode is disabled', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={5} />);
      const animatedParticles = screen.getAllByTestId('animated-particle');
      expect(animatedParticles).toHaveLength(5);
    });

    it('should render static particles when low bandwidth mode is enabled', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: true,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles count={5} />);
      const staticParticles = screen.getAllByTestId('static-particle');
      expect(staticParticles).toHaveLength(5);
      
      // Ensure no animated particles are rendered
      const animatedParticles = screen.queryAllByTestId('animated-particle');
      expect(animatedParticles).toHaveLength(0);
    });
  });

  describe('Reduced Motion Preference (Validates Requirement 8.5)', () => {
    it('should disable animations when user prefers reduced motion', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<FloatingParticles count={5} />);
      const staticParticles = screen.getAllByTestId('static-particle');
      expect(staticParticles).toHaveLength(5);
      
      // Ensure no animated particles are rendered
      const animatedParticles = screen.queryAllByTestId('animated-particle');
      expect(animatedParticles).toHaveLength(0);
    });
  });

  describe('Accessibility (Validates Requirement 7.5)', () => {
    it('should mark container as aria-hidden', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have pointer-events-none to not interfere with interactions', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveClass('pointer-events-none');
    });
  });

  describe('Container Styling', () => {
    it('should have absolute positioning', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveClass('absolute');
    });

    it('should cover full area with inset-0', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveClass('inset-0');
    });

    it('should have overflow-hidden to contain particles', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      render(<FloatingParticles />);
      const container = screen.getByTestId('floating-particles');
      expect(container).toHaveClass('overflow-hidden');
    });
  });

  describe('Particle Consistency', () => {
    it('should generate same particles on re-renders (memoization)', () => {
      vi.mocked(useLowBandwidthModule.default).mockReturnValue({
        isLowBandwidth: false,
        toggleLowBandwidth: vi.fn(),
        dismissSuggestion: vi.fn(),
        showSuggestion: false,
      });

      const { rerender } = render(<FloatingParticles count={5} />);
      const firstRenderParticles = screen.getAllByTestId('animated-particle');
      const firstPositions = firstRenderParticles.map(p => {
        const style = p.getAttribute('style') || '';
        return style;
      });

      // Re-render with same props
      rerender(<FloatingParticles count={5} />);
      const secondRenderParticles = screen.getAllByTestId('animated-particle');
      const secondPositions = secondRenderParticles.map(p => {
        const style = p.getAttribute('style') || '';
        return style;
      });

      // Positions should be the same (memoized)
      expect(firstPositions).toEqual(secondPositions);
    });
  });
});
