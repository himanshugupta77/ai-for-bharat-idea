import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceOutputState {
  isPlaying: boolean
  progress: number
  duration: number
  error: string | null
}

interface UseVoiceOutputReturn extends VoiceOutputState {
  play: (audioData: string, format?: string) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
}

/**
 * Hook to handle audio playback
 */
const useVoiceOutput = (): UseVoiceOutputReturn => {
  const [state, setState] = useState<VoiceOutputState>({
    isPlaying: false,
    progress: 0,
    duration: 0,
    error: null,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Update playback progress
   */
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      const progress = audioRef.current.currentTime
      const duration = audioRef.current.duration || 0

      setState((prev) => ({
        ...prev,
        progress,
        duration,
      }))
    }
  }, [])

  /**
   * Start progress tracking
   */
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(updateProgress, 100)
  }, [updateProgress])

  /**
   * Stop progress tracking
   */
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  /**
   * Play audio from base64 data
   */
  const play = useCallback(
    async (audioData: string, format: string = 'mp3'): Promise<void> => {
      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          audioRef.current = null
        }

        stopProgressTracking()

        // Create new audio element
        const audio = new Audio()
        audioRef.current = audio

        // Convert base64 to blob URL
        const byteCharacters = atob(audioData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: `audio/${format}` })
        const url = URL.createObjectURL(blob)

        audio.src = url

        // Set up event listeners
        audio.onloadedmetadata = () => {
          setState((prev) => ({
            ...prev,
            duration: audio.duration,
          }))
        }

        audio.onplay = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: true,
            error: null,
          }))
          startProgressTracking()
        }

        audio.onpause = () => {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
          }))
          stopProgressTracking()
        }

        audio.onended = () => {
          setState({
            isPlaying: false,
            progress: 0,
            duration: 0,
            error: null,
          })
          stopProgressTracking()
          URL.revokeObjectURL(url)
        }

        audio.onerror = () => {
          setState({
            isPlaying: false,
            progress: 0,
            duration: 0,
            error: 'Failed to play audio',
          })
          stopProgressTracking()
          URL.revokeObjectURL(url)
        }

        // Start playback
        await audio.play()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to play audio'
        setState({
          isPlaying: false,
          progress: 0,
          duration: 0,
          error: errorMessage,
        })
      }
    },
    [startProgressTracking, stopProgressTracking]
  )

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [])

  /**
   * Resume playback
   */
  const resume = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play()
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: 'Failed to resume playback',
        }))
      }
    }
  }, [])

  /**
   * Stop playback and reset
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    stopProgressTracking()

    setState({
      isPlaying: false,
      progress: 0,
      duration: 0,
      error: null,
    })
  }, [stopProgressTracking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
  }
}

export default useVoiceOutput
