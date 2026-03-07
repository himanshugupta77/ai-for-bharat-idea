import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureCard } from '../FeatureCard';

// Mock the useLowBandwidth hook
vi.mock('../../hooks/useLowBandwidth', () => ({
  default: () => ({ isLowBandwidth: false }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, transition, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('FeatureCard Component', () => {
  beforeEach(() => {
    // Reset matchMedia mock
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

  it('renders with icon, title, and description', () => {
    render(
      <FeatureCard
        icon="🤖"
        title="AI Chatbot"
        description="Get instant answers to your questions"
      />
    );

    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText('AI Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Get instant answers to your questions')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
        className="custom-class"
      />
    );

    const glassCard = container.querySelector('.custom-class');
    expect(glassCard).toBeInTheDocument();
  });

  it('has padding p-6', () => {
    const { container } = render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
      />
    );

    const glassCard = container.querySelector('.p-6');
    expect(glassCard).toBeInTheDocument();
  });

  it('has rounded-2xl border radius', () => {
    const { container } = render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
      />
    );

    const glassCard = container.querySelector('.rounded-2xl');
    expect(glassCard).toBeInTheDocument();
  });

  it('displays icon with correct size', () => {
    render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
      />
    );

    const icon = screen.getByText('🤖');
    expect(icon).toHaveClass('text-4xl');
  });

  it('displays title with correct styling', () => {
    render(
      <FeatureCard
        icon="🤖"
        title="Test Title"
        description="Test description"
      />
    );

    const title = screen.getByText('Test Title');
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-white');
  });

  it('displays description with correct styling', () => {
    render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
      />
    );

    const description = screen.getByText('Test description');
    expect(description.tagName).toBe('P');
    expect(description).toHaveClass('text-gray-300', 'text-sm', 'leading-relaxed');
  });

  it('uses GlassCard as base component', () => {
    const { container } = render(
      <FeatureCard
        icon="🤖"
        title="Test"
        description="Test description"
      />
    );

    // GlassCard has backdrop-blur-lg class
    const glassCard = container.querySelector('.backdrop-blur-lg');
    expect(glassCard).toBeInTheDocument();
  });
});
