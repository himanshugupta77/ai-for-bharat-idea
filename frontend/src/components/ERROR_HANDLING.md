# Error Handling and User Feedback

This document describes the comprehensive error handling and user feedback mechanisms implemented for the Bharat Sahayak AI Assistant frontend.

## Overview

Task 19 implements three main components:
1. **Error Boundaries** - Catch React errors and display user-friendly messages
2. **API Error Handling** - Handle network errors with retry logic and connection monitoring
3. **User Feedback** - Toast notifications and progress indicators

## Components

### 1. ErrorBoundary

**Location**: `frontend/src/components/ErrorBoundary.tsx`

**Purpose**: Catches JavaScript errors anywhere in the React component tree and displays a fallback UI.

**Features**:
- Catches and logs React errors
- Displays user-friendly error message
- Shows error details in development mode
- Provides "Try Again" and "Go to Home" actions
- Accessible with ARIA labels

**Usage**:
```tsx
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

**Requirements**: 20.1, 20.2

---

### 2. ConnectionIndicator

**Location**: `frontend/src/components/ConnectionIndicator.tsx`

**Purpose**: Shows a banner when the user is offline or has a slow connection.

**Features**:
- Monitors online/offline status
- Detects slow connections using Network Information API
- Shows appropriate message for each state
- Accessible with ARIA live regions

**Usage**:
```tsx
import { ConnectionIndicator } from './components/ConnectionIndicator'

function App() {
  return (
    <>
      <ConnectionIndicator />
      <YourApp />
    </>
  )
}
```

**Requirements**: 20.3, 20.4

---

### 3. Toast Notifications

**Location**: `frontend/src/components/Toast.tsx`

**Purpose**: Display temporary notification messages for user feedback.

**Features**:
- Four types: success, error, warning, info
- Auto-dismiss after configurable duration
- Smooth entrance/exit animations
- Accessible with ARIA live regions
- Stacked notifications support

**Usage**:
```tsx
import { useToastContext } from '../contexts/ToastContext'

function MyComponent() {
  const toast = useToastContext()

  const handleSuccess = () => {
    toast.success('Operation completed successfully!')
  }

  const handleError = () => {
    toast.error('An error occurred. Please try again.')
  }

  const handleWarning = () => {
    toast.warning('This action cannot be undone.')
  }

  const handleInfo = () => {
    toast.info('New features are available.')
  }

  return (
    <button onClick={handleSuccess}>Show Toast</button>
  )
}
```

**Requirements**: 20.5

---

### 4. Progress Indicators

**Location**: `frontend/src/components/ProgressIndicator.tsx`

**Purpose**: Show loading states for async operations.

**Features**:
- Determinate progress (with percentage)
- Indeterminate progress (spinner)
- Inline variant for compact spaces
- Accessible with ARIA attributes

**Usage**:
```tsx
import { ProgressIndicator, InlineProgressIndicator } from './components/ProgressIndicator'

// Determinate progress
<ProgressIndicator
  isLoading={true}
  message="Processing your request"
  progress={75}
/>

// Indeterminate progress
<ProgressIndicator
  isLoading={true}
  message="Loading data"
/>

// Inline progress
<InlineProgressIndicator message="Saving changes" />
```

**Requirements**: 20.5

---

## Hooks

### useNetworkStatus

**Location**: `frontend/src/hooks/useNetworkStatus.ts`

**Purpose**: Monitor network connection status.

**Returns**:
```typescript
{
  isOnline: boolean
  isSlowConnection: boolean
  effectiveType?: string
}
```

**Usage**:
```tsx
import { useNetworkStatus } from '../hooks/useNetworkStatus'

function MyComponent() {
  const { isOnline, isSlowConnection } = useNetworkStatus()

  if (!isOnline) {
    return <div>You are offline</div>
  }

  if (isSlowConnection) {
    return <div>Slow connection detected</div>
  }

  return <div>Your content</div>
}
```

---

### useToast

**Location**: `frontend/src/hooks/useToast.ts`

**Purpose**: Manage toast notifications (used internally by ToastContext).

**Note**: Use `useToastContext()` instead of this hook directly.

---

## Utilities

### getErrorMessage

**Location**: `frontend/src/utils/errorMessages.ts`

**Purpose**: Convert API errors to user-friendly messages.

**Functions**:
- `getErrorMessage(error, statusCode)` - Get error message based on error type and status
- `getLocalizedErrorMessage(error, statusCode, language)` - Get localized error message
- `isRetryableError(statusCode)` - Check if error should be retried
- `isNetworkError(error)` - Check if error is a network error

**Usage**:
```tsx
import { getErrorMessage } from '../utils/errorMessages'

