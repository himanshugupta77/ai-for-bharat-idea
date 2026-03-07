import { useState, useRef, useCallback, useEffect } from 'react'
import { AUDIO_CONFIG } from '../utils/constants'

interface VoiceInputState {
  isRecording: boolean
  audioLevel: number
  error: string | null
}

interface UseVoiceInputReturn extends VoiceInputState {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  cancelRecording: () => void
}

/**
 * Hook to handle Web Audio API for voice recording
 */
const useVoiceInput = (): UseVoiceInputReturn => {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    audioLevel: 0,
    error: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /**
   * Monitor audio level for visualization and silence detection
   */
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average audio level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = average / 255

    setState((prev) => ({ ...prev, audioLevel: normalizedLevel }))

    // Silence detection: if audio level is very low for extended period
    if (normalizedLevel < 0.01) {
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            // Stop recording on silence - will be handled by stopRecording
            mediaRecorderRef.current.stop()
          }
        }, AUDIO_CONFIG.silenceThreshold)
      }
    } else {
      // Reset silence timeout if audio detected
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }, [])

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_CONFIG.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      streamRef.current = stream

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Set up media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
      })

      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()

      setState({
        isRecording: true,
        audioLevel: 0,
        error: null,
      })

      // Start monitoring audio level
      monitorAudioLevel()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to access microphone'
      setState({
        isRecording: false,
        audioLevel: 0,
        error: errorMessage,
      })
    }
  }, [monitorAudioLevel])

  /**
   * Stop recording and return audio blob
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Clean up
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = null
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }

        setState({
          isRecording: false,
          audioLevel: 0,
          error: null,
        })

        resolve(audioBlob)
      }

      mediaRecorderRef.current.stop()
    })
  }, [])

  /**
   * Cancel recording without returning audio
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      audioChunksRef.current = []
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setState({
      isRecording: false,
      audioLevel: 0,
      error: null,
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRecording()
    }
  }, [cancelRecording])

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}

export default useVoiceInput
