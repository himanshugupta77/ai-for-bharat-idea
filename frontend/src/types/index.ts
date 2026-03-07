// Core type definitions for Bharat Sahayak

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'mr'
  | 'ta'
  | 'te'
  | 'bn'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  schemes?: SchemeCard[]
}

export interface SchemeCard {
  id: string
  name: string
  description: string
  category?: string
  eligibilitySummary: string
  applicationSteps: string[]
  officialLink?: string
}

export interface ChatState {
  messages: Message[]
  sessionId: string
  isLoading: boolean
  isVoiceActive: boolean
  selectedLanguage: SupportedLanguage
  isDarkMode: boolean
  isLowBandwidth: boolean
}

export interface UserInfo {
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

export interface EligibilityCriterion {
  criterion: string
  required: string
  userValue: string
  met: boolean
}

export interface EligibilityResult {
  eligible: boolean
  explanation: {
    criteria: EligibilityCriterion[]
    summary: string
  }
  schemeDetails: {
    name: string
    benefits: string
    applicationProcess: string[]
    requiredDocuments: string[]
  }
}

export interface Scheme {
  id: string
  name: string
  description: string
  category: string
  targetAudience: string
  benefits: string
  eligibilityRules: Array<{
    criterion: string
    requirement: string
  }>
  applicationSteps: string[]
  officialWebsite: string
  documents: string[]
}

export interface APIError {
  error: string
  message: string
  field?: string
  retryAfter?: number
}
