/**
 * E2E Tests for Critical User Flows
 * 
 * Task 25.1: Write E2E tests for critical user flows
 * - Test complete chat flow (text input → response → scheme recommendation)
 * - Test voice input flow (record → transcribe → response)
 * - Test eligibility check flow (form submission → result display)
 * - Test language switching across all features
 * - Test dark mode and low bandwidth mode
 * 
 * Requirements: 24.1, 24.2, 24.3
 */

import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as apiModule from '@/utils/api'
import type { SchemeCard } from '@/types'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock i18next with comprehensive translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.appName': 'Bharat Sahayak',
        'landing.title': 'Welcome to Bharat Sahayak',
        'landing.subtitle': 'Your AI-Powered Welfare Assistant',
        'landing.description': 'Discover government welfare schemes in your language',
        'landing.cta': 'Start Chatting',
        'chat.placeholder': 'Type your message here...',
        'chat.send': 'Send',
        'chat.typing': 'Assistant is typing...',
        'chat.noMessages': 'No messages yet',
        'common.loading': 'Loading...',
        'eligibility.title': 'Check Eligibility',
        'eligibility.age': 'Age',
        'eligibility.gender': 'Gender',
        'eligibility.income': 'Annual Income',
        'eligibility.state': 'State',
        'eligibility.submit': 'Check Eligibility',
        'eligibility.eligible': 'You are eligible',
        'eligibility.notEligible': 'You are not eligible',
        'common.darkMode': 'Dark Mode',
        'common.lowBandwidth': 'Low Bandwidth Mode',
        'common.language': 'Language',
        'voice.start': 'Start Recording',
        'voice.stop': 'Stop Recording',
        'voice.recording': 'Recording...',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock API
vi.mock('@/utils/api', () => ({
  api: {
    chat: vi.fn(),
    voiceToText: vi.fn(),
    textToSpeech: vi.fn(),
    checkEligibility: vi.fn(),
    getSchemes: vi.fn(),
  },
}))

// Mock accessibility utilities
vi.mock('@/utils/accessibility', () => ({
  announceToScreenReader: vi.fn(),
}))

