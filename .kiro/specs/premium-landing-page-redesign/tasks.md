# Implementation Plan: Premium Landing Page Redesign

## Overview

This implementation plan breaks down the premium landing page redesign into actionable coding tasks. The redesign transforms the current landing page into a dark, futuristic interface with glassmorphism effects, smooth animations, and modern typography using React, TypeScript, Tailwind CSS, and Framer Motion. All tasks build incrementally, with each phase validating functionality before moving forward.

## Tasks

- [ ] 1. Foundation - Update Tailwind configuration and global styles
  - [x] 1.1 Extend Tailwind config with dark color palette and custom animations
    - Add dark slate colors (#020617, #0F172A, #1E293B)
    - Add accent colors (saffron #FF7A18, green #22C55E, blue #38BDF8)
    - Add custom animations (gradient-mesh, float, glow-pulse, rotate-slow, particle-float)
    - Add custom keyframes for all animations
    - _Requirements: 1.1, 1.2, 7.1_

  - [x] 1.2 Update global CSS with glassmorphism utilities and typography
    - Add glass-dark, glass-glow, gradient-text CSS classes
    - Add premium-badge styling
    - Import Inter font from Google Fonts
    - Add typography classes (hero-headline, section-heading, card-title, body-large)
    - Add @supports fallback for backdrop-filter
    - Add prefers-reduced-motion media query
    - _Requirements: 2.4, 5.4, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.7_

- [ ] 2. Foundation - Create new background components
  - [x] 2.1 Create GradientMesh component with animated glowing gradients
    - Implement TypeScript component with GradientMeshProps interface
    - Create multiple overlapping gradient circles using saffron, green, and blue
    - Add Framer Motion animation for slow continuous movement
    - Apply heavy blur for soft glow effect
    - Respect low bandwidth mode to disable animations
    - _Requirements: 1.2, 1.3, 8.5_

  - [x] 2.2 Create FloatingParticles component with random particle system
    - Implement TypeScript component with FloatingParticlesProps interface (count, className)
    - Generate configurable number of particles (default 25)
    - Randomize particle sizes (2-4px), positions, and opacity
    - Add Framer Motion floating animation with random delays
    - Respect low bandwidth mode to disable animations
    - _Requirements: 1.4, 8.5_

  - [x] 2.3 Create AnimatedBackground component combining gradient and particles
    - Implement TypeScript component with AnimatedBackgroundProps interface
    - Use fixed positioning covering full viewport
    - Layer dark gradient base (#020617 → #0F172A → #1E293B)
    - Integrate GradientMesh as overlay
    - Integrate FloatingParticles as top layer
    - Ensure background remains fixed during scroll
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Foundation - Create Navbar component
  - [x] 3.1 Implement Navbar component with glassmorphism styling
    - Create TypeScript component with NavbarProps interface
    - Add sticky positioning with backdrop blur
    - Display "Bharat Sahayak" logo text on left
    - Add navigation menu items: Home, Schemes, Eligibility Checker, Chat Assistant, About
    - Integrate existing language selector on right
    - Apply glassmorphism styling (backdrop-blur-xl, bg-slate-950/30, border-white/10)
    - Add responsive hamburger menu for mobile viewports
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 9.6_

  - [x] 3.2 Add hover animations to Navbar menu items
    - Implement CSS underline animation on hover using ::after pseudo-element
    - Use gradient colors for underline (saffron to green)
    - Add 300ms transition duration
    - _Requirements: 2.5, 8.3_

  - [ ]* 3.3 Write unit tests for Navbar component
    - Test logo text rendering
    - Test all menu items present
    - Test language selector integration
    - Test hover underline animation
    - Test responsive hamburger menu on mobile
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 9.6_

- [ ] 4. Foundation - Enhance existing components
  - [x] 4.1 Enhance AIOrb component with premium animations
    - Update gradient to mix saffron, green, and blue colors
    - Add continuous rotation animation (360° over 20 seconds)
    - Add floating motion animation (±30px over 4 seconds)
    - Enhance glow effect with multiple shadow layers
    - Add particle emission effects
    - Respect low bandwidth mode to disable animations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.5_

  - [x] 4.2 Enhance GlassButton component with gradient variant
    - Add gradient background option for primary CTA buttons
    - Enhance glow effect on hover (scale 1.05x, increased shadow)
    - Add smooth 300ms transitions
    - Create primary and secondary variants
    - _Requirements: 3.5, 3.6, 3.7, 8.3_

  - [x] 4.3 Create FeatureCard component with glassmorphism
    - Implement TypeScript component with FeatureCardProps interface (icon, title, description)
    - Use GlassCard as base component
    - Add padding (p-6) and border radius (rounded-2xl)
    - Implement hover lift animation (-4px translateY)
    - Add glow border effect on hover
    - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 4.4 Enhance SchemeCard component with gradient lighting
    - Add gradient lighting effects
    - Enhance hover animations
    - Integrate icon display
    - Improve typography hierarchy
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ]* 4.5 Write unit tests for enhanced components
    - Test AIOrb gradient colors and animations
    - Test AIOrb respects low bandwidth mode
    - Test GlassButton variants and hover effects
    - Test FeatureCard rendering and hover lift
    - Test SchemeCard gradient and hover effects
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.5_

- [x] 5. Checkpoint - Ensure all foundation components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Landing Page - Redesign Hero Section
  - [x] 6.1 Implement two-column Hero Section layout
    - Create responsive grid layout (single column mobile, two columns desktop)
    - Add left column for text content
    - Add right column for AI Orb visual
    - Ensure proper spacing and alignment
    - _Requirements: 3.1, 3.8, 9.1, 9.2, 9.3, 9.4_

  - [x] 6.2 Add Hero Section content elements
    - Create badge component with text "Official AI Portal for Government Welfare Schemes"
    - Add headline "AI-Powered Government Welfare Assistant" with gradient text effect
    - Add subtext "Find the right government schemes instantly using AI, voice support, and multilingual assistance."
    - Apply hero-headline typography class to headline
    - Apply body-large typography class to subtext
    - _Requirements: 3.2, 3.3, 3.4, 7.2, 7.3_

  - [x] 6.3 Add Hero Section CTA buttons
    - Create primary button "Start Chatting" with gradient background
    - Create secondary button "Explore Schemes" with transparent style
    - Position buttons horizontally with spacing
    - Integrate enhanced GlassButton component
    - _Requirements: 3.5, 3.6, 3.7_

  - [x] 6.4 Add Hero Section animations
    - Implement Framer Motion fade-in animation for hero content
    - Add staggered timing for badge, headline, subtext, and buttons
    - Use initial opacity 0, y: 20 with animate to opacity 1, y: 0
    - Set duration to 600ms with easeOut easing
    - Stagger children by 100ms with 200ms delay
    - _Requirements: 8.1, 8.2_

  - [x] 6.5 Integrate AI Orb in Hero Section right column
    - Position enhanced AIOrb component in right column
    - Ensure proper sizing and centering
    - Verify animations work smoothly
    - _Requirements: 4.5_

  - [ ]* 6.6 Write unit tests for Hero Section
    - Test two-column layout on desktop
    - Test single-column layout on mobile
    - Test badge text rendering
    - Test headline text rendering
    - Test subtext rendering
    - Test both CTA buttons present
    - Test fade-in animations trigger
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 8.2_

- [ ] 7. Landing Page - Redesign Features Section
  - [x] 7.1 Implement Features Section layout and header
    - Create section container with proper spacing
    - Add title "Powerful AI Features" with section-heading class
    - Add subtitle "Everything you need to discover and apply for government welfare schemes"
    - Center align header text
    - _Requirements: 5.1, 5.2_

  - [x] 7.2 Create responsive features grid
    - Implement CSS Grid layout
    - Single column on mobile (< 768px)
    - Two columns on tablet (768px - 1023px)
    - Four columns on desktop (≥ 1024px)
    - Add consistent gap spacing (1.5rem mobile, 2rem desktop)
    - _Requirements: 5.9, 9.1, 9.2, 9.3, 9.5_

  - [x] 7.3 Add four feature cards with content
    - Create FeatureCard for "AI Chatbot" with icon and description
    - Create FeatureCard for "Smart Eligibility Checker" with icon and description
    - Create FeatureCard for "Voice Assistant" with icon and description
    - Create FeatureCard for "Multilingual Support" with icon and description
    - Ensure all cards use FeatureCard component
    - _Requirements: 5.3, 5.8_

  - [x] 7.4 Add scroll-triggered animations to Features Section
    - Implement Framer Motion whileInView animation
    - Use initial opacity 0, y: 30 with whileInView opacity 1, y: 0
    - Set viewport once: true with -100px margin
    - Add 600ms duration
    - _Requirements: 8.1, 8.4_

  - [ ]* 7.5 Write unit tests for Features Section
    - Test section title and subtitle rendering
    - Test all four feature cards present
    - Test grid layout at different breakpoints
    - Test scroll-triggered animations
    - _Requirements: 5.1, 5.2, 5.3, 9.5_

- [ ] 8. Landing Page - Redesign Schemes Section
  - [x] 8.1 Implement Schemes Section layout and header
    - Create section container with proper spacing
    - Add title "Popular Government Schemes" with section-heading class
    - Center align header text
    - _Requirements: 6.1_

  - [x] 8.2 Create responsive schemes grid and add scheme cards
    - Implement responsive grid layout (single column mobile, multi-column desktop)
    - Create SchemeCard for "PM Kisan Samman Nidhi" with icon and description
    - Create SchemeCard for "Ayushman Bharat Yojana" with icon and description
    - Ensure proper spacing between cards
    - _Requirements: 6.2, 6.6, 9.1, 9.2, 9.3_

  - [x] 8.3 Add scroll-triggered animations to Schemes Section
    - Implement Framer Motion whileInView animation
    - Use same animation pattern as Features Section
    - _Requirements: 8.1_

  - [ ]* 8.4 Write unit tests for Schemes Section
    - Test section title rendering
    - Test both scheme cards present
    - Test responsive grid layout
    - Test scroll-triggered animations
    - _Requirements: 6.1, 6.2, 6.6_

- [x] 9. Checkpoint - Ensure landing page sections render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration - Wire components together in App
  - [x] 10.1 Integrate Navbar into App.tsx
    - Import and add Navbar component at top of App
    - Ensure Navbar appears above all other content
    - Verify sticky positioning works during scroll
    - _Requirements: 2.7_

  - [x] 10.2 Integrate AnimatedBackground into LandingPage
    - Import and add AnimatedBackground as first element in LandingPage
    - Ensure background covers full viewport
    - Verify background remains fixed during scroll
    - _Requirements: 1.5_

  - [x] 10.3 Verify all sections render in correct order
    - Ensure Hero Section appears first
    - Ensure Features Section appears second
    - Ensure Schemes Section appears third
    - Verify proper spacing between sections
    - _Requirements: 3.1, 5.1, 6.1_

  - [ ]* 10.4 Write integration tests for full landing page
    - Test complete page renders without errors
    - Test all sections visible
    - Test navigation between sections
    - Test responsive behavior across breakpoints
    - _Requirements: 9.1, 9.2, 9.3, 9.7_

- [ ] 11. Polish - Implement accessibility features
  - [x] 11.1 Add keyboard navigation support
    - Ensure all interactive elements accessible via Tab
    - Add skip to main content link
    - Implement arrow key navigation for navbar menu
    - Add visible focus indicators (2px solid orange with 2px offset)
    - _Requirements: 7.5_

  - [x] 11.2 Add ARIA labels and semantic HTML
    - Use semantic HTML elements (nav, main, section, article)
    - Add ARIA labels for icon-only buttons
    - Add ARIA live regions for dynamic content
    - Add descriptive alt text for visual elements
    - _Requirements: 7.5_

  - [x] 11.3 Verify color contrast meets WCAG AA standards
    - Test white text on slate-950 background (target 19.5:1)
    - Test light gray text on slate-950 background (target 12.6:1)
    - Ensure all text meets minimum 4.5:1 ratio (3:1 for large text)
    - _Requirements: 7.5_

  - [ ]* 11.4 Run automated accessibility audit
    - Use axe-core to check for accessibility violations
    - Fix any violations found
    - Verify keyboard navigation works correctly
    - Test with screen reader (manual verification recommended)
    - _Requirements: 7.5_

- [ ] 12. Polish - Optimize animations and performance
  - [x] 12.1 Implement low bandwidth mode checks
    - Ensure all animated components check useLowBandwidth hook
    - Disable animations when low bandwidth mode enabled
    - Provide static fallback rendering
    - _Requirements: 8.5_

  - [x] 12.2 Add prefers-reduced-motion support
    - Check window.matchMedia for prefers-reduced-motion
    - Disable animations when user preference set
    - Ensure functionality maintained without animations
    - _Requirements: 8.7_

  - [x] 12.3 Optimize animation performance
    - Use hardware-accelerated properties (transform, opacity)
    - Limit concurrent animations
    - Implement lazy loading for non-critical animations
    - Verify animations maintain smooth performance
    - _Requirements: 4.6, 8.7_

  - [ ]* 12.4 Run performance tests
    - Measure FPS during scroll and animations
    - Verify animations maintain close to 60fps
    - Test on various devices and browsers
    - _Requirements: 4.6, 8.7_

- [ ] 13. Testing - Implement property-based tests
  - [ ]* 13.1 Write property test for text contrast accessibility
    - **Property 1: Text Contrast Accessibility**
    - **Validates: Requirements 7.5**
    - Use fast-check to test all text elements
    - Verify contrast ratio meets WCAG AA (4.5:1 normal, 3:1 large)
    - Test across all text element types (headline, subtext, card text, button text, navbar)
    - Run 100+ iterations

  - [ ]* 13.2 Write property test for responsive layout adaptation
    - **Property 2: Responsive Layout Adaptation**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
    - Use fast-check to test viewport widths from 320px to 2560px
    - Verify single-column layout below 768px
    - Verify multi-column layouts at 768px and above
    - Ensure all content remains accessible
    - Run 100+ iterations

  - [ ]* 13.3 Write property test for interactive element feedback
    - **Property 3: Interactive Element Feedback**
    - **Validates: Requirements 2.5, 3.7, 5.7, 6.5, 8.3, 8.4**
    - Use fast-check to test all interactive elements (buttons, cards, menu items)
    - Verify visual feedback on hover/focus within 300ms
    - Check for scale, glow, lift, or underline animations
    - Run 100+ iterations

  - [ ]* 13.4 Write property test for glassmorphism consistency
    - **Property 4: Glassmorphism Consistency**
    - **Validates: Requirements 2.4, 5.4, 6.3**
    - Use fast-check to test all glass components (navbar, cards, buttons)
    - Verify backdrop blur present
    - Verify semi-transparent background
    - Verify subtle border present
    - Run 100+ iterations

  - [ ]* 13.5 Write property test for animation respect of low bandwidth mode
    - **Property 5: Animation Respect for Low Bandwidth Mode**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**
    - Use fast-check to test with low bandwidth mode enabled/disabled
    - Verify animations disabled when mode enabled
    - Verify animations work when mode disabled
    - Run 100+ iterations

  - [ ]* 13.6 Write property test for existing feature preservation
    - **Property 6: Existing Feature Preservation**
    - **Validates: Requirements 10.6**
    - Use fast-check to test existing features (chat, eligibility, language, routing)
    - Compare behavior before/after redesign
    - Verify same inputs produce same outputs
    - Run 100+ iterations

- [ ] 14. Testing - Run comprehensive test suite
  - [ ]* 14.1 Run all unit tests and verify coverage
    - Execute unit test suite
    - Verify 85%+ code coverage
    - Fix any failing tests
    - _Requirements: All_

  - [ ]* 14.2 Run all property tests and verify properties hold
    - Execute all 6 property tests
    - Verify each runs 100+ iterations
    - Fix any property violations
    - _Requirements: 7.5, 9.1-9.5, 2.5, 3.7, 5.7, 6.5, 8.2-8.5, 10.6_

  - [ ]* 14.3 Run cross-browser integration tests
    - Test in Chrome, Firefox, and Safari
    - Verify visual consistency across browsers
    - Test animations and interactions
    - Fix any browser-specific issues
    - _Requirements: All_

  - [ ]* 14.4 Run accessibility audit
    - Execute axe-core automated tests
    - Verify zero accessibility violations
    - Test keyboard navigation manually
    - Verify WCAG AA compliance
    - _Requirements: 7.5_

- [x] 15. Final Checkpoint - Verify all requirements met
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Deployment - Prepare for production
  - [x] 16.1 Verify backend preservation
    - Confirm no backend code files modified
    - Confirm no API endpoints changed
    - Confirm chatbot functionality unchanged
    - Confirm application routes unchanged
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 16.2 Optimize production build
    - Run production build
    - Verify code splitting works correctly
    - Check bundle sizes are reasonable
    - Test lazy loading of animations
    - _Requirements: 8.7_

  - [ ]* 16.3 Run final smoke tests
    - Test all user flows work correctly
    - Verify responsive design on real devices
    - Test performance on various network conditions
    - Verify low bandwidth mode works correctly
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- All animations respect low bandwidth mode and prefers-reduced-motion settings
- The redesign is frontend-only and preserves all existing backend functionality
