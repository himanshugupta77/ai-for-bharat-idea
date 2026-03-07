import { useState, useRef, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSelector } from './LanguageSelector';
import useLowBandwidth from '@/hooks/useLowBandwidth';

export interface NavbarProps {
  className?: string;
}

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Schemes', path: '/schemes' },
  { label: 'Eligibility Checker', path: '/eligibility' },
  { label: 'Chat Assistant', path: '/chat' },
  { label: 'About', path: '/about' },
];

export function Navbar({ className = '' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLowBandwidth } = useLowBandwidth();
  const menuItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Check for user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  const isActive = (path: string) => location.pathname === path;

  // Handle arrow key navigation for menu items
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % menuItems.length;
      menuItemRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
      menuItemRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      menuItemRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = menuItems.length - 1;
      menuItemRefs.current[lastIndex]?.focus();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 h-16 backdrop-blur-xl bg-slate-950/30 border-b border-white/10 ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-white hover:text-orange-400 transition-colors duration-300"
          onClick={closeMobileMenu}
        >
          Bharat Sahayak
        </Link>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex items-center space-x-8" role="menubar">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              ref={(el) => (menuItemRefs.current[index] = el)}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative text-sm font-medium transition-colors duration-300 menu-item focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                isActive(item.path)
                  ? 'text-white active'
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side: Language Selector + Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <LanguageSelector />

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-white hover:text-orange-400 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={shouldAnimate ? { opacity: 0, height: 0 } : {}}
            animate={shouldAnimate ? { opacity: 1, height: 'auto' } : {}}
            exit={shouldAnimate ? { opacity: 0, height: 0 } : {}}
            transition={{ duration: 0.3 }}
            className="lg:hidden backdrop-blur-xl bg-slate-950/95 border-b border-white/10"
          >
            <div className="container mx-auto px-6 py-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-orange-500/20 to-green-500/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .menu-item {
          position: relative;
        }
        
        .menu-item::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #FF7A18, #22C55E);
          transition: width 0.3s ease;
        }
        
        .menu-item:hover::after,
        .menu-item.active::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}
