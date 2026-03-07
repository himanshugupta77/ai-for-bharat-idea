import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AIOrb } from '@/components/AIOrb';
import AnimatedBackground from '@/components/AnimatedBackground';
import { GlassButton } from '@/components/GlassButton';
import { GlassCard } from '@/components/GlassCard';
import { FeatureCard } from '@/components/FeatureCard';
import { SchemeCard } from '@/components/SchemeCard';
import useLowBandwidth from '@/hooks/useLowBandwidth';

export default function LandingPage() {
  const { t } = useTranslation();
  const { isLowBandwidth } = useLowBandwidth();
  const { scrollYProgress } = useScroll();

  // Check for user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax effect for background elements (disabled in low bandwidth mode or reduced motion)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Enable smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  // AI capabilities data
  const aiCapabilities = [
    {
      icon: '🧠',
      title: t('landing.aiCapabilities.bedrock.title'),
      description: t('landing.aiCapabilities.bedrock.description'),
    },
    {
      icon: '🌐',
      title: t('landing.aiCapabilities.translate.title'),
      description: t('landing.aiCapabilities.translate.description'),
    },
    {
      icon: '🎙️',
      title: t('landing.aiCapabilities.transcribe.title'),
      description: t('landing.aiCapabilities.transcribe.description'),
    },
    {
      icon: '🔊',
      title: t('landing.aiCapabilities.polly.title'),
      description: t('landing.aiCapabilities.polly.description'),
    },
  ];

  // AWS services data
  const awsServices = [
    { icon: '⚡', name: 'Lambda', purpose: t('landing.architecture.services.lambda') },
    { icon: '🌐', name: 'API Gateway', purpose: t('landing.architecture.services.apiGateway') },
    { icon: '💾', name: 'DynamoDB', purpose: t('landing.architecture.services.dynamodb') },
    { icon: '☁️', name: 'S3', purpose: t('landing.architecture.services.s3') },
    { icon: '🚀', name: 'CloudFront', purpose: t('landing.architecture.services.cloudfront') },
    { icon: '🧠', name: 'Bedrock', purpose: t('landing.architecture.services.bedrock') },
    { icon: '🎤', name: 'Transcribe', purpose: t('landing.architecture.services.transcribe') },
    { icon: '🔊', name: 'Polly', purpose: t('landing.architecture.services.polly') },
    { icon: '🌍', name: 'Translate', purpose: t('landing.architecture.services.translate') },
    { icon: '📊', name: 'CloudWatch', purpose: t('landing.architecture.services.cloudwatch') },
    { icon: '🔐', name: 'WAF', purpose: t('landing.architecture.services.waf') },
    { icon: '🔑', name: 'KMS', purpose: t('landing.architecture.services.kms') },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link"
      >
        {t('accessibility.skipToContent')}
      </a>
      
      {/* ARIA live region for dynamic content announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        id="live-region"
      />
      
      {/* Animated background */}
      <AnimatedBackground />

      {/* Parallax background layer - lazy loaded only when in view */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0 -z-5 opacity-30"
          style={{ 
            y: backgroundY,
            // Hardware acceleration hint
            willChange: 'transform',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          aria-hidden="true"
        >
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-saffron/20 blur-3xl" />
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-green/20 blur-3xl" />
          <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-saffron/20 blur-3xl" />
        </motion.div>
      )}

      {/* Hero Section - Two-column layout */}
      <main 
        id="main-content"
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 min-h-screen flex items-center"
        aria-labelledby="hero-heading"
      >
        {/* Two-column grid: single column on mobile, two columns on desktop */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full"
          data-testid="hero-section"
        >
          {/* Left Column - Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: shouldAnimate ? 0.1 : 0,
                  delayChildren: shouldAnimate ? 0.2 : 0,
                },
              },
            }}
            className="text-center lg:text-left"
            style={{
              // Hardware acceleration hint for staggered children
              willChange: shouldAnimate ? 'transform, opacity' : 'auto',
            }}
          >
            {/* Badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                },
              }}
              className="inline-block mb-6"
            >
              <div className="premium-badge">
                {t('landing.badge')}
              </div>
            </motion.div>

            {/* Headline with gradient text */}
            <motion.h1
              id="hero-heading"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                },
              }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-cyan-400 via-orange-300 to-white bg-clip-text text-transparent mb-6"
            >
              <span className="whitespace-nowrap">{t('landing.hero.title1')}</span> <br />
              <span className="whitespace-nowrap">{t('landing.hero.title2')}</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                },
              }}
              className="body-large text-gray-300 mb-8"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                },
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {/* Primary CTA Button */}
              <Link to="/chat" aria-label="Start chatting with AI assistant">
                <GlassButton 
                  variant="primary"
                  className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4"
                >
                  {t('landing.hero.startChatting')}
                </GlassButton>
              </Link>

              {/* Secondary CTA Button */}
              <Link to="/schemes" aria-label="Explore government schemes">
                <GlassButton 
                  variant="secondary"
                  className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4"
                >
                  {t('landing.hero.exploreSchemes')}
                </GlassButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - AI Orb Visual */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center"
            aria-hidden="true"
          >
            <AIOrb size="lg" />
          </motion.div>
        </div>
      </main>

      {/* Features Section - responsive padding and grid */}
      <section 
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
        aria-labelledby="features-heading"
      >
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
        {/* Features Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            id="features-heading"
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-heading text-white mb-4"
          >
            {t('landing.features.title')}
          </motion.h2>
          
          <motion.p
            initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {t('landing.features.subtitle')}
          </motion.p>
        </div>

        {/* Features Grid - responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" 
          role="list"
          aria-label="AI features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: shouldAnimate ? 0.1 : 0,
              },
            },
          }}
        >
          {/* AI Chatbot Feature Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
            role="listitem"
          >
            <FeatureCard
              icon="🤖"
              title={t('landing.features.aiChatbot.title')}
              description={t('landing.features.aiChatbot.description')}
            />
          </motion.div>

          {/* Smart Eligibility Checker Feature Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
            role="listitem"
          >
            <FeatureCard
              icon="✅"
              title={t('landing.features.eligibilityChecker.title')}
              description={t('landing.features.eligibilityChecker.description')}
            />
          </motion.div>

          {/* Voice Assistant Feature Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
            role="listitem"
          >
            <FeatureCard
              icon="🎤"
              title={t('landing.features.voiceAssistant.title')}
              description={t('landing.features.voiceAssistant.description')}
            />
          </motion.div>

          {/* Multilingual Support Feature Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
              },
            }}
            role="listitem"
          >
            <FeatureCard
              icon="🗣️"
              title={t('landing.features.multilingual.title')}
              description={t('landing.features.multilingual.description')}
            />
          </motion.div>
        </motion.div>
        </motion.div>
      </section>

      {/* Schemes Section - responsive padding and grid */}
      <section 
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
        aria-labelledby="schemes-heading"
      >
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Schemes Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              id="schemes-heading"
              initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-heading text-white mb-4"
            >
              {t('landing.schemes.title')}
            </motion.h2>
          </div>

          {/* Schemes Grid - responsive: 1 col mobile, 2 col desktop */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
            data-testid="schemes-grid"
            role="list"
            aria-label="Popular government schemes"
          >
            {/* PM Kisan Samman Nidhi Scheme Card */}
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              role="listitem"
            >
              <SchemeCard
                scheme={{
                  id: 'pm-kisan',
                  name: t('landing.schemes.pmKisan.name'),
                  description: t('landing.schemes.pmKisan.description'),
                  category: 'agriculture',
                  eligibilitySummary: t('landing.schemes.pmKisan.eligibility'),
                  applicationSteps: [
                    'Visit the PM-KISAN portal',
                    'Register with Aadhaar number',
                    'Fill in land details',
                    'Submit application online'
                  ],
                  officialLink: 'https://pmkisan.gov.in/'
                }}
                icon="🌾"
              />
            </motion.div>

            {/* Ayushman Bharat Yojana Scheme Card */}
            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              role="listitem"
            >
              <SchemeCard
                scheme={{
                  id: 'ayushman-bharat',
                  name: t('landing.schemes.ayushman.name'),
                  description: t('landing.schemes.ayushman.description'),
                  category: 'health',
                  eligibilitySummary: t('landing.schemes.ayushman.eligibility'),
                  applicationSteps: [
                    'Check eligibility on official portal',
                    'Visit nearest Ayushman Mitra',
                    'Provide required documents',
                    'Receive Ayushman card'
                  ],
                  officialLink: 'https://pmjay.gov.in/'
                }}
                icon="🏥"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* AI Capabilities Section - responsive padding and grid */}
      <section 
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
        aria-labelledby="ai-capabilities-heading"
      >
        <motion.h2
          id="ai-capabilities-heading"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-16 text-white"
        >
          {t('landing.aiCapabilities.title')}
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto" 
          role="list" 
          aria-label="AI capabilities"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: shouldAnimate ? 0.1 : 0,
              },
            },
          }}
        >
          {aiCapabilities.map((capability) => (
            <motion.div
              key={capability.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5 }
                },
              }}
              role="listitem"
            >
              <GlassCard className="p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
                {/* Gradient background overlay - matching SchemesPage */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A18]/10 via-transparent to-[#22C55E]/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#38BDF8]/5 to-transparent pointer-events-none" />
                
                {/* Enhanced glow border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                     style={{
                       boxShadow: '0 0 30px rgba(255, 122, 24, 0.3), 0 0 60px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                     }} />
                
                <div className="relative flex items-start gap-3 sm:gap-4">
                  <div className="icon-3d flex-shrink-0" aria-hidden="true">{capability.icon}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-white">
                      {capability.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Architecture Transparency Section - responsive padding and grid */}
      <section 
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
        aria-labelledby="architecture-heading"
      >
        <motion.h2
          id="architecture-heading"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 text-white"
        >
          {t('landing.architecture.title')}
        </motion.h2>

        <motion.p
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
        >
          {t('landing.architecture.subtitle')}
        </motion.p>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto" 
          role="list" 
          aria-label="AWS services"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: shouldAnimate ? 0.05 : 0,
              },
            },
          }}
        >
          {awsServices.map((service) => (
            <motion.div
              key={service.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.4 }
                },
              }}
              role="listitem"
            >
              <GlassCard className="p-3 sm:p-4 lg:p-6 text-center relative overflow-hidden group" hover={shouldAnimate}>
                {/* Gradient background overlay - matching SchemesPage */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A18]/10 via-transparent to-[#22C55E]/10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#38BDF8]/5 to-transparent pointer-events-none" />
                
                {/* Enhanced glow border on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                     style={{
                       boxShadow: '0 0 30px rgba(255, 122, 24, 0.3), 0 0 60px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                     }} />
                
                <div className="relative">
                  <div className="icon-3d mb-2 sm:mb-3" aria-hidden="true">{service.icon}</div>
                  <h4 className="font-semibold text-sm sm:text-base text-white mb-1">
                    {service.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {service.purpose}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to="/about" aria-label="Learn more about our architecture">
            <GlassButton className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
              {t('landing.architecture.learnMore')}
            </GlassButton>
          </Link>
        </motion.div>
      </section>

      {/* Final CTA Section - responsive padding */}
      <section 
        className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center"
        aria-labelledby="cta-heading"
      >
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t('landing.cta.subtitle')}
          </p>
          <Link to="/chat" aria-label="Start chatting with Bharat Sahayak now">
            <GlassButton className="text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4">
              {t('landing.cta.button')}
            </GlassButton>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
