import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceInput, useLowBandwidth } from '../hooks'
import { api } from '../utils/api'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onError: (error: string) => void
}

export function VoiceInput({ onTranscript, onError }: VoiceInputProps) {
  const { isLowBandwidth } = useLowBandwidth()
  const { startRecording, stopRecording, isRecording, audioLevel, error } = useVoiceInput()
  
  // Handle recording toggle
  const handleToggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording()
    } else {
      await handleStartRecording()
    }
  }
  
  const handleStartRecording = async () => {
    try {
      await startRecording()
      // Audio level monitoring is handled by the hook
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }
  
  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording()
      
      if (audioBlob) {
        // Convert blob to base64 and send to API
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1]
          try {
            const response = await api.voiceToText({
              audioData: base64Audio,
              format: 'webm'
            })
            onTranscript(response.transcript)
          } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to transcribe audio')
          }
        }
        reader.readAsDataURL(audioBlob)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to stop recording')
    }
  }
  
  // Handle errors from useVoiceInput hook
  useEffect(() => {
    if (error) {
      onError(error)
    }
  }, [error, onError])
  
  // Waveform bars (5 bars with staggered animation)
  const waveformBars = [0, 1, 2, 3, 4]
  
  return (
    <div className="relative">
      <motion.button
        onClick={handleToggleRecording}
        className={`relative overflow-hidden ${
          isRecording
            ? 'w-48 rounded-xl bg-gradient-to-r from-orange-500 to-green-500'
            : 'w-12 h-12 rounded-full bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600'
        } flex items-center justify-center transition-all duration-200 hover:shadow-lg`}
        animate={isRecording ? { width: 192, borderRadius: 12 } : { width: 48, borderRadius: 9999 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        aria-pressed={isRecording}
      >
        {/* Ripple animation when active */}
        <AnimatePresence>
          {isRecording && !isLowBandwidth && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-xl"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
        
        {/* Microphone icon or waveform */}
        {!isRecording ? (
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          <div className="flex items-center justify-center space-x-1 h-8">
            {waveformBars.map((index) => (
              <motion.div
                key={index}
                className="w-1 bg-white rounded-full"
                animate={
                  isLowBandwidth
                    ? { height: 16 }
                    : {
                        height: [8, 24 * (audioLevel + 0.2), 8],
                      }
                }
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
                style={{ height: 8 }}
              />
            ))}
          </div>
        )}
      </motion.button>
      
      {/* Recording indicator text */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              ● Recording...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
