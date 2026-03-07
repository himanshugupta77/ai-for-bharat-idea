# Page Component Unit Tests

This directory contains unit tests for page components in the Bharat Sahayak frontend.

## Test Coverage

### LandingPage.test.tsx
Tests for the landing page functionality:
- **Page Rendering**: Verifies all sections render correctly (hero, features, AI capabilities, architecture, CTA)
- **CTA Button Navigation**: Tests navigation links to /chat and /about routes with proper aria-labels
- **Parallax Scroll Behavior**: Tests smooth scroll behavior on mount/unmount and parallax background elements
- **Accessibility**: Tests heading hierarchy, landmarks, skip links, and ARIA attributes
- **Responsive Design**: Tests responsive padding, text sizes, and grid layouts
- **Low Bandwidth Mode**: Tests rendering without animations in low bandwidth mode
- **Content Sections**: Tests all feature cards, AI capability cards, and AWS service cards

## Requirements Validated

These tests validate **Requirement 11.6** from the requirements document:
- Landing page renders with animated gradient background
- Floating AI orb displays correctly
- Feature sections explain capabilities
- Architecture transparency section shows AWS services
- Parallax scrolling effects work properly
- CTA buttons navigate to correct routes

## Running Tests

### Run Landing Page Tests Only
```bash
npm test LandingPage
```

### Run All Page Tests
```bash
npm test pages
```

### Run Tests in Watch Mode
```bash
npm test -- --watch pages
```

### Run Tests with Coverage
```bash
npm run test:coverage -- pages
```

## Test Structure

Each page test file follows this structure:
1. **Setup**: Mock dependencies (framer-motion, i18next, custom hooks, components)
2. **Page Rendering Tests**: Verify all sections and components render
3. **Navigation Tests**: Test CTA buttons and links
4. **Behavior Tests**: Test interactive features (parallax, animations)
5. **Accessibility Tests**: Verify WCAG compliance
6. **Responsive Tests**: Test responsive design classes
7. **Content Tests**: Verify all content sections display correctly

## Mocking Strategy

### Framer Motion
- Mocked to avoid animation issues in tests
- `motion.div` and `motion.h2` render as regular HTML elements
- `useScroll` and `useTransform` return static values

### React i18next
- Mocked with a translation function that returns predefined strings
- Covers all translation keys used in the landing page

### Custom Hooks
- `useLowBandwidth`: Mocked to return `{ isLowBandwidth: false }` by default
- Can be overridden for low bandwidth mode tests

### Components
- `AIOrb`, `AnimatedGradient`, `GlassButton`, `GlassCard`: Mocked with simple implementations
- Preserves data attributes for testing

## Coverage Goals

- Line coverage: > 90%
- Branch coverage: > 85%
- Function coverage: > 90%

## Key Test Cases

### CTA Button Navigation
- ✅ Primary CTA links to /chat
- ✅ Secondary CTA links to /chat
- ✅ Learn More button links to /about
- ✅ All links have proper aria-labels
- ✅ Links are clickable and navigable

### Parallax Scroll Behavior
- ✅ Smooth scroll enabled on mount
- ✅ Scroll behavior reset on unmount
- ✅ Parallax background elements render
- ✅ Decorative elements marked as aria-hidden

### Accessibility
- ✅ Proper heading hierarchy (h1, h2, h3, h4)
- ✅ Main landmark with id="main-content"
- ✅ Skip to main content link
- ✅ Section labels with aria-labelledby
- ✅ Decorative icons marked as aria-hidden
- ✅ Role="list" and role="listitem" for feature grids

## Adding New Page Tests

When adding new page components:
1. Create a new test file: `[PageName].test.tsx`
2. Follow the existing test structure
3. Mock external dependencies (framer-motion, i18next, hooks, components)
4. Test rendering, navigation, behavior, accessibility, and content
5. Update this README with the new test coverage

## Notes

- Tests use React Testing Library for component testing
- Vitest is the test runner
- User interactions tested with @testing-library/user-event
- Navigation tested by verifying href attributes (React Router handles actual navigation)
- Parallax effects tested by checking scroll behavior and element presence
