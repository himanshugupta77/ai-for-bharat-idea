import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLowBandwidth } from '../hooks'
import { SchemeCard } from '../components/SchemeCard'
import AnimatedBackground from '../components/AnimatedBackground'
import { GlassCard } from '../components'
import type { SchemeCard as SchemeCardType } from '../types'

export default function SchemesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLowBandwidth } = useLowBandwidth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion
  
  // All government schemes
  const schemes: SchemeCardType[] = [
    {
      id: 'pm-kisan',
      name: 'PM-KISAN',
      description: 'Income support scheme providing ₹6000 per year to small and marginal farmer families',
      category: 'agriculture',
      eligibilitySummary: 'Small farmers with land up to 2 hectares',
      applicationSteps: [
        'Visit PM-KISAN portal at https://pmkisan.gov.in',
        'Click on "Farmers Corner" and select "New Farmer Registration"',
        'Enter Aadhaar number and mobile number',
        'Fill in personal details and land information',
        'Upload land ownership documents',
        'Submit application and note registration number'
      ],
      officialLink: 'https://pmkisan.gov.in'
    },
    {
      id: 'mgnrega',
      name: 'MGNREGA',
      description: 'Guarantees 100 days of wage employment per year to rural households',
      category: 'employment',
      eligibilitySummary: 'Rural households willing to do unskilled manual work',
      applicationSteps: [
        'Visit local Gram Panchayat office',
        'Submit application with photograph',
        'Provide proof of residence',
        'Receive job card within 15 days',
        'Apply for work using job card'
      ],
      officialLink: 'https://nrega.nic.in'
    },
    {
      id: 'ayushman-bharat',
      name: 'Ayushman Bharat (PM-JAY)',
      description: 'Health insurance scheme providing coverage up to ₹5 lakh per family per year',
      category: 'health',
      eligibilitySummary: 'Poor and vulnerable families as per SECC 2011 database',
      applicationSteps: [
        'Check eligibility at https://pmjay.gov.in',
        'Visit nearest Ayushman Mitra help desk',
        'Provide Aadhaar and family details',
        'Get Ayushman card issued',
        'Use card at empanelled hospitals for cashless treatment'
      ],
      officialLink: 'https://pmjay.gov.in'
    },
    {
      id: 'pmay',
      name: 'Pradhan Mantri Awas Yojana (PMAY)',
      description: 'Affordable housing scheme providing financial assistance for construction or purchase of houses',
      category: 'housing',
      eligibilitySummary: 'EWS, LIG, and MIG families without pucca house',
      applicationSteps: [
        'Visit PMAY portal at https://pmaymis.gov.in',
        'Select appropriate category (Urban/Rural)',
        'Fill online application form',
        'Upload required documents',
        'Submit Aadhaar for verification',
        'Track application status online'
      ],
      officialLink: 'https://pmaymis.gov.in'
    },
    {
      id: 'pmuy',
      name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
      description: 'Free LPG connection to women from BPL households',
      category: 'welfare',
      eligibilitySummary: 'Women aged 18+ from BPL households',
      applicationSteps: [
        'Visit nearest LPG distributor',
        'Fill PMUY application form',
        'Submit BPL card and identity proof',
        'Provide address proof and photograph',
        'Get connection installed at home'
      ],
      officialLink: 'https://www.pmuy.gov.in'
    },
    {
      id: 'apy',
      name: 'Atal Pension Yojana (APY)',
      description: 'Pension scheme for unorganized sector workers providing guaranteed pension',
      category: 'pension',
      eligibilitySummary: 'Citizens aged 18-40 years in unorganized sector',
      applicationSteps: [
        'Visit your bank branch',
        'Fill APY registration form',
        'Provide Aadhaar and mobile number',
        'Choose pension amount (₹1000 to ₹5000)',
        'Authorize auto-debit for monthly contribution'
      ],
      officialLink: 'https://www.npscra.nsdl.co.in/atal-pension-yojana.php'
    },
    {
      id: 'pmfby',
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance scheme protecting farmers against crop loss due to natural calamities',
      category: 'agriculture',
      eligibilitySummary: 'All farmers including sharecroppers and tenant farmers',
      applicationSteps: [
        'Visit nearest bank, CSC, or insurance company office',
        'Fill crop insurance application form',
        'Provide land details and crop information',
        'Pay premium amount',
        'Receive insurance policy document'
      ],
      officialLink: 'https://pmfby.gov.in'
    },
    {
      id: 'nsap-old-age',
      name: 'National Social Assistance Programme - Old Age Pension',
      description: 'Monthly pension for elderly citizens from BPL families',
      category: 'pension',
      eligibilitySummary: 'Elderly citizens aged 60+ from BPL families',
      applicationSteps: [
        'Visit local Panchayat or Municipal office',
        'Fill pension application form',
        'Submit BPL card and age proof',
        'Provide bank account details',
        'Get application verified by local authority'
      ],
      officialLink: 'https://nsap.nic.in'
    },
    {
      id: 'pmmy',
      name: 'Pradhan Mantri Mudra Yojana (PMMY)',
      description: 'Collateral-free loans up to ₹10 lakh for small businesses and entrepreneurs',
      category: 'business',
      eligibilitySummary: 'Small business owners and entrepreneurs',
      applicationSteps: [
        'Prepare business plan and project report',
        'Visit nearest bank, NBFC, or MFI',
        'Fill Mudra loan application form',
        'Submit identity and business documents',
        'Attend bank interview if required'
      ],
      officialLink: 'https://www.mudra.org.in'
    },
    {
      id: 'bbbp',
      name: 'Beti Bachao Beti Padhao',
      description: 'Campaign to address declining Child Sex Ratio and empower girl children through education',
      category: 'education',
      eligibilitySummary: 'Girl children and their families',
      applicationSteps: [
        'Visit Women and Child Development office',
        'Inquire about specific schemes under BBBP',
        'Fill application for relevant sub-scheme',
        'Submit birth certificate and identity proof',
        'Open Sukanya Samriddhi Account if eligible'
      ],
      officialLink: 'https://wcd.nic.in/bbbp-schemes'
    },
    {
      id: 'pmkvy',
      name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
      description: 'Free skill development training with certification and placement assistance',
      category: 'education',
      eligibilitySummary: 'Youth aged 15-45 years seeking skill training',
      applicationSteps: [
        'Visit PMKVY portal at https://www.pmkvyofficial.org',
        'Find nearest training center',
        'Register for desired skill course',
        'Attend training sessions regularly',
        'Complete assessment and get certified'
      ],
      officialLink: 'https://www.pmkvyofficial.org'
    },
    {
      id: 'stand-up-india',
      name: 'Stand Up India',
      description: 'Bank loans between ₹10 lakh and ₹1 crore for SC/ST/Women entrepreneurs',
      category: 'business',
      eligibilitySummary: 'SC/ST and Women entrepreneurs for new businesses',
      applicationSteps: [
        'Visit Stand Up India portal at https://www.standupmitra.in',
        'Prepare detailed project report',
        'Apply online through portal',
        'Visit nearest bank branch',
        'Submit application with documents',
        'Attend bank interview'
      ],
      officialLink: 'https://www.standupmitra.in'
    }
  ]
  
  // Category icons
  const categoryIcons: Record<string, string> = {
    agriculture: '🌾',
    employment: '💼',
    health: '🏥',
    housing: '🏠',
    welfare: '🤝',
    pension: '👴',
    business: '💰',
    education: '📚'
  }
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(schemes.map(s => s.category).filter((c): c is string => c !== undefined)))]
  
  // Filter schemes by category
  const filteredSchemes = selectedCategory === 'all' 
    ? schemes 
    : schemes.filter(s => s.category === selectedCategory)
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
  const handleCheckEligibility = () => {
    navigate('/eligibility')
  }
  
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
  
  // Card animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Skip to main content link */}
      <a
        href="#schemes-main"
        className="skip-link"
      >
        {t('accessibility.skipToContent')}
      </a>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center" role="banner">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            initial={shouldAnimate ? { opacity: 0, y: -20 } : {}}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {t('schemes.title', 'Government Schemes')}
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={shouldAnimate ? { opacity: 0 } : {}}
            animate={shouldAnimate ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('schemes.subtitle', 'Explore popular government welfare schemes and check your eligibility')}
          </motion.p>
        </header>
        
        {/* Category Filter */}
        <motion.div 
          className="mb-8"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GlassCard>
            <div className="p-4">
              <label htmlFor="category-filter" className="block text-sm font-semibold text-white mb-3">
                {t('schemes.filterByCategory', 'Filter by Category')}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    aria-pressed={selectedCategory === category}
                  >
                    {category === 'all' 
                      ? t('schemes.allCategories', 'All Schemes')
                      : t(`schemes.category.${category}`, category.charAt(0).toUpperCase() + category.slice(1))
                    }
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Schemes Grid */}
        <main id="schemes-main" role="main">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={shouldAnimate ? containerVariants : {}}
            initial="hidden"
            animate="visible"
          >
            {filteredSchemes.map((scheme) => (
              <motion.div
                key={scheme.id}
                variants={shouldAnimate ? cardVariants : {}}
              >
                <SchemeCard
                  scheme={scheme}
                  onCheckEligibility={handleCheckEligibility}
                  icon={scheme.category ? categoryIcons[scheme.category] : '📋'}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* No results message */}
          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-300">
                {t('schemes.noSchemes', 'No schemes found in this category')}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
