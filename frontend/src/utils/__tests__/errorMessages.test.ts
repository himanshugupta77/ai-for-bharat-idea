import { describe, it, expect } from 'vitest'
import {
  getErrorMessage,
  getLocalizedErrorMessage,
  isRetryableError,
  isNetworkError,
} from '../errorMessages'
import type { APIError } from '@/types'

describe('Error Messages', () => {
  describe('getErrorMessage - Specific Error Types (Validates Requirement 21.1, 21.4)', () => {
    it('should return network error message', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      const message = getErrorMessage(error, 0)

      expect(message).toContain('Unable to connect')
      expect(message).toContain('internet connection')
    })

    it('should return rate limit error message with retry time', () => {
      const error: APIError = {
        error: 'RateLimitExceeded',
        message: 'Too many requests',
        retryAfter: 60,
      }

      const message = getErrorMessage(error, 429)

      expect(message).toContain('Too many requests')
      expect(message).toContain('60 seconds')
    })

    it('should return rate limit error with default retry time when not specified', () => {
      const error: APIError = {
        error: 'RateLimitExceeded',
        message: 'Too many requests',
      }

      const message = getErrorMessage(error, 429)

      expect(message).toContain('Too many requests')
      expect(message).toContain('60 seconds')
    })

    it('should return validation error message', () => {
      const error: APIError = {
        error: 'ValidationError',
        message: 'Invalid age',
        field: 'age',
      }

      const message = getErrorMessage(error, 400)

      expect(message).toContain('Invalid input')
      expect(message).toContain('check your information')
    })

    it('should return parse error message', () => {
      const error: APIError = {
        error: 'ParseError',
        message: 'Failed to parse',
      }

      const message = getErrorMessage(error, 200)

      expect(message).toContain('Unable to process')
      expect(message).toContain('try again')
    })

    it('should return audio quality error message', () => {
      const error: APIError = {
        error: 'AudioQualityError',
        message: 'Low quality',
      }

      const message = getErrorMessage(error, 400)

      expect(message).toContain('Audio quality')
      expect(message).toContain('speak clearly')
    })

    it('should return payload too large error message', () => {
      const error: APIError = {
        error: 'PayloadTooLarge',
        message: 'File too large',
      }

      const message = getErrorMessage(error, 413)

      expect(message).toContain('too large')
      expect(message).toContain('smaller file')
    })

    it('should return scheme not found error message', () => {
      const error: APIError = {
        error: 'SchemeNotFound',
        message: 'Scheme not found',
      }

      const message = getErrorMessage(error, 404)

      expect(message).toContain('scheme was not found')
      expect(message).toContain('try another scheme')
    })

    it('should return internal error message', () => {
      const error: APIError = {
        error: 'InternalError',
        message: 'Server error',
      }

      const message = getErrorMessage(error, 500)

      expect(message).toContain('unexpected error')
      expect(message).toContain('try again later')
    })
  })

  describe('getErrorMessage - Status Codes (Validates Requirement 21.1, 21.4)', () => {
    it('should return 400 error message', () => {
      const error: APIError = {
        error: 'BadRequest',
        message: 'Bad request',
      }

      const message = getErrorMessage(error, 400)

      expect(message).toContain('Invalid request')
      expect(message).toContain('check your input')
    })

    it('should return 401 error message', () => {
      const error: APIError = {
        error: 'Unauthorized',
        message: 'Unauthorized',
      }

      const message = getErrorMessage(error, 401)

      expect(message).toContain('Authentication required')
      expect(message).toContain('refresh the page')
    })

    it('should return 403 error message', () => {
      const error: APIError = {
        error: 'Forbidden',
        message: 'Forbidden',
      }

      const message = getErrorMessage(error, 403)

      expect(message).toContain('Access denied')
      expect(message).toContain('do not have permission')
    })

    it('should return 404 error message', () => {
      const error: APIError = {
        error: 'NotFound',
        message: 'Not found',
      }

      const message = getErrorMessage(error, 404)

      expect(message).toContain('resource was not found')
    })

    it('should return 429 error message', () => {
      const error: APIError = {
        error: 'TooManyRequests',
        message: 'Too many requests',
      }

      const message = getErrorMessage(error, 429)

      expect(message).toContain('Too many requests')
      expect(message).toContain('wait a moment')
    })

    it('should return 500 error message', () => {
      const error: APIError = {
        error: 'ServerError',
        message: 'Server error',
      }

      const message = getErrorMessage(error, 500)

      expect(message).toContain('Server error')
      expect(message).toContain('try again')
    })

    it('should return 502 error message', () => {
      const error: APIError = {
        error: 'BadGateway',
        message: 'Bad gateway',
      }

      const message = getErrorMessage(error, 502)

      expect(message).toContain('temporarily unavailable')
      expect(message).toContain('try again')
    })

    it('should return 503 error message', () => {
      const error: APIError = {
        error: 'ServiceUnavailable',
        message: 'Service unavailable',
      }

      const message = getErrorMessage(error, 503)

      expect(message).toContain('temporarily unavailable')
      expect(message).toContain('try again')
    })

    it('should return 504 error message', () => {
      const error: APIError = {
        error: 'GatewayTimeout',
        message: 'Gateway timeout',
      }

      const message = getErrorMessage(error, 504)

      expect(message).toContain('timeout')
      expect(message).toContain('check your connection')
    })
  })

  describe('getErrorMessage - Fallback Messages (Validates Requirement 21.1)', () => {
    it('should return generic 5xx error message for unknown server errors', () => {
      const error: APIError = {
        error: 'UnknownError',
        message: 'Unknown error',
      }

      const message = getErrorMessage(error, 599)

      expect(message).toContain('Server error')
      expect(message).toContain('try again later')
    })

    it('should return generic 4xx error message for unknown client errors', () => {
      const error: APIError = {
        error: 'UnknownError',
        message: 'Unknown error',
      }

      const message = getErrorMessage(error, 499)

      expect(message).toContain('Request failed')
      expect(message).toContain('try again')
    })

    it('should return error message from API when no specific handler exists', () => {
      const error: APIError = {
        error: 'CustomError',
        message: 'Custom error message',
      }

      const message = getErrorMessage(error, 200)

      expect(message).toBe('Custom error message')
    })

    it('should return generic message when error message is empty', () => {
      const error: APIError = {
        error: 'UnknownError',
        message: '',
      }

      const message = getErrorMessage(error, 200)

      expect(message).toContain('unexpected error')
      expect(message).toContain('try again')
    })
  })

  describe('getLocalizedErrorMessage (Validates Requirement 21.4)', () => {
    it('should return error message in English', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      const message = getLocalizedErrorMessage(error, 0, 'en')

      expect(message).toContain('Unable to connect')
    })

    it('should return error message for Hindi (currently returns English)', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      const message = getLocalizedErrorMessage(error, 0, 'hi')

      // Currently returns English, but structure is in place for i18n
      expect(message).toContain('Unable to connect')
    })

    it('should handle all supported languages', () => {
      const error: APIError = {
        error: 'ValidationError',
        message: 'Invalid input',
      }

      const languages = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or']

      languages.forEach((lang) => {
        const message = getLocalizedErrorMessage(error, 400, lang)
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(0)
      })
    })
  })

  describe('isRetryableError (Validates Requirement 21.2)', () => {
    it('should return true for 500 errors', () => {
      expect(isRetryableError(500)).toBe(true)
    })

    it('should return true for 502 errors', () => {
      expect(isRetryableError(502)).toBe(true)
    })

    it('should return true for 503 errors', () => {
      expect(isRetryableError(503)).toBe(true)
    })

    it('should return true for 504 errors', () => {
      expect(isRetryableError(504)).toBe(true)
    })

    it('should return true for 429 rate limit errors', () => {
      expect(isRetryableError(429)).toBe(true)
    })

    it('should return false for 400 errors', () => {
      expect(isRetryableError(400)).toBe(false)
    })

    it('should return false for 401 errors', () => {
      expect(isRetryableError(401)).toBe(false)
    })

    it('should return false for 403 errors', () => {
      expect(isRetryableError(403)).toBe(false)
    })

    it('should return false for 404 errors', () => {
      expect(isRetryableError(404)).toBe(false)
    })

    it('should return false for 200 success', () => {
      expect(isRetryableError(200)).toBe(false)
    })

    it('should return false for 201 created', () => {
      expect(isRetryableError(201)).toBe(false)
    })
  })

  describe('isNetworkError (Validates Requirement 21.2)', () => {
    it('should return true for NetworkError', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      expect(isNetworkError(error)).toBe(true)
    })

    it('should return false for other error types', () => {
      const error: APIError = {
        error: 'ValidationError',
        message: 'Invalid input',
      }

      expect(isNetworkError(error)).toBe(false)
    })

    it('should return false for InternalError', () => {
      const error: APIError = {
        error: 'InternalError',
        message: 'Server error',
      }

      expect(isNetworkError(error)).toBe(false)
    })

    it('should return false for RateLimitExceeded', () => {
      const error: APIError = {
        error: 'RateLimitExceeded',
        message: 'Too many requests',
      }

      expect(isNetworkError(error)).toBe(false)
    })
  })

  describe('Edge Cases (Validates Requirement 21.1)', () => {
    it('should handle error with missing message field', () => {
      const error = {
        error: 'UnknownError',
      } as APIError

      const message = getErrorMessage(error, 500)

      expect(message).toBeTruthy()
      expect(message.length).toBeGreaterThan(0)
    })

    it('should handle error with null message', () => {
      const error = {
        error: 'UnknownError',
        message: null as unknown as string,
      } as APIError

      const message = getErrorMessage(error, 500)

      expect(message).toBeTruthy()
      expect(message.length).toBeGreaterThan(0)
    })

    it('should handle error with undefined error type', () => {
      const error = {
        message: 'Something went wrong',
      } as APIError

      const message = getErrorMessage(error, 500)

      expect(message).toBeTruthy()
    })

    it('should handle status code 0 (network failure)', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      const message = getErrorMessage(error, 0)

      expect(message).toContain('Unable to connect')
    })

    it('should handle negative status codes', () => {
      const error: APIError = {
        error: 'UnknownError',
        message: 'Unknown error',
      }

      const message = getErrorMessage(error, -1)

      expect(message).toBeTruthy()
    })

    it('should handle very large status codes', () => {
      const error: APIError = {
        error: 'UnknownError',
        message: 'Unknown error',
      }

      const message = getErrorMessage(error, 9999)

      expect(message).toBeTruthy()
    })
  })

  describe('User-Friendly Messages (Validates Requirement 21.4)', () => {
    it('should not expose technical details in error messages', () => {
      const error: APIError = {
        error: 'InternalError',
        message: 'Database connection failed at line 42',
      }

      const message = getErrorMessage(error, 500)

      expect(message).not.toContain('Database')
      expect(message).not.toContain('line 42')
      expect(message).toContain('unexpected error')
    })

    it('should provide actionable guidance in error messages', () => {
      const error: APIError = {
        error: 'NetworkError',
        message: 'Network failed',
      }

      const message = getErrorMessage(error, 0)

      expect(message).toContain('check your internet connection')
      expect(message).toContain('try again')
    })

    it('should be concise and clear', () => {
      const error: APIError = {
        error: 'ValidationError',
        message: 'Invalid input',
      }

      const message = getErrorMessage(error, 400)

      expect(message.length).toBeLessThan(200)
      expect(message).toMatch(/[.!]$/) // Ends with punctuation
    })
  })
})
