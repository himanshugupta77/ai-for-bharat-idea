/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/Toast'

interface ToastContextType {
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * ToastProvider provides toast notification functionality to the entire app
 * Implements Requirements 20.5
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, removeToast, success, error, warning, info, clearAll } = useToast()

  return (
    <ToastContext.Provider value={{ success, error, warning, info, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast notifications from any component
 */
export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
