import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders Navbar component', () => {
    render(<App />);
    
    // Check if Navbar is present by looking for the logo
    const logo = screen.getByText('Bharat Sahayak');
    expect(logo).toBeInTheDocument();
  });

  it('renders Navbar above page content', () => {
    const { container } = render(<App />);
    
    // Check if nav element exists with sticky positioning
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('sticky');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('z-50');
  });
});
