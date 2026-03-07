# Implementation Plan: Bharat Sahayak AI Assistant

## Overview

This implementation plan breaks down the Bharat Sahayak AI Assistant into discrete coding tasks. The platform is a production-ready, multilingual AI welfare assistant built on AWS serverless architecture with a premium UI/UX. Implementation follows an incremental approach: infrastructure setup → backend APIs → frontend components → integration → testing.

## Tasks

- [x] 1. Set up project infrastructure and AWS resources
  - Initialize project structure with separate frontend and backend directories
  - Create AWS SAM template for Lambda functions, API Gateway, DynamoDB, and IAM roles
  - Configure DynamoDB table with single-table design (PK, SK, GSI for category index, TTL enabled)
  - Set up S3 buckets for static hosting and temporary audio storage
  - Configure CloudFront distribution with HTTPS and security headers
  - Set up AWS WAF with rate limiting, geo-blocking, SQL injection, and XSS rules
  - Create KMS keys for encryption at rest
  - Configure CloudWatch log groups and alarms
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.8, 7.4, 7.5_

- [x] 2. Implement backend Lambda functions with AWS service integrations
  - [x] 2.1 Create Chat Lambda function (Python 3.12)
    - Implement lambda_handler with request validation using Pydantic
    - Integrate Amazon Bedrock client for Claude 3 API calls
    - Integrate Amazon Translate for language detection and translation
    - Implement session management with DynamoDB (create/retrieve/update sessions)
    - Build prompt engineering logic with scheme database context
    - Parse LLM responses to extract scheme recommendations
    - Implement error handling and CloudWatch logging
    - Add rate limiting decorator (10 requests per 60 seconds per IP)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 9.2, 9.5, 9.8_


  - [x] 2.2 Write property test for Chat Lambda
    - **Property 1: Language consistency**
    - **Validates: Requirements 1.5, 1.6**

  - [x] 2.3 Create Voice-to-Text Lambda function (Python 3.12)
    - Implement lambda_handler with base64 audio decoding
    - Upload audio to S3 temporary bucket with 1-hour TTL
    - Integrate Amazon Transcribe with language identification for 11 languages
    - Poll for transcription job completion (max 30s timeout)
    - Retrieve transcript and detected language
    - Clean up S3 temporary objects
    - Return transcript with confidence score
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.6_

  - [x] 2.4 Write property test for Voice-to-Text Lambda
    - **Property 3: Audio format handling**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 2.5 Create Text-to-Speech Lambda function (Python 3.12)
    - Implement lambda_handler with text validation (max 3000 chars)
    - Map languages to Amazon Polly voice profiles (11 languages)
    - Integrate Amazon Polly synthesize_speech API
    - Implement audio compression for low bandwidth mode (Opus 24kbps)
    - Encode audio to base64 for response
    - Calculate audio duration
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.7_

  - [x] 2.6 Write property test for Text-to-Speech Lambda
    - **Property 5: Audio compression effectiveness**
    - **Validates: Requirements 3.5**

  - [x] 2.7 Create Eligibility Check Lambda function (Python 3.12)
    - Implement lambda_handler with user info validation
    - Build rule engine classes (EligibilityRule, SchemeRules)
    - Retrieve scheme rules from DynamoDB
    - Evaluate each eligibility criterion with explanations
    - Generate structured eligibility result with met/unmet criteria
    - Return scheme details and application process
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2_

  - [x] 2.8 Write property test for Eligibility Check Lambda
    - **Property 7: Eligibility determinism**
    - **Validates: Requirements 5.4, 8.1**

  - [x] 2.9 Create Schemes Lambda function (Python 3.12)
    - Implement GET /schemes endpoint with pagination and category filtering
    - Implement GET /schemes/{schemeId} endpoint for detailed scheme info
    - Add Lambda memory caching with 5-minute TTL
    - Implement DynamoDB query patterns for scheme retrieval
    - Return translated scheme names and descriptions
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.10 Write unit tests for Schemes Lambda
    - Test pagination logic
    - Test category filtering
    - Test cache behavior
    - _Requirements: 4.1, 4.2_

