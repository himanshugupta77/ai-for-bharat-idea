import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ChatPage from '../ChatPage'
import * as apiModule from '@/utils/api'
import type { Message, SchemeCard } from '@/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.appName': 'Bharat Sahayak',
        'landing.subtitle': 'Your AI-Powered Welfare Assistant',
        'chat.noMessages': 'No messages yet',
        'landing.description': 'Start a conversation to discover welfare schemes',
        'chat.placeholder': 'Type your message here...',
        'chat.send': 'Send',
        'chat.typing': 'Assistant is typing...',
        'common.loading': 'Loading...',
        'accessibility.skipToContent': 'Skip to main content',
        'session.sessionCleared': 'Session cleared successfully',
      }
      return translations[key] || key
    },
  }),
}))

// Mock custom hooks
vi.mock('@/hooks/useSession', () => ({
  default: () => ({
    sessionId: 'test-session-id',
    clearSession: vi.fn(),
  }),
}))

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({
    language: 'en',
    setLanguage: vi.fn(),
  }),
}))

vi.mock('@/hooks/useLowBandwidth', () => ({
  default: () => ({
    isLowBandwidth: false,
  }),
}))

vi.mock('@/hooks/useVoiceInput', () => ({
  default: () => ({
    startRecording: vi.fn(),
    stopRecording: vi.fn().mockResolvedValue(null),
    isRecording: false,
    audioLevel: 0.5,
    error: null,
  }),
}))

// Mock toast context
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('@/contexts/ToastContext', () => ({
  useToastContext: () => mockToast,
}))

// Mock accessibility utilities
vi.mock('@/utils/accessibility', () => ({
  announceToScreenReader: vi.fn(),
}))

// Mock API
vi.mock('@/utils/api', () => ({
  api: {
    chat: vi.fn(),
    voiceToText: vi.fn(),
  },
}))

// Mock components
vi.mock('@/components/GlassCard', () => ({
  GlassCard: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/components/LoadingShimmer', () => ({
  LoadingShimmer: () => <div data-testid="loading-shimmer">Loading...</div>,
}))

vi.mock('@/components/TypingIndicator', () => ({
  TypingIndicator: () => <div data-testid="typing-indicator">Typing...</div>,
}))

