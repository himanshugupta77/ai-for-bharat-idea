import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedBackground from '../AnimatedBackground';

// Mock the child components
vi.mock('../GradientMesh', () => ({
  default: () => <div data-testid="gradient-mesh">GradientMesh</div>,
}));

vi.mock('../FloatingParticles', () => ({
  default: ({ count }: { count: number }) => (
    <div data-testid="floating-particles">FloatingParticles (count: {count})</div>
  ),
}));

// Mock useLowBandwidth hook
vi.mock('@/hooks/useLowBandwidth', () => ({
  default: () => ({ isLowBandwidth: false }),
}));

describe('AnimatedBackground Component', () => {
  it('renders with fixed positioning covering full viewport', () => {
    render(<AnimatedBackground />);
    const background = screen.getByTestId('animated-background');
    
    expect(background).toBeInTheDocument();
    expect(background).toHaveClass('fixed');
    expect(background).toHaveClass('inset-0');
    expect(background).toHaveClass('-z-10');
  });

  it('renders dark gradient base layer', () => {
    const { container } = render(<AnimatedBackground />);
    const gradientBase = container.querySelector('[style*="linear-gradient"]');
    
    expect(gradientBase).toBeInTheDocument();
    expect(gradientBase).toHaveStyle({
      background: 'linear-gradient(to bottom, #020617 0%, #0F172A 50%, #1E293B 100%)',
    });
  });

  it('integrates GradientMesh component as overlay', () => {
    render(<AnimatedBackground />);
    const gradientMesh = screen.getByTestId('gradient-mesh');
    
    expect(gradientMesh).toBeInTheDocument();
  });

  it('integrates FloatingParticles component as top layer', () => {
    render(<AnimatedBackground />);
    const particles = screen.getByTestId('floating-particles');
    
    expect(particles).toBeInTheDocument();
    expect(particles).toHaveTextContent('FloatingParticles (count: 20)');
  });

  it('applies custom className when provided', () => {
    render(<AnimatedBackground className="custom-class" />);
    const background = screen.getByTestId('animated-background');
    
    expect(background).toHaveClass('custom-class');
  });

  it('maintains correct layer order (base, mesh, particles)', () => {
    const { container } = render(<AnimatedBackground />);
    const background = container.querySelector('[data-testid="animated-background"]');
    const children = background?.children;
    
    expect(children).toHaveLength(3);
    // First child should be the gradient base
    expect(children?.[0]).toHaveStyle({
      background: 'linear-gradient(to bottom, #020617 0%, #0F172A 50%, #1E293B 100%)',
    });
    // Second child should be GradientMesh
    expect(children?.[1]).toHaveAttribute('data-testid', 'gradient-mesh');
    // Third child should be FloatingParticles
    expect(children?.[2]).toHaveAttribute('data-testid', 'floating-particles');
  });

  it('ensures background remains fixed during scroll', () => {
    render(<AnimatedBackground />);
    const background = screen.getByTestId('animated-background');
    
    // Fixed positioning ensures the background stays in place during scroll
    expect(background).toHaveClass('fixed');
    expect(background).toHaveClass('inset-0');
  });
});
