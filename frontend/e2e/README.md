# End-to-End Tests

## Overview

Comprehensive E2E tests for the Bharat Sahayak AI Assistant platform using Playwright. These tests validate complete user flows across all critical features.

## Test Suites

### 1. Chat Flow (`chat-flow.spec.ts`)
Tests the complete chat interaction flow from text input to scheme recommendations.

**Coverage:**
- ✅ Complete chat flow (text input → response → scheme recommendation)
- ✅ Multiple messages in conversation
- ✅ Error handling on API failure
- ✅ Character limit enforcement
- ✅ Auto-scroll to latest message

**Requirements Validated:** 24.1, 24.2

### 2. Voice Input Flow (`voice-flow.spec.ts`)
Tests voice recording, transcription, and response generation.

**Coverage:**
- ✅ Complete voice input flow (record → transcribe → response)
- ✅ Waveform animation during recording
- ✅ Error handling for transcription failures
- ✅ Silence detection and auto-stop
- ✅ Audio quality feedback
- ✅ Microphone permission handling

**Requirements Validated:** 24.1, 24.2

### 3. Eligibility Check Flow (`eligibility-flow.spec.ts`)
Tests the eligibility form submission and result display.

**Coverage:**
- ✅ Complete eligibility check (form → result)
- ✅ Eligible user result display
- ✅ Not eligible result with explanations
- ✅ Form validation
- ✅ Conditional fields based on scheme
- ✅ API error handling
- ✅ Multiple scheme eligibility checks

**Requirements Validated:** 24.1, 24.3

### 4. Language Switching (`language-switching.spec.ts`)
Tests language switching across all features and pages.

**Coverage:**
- ✅ Language selector on all pages
- ✅ Language switching and persistence
- ✅ UI element translation
- ✅ Chat interface translation
- ✅ Messages in selected language
- ✅ Scheme card translation
- ✅ Eligibility form translation
- ✅ Error message translation
- ✅ Font loading for Indian languages
- ✅ All 11 languages supported
- ✅ Language persistence across navigation

**Requirements Validated:** 24.1, 24.2

### 5. Mode Toggles (`mode-toggles.spec.ts`)
Tests dark mode and low bandwidth mode functionality.

**Coverage:**

**Dark Mode:**
- ✅ Toggle dark mode
- ✅ Persist dark mode preference
- ✅ Apply dark mode styles to all components
- ✅ Update glassmorphism effects
- ✅ Maintain dark mode across pages

**Low Bandwidth Mode:**
- ✅ Toggle low bandwidth mode
- ✅ Disable animations
- ✅ Reduce image quality
- ✅ Use compressed audio
- ✅ Lazy load non-critical resources
- ✅ Persist low bandwidth preference
- ✅ Auto-detect slow connection
- ✅ Disable parallax effects
- ✅ Maintain mode across pages

**Combined:**
- ✅ Support both modes simultaneously

**Requirements Validated:** 24.1, 24.3

## Running Tests

### Prerequisites

```bash
# Install dependencies
cd frontend
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/chat-flow.spec.ts

# Run specific test
npx playwright test -g "should complete full chat flow"
```

### Run Tests in Different Browsers

```bash
# Run in Chromium only
npx playwright test --project=chromium

# Run in Firefox only
npx playwright test --project=firefox

# Run in WebKit (Safari) only
npx playwright test --project=webkit

# Run in mobile browsers
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Debug Tests

```bash
# Run in debug mode
npx playwright test --debug

# Run specific test in debug mode
npx playwright test e2e/chat-flow.spec.ts --debug

# Show test report
npx playwright show-report
```

### CI/CD Integration

```bash
# Run tests in CI mode (with retries)
CI=true npm run test:e2e
```

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Base URL:** `http://localhost:5173` (dev server)
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Edge
- **Retries:** 2 on CI, 0 locally
- **Timeout:** 10s per action, 30s per navigation
- **Reporters:** HTML, List, JSON
- **Screenshots:** On failure
- **Videos:** On failure
- **Traces:** On first retry

## Test Data

Tests use the following test data attributes:

- `data-testid="chat-input"` - Chat input field
- `data-testid="send-button"` - Send message button
- `data-testid="voice-input-button"` - Voice input button
- `data-testid="scheme-card"` - Scheme recommendation card
- `data-testid="check-eligibility-button"` - Check eligibility button
- `data-testid="eligibility-form"` - Eligibility form
- `data-testid="language-selector"` - Language selector dropdown
- `data-testid="dark-mode-toggle"` - Dark mode toggle
- `data-testid="low-bandwidth-toggle"` - Low bandwidth mode toggle

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** using `expect().toBeVisible()` instead of fixed timeouts
3. **Mock API calls** when testing error scenarios
4. **Test user flows** end-to-end, not individual components
5. **Verify visual feedback** (animations, loading states, error messages)
6. **Test accessibility** (keyboard navigation, ARIA attributes)
7. **Test across browsers** to ensure cross-browser compatibility
8. **Keep tests independent** - each test should be able to run in isolation

## Troubleshooting

### Tests Failing Locally

1. Ensure dev server is running: `npm run dev`
2. Check if port 5173 is available
3. Clear browser cache: `npx playwright clean`
4. Update Playwright: `npx playwright install`

### Tests Timing Out

1. Increase timeout in `playwright.config.ts`
2. Check network conditions
3. Verify API endpoints are responding
4. Check for infinite loading states

### Element Not Found

1. Verify `data-testid` attributes exist in components
2. Check if element is conditionally rendered
3. Wait for element to be visible before interacting
4. Use `page.locator().first()` if multiple elements match

## Coverage

**Total E2E Tests:** 50+

**User Flows Covered:**
- ✅ Complete chat flow
- ✅ Voice input flow
- ✅ Eligibility check flow
- ✅ Language switching
- ✅ Dark mode
- ✅ Low bandwidth mode

**Requirements Validated:**
- ✅ Requirement 24.1: Complete chat flow
- ✅ Requirement 24.2: Voice input flow
- ✅ Requirement 24.3: Eligibility check flow

## Continuous Integration

E2E tests run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds

Results are published to:
- GitHub Actions artifacts
- Test report dashboard
- Slack notifications (on failure)

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance testing (Lighthouse CI)
- [ ] Accessibility testing (axe-core)
- [ ] API contract testing
- [ ] Load testing with k6
- [ ] Cross-device testing (BrowserStack)