vi.mock('@/components/Message', () => ({
  Message: ({ message }: { message: Message }) => (
    <div data-testid={`message-${message.id}`} data-role={message.role}>
      <p>{message.content}</p>
      {message.schemes && message.schemes.length > 0 && (
        <div data-testid="scheme-cards">
          {message.schemes.map((scheme) => (
            <div key={scheme.id} data-testid={`scheme-card-${scheme.id}`}>
              {scheme.name}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}))

vi.mock('@/components/VoiceInput', () => ({
  VoiceInput: ({ onTranscript, onError }: { onTranscript: (text: string) => void; onError: (error: string) => void }) => (
    <button
      data-testid="voice-input-button"
      onClick={() => {
        // Simulate voice input
        onTranscript('Test voice transcript')
      }}
    >
      Voice Input
    </button>
  ),
}))

vi.mock('@/components/SessionExpirationWarning', () => ({
  SessionExpirationWarning: () => <div data-testid="session-expiration-warning">Session expiring soon</div>,
}))

vi.mock('@/components/PrivacyNotice', () => ({
  PrivacyNotice: () => <div data-testid="privacy-notice">Privacy Notice</div>,
}))

vi.mock('@/components/ClearSessionButton', () => ({
  ClearSessionButton: ({ onClearSession }: { onClearSession: () => void }) => (
    <button data-testid="clear-session-button" onClick={onClearSession}>
      Clear Session
    </button>
  ),
}))

describe('ChatPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderChatPage = () => {
    return render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    )
  }

  describe('Message Sending and Receiving', () => {
    it('should send a message and receive a response', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        response: 'Here are some schemes for you',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      // Type a message
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Tell me about agriculture schemes')
      
      // Send the message
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)
      
      // Verify user message appears
      await waitFor(() => {
        expect(screen.getByText('Tell me about agriculture schemes')).toBeInTheDocument()
      })
      
      // Verify typing indicator appears
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      
      // Verify API was called
      expect(apiModule.api.chat).toHaveBeenCalledWith({
        message: 'Tell me about agriculture schemes',
        language: 'en',
      })
      
      // Verify assistant response appears
      await waitFor(() => {
        expect(screen.getByText('Here are some schemes for you')).toBeInTheDocument()
      })
      
      // Verify input is cleared
      expect(input).toHaveValue('')
    })

    it('should display scheme cards when schemes are returned', async () => {
      const user = userEvent.setup()
      
      const mockSchemes: SchemeCard[] = [
        {
          id: 'pm-kisan',
          name: 'PM-KISAN',
          description: 'Income support for farmers',
          eligibilitySummary: 'Small and marginal farmers',
          applicationSteps: ['Visit portal', 'Register with Aadhaar'],
        },
        {
          id: 'mgnrega',
          name: 'MGNREGA',
          description: 'Employment guarantee scheme',
          eligibilitySummary: 'Rural households',
          applicationSteps: ['Apply at local office'],
        },
      ]
      
      const mockResponse = {
        response: 'Here are some agriculture schemes',
        language: 'en',
        schemes: mockSchemes,
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Agriculture schemes')
      
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Here are some agriculture schemes')).toBeInTheDocument()
      })
      
      // Verify scheme cards are displayed
      expect(screen.getByTestId('scheme-cards')).toBeInTheDocument()
      expect(screen.getByTestId('scheme-card-pm-kisan')).toBeInTheDocument()
      expect(screen.getByTestId('scheme-card-mgnrega')).toBeInTheDocument()
      expect(screen.getByText('PM-KISAN')).toBeInTheDocument()
      expect(screen.getByText('MGNREGA')).toBeInTheDocument()
    })

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      
      vi.mocked(apiModule.api.chat).mockRejectedValueOnce(new Error('Network error'))
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
      
      // Verify error toast was shown
      expect(mockToast.error).toHaveBeenCalledWith('Network error')
    })

    it('should prevent sending empty messages', async () => {
      const user = userEvent.setup()
      
      renderChatPage()
      
      const sendButton = screen.getByText('Send')
      
      // Button should be disabled initially
      expect(sendButton).toBeDisabled()
      
      // Try to click disabled button
      await user.click(sendButton)
      
      // API should not be called
      expect(apiModule.api.chat).not.toHaveBeenCalled()
    })

    it('should prevent sending messages over character limit', async () => {
      const user = userEvent.setup()
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      const longMessage = 'a'.repeat(1001) // Over 1000 character limit
      
      await user.type(input, longMessage)
      
      const sendButton = screen.getByText('Send')
      
      // Button should be disabled
      expect(sendButton).toBeDisabled()
      
      // Character counter should show negative value
      expect(screen.getByText('-1 characters remaining')).toBeInTheDocument()
    })

    it('should support Enter key to send message', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        response: 'Response to Enter key message',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message{Enter}')
      
      // Verify API was called
      await waitFor(() => {
        expect(apiModule.api.chat).toHaveBeenCalled()
      })
    })

    it('should maintain conversation context across multiple messages', async () => {
      const user = userEvent.setup()
      
      const mockResponse1 = {
        response: 'First response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      const mockResponse2 = {
        response: 'Second response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      
      // Send first message
      await user.type(input, 'First message')
      await user.click(screen.getByText('Send'))
      
      await waitFor(() => {
        expect(screen.getByText('First response')).toBeInTheDocument()
      })
      
      // Send second message
      await user.type(input, 'Second message')
      await user.click(screen.getByText('Send'))
      
      await waitFor(() => {
        expect(screen.getByText('Second response')).toBeInTheDocument()
      })
      
      // Both messages should be visible
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('First response')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
      expect(screen.getByText('Second response')).toBeInTheDocument()
    })
  })

  describe('Voice Input Flow', () => {
    it('should handle voice input and populate text field', async () => {
      const user = userEvent.setup()
      
      renderChatPage()
      
      const voiceButton = screen.getByTestId('voice-input-button')
      await user.click(voiceButton)
      
      // Verify transcript is populated in input field
      const input = screen.getByPlaceholderText('Type your message here...')
      expect(input).toHaveValue('Test voice transcript')
      
      // Verify success toast
      expect(mockToast.success).toHaveBeenCalledWith('Voice input received')
    })

    it('should send message after voice input', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        response: 'Response to voice input',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      // Trigger voice input
      const voiceButton = screen.getByTestId('voice-input-button')
      await user.click(voiceButton)
      
      // Send the voice transcript
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)
      
      // Verify API was called with voice transcript
      expect(apiModule.api.chat).toHaveBeenCalledWith({
        message: 'Test voice transcript',
        language: 'en',
      })
      
      // Verify response appears
      await waitFor(() => {
        expect(screen.getByText('Response to voice input')).toBeInTheDocument()
      })
    })

    it('should handle voice input errors', async () => {
      const user = userEvent.setup()
      
      // Mock VoiceInput to trigger error
      vi.mock('@/components/VoiceInput', () => ({
        VoiceInput: ({ onError }: { onError: (error: string) => void }) => (
          <button
            data-testid="voice-input-button"
            onClick={() => onError('Microphone access denied')}
          >
            Voice Input
          </button>
        ),
      }))
      
      renderChatPage()
      
      const voiceButton = screen.getByTestId('voice-input-button')
      await user.click(voiceButton)
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('Microphone access denied')).toBeInTheDocument()
      })
      
      // Verify error toast
      expect(mockToast.error).toHaveBeenCalledWith('Microphone access denied')
    })
  })

  describe('Scheme Card Interactions', () => {
    it('should display scheme cards with all required information', async () => {
      const user = userEvent.setup()
      
      const mockScheme: SchemeCard = {
        id: 'test-scheme',
        name: 'Test Scheme',
        description: 'A test welfare scheme',
        eligibilitySummary: 'All citizens',
        applicationSteps: ['Step 1', 'Step 2', 'Step 3'],
        officialLink: 'https://example.com',
      }
      
      const mockResponse = {
        response: 'Here is a scheme for you',
        language: 'en',
        schemes: [mockScheme],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Show me schemes')
      await user.click(screen.getByText('Send'))
      
      // Wait for scheme card to appear
      await waitFor(() => {
        expect(screen.getByTestId('scheme-card-test-scheme')).toBeInTheDocument()
      })
      
      // Verify scheme information is displayed
      expect(screen.getByText('Test Scheme')).toBeInTheDocument()
    })

    it('should announce scheme recommendations to screen readers', async () => {
      const user = userEvent.setup()
      const { announceToScreenReader } = await import('@/utils/accessibility')
      
      const mockSchemes: SchemeCard[] = [
        {
          id: 'scheme1',
          name: 'Scheme 1',
          description: 'Description 1',
          eligibilitySummary: 'Summary 1',
          applicationSteps: [],
        },
        {
          id: 'scheme2',
          name: 'Scheme 2',
          description: 'Description 2',
          eligibilitySummary: 'Summary 2',
          applicationSteps: [],
        },
      ]
      
      const mockResponse = {
        response: 'Here are schemes',
        language: 'en',
        schemes: mockSchemes,
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Show schemes')
      await user.click(screen.getByText('Send'))
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Here are schemes')).toBeInTheDocument()
      })
      
      // Verify screen reader announcement
      expect(announceToScreenReader).toHaveBeenCalledWith('2 scheme recommendations available')
    })

    it('should handle multiple scheme cards in a single response', async () => {
      const user = userEvent.setup()
      
      const mockSchemes: SchemeCard[] = [
        {
          id: 'scheme1',
          name: 'Scheme 1',
          description: 'Description 1',
          eligibilitySummary: 'Summary 1',
          applicationSteps: [],
        },
        {
          id: 'scheme2',
          name: 'Scheme 2',
          description: 'Description 2',
          eligibilitySummary: 'Summary 2',
          applicationSteps: [],
        },
        {
          id: 'scheme3',
          name: 'Scheme 3',
          description: 'Description 3',
          eligibilitySummary: 'Summary 3',
          applicationSteps: [],
        },
      ]
      
      const mockResponse = {
        response: 'Here are three schemes',
        language: 'en',
        schemes: mockSchemes,
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Show schemes')
      await user.click(screen.getByText('Send'))
      
      // Wait for all scheme cards
      await waitFor(() => {
        expect(screen.getByTestId('scheme-card-scheme1')).toBeInTheDocument()
        expect(screen.getByTestId('scheme-card-scheme2')).toBeInTheDocument()
        expect(screen.getByTestId('scheme-card-scheme3')).toBeInTheDocument()
      })
      
      // Verify all scheme names are displayed
      expect(screen.getByText('Scheme 1')).toBeInTheDocument()
      expect(screen.getByText('Scheme 2')).toBeInTheDocument()
      expect(screen.getByText('Scheme 3')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show typing indicator while waiting for response', async () => {
      const user = userEvent.setup()
      
      // Create a promise that we can control
      let resolveChat: (value: unknown) => void
      const chatPromise = new Promise((resolve) => {
        resolveChat = resolve
      })
      
      vi.mocked(apiModule.api.chat).mockReturnValueOnce(chatPromise as Promise<never>)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      await user.click(screen.getByText('Send'))
      
      // Verify typing indicator appears
      await waitFor(() => {
        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      })
      
      // Resolve the promise
      resolveChat!({
        response: 'Response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      })
      
      // Typing indicator should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
      })
    })

    it('should disable send button while loading', async () => {
      const user = userEvent.setup()
      
      let resolveChat: (value: unknown) => void
      const chatPromise = new Promise((resolve) => {
        resolveChat = resolve
      })
      
      vi.mocked(apiModule.api.chat).mockReturnValueOnce(chatPromise as Promise<never>)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)
      
      // Button should be disabled while loading
      expect(sendButton).toBeDisabled()
      
      // Resolve the promise
      resolveChat!({
        response: 'Response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      })
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Response')).toBeInTheDocument()
      })
    })
  })

  describe('Session Management', () => {
    it('should clear session and messages when clear button is clicked', async () => {
      const user = userEvent.setup()
      
      // Send a message first
      const mockResponse = {
        response: 'Test response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      await user.click(screen.getByText('Send'))
      
      // Wait for message to appear
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument()
      })
      
      // Clear session
      const clearButton = screen.getByTestId('clear-session-button')
      await user.click(clearButton)
      
      // Messages should be cleared
      expect(screen.queryByText('Test message')).not.toBeInTheDocument()
      expect(screen.queryByText('Test response')).not.toBeInTheDocument()
      
      // Success toast should be shown
      expect(mockToast.success).toHaveBeenCalledWith('Session cleared successfully')
    })

    it('should show session expiration warning when session is expiring', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        response: 'Response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
        sessionExpiring: true,
        sessionTimeRemaining: 300,
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      await user.click(screen.getByText('Send'))
      
      // Wait for response and expiration warning
      await waitFor(() => {
        expect(screen.getByTestId('session-expiration-warning')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderChatPage()
      
      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Check for form
      expect(screen.getByLabelText('Send message form')).toBeInTheDocument()
      
      // Check for chat messages log
      expect(screen.getByLabelText('Chat messages')).toBeInTheDocument()
    })

    it('should announce new messages to screen readers', async () => {
      const user = userEvent.setup()
      const { announceToScreenReader } = await import('@/utils/accessibility')
      
      const mockResponse = {
        response: 'Test response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      await user.click(screen.getByText('Send'))
      
      await waitFor(() => {
        expect(screen.getByText('Test response')).toBeInTheDocument()
      })
      
      // Verify screen reader announcement
      expect(announceToScreenReader).toHaveBeenCalledWith('New message received from assistant')
    })

    it('should have skip to main content link', () => {
      renderChatPage()
      
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#chat-main')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no messages', () => {
      renderChatPage()
      
      expect(screen.getByText('No messages yet')).toBeInTheDocument()
      expect(screen.getByText('Start a conversation to discover welfare schemes')).toBeInTheDocument()
    })

    it('should hide empty state after first message', async () => {
      const user = userEvent.setup()
      
      const mockResponse = {
        response: 'First response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-id',
      }
      
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)
      
      renderChatPage()
      
      // Empty state should be visible
      expect(screen.getByText('No messages yet')).toBeInTheDocument()
      
      // Send a message
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'First message')
      await user.click(screen.getByText('Send'))
      
      // Wait for message
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument()
      })
      
      // Empty state should be hidden
      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument()
    })
  })
})
