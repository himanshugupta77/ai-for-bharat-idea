# Custom Hooks Unit Tests

This directory contains unit tests for custom React hooks used in the Bharat Sahayak frontend.

## Test Coverage

### useSession.test.ts
Tests for session management functionality:
- Session initialization from localStorage
- Session ID generation and persistence
- Session clearing and regeneration
- Session expiration checking via API
- Session deletion via API
- Error handling for API failures

### useLanguage.test.ts
Tests for language switching functionality:
- Language initialization from localStorage
- Default language (English) when no preference stored
- Language switching across all 11 supported languages
- Persistence to localStorage
- Document language attribute updates
- Language state across re-renders and remounts

### useTheme.test.ts
Tests for dark mode theme toggling:
- Theme initialization from localStorage
- System preference detection via matchMedia
- Theme toggling between light and dark modes
- Dark class management on document root
- Persistence to localStorage
- Theme state across re-renders and remounts

## Running Tests

### Install Dependencies
```bash
cd frontend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test
```

### Run Tests Once (CI Mode)
```bash
npm run test:run
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests with UI
```bash
npm run test:ui
```

## Test Framework

- **Vitest**: Fast unit test framework for Vite projects
- **React Testing Library**: Testing utilities for React hooks
- **jsdom**: DOM implementation for Node.js environment

## Requirements Validated

These tests validate **Requirement 6.1** from the requirements document:
- Session management maintains conversation context
- Language switching works correctly across all supported languages
- Theme toggling persists user preferences

## Test Structure

Each test file follows this structure:
1. **Setup**: Mock dependencies and clear state before each test
2. **Initialization Tests**: Verify correct initial state
3. **Functionality Tests**: Test core hook behavior
4. **Persistence Tests**: Verify localStorage integration
5. **Edge Cases**: Handle error conditions and rapid changes

## Mocking Strategy

- **localStorage**: Mocked in test setup to avoid side effects
- **matchMedia**: Mocked for system preference detection
- **API calls**: Mocked using Vitest's `vi.mock()` for useSession tests
- **Helper functions**: Mocked to control ID generation

## Coverage Goals

- Line coverage: > 90%
- Branch coverage: > 85%
- Function coverage: > 90%

## Adding New Tests

When adding new custom hooks:
1. Create a new test file: `use[HookName].test.ts`
2. Follow the existing test structure
3. Mock external dependencies
4. Test initialization, functionality, persistence, and edge cases
5. Update this README with the new test coverage