try {
  await api.chat({ message: 'Hello' })
} catch (error) {
  const message = getErrorMessage(error, 500)
  toast.error(message)
}
```

---

## API Client Error Handling

**Location**: `frontend/src/utils/api.ts`

The API client automatically handles:
- **Retry Logic**: Retries failed requests up to 3 times with exponential backoff
- **Rate Limiting**: Respects 429 status and Retry-After header
- **Network Errors**: Retries on network failures
- **Error Responses**: Parses and returns structured error objects

**Retry Strategy**:
- Initial delay: 1 second
- Exponential backoff: delay × 2^attempt
- Max retries: 3
- Retries on: 5xx errors, 429 (rate limit), network errors
- No retry on: 4xx errors (except 429)

**Example**:
```tsx
// The API client handles retries automatically
const response = await api.chat({
  message: 'Tell me about schemes',
  language: 'en'
})

// If all retries fail, an error is thrown
// You can catch it and show user-friendly message
try {
  const response = await api.chat({ message: 'Hello' })
} catch (error) {
  toast.error(error.message)
}
```

---

## Context Providers

### ToastProvider

**Location**: `frontend/src/contexts/ToastContext.tsx`

**Purpose**: Provides toast notification functionality throughout the app.

**Setup**:
```tsx
import { ToastProvider } from './contexts/ToastContext'

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}
```

**Usage**:
```tsx
import { useToastContext } from '../contexts/ToastContext'

function MyComponent() {
  const toast = useToastContext()
  
  toast.success('Success!')
  toast.error('Error!')
  toast.warning('Warning!')
  toast.info('Info!')
  toast.clearAll() // Clear all toasts
}
```

---

## Examples

See `frontend/src/components/ErrorHandling.example.tsx` for comprehensive examples of all error handling features.

---

## Accessibility

All error handling components are fully accessible:

- **ARIA Labels**: All interactive elements have appropriate labels
- **ARIA Live Regions**: Dynamic content updates are announced to screen readers
- **Keyboard Navigation**: All components are keyboard accessible
- **Focus Management**: Error boundaries and modals manage focus appropriately
- **Color Contrast**: All text meets WCAG AA standards (4.5:1 ratio)

---

## Requirements Coverage

| Requirement | Component | Status |
|-------------|-----------|--------|
| 20.1 | ErrorBoundary | ✅ Implemented |
| 20.2 | ErrorBoundary | ✅ Implemented |
| 20.3 | API Client, ConnectionIndicator | ✅ Implemented |
| 20.4 | API Client, useNetworkStatus | ✅ Implemented |
| 20.5 | Toast, ProgressIndicator | ✅ Implemented |
| 21.4 | getLocalizedErrorMessage | ✅ Implemented |

---

## Testing

To test error handling:

1. **Error Boundary**: Trigger a React error and verify fallback UI
2. **Network Errors**: Disconnect network and verify connection indicator
3. **API Errors**: Test with invalid API calls and verify retry logic
4. **Toast Notifications**: Trigger different toast types and verify display
5. **Progress Indicators**: Test with long-running operations

---

## Future Enhancements

1. **Error Reporting**: Integrate with error tracking service (e.g., Sentry)
2. **Localization**: Add translations for all error messages
3. **Offline Support**: Add service worker for offline functionality
4. **Error Analytics**: Track error patterns and user impact
5. **Custom Error Pages**: Add specific error pages for different scenarios

---

## Best Practices

1. **Always wrap API calls in try-catch blocks**
2. **Use toast notifications for user feedback**
3. **Show progress indicators for operations > 1 second**
4. **Provide clear, actionable error messages**
5. **Log errors to console in development**
6. **Never expose sensitive error details to users**
7. **Test error scenarios thoroughly**
8. **Make error messages accessible**

---

## Support

For questions or issues with error handling, please refer to:
- Design Document: `.kiro/specs/bharat-sahayak-ai-assistant/design.md`
- Requirements: `.kiro/specs/bharat-sahayak-ai-assistant/requirements.md`
- Tasks: `.kiro/specs/bharat-sahayak-ai-assistant/tasks.md`
