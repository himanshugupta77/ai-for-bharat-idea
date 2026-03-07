import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSession, useLanguage, useLowBandwidth } from '../hooks'
import { GlassCard, LoadingShimmer, TypingIndicator } from '../components'
import { Message as MessageComponent } from '../components/Message'
import { VoiceInput } from '../components/VoiceInput'
import { SessionExpirationWarning } from '../components/SessionExpirationWarning'
import { PrivacyNotice } from '../components/PrivacyNotice'
import { ClearSessionButton } from '../components/ClearSessionButton'
import AnimatedBackground from '../components/AnimatedBackground'
import { api } from '../utils/api'
import { announceToScreenReader } from '../utils/accessibility'
import { useToastContext } from '../contexts/ToastContext'
import type { Message } from '../types'

export default function ChatPage() {
  const { t } = useTranslation()
  const { clearSession } = useSession()
  const { language } = useLanguage()
  const { isLowBandwidth } = useLowBandwidth()
  const toast = useToastContext()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExpirationWarning, setShowExpirationWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const MAX_CHARS = 1000
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isLowBandwidth ? 'auto' : 'smooth' })
  }, [messages, isLowBandwidth])
  
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setIsTyping(true)
    setError(null)
    
    try {
      const response = await api.chat({
        message: userMessage.content,
        language: language
      })
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
        schemes: response.schemes
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Handle session expiration warning
      if (response.sessionExpiring && response.sessionTimeRemaining) {
        setShowExpirationWarning(true)
        setTimeRemaining(response.sessionTimeRemaining)
        announceToScreenReader('Your session will expire soon', 'polite')
      }
      
      // Announce to screen readers
      announceToScreenReader('New message received from assistant')
      
      // Announce schemes if any
      if (response.schemes && response.schemes.length > 0) {
        announceToScreenReader(`${response.schemes.length} scheme recommendations available`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      announceToScreenReader('Error sending message. Please try again.', 'assertive')
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const handleVoiceTranscript = (transcript: string) => {
    setInputText(transcript)
    inputRef.current?.focus()
    toast.success('Voice input received')
  }
  
  const handleVoiceError = (error: string) => {
    setError(error)
    toast.error(error)
  }
  
  const handleClearSession = () => {
    clearSession()
    setMessages([])
    setShowExpirationWarning(false)
    toast.success(t('session.sessionCleared'))
    announceToScreenReader('Session cleared', 'polite')
  }
  
  const remainingChars = MAX_CHARS - inputText.length
  const isOverLimit = remainingChars < 0
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Privacy Notice Modal */}
      <PrivacyNotice />
      
      {/* Skip to main content link */}
      <a
        href="#chat-main"
        className="skip-link"
      >
        {t('accessibility.skipToContent')}
      </a>
      
      {/* Responsive container: full width on mobile, constrained on larger screens */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-4xl">
        {/* Header - responsive text sizes */}
        <header className="mb-4 sm:mb-6 flex items-center justify-between" role="banner">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t('common.appName')}
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              {t('landing.subtitle')}
            </p>
          </div>
          <ClearSessionButton onClearSession={handleClearSession} disabled={isLoading} />
        </header>
        
        {/* Messages Container - responsive height */}
        <main id="chat-main" role="main">
          {/* Session Expiration Warning */}
          {showExpirationWarning && timeRemaining > 0 && (
            <SessionExpirationWarning
              timeRemainingSeconds={timeRemaining}
              onClearSession={handleClearSession}
            />
          )}
          
          <GlassCard className="mb-4 h-[50vh] sm:h-[55vh] lg:h-[60vh] overflow-y-auto">
            <div 
              className="space-y-3 sm:space-y-4 p-3 sm:p-4"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
              aria-relevant="additions"
            >
            {messages.length === 0 && (
              <div className="text-center text-gray-300 py-12">
                <p className="text-lg mb-2">{t('chat.noMessages')}</p>
                <p className="text-sm">{t('landing.description')}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3" role="status" aria-live="polite">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-green-400 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold" aria-hidden="true">AI</span>
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                  <span className="sr-only">{t('chat.typing')}</span>
                </div>
              </div>
            )}
            
            {isLoading && !isTyping && (
              <div role="status" aria-live="polite">
                <LoadingShimmer />
                <span className="sr-only">{t('common.loading')}</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </GlassCard>
        
        {/* Error Display */}
        {error && (
          <div 
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        {/* Input Area - responsive layout */}
        <GlassCard>
          <div className="p-3 sm:p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} aria-label="Send message form">
              {/* Mobile: stacked layout, Desktop: horizontal layout */}
              <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('chat.placeholder')}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-800/70 text-white placeholder-gray-400 border ${
                    isOverLimit ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none transition-all duration-300`}
                  rows={2}
                  disabled={isLoading}
                  aria-label={t('chat.placeholder')}
                  aria-describedby="char-counter"
                />
                <div className="flex justify-between items-center mt-2">
                  <span
                    id="char-counter"
                    className={`text-xs sm:text-sm ${
                      isOverLimit
                        ? 'text-red-400 font-semibold'
                        : remainingChars < 100
                        ? 'text-orange-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {remainingChars} characters remaining
                  </span>
                </div>
              </div>
              
              {/* Voice Input and Send Button - horizontal on mobile, part of row on desktop */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Voice Input Button */}
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={handleVoiceError}
                />
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading || isOverLimit}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                  aria-label={t('chat.send')}
                  type="submit"
                >
                  {t('chat.send')}
                </button>
              </div>
            </div>
          </form>
          </div>
        </GlassCard>
      </main>
      </div>
    </div>
  )
}
