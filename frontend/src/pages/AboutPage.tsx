import { useState } from 'react'
import { GlassCard } from '../components'
import AnimatedBackground from '../components/AnimatedBackground'

type Section = 'architecture' | 'ai' | 'privacy' | 'bias'

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState<Section>('architecture')

  const scrollToSection = (sectionId: Section) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground />
      
      {/* Skip to main content link */}
      <a
        href="#about-main"
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12" role="banner">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-orange-300 to-white bg-clip-text text-transparent">
            About Bharat Sahayak
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            An AI-powered, multilingual welfare assistant platform designed to help Indian citizens
            discover and access government welfare schemes with transparency and fairness.
          </p>
        </header>

        {/* Navigation */}
        <nav 
          className="flex flex-wrap justify-center gap-4 mb-12"
          role="navigation"
          aria-label="About page sections"
        >
          {[
            { id: 'architecture' as Section, label: 'Architecture' },
            { id: 'ai' as Section, label: 'AI Transparency' },
            { id: 'privacy' as Section, label: 'Privacy Policy' },
            { id: 'bias' as Section, label: 'Bias Prevention' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label={`Navigate to ${section.label} section`}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main id="about-main" role="main">
        {/* Architecture Section */}
        <section 
          id="architecture" 
          className="mb-16"
          aria-labelledby="architecture-heading"
        >
          <GlassCard className="p-8">
            <h2 
              id="architecture-heading"
              className="text-3xl font-bold mb-6 text-white"
            >
              AWS Serverless Architecture
            </h2>
            
            {/* Architecture Diagram */}
            <div 
              className="bg-gray-800/50 rounded-xl p-6 mb-6 overflow-x-auto"
              role="img"
              aria-label="AWS Serverless Architecture Diagram showing user browser connecting to CloudFront CDN, S3 hosting, API Gateway with WAF, Lambda functions for chat, voice, eligibility and schemes, AI services including Bedrock, Transcribe, Polly and Translate, DynamoDB database, and CloudWatch monitoring"
            >
              <svg
                viewBox="0 0 800 600"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* User Layer */}
                <rect x="350" y="20" width="100" height="60" rx="8" fill="#FF9933" />
                <text x="400" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  User Browser
                </text>

                {/* CDN Layer */}
                <rect x="200" y="120" width="120" height="60" rx="8" fill="#138808" />
                <text x="260" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  CloudFront CDN
                </text>

                <rect x="480" y="120" width="120" height="60" rx="8" fill="#138808" />
                <text x="540" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  S3 Hosting
                </text>

                {/* API Layer */}
                <rect x="320" y="220" width="160" height="60" rx="8" fill="#FF9933" />
                <text x="400" y="255" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  API Gateway + WAF
                </text>

                {/* Lambda Functions */}
                <rect x="50" y="320" width="100" height="50" rx="8" fill="#138808" />
                <text x="100" y="350" textAnchor="middle" fill="white" fontSize="10">
                  Chat Lambda
                </text>

                <rect x="200" y="320" width="100" height="50" rx="8" fill="#138808" />
                <text x="250" y="350" textAnchor="middle" fill="white" fontSize="10">
                  Voice Lambda
                </text>

                <rect x="350" y="320" width="100" height="50" rx="8" fill="#138808" />
                <text x="400" y="350" textAnchor="middle" fill="white" fontSize="10">
                  Eligibility
                </text>

                <rect x="500" y="320" width="100" height="50" rx="8" fill="#138808" />
                <text x="550" y="350" textAnchor="middle" fill="white" fontSize="10">
                  Schemes
                </text>

                {/* AI Services */}
                <rect x="50" y="420" width="90" height="40" rx="6" fill="#FF9933" />
                <text x="95" y="445" textAnchor="middle" fill="white" fontSize="9">
                  Bedrock
                </text>

                <rect x="160" y="420" width="90" height="40" rx="6" fill="#FF9933" />
                <text x="205" y="445" textAnchor="middle" fill="white" fontSize="9">
                  Transcribe
                </text>

                <rect x="270" y="420" width="90" height="40" rx="6" fill="#FF9933" />
                <text x="315" y="445" textAnchor="middle" fill="white" fontSize="9">
                  Polly
                </text>

                <rect x="380" y="420" width="90" height="40" rx="6" fill="#FF9933" />
                <text x="425" y="445" textAnchor="middle" fill="white" fontSize="9">
                  Translate
                </text>

                {/* Database */}
                <rect x="550" y="420" width="120" height="60" rx="8" fill="#138808" />
                <text x="610" y="455" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                  DynamoDB
                </text>

                {/* Monitoring */}
                <rect x="320" y="520" width="160" height="50" rx="8" fill="#FF9933" />
                <text x="400" y="550" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                  CloudWatch
                </text>

                {/* Connection Lines */}
                <line x1="400" y1="80" x2="260" y2="120" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="80" x2="540" y2="120" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="180" x2="400" y2="220" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="280" x2="100" y2="320" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="280" x2="250" y2="320" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="280" x2="400" y2="320" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="280" x2="550" y2="320" stroke="#666" strokeWidth="2" />
                <line x1="100" y1="370" x2="95" y2="420" stroke="#666" strokeWidth="2" />
                <line x1="250" y1="370" x2="205" y2="420" stroke="#666" strokeWidth="2" />
                <line x1="250" y1="370" x2="315" y2="420" stroke="#666" strokeWidth="2" />
                <line x1="100" y1="370" x2="425" y2="420" stroke="#666" strokeWidth="2" />
                <line x1="400" y1="370" x2="610" y2="420" stroke="#666" strokeWidth="2" />
                <line x1="550" y1="370" x2="610" y2="420" stroke="#666" strokeWidth="2" />
              </svg>
            </div>

            <div className="space-y-4 text-gray-300">
              <p className="text-lg">
                Bharat Sahayak is built on a fully serverless AWS architecture, ensuring scalability,
                reliability, and cost-efficiency.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Frontend Layer</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• CloudFront CDN for global content delivery</li>
                    <li>• S3 for static website hosting</li>
                    <li>• React 18 with TypeScript</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">API Layer</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• API Gateway for RESTful endpoints</li>
                    <li>• AWS WAF for security protection</li>
                    <li>• Rate limiting and throttling</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">Compute Layer</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Lambda functions (Python 3.12)</li>
                    <li>• Auto-scaling serverless compute</li>
                    <li>• Zero server management</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">AI Services</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Amazon Bedrock (Claude 3) for conversations</li>
                    <li>• Amazon Transcribe for speech-to-text</li>
                    <li>• Amazon Polly for text-to-speech</li>
                    <li>• Amazon Translate for multilingual support</li>
                  </ul>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* AI Transparency Section */}
        <section 
          id="ai" 
          className="mb-16"
          aria-labelledby="ai-heading"
        >
          <GlassCard className="p-8">
            <h2 
              id="ai-heading"
              className="text-3xl font-bold mb-6 text-white"
            >
              AI Transparency & Explainability
            </h2>
            
            <div className="space-y-6 text-gray-300">
              <p className="text-lg">
                We believe in transparent and explainable AI. Here's how our system makes decisions:
              </p>

              <div className="bg-orange-900/30 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-4 text-white">
                  Rule-Based Eligibility Checking
                </h3>
                <p className="mb-4">
                  Unlike black-box AI systems, our eligibility checker uses transparent, rule-based logic:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>
                      <strong>Deterministic Rules:</strong> Eligibility is determined by explicit government
                      criteria, not AI predictions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>
                      <strong>Full Explanations:</strong> Every decision shows which criteria you met or
                      didn't meet
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>
                      <strong>No AI Inference:</strong> Eligibility decisions never use machine learning
                      models
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span>
                      <strong>Auditable:</strong> All rules are based on official government scheme
                      documentation
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-900/30 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-4 text-white">
                  AI-Assisted Conversations
                </h3>
                <p className="mb-4">
                  Our conversational AI (Amazon Bedrock with Claude 3) helps you discover schemes:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
                    <span>
                      <strong>Context-Aware:</strong> Understands your situation and asks clarifying
                      questions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
                    <span>
                      <strong>Scheme Matching:</strong> Recommends relevant schemes based on your needs
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
                    <span>
                      <strong>Guidance Only:</strong> Provides information but doesn't make eligibility
                      decisions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
                    <span>
                      <strong>Verified Information:</strong> All scheme details come from our curated
                      database
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-6 py-2">
                <p className="font-medium text-white">
                  Key Principle: AI assists with discovery and conversation, but only transparent rules
                  determine eligibility.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Privacy Policy Section */}
        <section 
          id="privacy" 
          className="mb-16"
          aria-labelledby="privacy-heading"
        >
          <GlassCard className="p-8">
            <h2 
              id="privacy-heading"
              className="text-3xl font-bold mb-6 text-white"
            >
              Privacy Policy & Data Handling
            </h2>
            
            <div className="space-y-6 text-gray-300">
              <p className="text-lg">
                Your privacy is our top priority. We follow strict data minimization and protection
                practices.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    Data Collection
                  </h3>
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <p className="mb-3 font-medium">We collect only the minimum data necessary:</p>
                    <ul className="space-y-2 text-sm">
                      <li>• Conversation messages (stored temporarily for context)</li>
                      <li>• Eligibility information you provide (age, income, etc.)</li>
                      <li>• Session ID (random identifier, not linked to your identity)</li>
                      <li>• Language preference</li>
                    </ul>
                    <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                      We do NOT collect: Name, email, phone number, Aadhaar, or any personally
                      identifiable information
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    Data Storage & Retention
                  </h3>
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-purple-600 dark:text-purple-400 mr-2">🕐</span>
                        <span>
                          <strong>24-Hour Auto-Delete:</strong> All session data automatically expires and
                          is permanently deleted after 24 hours
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 dark:text-purple-400 mr-2">🔒</span>
                        <span>
                          <strong>Encrypted Storage:</strong> All data is encrypted at rest using AWS KMS
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 dark:text-purple-400 mr-2">🔐</span>
                        <span>
                          <strong>HTTPS Only:</strong> All communication is encrypted in transit
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-600 dark:text-purple-400 mr-2">🗑️</span>
                        <span>
                          <strong>No Long-Term Storage:</strong> We don't maintain user profiles or
                          historical data
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    Data Usage
                  </h3>
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <p className="mb-3">Your data is used exclusively for:</p>
                    <ul className="space-y-2 text-sm">
                      <li>✓ Maintaining conversation context during your session</li>
                      <li>✓ Evaluating scheme eligibility based on criteria you provide</li>
                      <li>✓ Generating personalized scheme recommendations</li>
                      <li>✓ Improving service quality through anonymized analytics</li>
                    </ul>
                    <p className="mt-3 text-sm font-medium">
                      We NEVER sell, share, or use your data for marketing purposes.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    Your Rights
                  </h3>
                  <div className="bg-orange-900/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      <li>• Clear your session data anytime by closing your browser</li>
                      <li>• No account creation required - completely anonymous usage</li>
                      <li>• Full transparency about what data we collect and why</li>
                      <li>• Automatic data deletion after 24 hours</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    Security Measures
                  </h3>
                  <div className="bg-red-900/30 rounded-lg p-4">
                    <ul className="space-y-2 text-sm">
                      <li>• AWS WAF protection against common web attacks</li>
                      <li>• Rate limiting to prevent abuse</li>
                      <li>• Input sanitization to prevent injection attacks</li>
                      <li>• IAM least privilege access controls</li>
                      <li>• Regular security audits and updates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Bias Prevention Section */}
        <section 
          id="bias" 
          className="mb-16"
          aria-labelledby="bias-heading"
        >
          <GlassCard className="p-8">
            <h2 
              id="bias-heading"
              className="text-3xl font-bold mb-6 text-white"
            >
              Bias Prevention & Fairness
            </h2>
            
            <div className="space-y-6 text-gray-300">
              <p className="text-lg">
                We are committed to providing fair and unbiased access to welfare information for all
                Indian citizens.
              </p>

              <div className="bg-gradient-to-r from-orange-900/30 to-green-900/30 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-4 text-white">
                  Our Fairness Principles
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      1. No Demographic Filtering
                    </h4>
                    <p className="text-sm">
                      We don't use gender, caste, religion, or location to filter or rank scheme
                      recommendations. All schemes are presented based solely on official eligibility
                      criteria.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      2. Transparent Rules Only
                    </h4>
                    <p className="text-sm">
                      Eligibility decisions use explicit government rules, not AI predictions that could
                      encode historical biases.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      3. Equal Language Support
                    </h4>
                    <p className="text-sm">
                      All 11 supported languages receive the same quality of service. No language is
                      prioritized over others.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-white">
                      4. Accessibility First
                    </h4>
                    <p className="text-sm">
                      Voice input/output and low-bandwidth mode ensure access for users with disabilities
                      or limited resources.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xl mb-4 text-white">
                  How We Prevent Bias
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold mb-2 text-white">
                      In Scheme Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• AI matches schemes based only on stated user needs</li>
                      <li>• No profiling based on demographic characteristics</li>
                      <li>• All eligible schemes are presented, not just "popular" ones</li>
                      <li>• Recommendations are based on official scheme criteria only</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold mb-2 text-white">
                      In Eligibility Checking
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Rules are directly derived from government documentation</li>
                      <li>• Same rules apply to all users without exception</li>
                      <li>• No AI-based predictions that could introduce bias</li>
                      <li>• Complete transparency in decision-making process</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-2 text-white">
                      In Language Processing
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Automatic language detection without user profiling</li>
                      <li>• Equal quality translation across all supported languages</li>
                      <li>• No language-based filtering of content</li>
                      <li>• Culturally appropriate responses for all languages</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/30 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-3 text-white">
                  Continuous Monitoring
                </h3>
                <p className="mb-3">
                  We actively monitor our system to ensure fairness:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Regular audits of scheme recommendations across user groups</li>
                  <li>• Validation that eligibility rules match official criteria</li>
                  <li>• Testing for unintended discrimination in AI responses</li>
                  <li>• User feedback collection to identify potential issues</li>
                </ul>
              </div>

              <div className="border-2 border-orange-500 rounded-xl p-6 bg-gray-800/50">
                <h3 className="font-semibold text-xl mb-3 text-white">
                  Report Concerns
                </h3>
                <p>
                  If you believe you've experienced bias or unfair treatment, please report it. We take
                  all concerns seriously and investigate thoroughly to maintain fairness for all users.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-300 text-sm" role="contentinfo">
          <p>
            Bharat Sahayak is committed to transparency, privacy, and fairness in helping Indian
            citizens access welfare schemes.
          </p>
          <p className="mt-2">Built with ❤️ for India</p>
        </footer>
      </div>
    </div>
  )
}
