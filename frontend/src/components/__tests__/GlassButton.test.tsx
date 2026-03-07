import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlassButton } from '../GlassButton';

describe('GlassButton Component', () => {
  it('renders children correctly', () => {
    render(<GlassButton>Click Me</GlassButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('defaults to secondary variant', () => {
    render(<GlassButton>Secondary Button</GlassButton>);
    const button = screen.getByText('Secondary Button');
    expect(button.className).toContain('backdrop-blur-lg');
    expect(button.className).toContain('bg-white/10');
  });

  it('renders primary variant with gradient background', () => {
    render(<GlassButton variant="primary">Primary Button</GlassButton>);
    const button = screen.getByText('Primary Button');
    expect(button.className).toContain('bg-gradient-to-r');
    expect(button.className).toContain('from-[#FF7A18]');
    expect(button.className).toContain('via-[#22C55E]');
    expect(button.className).toContain('to-[#38BDF8]');
  });

  it('renders secondary variant with glassmorphism', () => {
    render(<GlassButton variant="secondary">Secondary Button</GlassButton>);
    const button = screen.getByText('Secondary Button');
    expect(button.className).toContain('backdrop-blur-lg');
    expect(button.className).toContain('bg-white/10');
  });

  it('applies hover scale effect', () => {
    render(<GlassButton>Hover Me</GlassButton>);
    const button = screen.getByText('Hover Me');
    expect(button.className).toContain('hover:scale-105');
  });

  it('applies enhanced glow on primary variant hover', () => {
    render(<GlassButton variant="primary">Primary Button</GlassButton>);
    const button = screen.getByText('Primary Button');
    expect(button.className).toContain('hover:shadow-[0_0_40px_rgba(255,122,24,0.6)]');
  });

  it('has 300ms transition duration', () => {
    render(<GlassButton>Transition Button</GlassButton>);
    const button = screen.getByText('Transition Button');
    expect(button.className).toContain('duration-300');
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<GlassButton onClick={handleClick}>Click Me</GlassButton>);
    
    const button = screen.getByText('Click Me');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<GlassButton onClick={handleClick} disabled>Disabled Button</GlassButton>);
    
    const button = screen.getByText('Disabled Button');
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styles when disabled', () => {
    render(<GlassButton disabled>Disabled Button</GlassButton>);
    const button = screen.getByText('Disabled Button');
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
  });

  it('supports keyboard interaction with Enter key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<GlassButton onClick={handleClick}>Keyboard Button</GlassButton>);
    
    const button = screen.getByText('Keyboard Button');
    button.focus();
    await user.keyboard('{Enter}');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard interaction with Space key', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<GlassButton onClick={handleClick}>Keyboard Button</GlassButton>);
    
    const button = screen.getByText('Keyboard Button');
    button.focus();
    await user.keyboard(' ');
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<GlassButton className="custom-class">Custom Button</GlassButton>);
    const button = screen.getByText('Custom Button');
    expect(button.className).toContain('custom-class');
  });

  it('supports different button types', () => {
    render(<GlassButton type="submit">Submit Button</GlassButton>);
    const button = screen.getByText('Submit Button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
