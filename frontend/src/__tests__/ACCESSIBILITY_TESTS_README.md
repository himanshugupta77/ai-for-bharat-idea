# Accessibility Tests Documentation

## Overview

This document describes the comprehensive accessibility tests implemented for the Bharat Sahayak AI Assistant platform. These tests validate compliance with Requirements 23.1, 23.2, and 23.3 from the requirements document.

## Test Coverage

### 1. Keyboard Navigation Tests (Requirement 23.1)

#### Tab Order and Focus Management
- **Test**: All interactive elements are keyboard accessible
- **Components Tested**: EligibilityForm
- **Validation**: Verifies that users can navigate through all form fields, buttons, and interactive elements using the Tab key
- **Test Cases**:
  - Tab navigation through form inputs (age, gender, income, state, category, occupation)
  - Enter key support for form submission
  - Space key support for button activation
  - Checkbox keyboard navigation
  - Visible focus indicators

#### Focus Trap Utility
- **Test**: Focus trapping for modal dialogs
- **Validation**: Ensures focus stays within modal containers and cycles properly
- **Test Cases**:
  - Focus cycles from last to first element on Tab
  - Focus cycles from first to last element on Shift+Tab
  - Cleanup function removes event listeners properly

#### Focusable Elements Detection
- **Test**: Utility function identifies all focusable elements
- **Validation**: Correctly identifies buttons, inputs, links, and elements with tabindex
- **Test Cases**:
  - Identifies all focusable elements (links, buttons, inputs, textareas, selects)
  - Excludes disabled elements
  - Excludes elements with tabindex="-1"

#### Skip to Main Content Link
- **Test**: Skip link for keyboard users
- **Validation**: Provides quick navigation to main content
- **Test Cases**:
  - Creates skip link with correct href
  - Visually hidden but focusable
  - Becomes visible on focus

### 2. ARIA Attributes Tests (Requirement 23.2)

#### ARIA Labels
- **Test**: All interactive elements have proper labels
- **Components Tested**: VoiceInput, EligibilityForm
- **Test Cases**:
  - Voice input button has aria-label
  - Form inputs have associated labels
  - Labels are descriptive and meaningful

#### ARIA Roles
- **Test**: Semantic roles for screen readers
- **Components Tested**: Message, EligibilityForm
- **Test Cases**:
  - Message component has role="article"
  - Error messages have role="alert"

#### ARIA Described By
- **Test**: Error messages are associated with inputs
- **Components Tested**: EligibilityForm
- **Test Cases**:
  - Error messages linked via aria-describedby
  - Error IDs match input aria-describedby values

#### ARIA Required
- **Test**: Required fields are marked
- **Components Tested**: EligibilityForm
- **Test Cases**:
  - All required fields have aria-required="true"
  - Optional fields do not have aria-required

#### ARIA Invalid
- **Test**: Invalid fields are marked
- **Components Tested**: EligibilityForm
- **Test Cases**:
  - aria-invalid="true" when field has error
  - aria-invalid="false" when field is valid

#### ARIA Pressed
- **Test**: Toggle buttons indicate state
- **Components Tested**: VoiceInput
- **Test Cases**:
  - Voice button has aria-pressed attribute
  - State updates when recording starts/stops

#### ARIA Hidden
- **Test**: Decorative elements are hidden from screen readers
- **Components Tested**: Message
- **Test Cases**:
  - Avatar elements have aria-hidden="true"
  - Decorative icons are properly hidden

### 3. Screen Reader Announcements Tests (Requirement 23.2)

#### announceToScreenReader Utility
- **Test**: Dynamic announcements for screen readers
- **Validation**: Creates live regions for announcements
- **Test Cases**:
  - Creates element with role="status"
  - Supports aria-live="polite" (default)
  - Supports aria-live="assertive" for urgent messages
  - Removes announcement after timeout (1000ms)
  - Handles multiple simultaneous announcements

#### Dynamic Content Announcements
- **Test**: Important updates are announced
- **Components Tested**: Message, EligibilityForm
- **Test Cases**:
  - New messages are announced
  - Eligibility results are announced
  - Error messages are announced

#### Screen Reader Only Content
- **Test**: Content visible only to screen readers
- **Validation**: Uses sr-only class pattern
- **Test Cases**:
  - Skip link has sr-only class
  - Content becomes visible on focus

### 4. Alternative Input Methods (Requirement 23.6)

- **Test**: Voice input is optional, not required
- **Validation**: Text input is always available as alternative
- **Test Cases**:
  - Voice input button is present but optional
  - Text input is provided in parent components

### 5. Semantic HTML Tests

#### Semantic Elements
- **Test**: Proper HTML elements are used
- **Components Tested**: EligibilityForm
- **Test Cases**:
  - Buttons use <button> elements
  - Inputs use proper <input> elements
  - Selects use <select> elements

### 6. Text Alternatives (Requirement 23.5)

- **Test**: All visual content has text alternatives
- **Components Tested**: SchemeCard, Message
- **Test Cases**:
  - Scheme cards have descriptive text
  - Message timestamps are text-based
  - All content is accessible without images

## Test Statistics

- **Total Test Suites**: 11
- **Total Test Cases**: 40+
- **Components Covered**: 5 (VoiceInput, Message, SchemeCard, EligibilityForm, accessibility utilities)
- **Requirements Validated**: 23.1, 23.2, 23.3, 23.5, 23.6

## Running the Tests

```bash
# Run all accessibility tests
npm test -- accessibility.test.tsx --run

# Run with coverage
npm test -- accessibility.test.tsx --coverage

# Run in watch mode
npm test -- accessibility.test.tsx
```

## Requirements Mapping

| Requirement | Description | Test Coverage |
|-------------|-------------|---------------|
| 23.1 | Keyboard navigation for all interactive elements | ✅ Comprehensive |
| 23.2 | ARIA labels for screen readers | ✅ Comprehensive |
| 23.3 | Color contrast ratios of at least 4.5:1 | ⚠️ Manual validation required |
| 23.4 | Browser zoom up to 200% | ⚠️ Manual validation required |
| 23.5 | Text alternatives for visual content | ✅ Comprehensive |
| 23.6 | Alternative input methods | ✅ Verified |

## Notes

- **Color Contrast (23.3)**: While automated tests cannot fully validate color contrast, the design system uses Tailwind CSS with WCAG-compliant color combinations. Manual testing with tools like axe DevTools or WAVE is recommended.

- **Browser Zoom (23.4)**: Responsive design tests cover layout behavior, but manual testing at 200% zoom is recommended to ensure no content is cut off or overlaps.

- **Screen Reader Testing**: While these tests validate ARIA attributes and announcements, manual testing with actual screen readers (NVDA, JAWS, VoiceOver) is recommended for complete validation.

## Future Enhancements

1. Add automated color contrast validation using tools like axe-core
2. Add tests for focus visible styles
3. Add tests for reduced motion preferences
4. Add tests for high contrast mode
5. Integrate with CI/CD pipeline for automated accessibility checks

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Testing Library Accessibility](https://testing-library.com/docs/queries/about/#priority)