- [x] 3. Configure API Gateway and integrate Lambda functions
  - Create REST API (not HTTP API for WAF support)
  - Define endpoints: POST /chat, POST /voice-to-text, POST /text-to-speech, POST /eligibility-check, GET /schemes, GET /schemes/{schemeId}
  - Configure CORS with allowed origins, methods, and headers
  - Enable request validation with JSON schemas for all POST endpoints
  - Set up throttling (500 burst, 1000 req/s rate limit)
  - Configure Lambda integrations with proper IAM execution roles
  - Set up custom error responses (400, 429, 500)
  - Deploy API to production stage
  - _Requirements: 9.3, 7.4_

- [x] 4. Seed DynamoDB with government scheme data
  - [x] 4.1 Create scheme data seeding script (Python)
    - Define at least 10 major government schemes (PM-KISAN, MGNREGA, Ayushman Bharat, etc.)
    - Include scheme metadata: name, translations, description, category, eligibility rules
    - Define eligibility rules as evaluator lambda expressions
    - Include application steps, required documents, official websites
    - Batch write schemes to DynamoDB with proper PK/SK structure
    - _Requirements: 4.1, 5.1_

  - [x] 4.2 Write unit tests for seeding script
    - Test data validation
    - Test batch write logic
    - _Requirements: 4.1_

- [x] 5. Checkpoint - Ensure backend APIs are functional
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Set up frontend project with React and TypeScript
  - Initialize Vite project with React 18 and TypeScript
  - Install dependencies: Tailwind CSS, Framer Motion, React Router
  - Configure Tailwind with custom design system (colors, typography, spacing, border radius)
  - Set up CSS variables for light/dark mode themes
  - Create project structure: components/, pages/, hooks/, utils/, types/
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - _Requirements: 10.1, 10.8_

- [x] 7. Implement core frontend utilities and hooks
  - [x] 7.1 Create API client utility (TypeScript)
    - Implement fetch wrapper with error handling
    - Add request/response interceptors
    - Configure base URL and headers
    - Implement retry logic for failed requests
    - _Requirements: 7.4_

  - [x] 7.2 Create custom hooks (TypeScript)
    - useSession: Manage session ID in localStorage
    - useLanguage: Manage selected language state
    - useTheme: Manage dark mode toggle
    - useLowBandwidth: Detect and manage low bandwidth mode
    - useVoiceInput: Handle Web Audio API for voice recording
    - useVoiceOutput: Handle audio playback
    - _Requirements: 6.1, 10.8, 10.9_

  - [x] 7.3 Write unit tests for custom hooks
    - Test session management
    - Test language switching
    - Test theme toggling
    - _Requirements: 6.1_

- [x] 8. Implement design system components
  - [x] 8.1 Create GlassCard component (TypeScript/React)
    - Implement glassmorphism styles with backdrop-filter
    - Support light/dark mode variants
    - Add hover effects with transform and shadow
    - _Requirements: 10.2, 10.8_

  - [x] 8.2 Create GlassButton component (TypeScript/React)
    - Implement glass effect with hover animations
    - Add ripple click effect
    - Support disabled state
    - _Requirements: 10.2, 10.4_

  - [x] 8.3 Create AnimatedGradient component (TypeScript/React)
    - Implement saffron-white-green gradient animation
    - Use CSS keyframes for 15s infinite loop
    - _Requirements: 10.1, 10.5, 11.1_

  - [x] 8.4 Create LoadingShimmer component (TypeScript/React)
    - Implement shimmer animation with gradient
    - Support different sizes and shapes
    - _Requirements: 12.3_

  - [x] 8.5 Create TypingIndicator component (TypeScript/React)
    - Implement three-dot bounce animation
    - Stagger animation delays (0s, 0.2s, 0.4s)
    - _Requirements: 12.4_