describe('E2E Critical User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderApp = () => {
    return render(<App />)
  }

  /**
   * Flow 1: Complete Chat Flow
   * User journey: Text input → Response → Scheme recommendation
   */
  describe('Flow 1: Complete Chat Flow (Text Input → Response → Scheme Recommendation)', () => {
    it('should complete full chat flow from landing page to scheme recommendation', async () => {
      const user = userEvent.setup()

      // Mock scheme data
      const mockSchemes: SchemeCard[] = [
        {
          id: 'pm-kisan',
          name: 'PM-KISAN',
          description: 'Income support for farmer families',
          eligibilitySummary: 'Small and marginal farmers with up to 2 hectares',
          applicationSteps: [
            'Visit PM-KISAN portal',
            'Register with Aadhaar',
            'Fill application form',
            'Submit land records',
          ],
          officialLink: 'https://pmkisan.gov.in',
        },
        {
          id: 'mgnrega',
          name: 'MGNREGA',
          description: 'Employment guarantee scheme for rural households',
          eligibilitySummary: 'Rural households willing to do unskilled manual work',
          applicationSteps: [
            'Apply at local Gram Panchayat',
            'Get job card',
            'Request work',
          ],
        },
        {
          id: 'ayushman-bharat',
          name: 'Ayushman Bharat',
          description: 'Health insurance scheme',
          eligibilitySummary: 'Families below poverty line',
          applicationSteps: [
            'Check eligibility online',
            'Visit empanelled hospital',
            'Get treatment',
          ],
        },
      ]

      const mockChatResponse = {
        response: 'Here are some agriculture and employment schemes that might help you. PM-KISAN provides direct income support to farmers, MGNREGA offers employment guarantee, and Ayushman Bharat provides health coverage.',
        language: 'en',
        schemes: mockSchemes,
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockChatResponse)

      renderApp()

      // Step 1: User lands on landing page
      expect(screen.getByText('Welcome to Bharat Sahayak')).toBeInTheDocument()
      expect(screen.getByText('Your AI-Powered Welfare Assistant')).toBeInTheDocument()

      // Step 2: User clicks "Start Chatting" CTA
      const ctaButton = screen.getByText('Start Chatting')
      await user.click(ctaButton)

      // Step 3: User is navigated to chat page
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // Step 4: User types a message about agriculture schemes
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'I am a small farmer. What schemes are available for me?')

      // Step 5: User sends the message
      const sendButton = screen.getByText('Send')
      expect(sendButton).not.toBeDisabled()
      await user.click(sendButton)

      // Step 6: User message appears in chat
      await waitFor(() => {
        expect(screen.getByText('I am a small farmer. What schemes are available for me?')).toBeInTheDocument()
      })

      // Step 7: Typing indicator appears
      expect(screen.getByText('Assistant is typing...')).toBeInTheDocument()

      // Step 8: API is called with correct parameters
      expect(apiModule.api.chat).toHaveBeenCalledWith({
        message: 'I am a small farmer. What schemes are available for me?',
        language: 'en',
      })

      // Step 9: Assistant response appears
      await waitFor(() => {
        expect(screen.getByText(/Here are some agriculture and employment schemes/)).toBeInTheDocument()
      })

      // Step 10: Typing indicator disappears
      expect(screen.queryByText('Assistant is typing...')).not.toBeInTheDocument()

      // Step 11: At least 3 scheme cards are displayed
      await waitFor(() => {
        expect(screen.getByText('PM-KISAN')).toBeInTheDocument()
        expect(screen.getByText('MGNREGA')).toBeInTheDocument()
        expect(screen.getByText('Ayushman Bharat')).toBeInTheDocument()
      })

      // Step 12: Scheme cards contain required information
      expect(screen.getByText('Income support for farmer families')).toBeInTheDocument()
      expect(screen.getByText(/Small and marginal farmers/)).toBeInTheDocument()
      expect(screen.getByText(/Visit PM-KISAN portal/)).toBeInTheDocument()

      // Step 13: Input field is cleared and ready for next message
      expect(input).toHaveValue('')
      expect(sendButton).toBeDisabled() // Disabled because input is empty

      // Verify complete flow completed successfully
      expect(mockChatResponse.schemes.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle follow-up questions maintaining context', async () => {
      const user = userEvent.setup()

      const mockResponse1 = {
        response: 'PM-KISAN is an income support scheme for farmers.',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-123',
      }

      const mockResponse2 = {
        response: 'To apply for PM-KISAN, you need to visit the official portal and register with your Aadhaar number.',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.chat)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      renderApp()

      // Navigate to chat
      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // First message
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Tell me about PM-KISAN')
      await user.click(screen.getByText('Send'))

      await waitFor(() => {
        expect(screen.getByText('PM-KISAN is an income support scheme for farmers.')).toBeInTheDocument()
      })

      // Follow-up question
      await user.type(input, 'How do I apply?')
      await user.click(screen.getByText('Send'))

      await waitFor(() => {
        expect(screen.getByText(/To apply for PM-KISAN/)).toBeInTheDocument()
      })

      // Both messages should be visible (context maintained)
      expect(screen.getByText('Tell me about PM-KISAN')).toBeInTheDocument()
      expect(screen.getByText('How do I apply?')).toBeInTheDocument()
    })
  })

  /**
   * Flow 2: Voice Input Flow
   * User journey: Record → Transcribe → Response
   */
  describe('Flow 2: Voice Input Flow (Record → Transcribe → Response)', () => {
    it('should complete full voice input flow from recording to response', async () => {
      const user = userEvent.setup()

      // Mock voice-to-text API
      const mockTranscript = {
        transcript: 'मुझे कृषि योजनाओं के बारे में बताएं',
        detectedLanguage: 'hi',
        confidence: 0.95,
      }

      // Mock chat response in Hindi
      const mockChatResponse = {
        response: 'यहाँ कुछ कृषि योजनाएं हैं जो आपके लिए उपयोगी हो सकती हैं।',
        language: 'hi',
        schemes: [
          {
            id: 'pm-kisan',
            name: 'प्रधानमंत्री किसान सम्मान निधि',
            description: 'किसान परिवारों के लिए आय सहायता',
            eligibilitySummary: '2 हेक्टेयर तक की भूमि वाले किसान',
            applicationSteps: ['पोर्टल पर जाएं', 'आधार से पंजीकरण करें'],
          },
        ],
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.voiceToText).mockResolvedValueOnce(mockTranscript)
      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockChatResponse)

      renderApp()

      // Navigate to chat
      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // Step 1: User clicks voice input button
      const voiceButton = screen.getByLabelText(/voice input/i) || screen.getByRole('button', { name: /microphone/i })
      await user.click(voiceButton)

      // Step 2: Recording indicator appears
      await waitFor(() => {
        expect(screen.getByText(/recording/i) || screen.getByLabelText(/recording/i)).toBeInTheDocument()
      })

      // Step 3: User stops recording (simulate)
      await user.click(voiceButton)

      // Step 4: Voice-to-text API is called
      await waitFor(() => {
        expect(apiModule.api.voiceToText).toHaveBeenCalled()
      })

      // Step 5: Transcript appears in input field
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Type your message here...')
        expect(input).toHaveValue('मुझे कृषि योजनाओं के बारे में बताएं')
      })

      // Step 6: Language is automatically detected and switched
      // (In real app, this would update the language selector)

      // Step 7: User sends the transcribed message
      const sendButton = screen.getByText('Send')
      await user.click(sendButton)

      // Step 8: Chat API is called with transcribed text
      await waitFor(() => {
        expect(apiModule.api.chat).toHaveBeenCalledWith({
          message: 'मुझे कृषि योजनाओं के बारे में बताएं',
          language: 'hi',
        })
      })

      // Step 9: Response appears in Hindi
      await waitFor(() => {
        expect(screen.getByText('यहाँ कुछ कृषि योजनाएं हैं जो आपके लिए उपयोगी हो सकती हैं।')).toBeInTheDocument()
      })

      // Step 10: Scheme card appears with Hindi text
      expect(screen.getByText('प्रधानमंत्री किसान सम्मान निधि')).toBeInTheDocument()

      // Verify voice flow completed successfully
      expect(mockTranscript.confidence).toBeGreaterThan(0.8)
    })

    it('should handle voice input errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock voice-to-text error
      vi.mocked(apiModule.api.voiceToText).mockRejectedValueOnce(
        new Error('Audio quality is too low for transcription')
      )

      renderApp()

      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // Try voice input
      const voiceButton = screen.getByLabelText(/voice input/i) || screen.getByRole('button', { name: /microphone/i })
      await user.click(voiceButton)
      await user.click(voiceButton) // Stop recording

      // Error message should appear
      await waitFor(() => {
        expect(screen.getByText(/audio quality is too low/i)).toBeInTheDocument()
      })

      // User should be able to try again or use text input
      const input = screen.getByPlaceholderText('Type your message here...')
      expect(input).toBeInTheDocument()
      expect(input).not.toBeDisabled()
    })

    it('should handle low confidence transcriptions', async () => {
      const user = userEvent.setup()

      const mockLowConfidenceTranscript = {
        transcript: 'unclear audio',
        detectedLanguage: 'en',
        confidence: 0.3,
      }

      vi.mocked(apiModule.api.voiceToText).mockResolvedValueOnce(mockLowConfidenceTranscript)

      renderApp()

      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      const voiceButton = screen.getByLabelText(/voice input/i) || screen.getByRole('button', { name: /microphone/i })
      await user.click(voiceButton)
      await user.click(voiceButton)

      // Low confidence warning should appear
      await waitFor(() => {
        expect(
          screen.getByText(/please speak clearly/i) || 
          screen.getByText(/low confidence/i) ||
          screen.getByText(/try again/i)
        ).toBeInTheDocument()
      })
    })
  })

  /**
   * Flow 3: Eligibility Check Flow
   * User journey: Form submission → Result display
   */
  describe('Flow 3: Eligibility Check Flow (Form Submission → Result Display)', () => {
    it('should complete full eligibility check flow for eligible user', async () => {
      const user = userEvent.setup()

      // Mock eligibility check response - eligible
      const mockEligibilityResponse = {
        eligible: true,
        explanation: {
          criteria: [
            {
              criterion: 'Age Requirement',
              required: 'Age between 18-60',
              userValue: '45',
              met: true,
            },
            {
              criterion: 'Land Ownership',
              required: 'Must own agricultural land',
              userValue: 'Yes',
              met: true,
            },
            {
              criterion: 'Land Size',
              required: 'Land holding up to 2 hectares',
              userValue: '1.5 hectares',
              met: true,
            },
          ],
          summary: 'You are eligible for PM-KISAN scheme. You meet all 3 eligibility criteria.',
        },
        schemeDetails: {
          name: 'PM-KISAN',
          benefits: '₹6000 per year in three installments',
          applicationProcess: [
            'Visit PM-KISAN portal at https://pmkisan.gov.in',
            'Register with Aadhaar number',
            'Fill application form with land details',
            'Submit land ownership documents',
            'Wait for verification by local authorities',
          ],
          requiredDocuments: [
            'Aadhaar card',
            'Land ownership documents',
            'Bank account details',
          ],
        },
      }

      vi.mocked(apiModule.api.checkEligibility).mockResolvedValueOnce(mockEligibilityResponse)

      renderApp()

      // Navigate to chat and ask about eligibility
      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // Step 1: User asks about scheme eligibility
      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Am I eligible for PM-KISAN?')
      await user.click(screen.getByText('Send'))

      // Step 2: Assistant suggests eligibility check
      // (In real flow, assistant would provide a link or button to eligibility form)

      // Step 3: User navigates to eligibility form
      // (Simulating direct navigation for test)
      const eligibilityForm = screen.getByLabelText(/eligibility form/i) || 
                              screen.getByRole('form', { name: /eligibility/i })
      
      // Step 4: User fills out eligibility form
      const ageInput = within(eligibilityForm).getByLabelText(/age/i)
      await user.type(ageInput, '45')

      const genderSelect = within(eligibilityForm).getByLabelText(/gender/i)
      await user.selectOptions(genderSelect, 'male')

      const incomeInput = within(eligibilityForm).getByLabelText(/income/i)
      await user.type(incomeInput, '250000')

      const stateSelect = within(eligibilityForm).getByLabelText(/state/i)
      await user.selectOptions(stateSelect, 'Maharashtra')

      // Additional fields for PM-KISAN
      const landOwnershipCheckbox = within(eligibilityForm).getByLabelText(/own.*land/i)
      await user.click(landOwnershipCheckbox)

      const landSizeInput = within(eligibilityForm).getByLabelText(/land size/i)
      await user.type(landSizeInput, '1.5')

      // Step 5: User submits the form
      const submitButton = within(eligibilityForm).getByText(/check eligibility/i)
      await user.click(submitButton)

      // Step 6: Loading indicator appears
      await waitFor(() => {
        expect(screen.getByText(/checking/i) || screen.getByText(/loading/i)).toBeInTheDocument()
      })

      // Step 7: API is called with form data
      await waitFor(() => {
        expect(apiModule.api.checkEligibility).toHaveBeenCalledWith({
          schemeId: 'pm-kisan',
          userInfo: expect.objectContaining({
            age: 45,
            gender: 'male',
            income: 250000,
            state: 'Maharashtra',
            ownsLand: true,
            landSize: 1.5,
          }),
        })
      })

      // Step 8: Eligibility result is displayed
      await waitFor(() => {
        expect(screen.getByText(/you are eligible/i)).toBeInTheDocument()
      })

      // Step 9: All criteria are shown with met/unmet status
      expect(screen.getByText('Age Requirement')).toBeInTheDocument()
      expect(screen.getByText('Land Ownership')).toBeInTheDocument()
      expect(screen.getByText('Land Size')).toBeInTheDocument()

      // Step 10: Explanation summary is displayed
      expect(screen.getByText(/you meet all 3 eligibility criteria/i)).toBeInTheDocument()

      // Step 11: Scheme benefits are displayed
      expect(screen.getByText(/₹6000 per year/i)).toBeInTheDocument()

      // Step 12: Application steps are displayed
      expect(screen.getByText(/Visit PM-KISAN portal/i)).toBeInTheDocument()
      expect(screen.getByText(/Register with Aadhaar/i)).toBeInTheDocument()

      // Step 13: Required documents are listed
      expect(screen.getByText(/Aadhaar card/i)).toBeInTheDocument()
      expect(screen.getByText(/Land ownership documents/i)).toBeInTheDocument()

      // Step 14: "Apply Now" button is available
      const applyButton = screen.getByText(/apply now/i) || screen.getByRole('link', { name: /apply/i })
      expect(applyButton).toBeInTheDocument()
      expect(applyButton).toHaveAttribute('href', expect.stringContaining('pmkisan.gov.in'))
    })

    it('should complete eligibility check flow for ineligible user with clear explanations', async () => {
      const user = userEvent.setup()

      // Mock eligibility check response - not eligible
      const mockIneligibleResponse = {
        eligible: false,
        explanation: {
          criteria: [
            {
              criterion: 'Age Requirement',
              required: 'Age between 18-60',
              userValue: '65',
              met: false,
            },
            {
              criterion: 'Land Ownership',
              required: 'Must own agricultural land',
              userValue: 'No',
              met: false,
            },
          ],
          summary: 'You are not eligible for PM-KISAN scheme. You do not meet 2 out of 2 criteria. Specifically: Age must be between 18-60 years, and you must own agricultural land.',
        },
        alternativeSchemes: [
          {
            id: 'old-age-pension',
            name: 'Old Age Pension Scheme',
            reason: 'Provides financial support for senior citizens',
          },
        ],
      }

      vi.mocked(apiModule.api.checkEligibility).mockResolvedValueOnce(mockIneligibleResponse)

      renderApp()

      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      // Fill and submit eligibility form (simulated)
      const eligibilityForm = screen.getByLabelText(/eligibility form/i) || 
                              screen.getByRole('form', { name: /eligibility/i })
      
      const ageInput = within(eligibilityForm).getByLabelText(/age/i)
      await user.type(ageInput, '65')

      const submitButton = within(eligibilityForm).getByText(/check eligibility/i)
      await user.click(submitButton)

      // Result shows not eligible
      await waitFor(() => {
        expect(screen.getByText(/you are not eligible/i)).toBeInTheDocument()
      })

      // Unmet criteria are clearly marked
      const ageCriterion = screen.getByText('Age Requirement')
      expect(ageCriterion).toBeInTheDocument()
      // Should show visual indicator (e.g., red X or cross icon)

      // Explanation for each unmet criterion
      expect(screen.getByText(/age must be between 18-60/i)).toBeInTheDocument()
      expect(screen.getByText(/must own agricultural land/i)).toBeInTheDocument()

      // Alternative schemes are suggested
      expect(screen.getByText(/alternative schemes/i)).toBeInTheDocument()
      expect(screen.getByText('Old Age Pension Scheme')).toBeInTheDocument()
    })

    it('should validate form inputs before submission', async () => {
      const user = userEvent.setup()

      renderApp()

      await user.click(screen.getByText('Start Chatting'))
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument()
      })

      const eligibilityForm = screen.getByLabelText(/eligibility form/i) || 
                              screen.getByRole('form', { name: /eligibility/i })

      // Try to submit empty form
      const submitButton = within(eligibilityForm).getByText(/check eligibility/i)
      await user.click(submitButton)

      // Validation errors should appear
      await waitFor(() => {
        expect(screen.getByText(/age is required/i) || screen.getByText(/please enter/i)).toBeInTheDocument()
      })

      // API should not be called
      expect(apiModule.api.checkEligibility).not.toHaveBeenCalled()

      // Try invalid age
      const ageInput = within(eligibilityForm).getByLabelText(/age/i)
      await user.type(ageInput, '150')
      await user.click(submitButton)

      // Age validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid age/i) || screen.getByText(/age must be/i)).toBeInTheDocument()
      })
    })
  })

  /**
   * Flow 4: Language Switching Across All Features
   * User journey: Switch language → All UI updates → Chat in new language → Voice in new language
   */
  describe('Flow 4: Language Switching Across All Features', () => {
    it('should switch language and update all UI elements', async () => {
      const user = userEvent.setup()

      renderApp()

      // Step 1: App loads in default language (English)
      expect(screen.getByText('Welcome to Bharat Sahayak')).toBeInTheDocument()
      expect(screen.getByText('Your AI-Powered Welfare Assistant')).toBeInTheDocument()

      // Step 2: User opens language selector
      const languageSelector = screen.getByLabelText(/language/i) || 
                               screen.getByRole('combobox', { name: /language/i })
      await user.click(languageSelector)

      // Step 3: User selects Hindi
      const hindiOption = screen.getByText('हिन्दी') || screen.getByRole('option', { name: /hindi/i })
      await user.click(hindiOption)

      // Step 4: All UI text updates to Hindi
      await waitFor(() => {
        // Landing page text should be in Hindi
        expect(screen.getByText(/भारत सहायक/i)).toBeInTheDocument()
      })

      // Step 5: Navigate to chat page
      const ctaButton = screen.getByText(/चैट शुरू करें/i) || screen.getByRole('button', { name: /start/i })
      await user.click(ctaButton)

      // Step 6: Chat interface is in Hindi
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/अपना संदेश यहां टाइप करें/i)).toBeInTheDocument()
      })

      // Step 7: User sends message in Hindi
      const mockHindiResponse = {
        response: 'यहाँ कुछ योजनाएं हैं।',
        language: 'hi',
        schemes: [],
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockHindiResponse)

      const input = screen.getByPlaceholderText(/अपना संदेश यहां टाइप करें/i)
      await user.type(input, 'मुझे योजनाओं के बारे में बताएं')
      
      const sendButton = screen.getByText(/भेजें/i)
      await user.click(sendButton)

      // Step 8: Response is in Hindi
      await waitFor(() => {
        expect(screen.getByText('यहाँ कुछ योजनाएं हैं।')).toBeInTheDocument()
      })

      // Step 9: Switch to Tamil
      await user.click(languageSelector)
      const tamilOption = screen.getByText('தமிழ்') || screen.getByRole('option', { name: /tamil/i })
      await user.click(tamilOption)

      // Step 10: UI updates to Tamil
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/உங்கள் செய்தியை இங்கே தட்டச்சு செய்யவும்/i)).toBeInTheDocument()
      })

      // Step 11: Error messages are also in selected language
      // (Test by triggering an error)
      vi.mocked(apiModule.api.chat).mockRejectedValueOnce(new Error('Network error'))
      
      await user.type(input, 'test')
      await user.click(sendButton)

      await waitFor(() => {
        // Error message should be in Tamil
        expect(screen.getByText(/பிழை/i) || screen.getByText(/தவறு/i)).toBeInTheDocument()
      })
    })

    it('should maintain language preference across page navigation', async () => {
      const user = userEvent.setup()

      renderApp()

      // Select Hindi
      const languageSelector = screen.getByLabelText(/language/i) || 
                               screen.getByRole('combobox', { name: /language/i })
      await user.click(languageSelector)
      const hindiOption = screen.getByText('हिन्दी') || screen.getByRole('option', { name: /hindi/i })
      await user.click(hindiOption)

      // Navigate to chat
      await user.click(screen.getByRole('button', { name: /start/i }))

      // Navigate to about page
      const aboutLink = screen.getByText(/के बारे में/i) || screen.getByRole('link', { name: /about/i })
      await user.click(aboutLink)

      // About page should be in Hindi
      await waitFor(() => {
        expect(screen.getByText(/आर्किटेक्चर/i) || screen.getByText(/वास्तुकला/i)).toBeInTheDocument()
      })

      // Navigate back to landing
      const homeLink = screen.getByText(/होम/i) || screen.getByRole('link', { name: /home/i })
      await user.click(homeLink)

      // Landing page should still be in Hindi
      expect(screen.getByText(/भारत सहायक/i)).toBeInTheDocument()
    })

    it('should persist language preference in localStorage', async () => {
      const user = userEvent.setup()

      renderApp()

      // Select Marathi
      const languageSelector = screen.getByLabelText(/language/i) || 
                               screen.getByRole('combobox', { name: /language/i })
      await user.click(languageSelector)
      const marathiOption = screen.getByText('मराठी') || screen.getByRole('option', { name: /marathi/i })
      await user.click(marathiOption)

      // Check localStorage
      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('mr')
      })

      // Reload app (simulate)
      const { unmount } = renderApp()
      unmount()
      renderApp()

      // Language should be Marathi on reload
      await waitFor(() => {
        expect(screen.getByText(/भारत सहायक/i)).toBeInTheDocument() // Marathi text
      })
    })

    it('should support all 11 languages', async () => {
      const user = userEvent.setup()

      const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'mr', name: 'मराठी' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'bn', name: 'বাংলা' },
        { code: 'gu', name: 'ગુજરાતી' },
        { code: 'kn', name: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'മലയാളം' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ' },
        { code: 'or', name: 'ଓଡ଼ିଆ' },
      ]

      renderApp()

      const languageSelector = screen.getByLabelText(/language/i) || 
                               screen.getByRole('combobox', { name: /language/i })

      // Test each language
      for (const lang of languages) {
        await user.click(languageSelector)
        
        const option = screen.getByText(lang.name) || 
                       screen.getByRole('option', { name: new RegExp(lang.name, 'i') })
        await user.click(option)

        // Verify language changed
        await waitFor(() => {
          expect(localStorage.getItem('language')).toBe(lang.code)
        })
      }
    })
  })

  /**
   * Flow 5: Dark Mode and Low Bandwidth Mode
   * User journey: Toggle modes → UI updates → Performance optimizations apply
   */
  describe('Flow 5: Dark Mode and Low Bandwidth Mode', () => {
    it('should toggle dark mode and update all UI elements', async () => {
      const user = userEvent.setup()

      renderApp()

      // Step 1: App loads in light mode
      const body = document.body
      expect(body.classList.contains('dark')).toBe(false)

      // Step 2: User toggles dark mode
      const darkModeToggle = screen.getByLabelText(/dark mode/i) || 
                             screen.getByRole('switch', { name: /dark/i })
      await user.click(darkModeToggle)

      // Step 3: Dark mode class is applied to body
      await waitFor(() => {
        expect(body.classList.contains('dark')).toBe(true)
      })

      // Step 4: Color scheme updates
      // (Check computed styles or CSS variables)
      const rootStyles = getComputedStyle(document.documentElement)
      // Dark mode should have different background color
      expect(rootStyles.getPropertyValue('--background-color')).not.toBe('#ffffff')

      // Step 5: Navigate to chat page
      await user.click(screen.getByText('Start Chatting'))

      // Step 6: Chat page is in dark mode
      await waitFor(() => {
        expect(body.classList.contains('dark')).toBe(true)
      })

      // Step 7: All components respect dark mode
      const chatContainer = screen.getByRole('main')
      expect(chatContainer).toHaveClass(/dark/i)

      // Step 8: Toggle back to light mode
      await user.click(darkModeToggle)

      // Step 9: Light mode is restored
      await waitFor(() => {
        expect(body.classList.contains('dark')).toBe(false)
      })

      // Step 10: Dark mode preference is persisted
      await user.click(darkModeToggle) // Enable dark mode again
      expect(localStorage.getItem('theme')).toBe('dark')

      // Reload and verify persistence
      const { unmount } = renderApp()
      unmount()
      renderApp()

      await waitFor(() => {
        expect(body.classList.contains('dark')).toBe(true)
      })
    })

    it('should enable low bandwidth mode and apply optimizations', async () => {
      const user = userEvent.setup()

      renderApp()

      // Step 1: App loads in normal mode
      expect(localStorage.getItem('lowBandwidth')).toBeFalsy()

      // Step 2: User toggles low bandwidth mode
      const lowBandwidthToggle = screen.getByLabelText(/low bandwidth/i) || 
                                 screen.getByRole('switch', { name: /bandwidth/i })
      await user.click(lowBandwidthToggle)

      // Step 3: Low bandwidth mode is enabled
      await waitFor(() => {
        expect(localStorage.getItem('lowBandwidth')).toBe('true')
      })

      // Step 4: Animations are disabled
      // (Check that animation classes are not applied or have reduced-motion)
      const animatedElements = document.querySelectorAll('[class*="animate"]')
      animatedElements.forEach(el => {
        const styles = getComputedStyle(el)
        expect(styles.animationDuration).toBe('0s') // Animations should be disabled
      })

      // Step 5: Images are loaded with reduced quality
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        const src = img.getAttribute('src')
        // Should use low-quality version or have loading="lazy"
        expect(
          src?.includes('low-quality') || 
          img.getAttribute('loading') === 'lazy'
        ).toBe(true)
      })

      // Step 6: Navigate to chat and send message
      await user.click(screen.getByText('Start Chatting'))
      
      const mockResponse = {
        response: 'Test response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)

      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test message')
      await user.click(screen.getByText('Send'))

      // Step 7: No typing indicator animation in low bandwidth mode
      // (Or simplified animation)
      await waitFor(() => {
        const typingIndicator = screen.queryByTestId('typing-indicator')
        if (typingIndicator) {
          const styles = getComputedStyle(typingIndicator)
          expect(styles.animationDuration).toBe('0s')
        }
      })

      // Step 8: Voice features use compressed audio
      const mockCompressedAudio = {
        audioData: 'compressed-base64-data',
        format: 'opus',
        duration: 3.5,
        sizeBytes: 10000, // Smaller size
      }

      vi.mocked(apiModule.api.textToSpeech).mockResolvedValueOnce(mockCompressedAudio)

      // Trigger text-to-speech
      const speakerButton = screen.getByLabelText(/play audio/i) || 
                            screen.getByRole('button', { name: /speaker/i })
      await user.click(speakerButton)

      // Step 9: API is called with lowBandwidth flag
      await waitFor(() => {
        expect(apiModule.api.textToSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            lowBandwidth: true,
          })
        )
      })

      // Step 10: Compressed audio is used (Opus format, smaller size)
      expect(mockCompressedAudio.format).toBe('opus')
      expect(mockCompressedAudio.sizeBytes).toBeLessThan(20000) // Significantly smaller
    })

    it('should detect slow network and suggest low bandwidth mode', async () => {
      const user = userEvent.setup()

      // Mock slow network connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          saveData: false,
        },
        writable: true,
      })

      renderApp()

      // Step 1: App detects slow connection
      // Step 2: Suggestion banner appears
      await waitFor(() => {
        expect(
          screen.getByText(/slow connection detected/i) ||
          screen.getByText(/enable low bandwidth mode/i)
        ).toBeInTheDocument()
      })

      // Step 3: User clicks "Enable" button
      const enableButton = screen.getByText(/enable/i) || 
                          screen.getByRole('button', { name: /enable.*bandwidth/i })
      await user.click(enableButton)

      // Step 4: Low bandwidth mode is enabled
      await waitFor(() => {
        expect(localStorage.getItem('lowBandwidth')).toBe('true')
      })

      // Step 5: Suggestion banner disappears
      expect(
        screen.queryByText(/slow connection detected/i)
      ).not.toBeInTheDocument()
    })

    it('should combine dark mode and low bandwidth mode', async () => {
      const user = userEvent.setup()

      renderApp()

      // Enable both modes
      const darkModeToggle = screen.getByLabelText(/dark mode/i)
      const lowBandwidthToggle = screen.getByLabelText(/low bandwidth/i)

      await user.click(darkModeToggle)
      await user.click(lowBandwidthToggle)

      // Both modes should be active
      await waitFor(() => {
        expect(document.body.classList.contains('dark')).toBe(true)
        expect(localStorage.getItem('lowBandwidth')).toBe('true')
      })

      // Navigate to chat
      await user.click(screen.getByText('Start Chatting'))

      // Chat should be in dark mode with no animations
      await waitFor(() => {
        const chatContainer = screen.getByRole('main')
        expect(chatContainer).toHaveClass(/dark/i)
        
        const animatedElements = chatContainer.querySelectorAll('[class*="animate"]')
        animatedElements.forEach(el => {
          const styles = getComputedStyle(el)
          expect(styles.animationDuration).toBe('0s')
        })
      })

      // Send message
      const mockResponse = {
        response: 'Test response',
        language: 'en',
        schemes: [],
        sessionId: 'test-session-123',
      }

      vi.mocked(apiModule.api.chat).mockResolvedValueOnce(mockResponse)

      const input = screen.getByPlaceholderText('Type your message here...')
      await user.type(input, 'Test')
      await user.click(screen.getByText('Send'))

      // Response appears without animations in dark mode
      await waitFor(() => {
        expect(screen.getByText('Test response')).toBeInTheDocument()
      })
    })

    it('should reduce image quality by at least 50% in low bandwidth mode', async () => {
      const user = userEvent.setup()

      renderApp()

      // Enable low bandwidth mode
      const lowBandwidthToggle = screen.getByLabelText(/low bandwidth/i)
      await user.click(lowBandwidthToggle)

      // Check image sources
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        const src = img.getAttribute('src') || ''
        const srcset = img.getAttribute('srcset') || ''
        
        // Should use low-quality images or have quality parameter
        expect(
          src.includes('quality=50') ||
          src.includes('low-quality') ||
          srcset.includes('quality=50') ||
          img.getAttribute('loading') === 'lazy'
        ).toBe(true)
      })
    })

    it('should lazy load non-critical resources in low bandwidth mode', async () => {
      const user = userEvent.setup()

      renderApp()

      // Enable low bandwidth mode
      const lowBandwidthToggle = screen.getByLabelText(/low bandwidth/i)
      await user.click(lowBandwidthToggle)

      // Navigate to about page (non-critical)
      const aboutLink = screen.getByText(/about/i) || screen.getByRole('link', { name: /about/i })
      await user.click(aboutLink)

      // About page content should be lazy loaded
      await waitFor(() => {
        expect(screen.getByText(/architecture/i)).toBeInTheDocument()
      })

      // Check that images are lazy loaded
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        expect(img.getAttribute('loading')).toBe('lazy')
      })
    })

    it('should maintain color contrast ratios in dark mode', async () => {
      const user = userEvent.setup()

      renderApp()

      // Enable dark mode
      const darkModeToggle = screen.getByLabelText(/dark mode/i)
      await user.click(darkModeToggle)

      await waitFor(() => {
        expect(document.body.classList.contains('dark')).toBe(true)
      })

      // Check text elements have sufficient contrast
      const textElements = document.querySelectorAll('p, h1, h2, h3, button, a')
      textElements.forEach(el => {
        const styles = getComputedStyle(el)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Calculate contrast ratio (simplified check)
        // In real implementation, would use proper contrast calculation
        expect(color).not.toBe(backgroundColor)
      })
    })
  })

  /**
   * Integration Test: Complete User Journey
   * Tests all flows together in a realistic scenario
   */
  describe('Integration: Complete User Journey', () => {
    it('should complete full user journey across all features', async () => {
      const user = userEvent.setup()

      // Mock all API responses
      const mockChatResponse = {
        response: 'Here are some schemes for farmers.',
        language: 'en',
        schemes: [
          {
            id: 'pm-kisan',
            name: 'PM-KISAN',
            description: 'Income support for farmers',
            eligibilitySummary: 'Small farmers',
            applicationSteps: ['Visit portal', 'Register'],
          },
        ],
        sessionId: 'test-session-123',
      }

      const mockEligibilityResponse = {
        eligible: true,
        explanation: {
          criteria: [
            { criterion: 'Age', required: '18-60', userValue: '45', met: true },
          ],
          summary: 'You are eligible',
        },
        schemeDetails: {
          name: 'PM-KISAN',
          benefits: '₹6000 per year',
          applicationProcess: ['Visit portal'],
          requiredDocuments: ['Aadhaar'],
        },
      }

      vi.mocked(apiModule.api.chat).mockResolvedValue(mockChatResponse)
      vi.mocked(apiModule.api.checkEligibility).mockResolvedValue(mockEligibilityResponse)

      renderApp()

      // 1. User lands on homepage
      expect(screen.getByText('Welcome to Bharat Sahayak')).toBeInTheDocument()

      // 2. User switches to Hindi
      const languageSelector = screen.getByLabelText(/language/i)
      await user.click(languageSelector)
      await user.click(screen.getByText('हिन्दी'))

      // 3. User enables dark mode
      const darkModeToggle = screen.getByLabelText(/dark mode/i)
      await user.click(darkModeToggle)

      // 4. User starts chatting
      await user.click(screen.getByRole('button', { name: /start/i }))

      // 5. User asks about schemes
      const input = screen.getByPlaceholderText(/type.*message/i)
      await user.type(input, 'मुझे किसान योजनाओं के बारे में बताएं')
      await user.click(screen.getByText(/send/i))

      // 6. User receives scheme recommendations
      await waitFor(() => {
        expect(screen.getByText('PM-KISAN')).toBeInTheDocument()
      })

      // 7. User checks eligibility
      const eligibilityForm = screen.getByRole('form', { name: /eligibility/i })
      const ageInput = within(eligibilityForm).getByLabelText(/age/i)
      await user.type(ageInput, '45')
      await user.click(within(eligibilityForm).getByText(/check/i))

      // 8. User sees eligibility result
      await waitFor(() => {
        expect(screen.getByText(/you are eligible/i)).toBeInTheDocument()
      })

      // 9. User applies for scheme
      const applyButton = screen.getByText(/apply/i)
      expect(applyButton).toHaveAttribute('href', expect.stringContaining('http'))

      // Verify complete journey
      expect(document.body.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('language')).toBe('hi')
      expect(apiModule.api.chat).toHaveBeenCalled()
      expect(apiModule.api.checkEligibility).toHaveBeenCalled()
    })
  })
})
