/**
 * Memoization utilities for performance optimization
 */

/**
 * Simple memoization function for expensive computations
 * @param fn Function to memoize
 * @param maxCacheSize Maximum number of cached results (default: 100)
 * @returns Memoized function
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  maxCacheSize: number = 100
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>()
  const keys: string[] = []

  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    keys.push(key)

    // Implement LRU cache eviction
    if (keys.length > maxCacheSize) {
      const oldestKey = keys.shift()!
      cache.delete(oldestKey)
    }

    return result
  }
}

/**
 * Debounce function to limit execution rate
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle function to limit execution frequency
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let inThrottle = false

  return (...args: TArgs) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
