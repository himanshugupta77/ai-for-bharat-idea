import { motion } from 'framer-motion'
import { memo, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLowBandwidth } from '../hooks'
import { SchemeCard } from './SchemeCard'
import type { Message as MessageType } from '../types'

interface MessageProps {
  message: MessageType
}

export const Message = memo(function Message({ message }: MessageProps) {
  const { isLowBandwidth } = useLowBandwidth()
  const navigate = useNavigate()
  const isUser = message.role === 'user'
  
  // Handle eligibility check navigation
  const handleCheckEligibility = useCallback((schemeId: string) => {
    // Store scheme ID in sessionStorage for the eligibility page
    sessionStorage.setItem('selectedSchemeId', schemeId)
    // Navigate to eligibility check page (you'll need to create this route)
    navigate('/eligibility')
  }, [navigate])
  
  // Memoize timestamp formatting
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [message.timestamp])
  
  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  }
  
  const animationProps = isLowBandwidth
    ? {}
    : {
        initial: 'hidden',
        animate: 'visible',
        variants: messageVariants,
        transition: { duration: 0.3, ease: 'easeOut' }
      }
  
  return (
    <motion.div
      {...animationProps}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-2 sm:space-x-3`}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message at ${formattedTime}`}
    >
      {/* Avatar for assistant - smaller on mobile */}
      {!isUser && (
        <div 
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-400 to-green-400 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-white text-xs sm:text-sm font-semibold">AI</span>
        </div>
      )}
      
      {/* Message Content - responsive max width */}
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white'
              : 'bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20 dark:border-gray-700/20'
          }`}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {formattedTime}
        </div>
        
        {/* Scheme Cards for assistant messages */}
        {!isUser && message.schemes && message.schemes.length > 0 && (
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            {message.schemes.map((scheme) => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme}
                onCheckEligibility={() => handleCheckEligibility(scheme.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Avatar for user - smaller on mobile */}
      {isUser && (
        <div 
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-white text-xs sm:text-sm font-semibold">U</span>
        </div>
      )}
    </motion.div>
  )
})
