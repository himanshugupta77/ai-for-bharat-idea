# Chat Interface Integration Tests

This document describes the integration tests for the ChatPage component, covering the complete user flows for messaging, voice input, and scheme card interactions.

## Test Coverage

### 1. Message Sending and Receiving (Requirements 6.1, 6.2, 12.1)

Tests the complete flow of sending text messages and receiving AI responses:

- **Basic message flow**: User types message → sends → receives response
- **Scheme card display**: Responses with scheme recommendations display cards
- **Error handling**: Network errors and API failures are handled gracefully
- **Input validation**: Empty messages and over-limit messages are prevented
- **Keyboard shortcuts**: Enter key sends messages (Shift+Enter for new line)
- **Conversation context**: Multiple messages maintain conversation history

### 2. Voice Input Flow (Requirements 6.1, 6.2, 12.1)

Tests the voice input functionality:

- **Voice transcript population**: Voice input populates the text field
- **Voice to message**: Voice transcript can be sent as a message
- **Error handling**: Microphone access errors are handled gracefully
- **User feedback**: Success and error toasts are displayed

### 3. Scheme Card Interactions (Requirements 6.1, 6.2, 12.1)

Tests scheme card display and interactions:

- **Card display**: Scheme cards show all required information
- **Multiple cards**: Multiple scheme cards can be displayed in one response
- **Accessibility**: Screen reader announcements for scheme recommendations
- **Information completeness**: Name, description, eligibility, and steps are shown

### 4. Loading States

Tests loading indicators and disabled states:

- **Typing indicator**: Shows while waiting for AI response
- **Button states**: Send button is disabled during loading
- **Shimmer loading**: Loading shimmer appears for long operations

### 5. Session Management

Tests session lifecycle:

- **Session clearing**: Clear button removes all messages
- **Expiration warnings**: Session expiration warnings are displayed
- **Toast notifications**: Success messages for session operations

### 6. Accessibility

Tests accessibility features:

- **ARIA labels**: Proper labels and roles for screen readers
- **Screen reader announcements**: New messages are announced
- **Skip links**: Skip to main content link is present
- **Keyboard navigation**: All interactive elements are keyboard accessible

### 7. Empty State

Tests the initial state before any messages:

- **Empty state display**: Shows helpful message when no messages exist
- **State transition**: Empty state disappears after first message

## Running the Tests

```bash
# Run all tests
npm test

# Run only integration tests
npm test ChatPage.integration

# Run with coverage
npm test:coverage

# Run with UI
npm test:ui
```

## Test Structure

Each test follows this pattern:

1. **Setup**: Mock API responses and dependencies
2. **Render**: Render the ChatPage component
3. **Act**: Simulate user interactions (typing, clicking, etc.)
4. **Assert**: Verify expected outcomes (DOM updates, API calls, etc.)

## Mocking Strategy

### API Mocking
- `api.chat()` - Mocked to return controlled responses
- `api.voiceToText()` - Mocked for voice input tests

### Component Mocking
- `VoiceInput` - Simplified to trigger callbacks
- `Message` - Simplified to display message content
- `SchemeCard` - Simplified to show scheme information
- `framer-motion` - Mocked to avoid animation issues in tests

### Hook Mocking
- `useSession` - Returns test session ID
- `useLanguage` - Returns English language
- `useLowBandwidth` - Returns false (normal bandwidth)
- `useVoiceInput` - Returns mock recording functions

## Key Test Utilities

### User Event
Uses `@testing-library/user-event` for realistic user interactions:
- `user.type()` - Simulates typing
- `user.click()` - Simulates clicking
- `user.keyboard()` - Simulates keyboard shortcuts

### Async Testing
Uses `waitFor()` for asynchronous operations:
- Waiting for API responses
- Waiting for DOM updates
- Waiting for animations to complete

### Custom Matchers
Uses `@testing-library/jest-dom` matchers:
- `toBeInTheDocument()` - Element exists in DOM
- `toHaveValue()` - Input has specific value
- `toBeDisabled()` - Element is disabled
- `toHaveAttribute()` - Element has specific attribute

## Test Data

### Mock Messages
```typescript
const mockMessage: Message = {
  id: 'msg-123',
  role: 'user',
  content: 'Test message',
  timestamp: Date.now(),
}
```

### Mock Schemes
```typescript
const mockScheme: SchemeCard = {
  id: 'pm-kisan',
  name: 'PM-KISAN',
  description: 'Income support for farmers',
  eligibilitySummary: 'Small and marginal farmers',
  applicationSteps: ['Visit portal', 'Register'],
}
```

### Mock API Responses
```typescript
const mockResponse = {
  response: 'AI response text',
  language: 'en',
  schemes: [mockScheme],
  sessionId: 'test-session-id',
}
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `waitFor()` options
- Check if API mocks are properly configured
- Verify async operations are awaited

### Elements Not Found
- Check if component mocks are correct
- Verify element selectors (text, role, testid)
- Use `screen.debug()` to inspect DOM

### Flaky Tests
- Avoid testing animation timing
- Use `waitFor()` for async operations
- Mock time-dependent functions

## Future Enhancements

1. **E2E Tests**: Add Playwright/Cypress tests for full browser testing
2. **Visual Regression**: Add screenshot comparison tests
3. **Performance Tests**: Add tests for render performance
4. **Network Conditions**: Test with simulated slow/offline networks
5. **Internationalization**: Test with different languages

## Related Files

- `ChatPage.tsx` - Main component being tested
- `VoiceInput.tsx` - Voice input component
- `Message.tsx` - Message display component
- `SchemeCard.tsx` - Scheme card component
- `useSession.ts` - Session management hook
- `api.ts` - API client utilities

## Requirements Traceability

| Requirement | Test Coverage |
|-------------|---------------|
| 6.1 - Session context | Message sending, conversation history |
| 6.2 - Follow-up questions | Multiple message flow |
| 12.1 - Chat interface | All message and input tests |
| 12.2 - Text and voice input | Voice input flow tests |
| 12.3 - Loading states | Shimmer and typing indicator tests |
| 12.4 - Typing indicator | Typing indicator display tests |
| 12.5 - Scheme cards | Scheme card display tests |
| 12.6 - Message animations | Message rendering tests |

## Maintenance

- Update tests when API contracts change
- Add tests for new features
- Keep mocks in sync with actual implementations
- Review test coverage regularly
- Update documentation when test patterns change
