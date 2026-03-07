import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedGradient } from '../components/AnimatedGradient'
import { EligibilityForm } from '../components/EligibilityForm'
import { EligibilityResult } from '../components/EligibilityResult'
import { api } from '../utils/api'
import { useToastContext } from '../contexts/ToastContext'
import type { UserInfo, EligibilityResult as EligibilityResultType } from '../types'

export default function EligibilityPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useToastContext()
  const [schemeId, setSchemeId] = useState<string | null>(null)
  const [schemeName, setSchemeName] = useState<string>('Selected Scheme')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EligibilityResultType | null>(null)

  useEffect(() => {
    // Get scheme ID from sessionStorage
    const storedSchemeId = sessionStorage.getItem('selectedSchemeId')
    
    if (!storedSchemeId) {
      showError('No scheme selected. Redirecting to chat...')
      setTimeout(() => navigate('/chat'), 2000)
      return
    }

    setSchemeId(storedSchemeId)
    
    // Fetch scheme details to get the name
    fetchSchemeDetails(storedSchemeId)
  }, [navigate, showError])

  const fetchSchemeDetails = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/schemes/${id}`)
      if (response.ok) {
        const scheme = await response.json()
        setSchemeName(scheme.name)
      }
    } catch (error) {
      console.error('Failed to fetch scheme details:', error)
    }
  }

  const handleSubmit = async (userInfo: UserInfo) => {
    if (!schemeId) return

    setIsLoading(true)
    try {
      const response = await api.checkEligibility({
        schemeId,
        userInfo,
      })

      setResult(response)
      success('Eligibility check completed!')
    } catch (error) {
      console.error('Eligibility check failed:', error)
      showError(
        error instanceof Error ? error.message : 'Failed to check eligibility. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/chat')
  }

  const handleCheckAnother = () => {
    setResult(null)
    sessionStorage.removeItem('selectedSchemeId')
    navigate('/chat')
  }

  if (!schemeId) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedGradient />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-900 dark:text-white">
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <AnimatedGradient />

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/chat')}
            className="mb-6 flex items-center text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            aria-label="Go back to chat"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Chat
          </button>

          {/* Show form or result */}
          {!result ? (
            <>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-900 dark:text-white">
                    Checking eligibility...
                  </p>
                </div>
              ) : (
                <EligibilityForm
                  schemeId={schemeId}
                  schemeName={schemeName}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              )}
            </>
          ) : (
            <EligibilityResult
              result={result}
              onClose={handleCheckAnother}
            />
          )}
        </div>
      </div>
    </div>
  )
}
