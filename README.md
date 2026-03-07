# Bharat Sahayak AI Assistant

A production-ready, multilingual AI welfare assistant platform built on AWS serverless architecture. Helps Indian citizens discover and access government welfare schemes through natural conversation in 11 languages with voice interaction capabilities.

## Features

- **Multilingual Support**: 11 languages (English + 10 Indian languages)
- **Voice Interaction**: Speech-to-text and text-to-speech capabilities
- **Intelligent Scheme Matching**: AI-powered welfare scheme recommendations
- **Explainable Eligibility**: Rule-based eligibility checking with transparent explanations
- **Premium UI/UX**: Apple-level interface with glassmorphism and smooth animations
- **Privacy-First**: Automatic 24-hour session expiration, minimal data collection
- **Serverless Architecture**: Zero server management, auto-scaling

## Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python 3.12, AWS Lambda, API Gateway
- **Database**: DynamoDB with on-demand capacity
- **AI Services**: Amazon Bedrock (Claude 3), Transcribe, Polly, Translate
- **Infrastructure**: AWS SAM, CloudFormation
- **Security**: AWS WAF, KMS encryption, HTTPS-only

## Project Structure

```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # Python Lambda functions
│   ├── src/
│   │   ├── chat/         # Chat Lambda function
│   │   ├── voice/        # Voice processing Lambda functions
│   │   ├── eligibility/  # Eligibility check Lambda function
│   │   ├── schemes/      # Schemes API Lambda function
│   │   └── shared/       # Shared utilities and models
│   ├── tests/            # Unit and property-based tests
│   └── requirements.txt
│
├── infrastructure/        # AWS SAM templates
│   ├── template.yaml     # Main SAM template
│   ├── parameters/       # Environment-specific parameters
│   └── scripts/          # Deployment scripts
│
├── docs/                 # Documentation
│   └── architecture.md
│
└── .github/
    └── workflows/        # CI/CD pipelines
```

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- AWS SAM CLI installed
- Python 3.12+
- Node.js 20+
- npm or yarn

## Deployment

### Backend Deployment

```bash
# Build and deploy infrastructure
cd infrastructure
sam build
sam deploy --guided

# For subsequent deployments
sam deploy
```

### Frontend Deployment

```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy to S3
aws s3 sync dist/ s3://bharat-sahayak-frontend-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Run property-based tests
pytest tests/property/
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev

# Run linter
npm run lint

# Run type check
npm run type-check
```

## Environment Variables

### Backend Lambda Functions

- `DYNAMODB_TABLE`: DynamoDB table name
- `BEDROCK_MODEL_ID`: Amazon Bedrock model ID
- `S3_TEMP_BUCKET`: S3 bucket for temporary audio storage
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)

### Frontend

- `VITE_API_ENDPOINT`: API Gateway endpoint URL

## Security

- HTTPS-only communication
- AWS WAF with rate limiting and attack protection
- KMS encryption for data at rest
- IAM least privilege access controls
- Automatic session expiration (24 hours)
- Input validation and sanitization

## Monitoring

- CloudWatch Logs for all Lambda functions
- CloudWatch Metrics for performance tracking
- CloudWatch Alarms for error rates and latency
- Custom dashboard for system health monitoring

## Cost Optimization

- On-demand DynamoDB capacity
- Lambda pay-per-use pricing
- CloudFront caching to reduce origin requests
- S3 lifecycle policies for temporary files
- Provisioned concurrency only for critical functions

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
