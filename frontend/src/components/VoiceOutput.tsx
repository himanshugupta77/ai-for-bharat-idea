import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useVoiceOutput, useLanguage, useLowBandwidth } from '../hooks'
import { api } from '../utils/api'

interface VoiceOutputProps {
  text: string
  className?: string
}

export function VoiceOutput({ text, className = '' }: VoiceOutputProps) {
  const { language } = useLanguage()
  const { isLowBandwidth } = useLowBandwidth()
  const { play, stop, isPlaying, error, progress: hookProgress } = useVoiceOutput()
  
  const [localProgress, setLocalProgress] = useState(0)
  
  // Use hook progress if available, otherwise use local progress
  const progress = hookProgress || localProgress
  
  // Handle play/pause toggle
  const handleTogglePlayback = async () => {
    if (isPlaying) {
      handleStop()
    } else {
      await handlePlay()
    }
  }
  
  const handlePlay = async () => {
    try {
      // Get audio from API
      const response = await api.textToSpeech({
        text,
        language,
        lowBandwidth: isLowBandwidth
      })
      
      if (response.audioData) {
        // Play audio using the hook
        await play(response.audioData, response.format)
      }
    } catch (err) {
      console.error('Failed to play audio:', err)
    }
  }
  
  const handleStop = useCallback(() => {
    stop()
    setLocalProgress(0)
  }, [stop])
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Voice output error:', error)
      handleStop()
    }
  }, [error, handleStop])
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <motion.button
        onClick={handleTogglePlayback}
        className="relative w-8 h-8 rounded-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
        whileHover={isLowBandwidth ? {} : { scale: 1.1 }}
        whileTap={isLowBandwidth ? {} : { scale: 0.95 }}
        aria-label={isPlaying ? 'Stop audio playback' : 'Play audio'}
        disabled={!text}
      >
        {/* Progress ring */}
        {isPlaying && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-orange-500 dark:text-orange-400"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
        )}
        
        {/* Speaker icon or pause icon */}
        {!isPlaying ? (
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        )}
      </motion.button>
      
      {/* Low bandwidth indicator */}
      {isLowBandwidth && isPlaying && (
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          Compressed audio
        </span>
      )}
    </div>
  )
}
