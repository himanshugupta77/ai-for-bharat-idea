import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiClient } from '../api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Retry Logic', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Exponential Backoff (Validates Requirement 21.2)', () => {
    it('should retry with exponential backoff on 500 errors', async () => {
      // First 2 calls fail with 500, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'InternalError', message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'InternalError', message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.get('/test')

      // First retry after 1000ms (2^0 * 1000)
      await vi.advanceTimersByTimeAsync(1000)

      // Second retry after 2000ms (2^1 * 1000)
      await vi.advanceTimersByTimeAsync(2000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(response.data).toEqual({ data: 'success' })
      expect(response.status).toBe(200)
    })

    it('should use exponential backoff delays: 1s, 2s, 4s', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: 'ServiceUnavailable', message: 'Service unavailable' }),
      })

      const responsePromise = apiClient.get('/test')

      // Track when retries happen
      const retryTimes: number[] = []
      const startTime = Date.now()

      // First call is immediate
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000)
      retryTimes.push(Date.now() - startTime)
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Second retry after 2000ms more
      await vi.advanceTimersByTimeAsync(2000)
      retryTimes.push(Date.now() - startTime)
      expect(mockFetch).toHaveBeenCalledTimes(3)

      // Third retry after 4000ms more
      await vi.advanceTimersByTimeAsync(4000)
      retryTimes.push(Date.now() - startTime)
      expect(mockFetch).toHaveBeenCalledTimes(4)

      await responsePromise

      // Verify exponential backoff pattern
      expect(retryTimes[0]).toBeGreaterThanOrEqual(1000)
      expect(retryTimes[1]).toBeGreaterThanOrEqual(3000)
      expect(retryTimes[2]).toBeGreaterThanOrEqual(7000)
    })

    it('should retry up to 3 times before giving up', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'InternalError', message: 'Server error' }),
      })

      const responsePromise = apiClient.get('/test')

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(1000) // First retry
      await vi.advanceTimersByTimeAsync(2000) // Second retry
      await vi.advanceTimersByTimeAsync(4000) // Third retry

      const response = await responsePromise

      // Initial call + 3 retries = 4 total calls
      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(response.error).toBeDefined()
      expect(response.status).toBe(500)
    })
  })

  describe('Retry on 429 Rate Limiting (Validates Requirement 21.2)', () => {
    it('should retry on 429 errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers(),
          json: async () => ({
            error: 'RateLimitExceeded',
            message: 'Too many requests',
            retryAfter: 2,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.get('/test')

      // Wait for retry delay
      await vi.advanceTimersByTimeAsync(2000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })

    it('should use Retry-After header value when present', async () => {
      const headers = new Headers()
      headers.set('Retry-After', '5')

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers,
          json: async () => ({
            error: 'RateLimitExceeded',
            message: 'Too many requests',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.get('/test')

      // Should wait 5 seconds as specified in Retry-After header
      await vi.advanceTimersByTimeAsync(5000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })
  })

  describe('No Retry on Client Errors (Validates Requirement 21.2)', () => {
    it('should not retry on 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'ValidationError',
          message: 'Invalid input',
        }),
      })

      const response = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.error?.error).toBe('ValidationError')
      expect(response.status).toBe(400)
    })

    it('should not retry on 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Unauthorized',
          message: 'Authentication required',
        }),
      })

      const response = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(401)
    })

    it('should not retry on 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Forbidden',
          message: 'Access denied',
        }),
      })

      const response = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(403)
    })

    it('should not retry on 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'NotFound',
          message: 'Resource not found',
        }),
      })

      const response = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.status).toBe(404)
    })
  })

  describe('Network Error Retry (Validates Requirement 21.2)', () => {
    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.get('/test')

      // Advance through retries
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(response.data).toEqual({ data: 'success' })
    })

    it('should return network error after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const responsePromise = apiClient.get('/test')

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(response.error?.error).toBe('NetworkError')
      expect(response.status).toBe(0)
    })
  })

  describe('Retry Disabled (Validates Requirement 21.2)', () => {
    it('should not retry when retry option is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'InternalError', message: 'Server error' }),
      })

      const response = await apiClient.get('/test', { retry: false })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.error?.error).toBe('InternalError')
    })
  })

  describe('Successful Response (Validates Requirement 21.2)', () => {
    it('should not retry on successful response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      })

      const response = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(response.data).toEqual({ data: 'success' })
      expect(response.status).toBe(200)
    })
  })

  describe('Retry with Different HTTP Methods (Validates Requirement 21.2)', () => {
    it('should retry POST requests on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: 'ServiceUnavailable', message: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.post('/test', { message: 'test' })

      await vi.advanceTimersByTimeAsync(1000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })

    it('should retry PUT requests on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          json: async () => ({ error: 'BadGateway', message: 'Bad gateway' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.put('/test', { data: 'test' })

      await vi.advanceTimersByTimeAsync(1000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })

    it('should retry DELETE requests on server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 504,
          json: async () => ({ error: 'GatewayTimeout', message: 'Gateway timeout' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.delete('/test')

      await vi.advanceTimersByTimeAsync(1000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })
  })

  describe('Edge Cases (Validates Requirement 21.2)', () => {
    it('should handle retry count correctly across multiple failures', async () => {
      let callCount = 0
      mockFetch.mockImplementation(async () => {
        callCount++
        if (callCount <= 3) {
          return {
            ok: false,
            status: 500,
            json: async () => ({ error: 'InternalError', message: 'Server error' }),
          }
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        }
      })

      const responsePromise = apiClient.get('/test')

      // Advance through retries
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const response = await responsePromise

      // Should stop after 3 retries (4 total calls)
      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(response.error).toBeDefined()
    })

    it('should handle mixed success and failure responses', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'InternalError', message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: 'success' }),
        })

      const responsePromise = apiClient.get('/test')

      await vi.advanceTimersByTimeAsync(1000)

      const response = await responsePromise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(response.data).toEqual({ data: 'success' })
    })
  })
})
