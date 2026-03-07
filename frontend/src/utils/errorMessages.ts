import type { APIError } from '../types'

/**
 * Get user-friendly error message based on error type and status code
 * Implements Requirements 20.3, 20.4
 */
export function getErrorMessage(error: APIError, statusCode: number): string {
  // Handle specific error types
  switch (error.error) {
    case 'NetworkError':
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    
    case 'RateLimitExceeded': {
      const retryAfter = error.retryAfter || 60
      return `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    }
    
    case 'ValidationError':
      return error.message || 'Invalid input. Please check your information and try again.'
    
    case 'ParseError':
      return 'Unable to process the response. Please try again.'
    
    case 'AudioQualityError':
      return 'Audio quality is too low. Please speak clearly and try again.'
    
    case 'PayloadTooLarge':
      return 'The file is too large. Please try with a smaller file.'
    
    case 'SchemeNotFound':
      return 'The requested scheme was not found. Please try another scheme.'
    
    case 'InternalError':
      return 'An unexpected error occurred. Our team has been notified. Please try again later.'
  }

  // Handle by status code
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    
    case 401:
      return 'Authentication required. Please refresh the page and try again.'
    
    case 403:
      return 'Access denied. You do not have permission to perform this action.'
    
    case 404:
      return 'The requested resource was not found.'
    
    case 429:
      return 'Too many requests. Please wait a moment before trying again.'
    
    case 500:
      return 'Server error. Please try again in a few moments.'
    
    case 502:
    case 503:
      return 'Service temporarily unavailable. Please try again in a few moments.'
    
    case 504:
      return 'Request timeout. Please check your connection and try again.'
    
    default:
      if (statusCode >= 500) {
        return 'Server error. Please try again later.'
      }
      if (statusCode >= 400) {
        return 'Request failed. Please try again.'
      }
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Get error message in the user's selected language
 * Implements Requirements 21.4
 */
export function getLocalizedErrorMessage(
  error: APIError,
  statusCode: number,
  _language: string
): string {
  // For now, return English message
  // In a full implementation, this would use i18n library
  // to return translated messages based on language
  return getErrorMessage(error, statusCode)
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(statusCode: number): boolean {
  // Retry on server errors (5xx) and rate limiting (429)
  return statusCode >= 500 || statusCode === 429
}

/**
 * Determine if an error is a network error
 */
export function isNetworkError(error: APIError): boolean {
  return error.error === 'NetworkError'
}