- [x] 9. Implement landing page components
  - [x] 9.1 Create LandingPage component (TypeScript/React)
    - Implement animated gradient background
    - Add floating AI orb with glow and float animations
    - Create hero section with title and CTA button
    - Add features showcase section with icons
    - Implement architecture transparency section
    - Add parallax scrolling effects
    - Implement smooth scroll behavior
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 9.2 Create AIOrb component (TypeScript/React)
    - Implement floating animation (3s ease-in-out infinite)
    - Add glow pulse animation (2s ease-in-out infinite)
    - Use Framer Motion for smooth animations
    - Disable animations in low bandwidth mode
    - _Requirements: 11.2, 10.9_

  - [x] 9.3 Write unit tests for landing page
    - Test CTA button navigation
    - Test parallax scroll behavior
    - _Requirements: 11.6_

- [x] 10. Implement chat interface components
  - [x] 10.1 Create ChatPage component (TypeScript/React)
    - Implement message history display with auto-scroll
    - Add text input field with character counter (max 1000)
    - Add voice input button
    - Integrate with Chat API endpoint
    - Handle loading states with shimmer
    - Display typing indicator during response generation
    - Implement error handling with user-friendly messages
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 6.1, 6.2_

  - [x] 10.2 Create Message component (TypeScript/React)
    - Implement slide-in animation (translateY -20px → 0, opacity 0 → 1, 300ms)
    - Support user and assistant message variants
    - Display timestamp
    - Render scheme cards for assistant messages
    - _Requirements: 12.6, 4.3_


  - [x] 10.3 Create SchemeCard component (TypeScript/React)
    - Implement glassmorphism card design
    - Display scheme name, description, eligibility summary
    - Add "Check Eligibility" button
    - Implement hover effects (translateY -4px, scale 1.02)
    - Add entrance animation (scale 0.95 → 1, opacity 0 → 1, 400ms)
    - _Requirements: 12.5, 10.2, 10.3_

  - [x] 10.4 Create VoiceInput component (TypeScript/React)
    - Implement microphone button with ripple animation
    - Use Web Audio API to capture audio (16kHz, WebM Opus)
    - Display waveform visualization during recording (5 bars with staggered animation)
    - Implement voice button morph (circular → waveform, 200ms)
    - Add silence detection (stop after 2s silence)
    - Integrate with Voice-to-Text API endpoint
    - Handle audio quality errors
    - _Requirements: 12.2, 12.7, 12.8, 2.1, 2.2, 2.3, 2.4_

  - [x] 10.5 Create VoiceOutput component (TypeScript/React)
    - Add speaker button to play audio responses
    - Integrate with Text-to-Speech API endpoint
    - Handle audio playback with HTML5 Audio API
    - Display playback progress indicator
    - Support low bandwidth mode with compressed audio
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 10.6 Write integration tests for chat interface
    - Test message sending and receiving
    - Test voice input flow
    - Test scheme card interactions
    - _Requirements: 6.1, 6.2, 12.1_

- [x] 11. Implement eligibility check flow
  - [x] 11.1 Create EligibilityForm component (TypeScript/React)
    - Create form fields for user info (age, gender, income, state, category, occupation)
    - Add conditional fields based on scheme type (land ownership, disability, BPL status)
    - Implement form validation with error messages
    - Add glass-styled input fields with focus effects
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 Create EligibilityResult component (TypeScript/React)
    - Display eligibility status (eligible/not eligible) with visual indicator
    - Show criteria checklist with met/unmet status for each criterion
    - Display explanation summary
    - Show scheme benefits and application steps
    - Add "Apply Now" button linking to official website
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

  - [x] 11.3 Write unit tests for eligibility components
    - Test form validation
    - Test result display logic
    - _Requirements: 5.1, 5.2_

