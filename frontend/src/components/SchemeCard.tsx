import { motion } from 'framer-motion'
import { useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLowBandwidth } from '../hooks'
import type { SchemeCard as SchemeCardType } from '../types'

interface SchemeCardProps {
  scheme: SchemeCardType
  onCheckEligibility?: () => void
  icon?: string
}

export const SchemeCard = memo(function SchemeCard({ scheme, onCheckEligibility, icon }: SchemeCardProps) {
  const { isLowBandwidth } = useLowBandwidth()
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check for user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  }
  
  const animationProps = shouldAnimate
    ? {
        initial: 'hidden',
        animate: 'visible',
        variants: cardVariants,
        transition: { duration: 0.4, ease: 'easeOut' },
        whileHover: { y: -8, scale: 1.02 },
        whileTap: { scale: 0.98 },
        style: {
          // Hardware acceleration hint
          willChange: 'transform, opacity',
        }
      }
    : {}
  
  return (
    <motion.div
      {...animationProps}
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300"
      role="article"
      aria-labelledby={`scheme-name-${scheme.id}`}
      aria-describedby={`scheme-desc-${scheme.id}`}
    >
      {/* Gradient lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-saffron/10 via-transparent to-accent-green/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent-blue/5 to-transparent pointer-events-none" />
      
      {/* Enhanced glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
           style={{
             boxShadow: '0 0 30px rgba(255, 122, 24, 0.3), 0 0 60px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)'
           }} />
      
      {/* Content - responsive padding */}
      <div className="relative p-6 sm:p-8">
        {/* Icon and Scheme Name - improved hierarchy */}
        <div className="flex items-start gap-4 mb-4">
          {icon && (
            <div 
              className="icon-3d flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-accent-saffron/20 to-accent-green/20 border border-accent-saffron/30 flex items-center justify-center backdrop-blur-sm"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 
              id={`scheme-name-${scheme.id}`}
              className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight"
            >
              {scheme.name}
            </h3>
          </div>
        </div>
        
        {/* Description - improved typography */}
        <p 
          id={`scheme-desc-${scheme.id}`}
          className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed"
        >
          {scheme.description}
        </p>
        
        {/* Eligibility Summary Badge - enhanced styling */}
        <div className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-saffron/20 to-accent-green/20 border border-accent-saffron/40 mb-4 sm:mb-5 backdrop-blur-sm">
          <p className="text-xs sm:text-sm font-semibold text-white">
            {scheme.eligibilitySummary}
          </p>
        </div>
        
        {/* Application Steps (Expandable) - improved styling */}
        {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
          <div className="mb-4 sm:mb-5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm sm:text-base font-semibold text-accent-saffron hover:text-accent-green transition-colors duration-200 flex items-center gap-2"
              aria-expanded={isExpanded}
              aria-controls={`steps-${scheme.id}`}
              aria-label={`${isExpanded ? 'Hide' : 'Show'} application steps for ${scheme.name}`}
            >
              <span className="transform transition-transform duration-200" style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
              {t('schemes.applicationSteps')}
            </button>
            
            {isExpanded && (
              <motion.ol
                id={`steps-${scheme.id}`}
                initial={shouldAnimate ? { opacity: 0, height: 0 } : {}}
                animate={shouldAnimate ? { opacity: 1, height: 'auto' } : {}}
                transition={{ duration: 0.3 }}
                className="mt-3 ml-4 sm:ml-6 space-y-2 list-decimal list-inside text-sm sm:text-base text-gray-300"
                aria-label="Application steps"
              >
                {scheme.applicationSteps.map((step, index) => (
                  <li key={index} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </motion.ol>
            )}
          </div>
        )}
        
        {/* Action Buttons - enhanced styling */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCheckEligibility}
            className="group/btn relative w-full sm:flex-1 px-4 sm:px-5 py-3 text-sm sm:text-base bg-gradient-to-r from-accent-saffron to-accent-green text-white rounded-xl font-bold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent-saffron/50 hover:scale-105 active:scale-95"
            aria-label={`Check eligibility for ${scheme.name}`}
          >
            <span className="relative z-10">{t('schemes.checkEligibility')}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-green to-accent-saffron opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
          
          {scheme.officialLink && (
            <a
              href={scheme.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 px-4 sm:px-5 py-3 text-sm sm:text-base backdrop-blur-sm bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-300 text-center"
              aria-label={`Visit official website for ${scheme.name} (opens in new tab)`}
            >
              {t('schemes.officialWebsite')}
            </a>
          )}
        </div>
      </div>
      
      {/* Enhanced decorative gradient border effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-saffron/30 via-accent-blue/20 to-accent-green/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
           style={{ 
             filter: 'blur(20px)',
             transform: 'scale(0.95)'
           }} />
    </motion.div>
  )
})
