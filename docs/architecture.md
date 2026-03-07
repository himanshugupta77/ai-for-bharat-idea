# Bharat Sahayak Architecture

## Overview

Bharat Sahayak is built on AWS serverless architecture, providing a scalable, cost-effective, and highly available platform for helping Indian citizens discover government welfare schemes.

## Architecture Diagram

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│         CloudFront CDN                  │
│  (Global Content Delivery + WAF)        │
└──────┬──────────────────────┬───────────┘
       │                      │
       │ Static Assets        │ API Calls
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│  S3 Bucket  │        │ API Gateway │
│  (Frontend) │        │  (REST API) │
└─────────────┘        └──────┬──────┘
                              │
                              │ Invoke
                              ▼
                    ┌──────────────────────┐
                    │  Lambda Functions    │
                    │  - Chat              │
                    │  - Voice-to-Text     │
                    │  - Text-to-Speech    │
                    │  - Eligibility       │
                    │  - Schemes           │
                    └──────┬───────────────┘
                           │
                           │ Read/Write
                           ▼
                    ┌──────────────────────┐
                    │     DynamoDB         │
                    │  (Sessions & Schemes)│
                    └──────────────────────┘
                           │
                           │ AI Services
                           ▼
                    ┌──────────────────────┐
                    │  Amazon Bedrock      │
                    │  Amazon Transcribe   │
                    │  Amazon Polly        │
                    │  Amazon Translate    │
                    └──────────────────────┘
```

## Components

### Frontend Layer

- **Technology**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Hosting**: S3 + CloudFront
- **Features**:
  - Responsive design with mobile-first approach
  - Glassmorphism UI with smooth animations
  - Dark mode support
  - Low bandwidth mode for slow connections
  - Accessibility compliant (WCAG 2.1 AA)

### API Layer

- **API Gateway**: REST API with request validation
- **WAF**: Rate limiting, geo-blocking, SQL injection, XSS protection
- **CORS**: Configured for secure cross-origin requests
- **Throttling**: 1000 requests/second, 100 requests/minute per IP

### Compute Layer

- **Lambda Functions**:
  - **Chat Function**: Process text queries with AI (1024 MB, 30s timeout)
  - **Voice-to-Text**: Transcribe audio (512 MB, 35s timeout)
  - **Text-to-Speech**: Generate speech (512 MB, 10s timeout)
  - **Eligibility**: Check eligibility (256 MB, 5s timeout)
  - **Schemes**: Retrieve scheme data (256 MB, 5s timeout)

### Data Layer

- **DynamoDB**:
  - **Capacity**: On-demand (pay-per-request)
  - **Table Design**: Single-table design with PK/SK
  - **GSI**: CategoryIndex for querying schemes by category
  - **TTL**: Automatic session expiration after 24 hours
  - **Encryption**: KMS encryption at rest

### AI Services

- **Amazon Bedrock**: Claude 3 Sonnet for conversational AI
- **Amazon Transcribe**: Speech-to-text with language identification
- **Amazon Polly**: Text-to-speech with neural voices
- **Amazon Translate**: Translation between 11 languages

### Security

- **Encryption**:
  - In transit: TLS 1.2+ (HTTPS only)
  - At rest: KMS encryption for DynamoDB and S3
- **IAM**: Least privilege access controls
- **WAF**: Protection against common attacks
- **Input Validation**: Request validation at API Gateway
- **Sanitization**: HTML sanitization to prevent XSS

### Monitoring

- **CloudWatch Logs**: All Lambda functions and API Gateway
- **CloudWatch Metrics**: Performance and usage metrics
- **CloudWatch Alarms**: Error rates, latency, availability
- **X-Ray**: Distributed tracing for debugging

## Data Flow

### Chat Flow

1. User sends message via frontend
2. CloudFront routes to API Gateway
3. API Gateway validates request and invokes Chat Lambda
4. Chat Lambda:
   - Retrieves session context from DynamoDB
   - Detects language (if not provided)
   - Translates to English (if needed)
   - Calls Bedrock for AI response
   - Translates response back to user language
   - Stores message in DynamoDB
5. Response returned to user

### Voice Flow

1. User records audio via frontend
2. Audio sent to Voice-to-Text Lambda
3. Lambda:
   - Uploads audio to S3 temp bucket
   - Starts Transcribe job
   - Waits for completion
   - Returns transcript
   - Deletes S3 object
4. Transcript processed through Chat flow
5. Response converted to speech via Text-to-Speech Lambda
6. Audio returned to user

### Eligibility Check Flow

1. User provides information and selects scheme
2. Eligibility Lambda:
   - Retrieves scheme rules from DynamoDB
   - Evaluates each rule against user info
   - Generates explanation
   - Returns eligibility decision
3. If not eligible, suggests alternative schemes

## Deployment

### Infrastructure as Code

- **AWS SAM**: Define all infrastructure in template.yaml
- **CloudFormation**: Automated provisioning and updates
- **Parameters**: Environment-specific configuration

### CI/CD Pipeline

- **GitHub Actions**: Automated testing and deployment
- **Environments**: dev, staging, prod
- **Testing**: Unit tests, property-based tests, integration tests
- **Deployment**: Automated on push to main/develop branches

## Cost Optimization

- **On-demand DynamoDB**: Pay only for actual usage
- **Lambda**: Pay per invocation and execution time
- **CloudFront**: Caching reduces origin requests
- **S3 Lifecycle**: Automatic deletion of temporary files
- **Provisioned Concurrency**: Only for critical functions in prod

## Scalability

- **Auto-scaling**: All serverless components scale automatically
- **Global Distribution**: CloudFront edge locations worldwide
- **No Single Point of Failure**: Fully distributed architecture
- **High Availability**: Multi-AZ deployment by default

## Security Best Practices

1. **Principle of Least Privilege**: IAM roles with minimal permissions
2. **Defense in Depth**: Multiple layers of security (WAF, encryption, validation)
3. **Secure by Default**: HTTPS-only, encryption enabled
4. **Regular Updates**: Automated dependency updates
5. **Audit Logging**: All actions logged to CloudWatch
6. **Secrets Management**: No hardcoded credentials
7. **Input Validation**: All inputs validated and sanitized

## Disaster Recovery

- **Backups**: Point-in-time recovery for DynamoDB (prod only)
- **Multi-Region**: Can be deployed to multiple regions
- **Rollback**: CloudFormation change sets for safe updates
- **Monitoring**: Alarms for early detection of issues

## Performance Targets

- **Chat Response**: < 5 seconds (95th percentile)
- **Voice Transcription**: < 3 seconds (95th percentile)
- **Eligibility Check**: < 1 second (95th percentile)
- **Frontend Load**: < 3 seconds Time to Interactive
- **Availability**: 99.9% uptime

## Future Enhancements

1. **Multi-region deployment** for global availability
2. **GraphQL API** for more flexible queries
3. **Real-time updates** using WebSockets
4. **Mobile apps** for iOS and Android
5. **Offline support** with service workers
6. **Advanced analytics** with QuickSight
7. **A/B testing** for UI improvements
8. **Chatbot integration** with WhatsApp, Telegram
