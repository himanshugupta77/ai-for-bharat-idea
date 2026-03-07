import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LowBandwidthToggle } from './components'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConnectionIndicator } from './components/ConnectionIndicator'
import { ToastProvider } from './contexts/ToastContext'
import { LoadingShimmer } from './components/LoadingShimmer'
import { Navbar } from './components/Navbar'

// Code splitting: Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const EligibilityPage = lazy(() => import('./pages/EligibilityPage'))
const SchemesPage = lazy(() => import('./pages/SchemesPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-saffron via-white to-green">
    <div className="text-center">
      <LoadingShimmer className="w-64 h-8 mx-auto mb-4" />
      <LoadingShimmer className="w-48 h-4 mx-auto" />
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          {/* Navbar - sticky at top */}
          <Navbar />
          
          {/* Connection status indicator */}
          <ConnectionIndicator />
          
          {/* Global controls - fixed position */}
          <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
            <LowBandwidthToggle />
          </div>
          
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/eligibility" element={<EligibilityPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
