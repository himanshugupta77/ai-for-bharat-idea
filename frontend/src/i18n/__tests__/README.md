# Internationalization (i18n) Tests

This directory contains comprehensive tests for the internationalization functionality of the Bharat Sahayak platform.

## Test Coverage

### 1. i18n Configuration Tests (`i18n.test.ts`)

Tests the core i18n configuration and translation loading:

- **Translation Loading** (7 tests)
  - Verifies all 11 supported languages are loaded
  - Checks translation resources exist for each language
  - Validates common, landing page, chat, and error message translations
  - Tests fallback behavior for missing translations

- **Language Switching** (14 tests)
  - Tests switching to each of the 11 supported languages
  - Verifies language persistence in localStorage
  - Tests rapid language switching
  - Validates language loading from localStorage on init

- **Translation Interpolation** (2 tests)
  - Tests variable interpolation in translations
  - Handles missing interpolation variables gracefully

- **Namespace Support** (2 tests)
  - Tests nested translation keys
  - Validates deeply nested key structures

- **Language Detection** (3 tests)
  - Verifies language detector configuration
  - Tests localStorage as primary detection method
  - Validates correct localStorage key usage

- **Fallback Behavior** (2 tests)
  - Confirms English as fallback language
  - Tests fallback when keys are missing

- **Translation Completeness** (1 test)
  - Ensures core keys exist across all languages

**Total: 31 tests**

### 2. LanguageSelector Component Tests (`../components/__tests__/LanguageSelector.test.tsx`)

Tests the language selector UI component:

- **Rendering** (5 tests)
  - Button rendering and display
  - Current language display
  - ARIA attributes
  - Initial dropdown state

- **Dropdown Interaction** (7 tests)
  - Opening and closing dropdown
  - Displaying all 11 languages
  - Language name display
  - Current language highlighting
  - Checkmark display

- **Language Selection** (2 tests)
  - setLanguage callback invocation
  - Dropdown closure after selection

- **Keyboard Navigation** (2 tests)
  - Escape key to close dropdown
  - Other keys don't close dropdown

- **Click Outside** (2 tests)
  - Closes dropdown when clicking outside
  - Keeps dropdown open when clicking inside

- **Accessibility** (3 tests)
  - Proper role attributes
  - Option roles
  - Screen reader support

- **Visual Feedback** (3 tests)
  - Arrow icon rotation
  - Hover styles
  - Gradient background for selected language

- **Dark Mode Support** (1 test)
  - Dark mode class application

- **Animation** (1 test)
  - Dropdown entrance animation

**Total: 26 tests**

### 3. Font Rendering Tests (`../../__tests__/font-rendering.test.ts`)

Tests font loading and rendering for Indian languages:

- **Font Loading** (12 tests)
  - Verifies correct font for each language
  - Inter for English
  - Noto Sans Devanagari for Hindi and Marathi
  - Noto Sans Tamil for Tamil
  - Noto Sans Telugu for Telugu
  - Noto Sans Bengali for Bengali
  - Noto Sans Gujarati for Gujarati
  - Noto Sans Kannada for Kannada
  - Noto Sans Malayalam for Malayalam
  - Noto Sans Gurmukhi for Punjabi
  - Noto Sans Oriya for Odia

- **Font Display Property** (2 tests)
  - font-display: swap for performance
  - Font weights (400, 500, 600, 700)

- **Font Fallbacks** (2 tests)
  - System font fallbacks
  - sans-serif as final fallback

- **Language-Specific Font Application** (9 tests)
  - Correct font for each Indian language
  - Unicode range validation

- **Unicode Support** (4 tests)
  - Devanagari Unicode range (U+0900 to U+097F)
  - Tamil Unicode range (U+0B80 to U+0BFF)
  - Telugu Unicode range (U+0C00 to U+0C7F)
  - Bengali Unicode range (U+0980 to U+09FF)

- **Font Performance** (2 tests)
  - font-display swap to prevent FOIT
  - Font preloading

- **Document Language Attribute** (3 tests)
  - lang attribute setting
  - lang attribute updates
  - Valid BCP 47 language tags

- **RTL Support** (2 tests)
  - No RTL for Indian languages
  - LTR direction maintenance

- **Font Loading Strategy** (2 tests)
  - Asynchronous font loading
  - Font caching

- **Accessibility** (3 tests)
  - Readable font sizes
  - Browser zoom support
  - Contrast with background

**Total: 41 tests**

## Requirements Validation

These tests validate the following requirements from the spec:

- **Requirement 22.1**: THE Platform SHALL support language detection and switching
  - Validated by language switching tests
  - Validated by LanguageSelector component tests
  - Validated by language detection tests

- **Requirement 22.2**: THE Platform SHALL translate all static UI text in 11 supported languages
  - Validated by translation loading tests
  - Validated by translation completeness tests
  - Validated by font rendering tests

## Running the Tests

Run all i18n tests:
```bash
npm test -- i18n.test.ts LanguageSelector.test.tsx font-rendering.test.ts --run
```

Run individual test suites:
```bash
# i18n configuration tests
npm test -- i18n.test.ts --run

# LanguageSelector component tests
npm test -- LanguageSelector.test.tsx --run

# Font rendering tests
npm test -- font-rendering.test.ts --run
```

## Test Statistics

- **Total Test Files**: 3
- **Total Tests**: 98
- **Pass Rate**: 100%

## Supported Languages

The tests cover all 11 supported languages:

1. English (en)
2. Hindi (hi) - हिन्दी
3. Marathi (mr) - मराठी
4. Tamil (ta) - தமிழ்
5. Telugu (te) - తెలుగు
6. Bengali (bn) - বাংলা
7. Gujarati (gu) - ગુજરાતી
8. Kannada (kn) - ಕನ್ನಡ
9. Malayalam (ml) - മലയാളം
10. Punjabi (pa) - ਪੰਜਾਬੀ
11. Odia (or) - ଓଡ଼ିଆ

## Key Features Tested

1. **Language Switching**: Users can switch between all 11 languages
2. **Translation Loading**: All translations are loaded correctly
3. **Font Rendering**: Appropriate fonts are loaded for each language
4. **Persistence**: Language preference is saved in localStorage
5. **Accessibility**: Proper ARIA attributes and screen reader support
6. **Performance**: Fonts use display:swap for optimal loading
7. **Unicode Support**: All Indian language scripts are properly supported
8. **Fallback Behavior**: Missing translations fall back to English
9. **UI Components**: LanguageSelector component works correctly
10. **Dark Mode**: Language selector supports dark mode

## Notes

- Tests use Vitest as the testing framework
- React Testing Library is used for component tests
- All tests follow the AAA pattern (Arrange, Act, Assert)
- Tests are isolated and can run independently
- Mock implementations are used for hooks and i18n where needed
