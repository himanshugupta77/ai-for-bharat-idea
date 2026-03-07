// API client utility with error handling and retry logic

import { API_BASE_URL } from './constants'
import { sanitizeInput } from './helpers'
import type { APIError } from '../types'

interface RequestConfig extends RequestInit {
  retry?: boolean
  retryCount?: number
  maxRetries?: number
  retryDelay?: number
}

interface APIResponse<T> {
  data?: T
  error?: APIError
  status: number
}

class APIClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Request interceptor - adds default headers and session ID
   */
  private async requestInterceptor(
    url: string,
    config: RequestConfig
  ): Promise<[string, RequestConfig]> {
    const headers = new Headers(config.headers || {})

    // Add default headers
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value)
      }
    })

    // Add session ID if available
    const sessionId = localStorage.getItem('bharat-sahayak-session')
    if (sessionId) {
      headers.set('X-Session-Id', sessionId)
    }

    return [url, { ...config, headers }]
  }

  /**
   * Response interceptor - handles common response processing
   */
  private async responseInterceptor<T>(response: Response): Promise<APIResponse<T>> {
    const status = response.status

    // Handle successful responses
    if (response.ok) {
      try {
        const data = await response.json()
        
        // Store session ID if provided
        if (data.sessionId) {
          localStorage.setItem('bharat-sahayak-session', data.sessionId)
        }

        return { data, status }
      } catch (error) {
        return {
          error: {
            error: 'ParseError',
            message: 'Failed to parse response',
          },
          status,
        }
      }
    }

    // Handle error responses
    try {
      const error = await response.json()
      return { error, status }
    } catch {
      return {
        error: {
          error: 'NetworkError',
          message: 'An error occurred while processing your request',
        },
        status,
      }
    }
  }

  /**
   * Implements exponential backoff retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    config: RequestConfig
  ): Promise<APIResponse<T>> {
    const {
      retry = true,
      retryCount = 0,
      maxRetries = 3,
      retryDelay = 1000,
      ...fetchConfig
    } = config

    try {
      const [interceptedUrl, interceptedConfig] = await this.requestInterceptor(
        url,
        fetchConfig
      )

      const response = await fetch(interceptedUrl, interceptedConfig)

      // Don't retry on client errors (4xx) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return this.responseInterceptor<T>(response)
      }

      // Retry on server errors (5xx) or 429
      if (!response.ok && retry && retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount) // Exponential backoff
        
        // For 429, use Retry-After header if available
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay
          
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        return this.fetchWithRetry<T>(url, {
          ...config,
          retryCount: retryCount + 1,
        })
      }

      return this.responseInterceptor<T>(response)
    } catch (error) {
      // Network error - retry if enabled
      if (retry && retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount)
        await new Promise((resolve) => setTimeout(resolve, delay))

        return this.fetchWithRetry<T>(url, {
          ...config,
          retryCount: retryCount + 1,
        })
      }

      return {
        error: {
          error: 'NetworkError',
          message: 'Network connection failed. Please check your internet connection.',
        },
        status: 0,
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    return this.fetchWithRetry<T>(url, {
      ...config,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    return this.fetchWithRetry<T>(url, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    return this.fetchWithRetry<T>(url, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    return this.fetchWithRetry<T>(url, {
      ...config,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_BASE_URL)

// Export type for use in other modules
export type { APIResponse }

// API helper functions for specific endpoints

interface ChatRequest {
  message: string
  language?: string
}

interface ChatResponse {
  response: string
  language: string
  schemes: Array<{
    id: string
    name: string
    description: string
    eligibilitySummary: string
    applicationSteps: string[]
    officialLink?: string
  }>
  sessionId: string
  sessionExpiring?: boolean
  sessionTimeRemaining?: number
}

interface VoiceToTextRequest {
  audioData: string
  format: string
}

interface VoiceToTextResponse {
  transcript: string
  detectedLanguage: string
  confidence: number
}

interface TextToSpeechRequest {
  text: string
  language: string
  lowBandwidth?: boolean
}

interface TextToSpeechResponse {
  audioData: string
  format: string
  duration: number
  sizeBytes: number
}

interface EligibilityCheckRequest {
  schemeId: string
  userInfo: {
    age: number
    gender: 'male' | 'female' | 'other'
    income: number
    state: string
    category: 'general' | 'obc' | 'sc' | 'st'
    occupation: string
    hasDisability?: boolean
    isBPL?: boolean
    ownsLand?: boolean
    landSize?: number
  }
}

interface EligibilityCheckResponse {
  eligible: boolean
  explanation: {
    criteria: Array<{
      criterion: string
      required: string
      userValue: string
      met: boolean
    }>
    summary: string
  }
  schemeDetails: {
    name: string
    benefits: string
    applicationProcess: string[]
    requiredDocuments: string[]
  }
}

export const api = {
  /**
   * Send a chat message
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Sanitize input before sending
    const sanitizedRequest = {
      ...request,
      message: sanitizeInput(request.message),
    }
    
    const response = await apiClient.post<ChatResponse>('/chat', sanitizedRequest)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  },

  /**
   * Convert voice to text
   */
  async voiceToText(request: VoiceToTextRequest): Promise<VoiceToTextResponse> {
    const response = await apiClient.post<VoiceToTextResponse>('/voice-to-text', request)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  },

  /**
   * Convert text to speech
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    // Sanitize input before sending
    const sanitizedRequest = {
      ...request,
      text: sanitizeInput(request.text),
    }
    
    const response = await apiClient.post<TextToSpeechResponse>('/text-to-speech', sanitizedRequest)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  },

  /**
   * Check eligibility for a scheme
   */
  async checkEligibility(request: EligibilityCheckRequest): Promise<EligibilityCheckResponse> {
    // Sanitize string inputs
    const sanitizedRequest = {
      ...request,
      schemeId: sanitizeInput(request.schemeId),
      userInfo: {
        ...request.userInfo,
        state: sanitizeInput(request.userInfo.state),
        occupation: sanitizeInput(request.userInfo.occupation),
      },
    }
    
    const response = await apiClient.post<EligibilityCheckResponse>('/eligibility-check', sanitizedRequest)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  },

  /**
   * Get session information including expiration status
   */
  async getSessionInfo(_sessionId: string): Promise<{
    sessionId: string
    exists: boolean
    expired: boolean
    timeRemainingSeconds: number
    showExpirationWarning: boolean
    messageCount: number
  }> {
    const response = await apiClient.get<{
      sessionId: string
      exists: boolean
      expired: boolean
      timeRemainingSeconds: number
      showExpirationWarning: boolean
      messageCount: number
    }>(`/session/info`)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  },

  /**
   * Delete session data immediately
   */
  async deleteSession(_sessionId: string): Promise<{ message: string; sessionId: string }> {
    const response = await apiClient.delete<{ message: string; sessionId: string }>(`/session`)
    
    if (response.error) {
      throw new Error(response.error.message)
    }
    
    return response.data!
  }
}