- [x] 12. Implement About page with transparency information
  - [x] 12.1 Create AboutPage component (TypeScript/React)
    - Display AWS architecture diagram (interactive SVG or static image)
    - Add AI transparency section explaining rule-based eligibility
    - Create privacy policy section with data handling details
    - Add bias prevention measures explanation
    - Implement section navigation with smooth scrolling
    - _Requirements: 13.1, 13.2, 13.3, 8.1, 8.2, 8.3, 8.4_

  - [x] 12.2 Write unit tests for About page
    - Test section navigation
    - Test content rendering
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 13. Implement accessibility features
  - [x] 13.1 Add ARIA labels and roles to all interactive elements
    - Add aria-label to buttons, inputs, and navigation elements
    - Add role attributes (article, status, navigation)
    - Add aria-live regions for dynamic content updates
    - Add aria-describedby for form hints and errors
    - _Requirements: 14.1, 14.2_

  - [x] 13.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Implement focus trap for modals
    - Add skip-to-main-content link
    - Ensure logical tab order
    - Add visible focus indicators (2px outline with offset)
    - _Requirements: 14.3, 14.4_

  - [x] 13.3 Add screen reader announcements
    - Implement announceToScreenReader utility function
    - Announce message received, eligibility results, errors
    - Add sr-only class for screen reader-only text
    - _Requirements: 14.1, 14.2_

  - [x] 13.4 Write accessibility tests
    - Test keyboard navigation
    - Test ARIA attributes
    - Test screen reader announcements
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 14. Implement responsive design and low bandwidth mode
  - [x] 14.1 Add responsive breakpoints and layouts
    - Implement mobile layout (< 640px): single column, bottom navigation
    - Implement tablet layout (640px - 1024px): two-column grid
    - Implement desktop layout (> 1024px): three-column grid, persistent sidebar
    - Test all components at different breakpoints
    - _Requirements: 15.1, 15.2_

  - [x] 14.2 Implement low bandwidth mode
    - Detect slow connection using Network Information API
    - Disable all animations when low bandwidth detected
    - Reduce image quality to 50%
    - Use compressed audio (Opus 24kbps)
    - Lazy load non-critical resources
    - Add manual toggle for low bandwidth mode
    - _Requirements: 10.9, 3.5, 15.3_


  - [x] 14.3 Write responsive design tests
    - Test layout at different breakpoints
    - Test low bandwidth mode behavior
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 15. Checkpoint - Ensure frontend components are functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement security features
  - [x] 16.1 Add Content Security Policy headers
    - Configure CSP directives (default-src, script-src, style-src, etc.)
    - Add security headers to CloudFront distribution
    - Configure Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options
    - _Requirements: 7.4, 17.1_

  - [x] 16.2 Implement input sanitization
    - Add HTML escaping for all user inputs
    - Remove null bytes and dangerous characters
    - Use bleach library for text sanitization in Python
    - Implement XSS prevention in frontend
    - _Requirements: 17.2, 17.3_

  - [x] 16.3 Configure encryption
    - Enable KMS encryption for DynamoDB
    - Enable S3 server-side encryption
    - Configure CloudWatch Logs encryption
    - Enforce HTTPS-only for all endpoints
    - _Requirements: 7.4, 7.5, 17.4_

  - [x] 16.4 Write security tests
    - Test input sanitization
    - Test HTTPS enforcement
    - Test CSP headers
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 17. Implement monitoring and logging
  - [x] 17.1 Add structured logging to Lambda functions
    - Implement JSON-formatted logs with correlation IDs
    - Log request/response metadata (excluding PII)
    - Log error stack traces
    - Add performance metrics (latency, token usage)
    - _Requirements: 9.8, 18.1, 18.2_

  - [x] 17.2 Create CloudWatch dashboards
    - Create dashboard for API metrics (request count, latency, errors)
    - Create dashboard for Lambda metrics (invocations, duration, errors, throttles)
    - Create dashboard for DynamoDB metrics (read/write capacity, throttles)
    - Add widgets for Bedrock token usage and costs
    - _Requirements: 18.3, 18.4_

  - [x] 17.3 Configure CloudWatch alarms
    - Create alarm for API Gateway 5xx errors (threshold: 10 in 5 minutes)
    - Create alarm for Lambda errors (threshold: 5 in 5 minutes)
    - Create alarm for Lambda duration (threshold: 25s, 80% of timeout)
    - Create alarm for DynamoDB throttling
    - Configure SNS topic for alarm notifications
    - _Requirements: 18.5_

  - [x] 17.4 Write monitoring tests
    - Test log format and content
    - Test metric emission
    - _Requirements: 18.1, 18.2_

