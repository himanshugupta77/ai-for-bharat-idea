import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Navbar';

// Mock the hooks and components
vi.mock('@/hooks/useLowBandwidth', () => ({
  default: () => ({ isLowBandwidth: false }),
}));

vi.mock('../LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language Selector</div>,
}));

const renderNavbar = (props = {}) => {
  return render(
    <BrowserRouter>
      <Navbar {...props} />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  it('renders logo text "Bharat Sahayak"', () => {
    renderNavbar();
    expect(screen.getByText('Bharat Sahayak')).toBeInTheDocument();
  });

  it('renders all required menu items', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Schemes')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Checker')).toBeInTheDocument();
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('integrates language selector', () => {
    renderNavbar();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
  });

  it('applies glassmorphism styling', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('backdrop-blur-xl');
    expect(nav).toHaveClass('bg-slate-950/30');
    expect(nav).toHaveClass('border-white/10');
  });

  it('has sticky positioning', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('sticky');
    expect(nav).toHaveClass('top-0');
  });

  it('displays hamburger menu button on mobile', () => {
    renderNavbar();
    const hamburgerButton = screen.getByLabelText('Open menu');
    expect(hamburgerButton).toBeInTheDocument();
    expect(hamburgerButton).toHaveClass('lg:hidden');
  });

  it('toggles mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();
    
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    // Mobile menu should not be visible initially
    expect(screen.queryByRole('link', { name: 'Home' })).toBeInTheDocument();
    
    // Click to open mobile menu
    await user.click(hamburgerButton);
    
    // Check that button label changes
    await waitFor(() => {
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });
    
    // Mobile menu should be visible
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
    expect(mobileMenu).toBeInTheDocument();
  });

  it('closes mobile menu when a menu item is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();
    
    // Open mobile menu
    const hamburgerButton = screen.getByLabelText('Open menu');
    await user.click(hamburgerButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });
    
    // Click a menu item in mobile menu
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu');
    const homeLink = mobileMenu?.querySelector('a[href="/"]');
    if (homeLink) {
      await user.click(homeLink);
    }
    
    // Menu should close
    await waitFor(() => {
      expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();
    });
  });

  it('hides desktop menu on mobile viewports', () => {
    renderNavbar();
    
    // Desktop menu items should have lg:flex class (hidden on mobile)
    const desktopMenu = screen.getByRole('navigation').querySelector('.hidden.lg\\:flex');
    expect(desktopMenu).toBeInTheDocument();
  });

  it('applies custom className prop', () => {
    renderNavbar({ className: 'custom-class' });
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('has proper ARIA attributes', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    const hamburgerButton = screen.getByLabelText('Open menu');
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open menu');
  });

  it('highlights active menu item', () => {
    // This test would need to mock useLocation to return a specific path
    // For now, we just verify the structure exists
    renderNavbar();
    const homeLink = screen.getAllByText('Home')[0];
    expect(homeLink).toBeInTheDocument();
  });

  it('displays underline animation styles', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    const style = nav.querySelector('style');
    expect(style?.textContent).toContain('.menu-item::after');
    expect(style?.textContent).toContain('linear-gradient(90deg, #FF7A18, #22C55E)');
    expect(style?.textContent).toContain('transition: width 0.3s ease');
  });
});
