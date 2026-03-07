/**
 * Error Handling Examples
 * 
 * This file demonstrates how to use the error handling and user feedback
 * mechanisms implemented in Task 19.
 * 
 * Implements Requirements 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useToastContext } from '../contexts/ToastContext'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { ProgressIndicator, InlineProgressIndicator } from './ProgressIndicator'
import { GlassButton, GlassCard } from '.'
import { api } from '../utils/api'

/**
 * Example 1: Using ErrorBoundary to catch React errors
 */
function ErrorBoundaryExample() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('This is a test error!')
  }

  return (
    <ErrorBoundary>
      <div>
        <h2>Error Boundary Example</h2>
        <p>Click the button to trigger an error:</p>
        <GlassButton onClick={() => setShouldError(true)}>
          Trigger Error
        </GlassButton>
      </div>
    </ErrorBoundary>
  )
}

/**
 * Example 2: Using Toast notifications for user feedback
 */
function ToastExample() {
  const toast = useToastContext()

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
      <div className="flex flex-wrap gap-3">
        <GlassButton onClick={() => toast.success('Operation completed successfully!')}>
          Show Success
        </GlassButton>
        <GlassButton onClick={() => toast.error('An error occurred. Please try again.')}>
          Show Error
        </GlassButton>
        <GlassButton onClick={() => toast.warning('This action cannot be undone.')}>
          Show Warning
        </GlassButton>
        <GlassButton onClick={() => toast.info('New features are available.')}>
          Show Info
        </GlassButton>
      </div>
    </GlassCard>
  )
}

/**
 * Example 3: Handling API errors with retry logic
 */
function APIErrorHandlingExample() {
  const toast = useToastContext()
  const [isLoading, setIsLoading] = useState(false)

  const handleAPICall = async () => {
    setIsLoading(true)
    try {
      // The API client automatically handles retries with exponential backoff
      const response = await api.chat({
        message: 'Tell me about PM-KISAN scheme',
        language: 'en'
      })
      
      toast.success('Message sent successfully!')
      console.log('Response:', response)
    } catch (error) {
      // Error is already retried by the API client
      // Now we show user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to send message'
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">API Error Handling</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        The API client automatically retries failed requests with exponential backoff.
        Network errors, 429 (rate limit), and 5xx errors are retried up to 3 times.
      </p>
      <GlassButton onClick={handleAPICall} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send API Request'}
      </GlassButton>
    </GlassCard>
  )
}

/**
 * Example 4: Network status monitoring
 */
function NetworkStatusExample() {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkStatus()

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Network Status</h2>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Connection:</span>
          <span className={isSlowConnection ? 'text-yellow-600' : 'text-green-600'}>
            {isSlowConnection ? 'Slow' : 'Good'}
          </span>
        </div>
        {effectiveType && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Type:</span>
            <span>{effectiveType}</span>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

/**
 * Example 5: Progress indicators for long-running operations
 */
function ProgressIndicatorExample() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const simulateProgress = () => {
    setIsLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Progress Indicators</h2>
      
      {/* Determinate progress */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Determinate Progress</h3>
        <ProgressIndicator
          isLoading={isLoading}
          message="Processing your request"
          progress={progress}
        />
        {!isLoading && (
          <GlassButton onClick={simulateProgress}>
            Start Progress
          </GlassButton>
        )}
      </div>

      {/* Indeterminate progress */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Indeterminate Progress</h3>
        <ProgressIndicator
          isLoading={true}
          message="Loading data"
        />
      </div>

      {/* Inline progress */}
      <div>
        <h3 className="text-sm font-medium mb-2">Inline Progress</h3>
        <InlineProgressIndicator message="Saving changes" />
      </div>
    </GlassCard>
  )
}

/**
 * Example 6: Comprehensive error handling in a form
 */
function FormWithErrorHandlingExample() {
  const toast = useToastContext()
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      toast.success('Form submitted successfully!')
      setFormData({ name: '', email: '' })
    } catch (error) {
      toast.error('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold mb-4">Form with Error Handling</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-saffron`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-600 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-saffron`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600 mt-1">
              {errors.email}
            </p>
          )}
        </div>

        <GlassButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? <InlineProgressIndicator message="Submitting" /> : 'Submit'}
        </GlassButton>
      </form>
    </GlassCard>
  )
}

/**
 * Main example component showcasing all error handling features
 */
export default function ErrorHandlingExamples() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron via-white to-green p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Error Handling & User Feedback Examples
        </h1>

        <ErrorBoundaryExample />
        <ToastExample />
        <APIErrorHandlingExample />
        <NetworkStatusExample />
        <ProgressIndicatorExample />
        <FormWithErrorHandlingExample />
      </div>
    </div>
  )
}