- [x] 18. Set up CI/CD pipeline with GitHub Actions
  - [x] 18.1 Create backend deployment workflow
    - Add workflow for Python Lambda functions
    - Install dependencies and run unit tests
    - Run property-based tests
    - Package Lambda functions with SAM
    - Deploy to AWS using SAM deploy
    - Run integration tests against deployed APIs
    - _Requirements: 19.1, 19.2, 19.3_

  - [x] 18.2 Create frontend deployment workflow
    - Add workflow for React TypeScript frontend
    - Install dependencies and run linting
    - Run unit tests
    - Build production bundle with Vite
    - Deploy to S3 and invalidate CloudFront cache
    - _Requirements: 19.4, 19.5_

  - [x] 18.3 Add deployment stages
    - Configure dev, staging, and production environments
    - Use environment-specific configuration files
    - Implement manual approval for production deployments
    - _Requirements: 19.6_

  - [x] 18.4 Write CI/CD tests
    - Test workflow execution
    - Test deployment rollback
    - _Requirements: 19.1, 19.2_

- [x] 19. Implement error handling and user feedback
  - [x] 19.1 Add error boundaries to React components
    - Create ErrorBoundary component to catch React errors
    - Display user-friendly error messages
    - Log errors to console for debugging
    - Provide "Try Again" action
    - _Requirements: 20.1, 20.2_

  - [x] 19.2 Implement API error handling
    - Handle network errors with retry logic
    - Display specific error messages for 400, 429, 500 errors
    - Show connection lost indicator
    - Implement exponential backoff for retries
    - _Requirements: 20.3, 20.4_

  - [x] 19.3 Add user feedback mechanisms
    - Implement toast notifications for success/error messages
    - Add loading states for all async operations
    - Show progress indicators for long-running operations
    - _Requirements: 20.5_

  - [x] 19.4 Write error handling tests
    - Test error boundary behavior
    - Test retry logic
    - Test error message display
    - _Requirements: 20.1, 20.2, 20.3_


- [x] 20. Implement performance optimizations
  - [x] 20.1 Add frontend performance optimizations
    - Implement code splitting with React.lazy and Suspense
    - Add lazy loading for images and non-critical components
    - Optimize bundle size with tree shaking
    - Add service worker for offline support (optional)
    - Implement memoization for expensive computations
    - _Requirements: 21.1, 21.2_

  - [x] 20.2 Add backend performance optimizations
    - Implement Lambda memory caching for scheme data
    - Add DynamoDB query result caching
    - Configure Lambda provisioned concurrency for Chat function
    - Optimize DynamoDB queries with proper indexes
    - _Requirements: 21.3, 21.4_

  - [x] 20.3 Configure CloudFront caching
    - Set cache TTL for static assets (1 year)
    - Set cache TTL for API responses (scheme list: 1 hour, scheme details: 24 hours)
    - Configure cache invalidation on deployments
    - Add cache-control headers
    - _Requirements: 21.5_

  - [x] 20.4 Write performance tests
    - Test bundle size limits
    - Test API response times
    - Test cache behavior
    - _Requirements: 21.1, 21.3, 21.5_

- [x] 21. Implement internationalization (i18n) for UI text
  - [x] 21.1 Set up i18n framework
    - Install react-i18next library
    - Create translation files for 11 languages
    - Configure language detection and switching
    - _Requirements: 1.1, 22.1_

  - [x] 21.2 Add translations for UI elements
    - Translate all static UI text (buttons, labels, placeholders, error messages)
    - Add language selector component
    - Persist language preference in localStorage
    - _Requirements: 22.2, 22.3_

  - [x] 21.3 Add font support for Indian languages
    - Load Noto Sans Devanagari for Hindi
    - Load Noto Sans Tamil for Tamil
    - Load appropriate fonts for other Indian languages
    - Configure font-display: swap for performance
    - _Requirements: 22.4_

  - [x] 21.4 Write i18n tests
    - Test language switching
    - Test translation loading
    - Test font rendering
    - _Requirements: 22.1, 22.2_

- [x] 22. Implement session management and data privacy
  - [x] 22.1 Add session expiration handling
    - Implement TTL-based session expiration in DynamoDB (24 hours)
    - Display session expiration warning to users
    - Clear session data on expiration
    - _Requirements: 7.2, 7.3, 7.6_

  - [x] 22.2 Implement data minimization
    - Collect only essential user information for eligibility checks
    - Avoid storing PII beyond session duration
    - Implement data sanitization before storage
    - _Requirements: 7.1, 7.3_

  - [x] 22.3 Add privacy controls
    - Add "Clear Session" button to delete data immediately
    - Display privacy notice on first visit
    - Show data retention policy
    - _Requirements: 7.3, 13.3_

  - [x] 22.4 Write privacy tests
    - Test session expiration
    - Test data deletion
    - Test PII handling
    - _Requirements: 7.2, 7.3, 7.6_

- [x] 23. Checkpoint - Ensure all features are integrated
  - Ensure all tests pass, ask the user if questions arise.

- [x] 24. Create comprehensive documentation
  - [x] 24.1 Write API documentation
    - Document all API endpoints with request/response examples
    - Add authentication and rate limiting details
    - Include error codes and troubleshooting guide
    - _Requirements: 23.1_

  - [x] 24.2 Write deployment documentation
    - Document AWS resource setup steps
    - Add environment configuration guide
    - Include CI/CD pipeline setup instructions
    - Document monitoring and alerting setup
    - _Requirements: 23.2_

  - [x] 24.3 Write user guide
    - Create user-facing documentation for platform features
    - Add FAQ section
    - Include troubleshooting tips for common issues
    - _Requirements: 23.3_

  - [x] 24.4 Write developer guide
    - Document project structure and architecture
    - Add contribution guidelines
    - Include local development setup instructions
    - Document testing strategy
    - _Requirements: 23.4_

- [-] 25. Perform end-to-end testing and validation
  - [x] 25.1 Write E2E tests for critical user flows
    - Test complete chat flow (text input → response → scheme recommendation)
    - Test voice input flow (record → transcribe → response)
    - Test eligibility check flow (form submission → result display)
    - Test language switching across all features
    - Test dark mode and low bandwidth mode
    - _Requirements: 24.1, 24.2, 24.3_

  - [x] 25.2 Perform manual testing
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - Test on mobile devices (iOS, Android)
    - Test with screen readers (NVDA, JAWS, VoiceOver)
    - Test with keyboard-only navigation
    - Test in low bandwidth conditions
    - _Requirements: 24.4, 24.5_

  - [x] 25.3 Perform load testing
    - Test API Gateway under high load (1000 req/s)
    - Test Lambda cold start performance
    - Test DynamoDB throughput limits
    - Validate auto-scaling behavior
    - _Requirements: 24.6_

- [x] 26. Final checkpoint - Production readiness validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Backend uses Python 3.12 for all Lambda functions
- Frontend uses React 18 with TypeScript
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration and E2E tests validate complete user flows
- Implementation follows serverless-first architecture with AWS services
- Security, privacy, and accessibility are integrated throughout implementation
