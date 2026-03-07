# Developer Guide

Comprehensive guide for developers contributing to the Bharat Sahayak AI Assistant platform.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Strategy](#testing-strategy)
- [Contributing Guidelines](#contributing-guidelines)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)

---

## Project Overview

### Technology Stack

**Frontend**:
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Vite for build tooling
- React Router for navigation
- i18next for internationalization

**Backend**:
- Python 3.12
- AWS Lambda (serverless functions)
- AWS API Gateway (REST API)
- Boto3 (AWS SDK)
- Pydantic (data validation)

**Infrastructure**:
- AWS SAM (Serverless Application Model)
- CloudFormation (IaC)
- DynamoDB (NoSQL database)
- S3 + CloudFront (static hosting)
- AWS WAF (security)

**AI Services**:
- Amazon Bedrock (Claude 3)
- Amazon Transcribe (speech-to-text)
- Amazon Polly (text-to-speech)
- Amazon Translate (language translation)

**Development Tools**:
- Git for version control
- GitHub Actions for CI/CD
- pytest for Python testing
- Vitest for JavaScript testing
- ESLint + Prettier for code formatting

### Key Design Principles

1. **Serverless-First**: No server management, auto-scaling
2. **Privacy-First**: Minimal data collection, automatic expiration
3. **Accessibility-First**: WCAG 2.1 AA compliance
4. **Multilingual**: Native support for 11 Indian languages
5. **Explainable AI**: Transparent, rule-based eligibility
6. **Cost-Optimized**: Pay-per-use, efficient resource utilization

---

## Architecture


### High-Level Architecture

```
User Browser
    ↓ HTTPS
CloudFront CDN + WAF
    ↓
S3 (Frontend) + API Gateway
    ↓
Lambda Functions
    ↓
DynamoDB + AI Services (Bedrock, Transcribe, Polly, Translate)
    ↓
CloudWatch (Monitoring)
```

See [architecture.md](./architecture.md) for detailed diagrams and component descriptions.

### Request Flow

1. User interacts with React frontend
2. Frontend makes API call to API Gateway
3. API Gateway validates request and invokes Lambda
4. Lambda processes request:
   - Retrieves session from DynamoDB
   - Calls AI services (Bedrock, Translate, etc.)
   - Stores results in DynamoDB
5. Response returned to frontend
6. Frontend updates UI

---

## Project Structure

```
bharat-sahayak/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── AIOrb.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Message.tsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   └── AboutPage.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useVoiceInput.ts
│   │   │   ├── useSession.ts
│   │   │   └── ...
│   │   ├── utils/           # Utility functions
│   │   │   ├── api.ts
│   │   │   ├── helpers.ts
│   │   │   └── ...
│   │   ├── i18n/            # Internationalization
│   │   │   ├── locales/
│   │   │   └── config.ts
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── tests/               # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                 # Python Lambda functions
│   ├── src/
│   │   ├── chat/           # Chat Lambda
│   │   │   ├── handler.py
│   │   │   └── test_handler.py
│   │   ├── voice/          # Voice processing Lambdas
│   │   │   ├── voice_to_text_handler.py
│   │   │   ├── text_to_speech_handler.py
│   │   │   └── tests/
│   │   ├── eligibility/    # Eligibility check Lambda
│   │   │   ├── handler.py
│   │   │   └── test_handler.py
│   │   ├── schemes/        # Schemes API Lambda
│   │   │   ├── handler.py
│   │   │   └── test_handler.py
│   │   ├── session/        # Session management Lambda
│   │   │   ├── handler.py
│   │   │   └── test_handler.py
│   │   └── shared/         # Shared utilities
│   │       ├── models.py
│   │       ├── utils.py
│   │       ├── session_manager.py
│   │       └── data_privacy.py
│   ├── scripts/            # Utility scripts
│   │   └── seed_schemes.py
│   ├── tests/              # Backend tests
│   │   ├── unit/
│   │   └── property/
│   ├── requirements.txt
│   └── requirements-dev.txt
│
├── infrastructure/          # AWS SAM templates
│   ├── template.yaml       # Main SAM template
│   ├── parameters/         # Environment configs
│   │   ├── dev.json
│   │   ├── staging.json
│   │   └── prod.json
│   ├── scripts/            # Deployment scripts
│   │   ├── deploy.sh
│   │   ├── deploy-frontend.sh
│   │   └── destroy.sh
│   └── monitoring/         # Monitoring configs
│       └── dashboard.json
│
├── docs/                   # Documentation
│   ├── API.md
│   ├── architecture.md
│   ├── USER_GUIDE.md
│   └── DEVELOPER_GUIDE.md
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│       ├── backend-deploy.yml
│       ├── frontend-deploy.yml
│       └── pr-validation.yml
│
├── README.md
├── DEPLOYMENT.md
├── SECURITY.md
└── .gitignore
```

---


## Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- AWS CLI configured
- AWS SAM CLI
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/bharat-sahayak.git
cd bharat-sahayak

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Frontend setup
cd ../frontend
npm install

# Infrastructure setup
cd ../infrastructure
sam build
```

### Environment Variables

Create `.env` files:

**backend/.env.local**:
```bash
ENVIRONMENT=local
LOG_LEVEL=DEBUG
DYNAMODB_TABLE=bharat-sahayak-data-local
DYNAMODB_ENDPOINT=http://localhost:8000  # For local DynamoDB
AWS_REGION=ap-south-1
```

**frontend/.env.local**:
```bash
VITE_API_ENDPOINT=http://localhost:3000
VITE_ENVIRONMENT=development
```

### Local Development

**Run DynamoDB Local**:
```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

**Run Backend Locally**:
```bash
cd infrastructure
sam local start-api --env-vars env.json
```

**Run Frontend Locally**:
```bash
cd frontend
npm run dev
```

Access at `http://localhost:5173`

---


## Coding Standards

### Python (Backend)

**Style Guide**: PEP 8

**Formatting**:
```bash
# Format code
black src/

# Sort imports
isort src/

# Lint
flake8 src/
pylint src/
```

**Type Hints**:
```python
from typing import Dict, List, Optional

def process_message(
    message: str,
    language: Optional[str] = None
) -> Dict[str, any]:
    """Process user message and return response.
    
    Args:
        message: User's input message
        language: Optional language code
        
    Returns:
        Dictionary containing response and metadata
    """
    pass
```

**Naming Conventions**:
- Functions: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_leading_underscore`

**Documentation**:
- Use docstrings for all functions and classes
- Follow Google style docstrings
- Include type hints

### TypeScript (Frontend)

**Style Guide**: Airbnb TypeScript

**Formatting**:
```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

**Component Structure**:
```typescript
import React from 'react';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export const Message: React.FC<MessageProps> = ({
  content,
  role,
  timestamp
}) => {
  return (
    <div className={`message message-${role}`}>
      <p>{content}</p>
      <span>{new Date(timestamp).toLocaleTimeString()}</span>
    </div>
  );
};
```

**Naming Conventions**:
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities

**Import Order**:
1. React imports
2. Third-party libraries
3. Internal components
4. Utilities and helpers
5. Types
6. Styles

---


## Testing Strategy

### Backend Testing

**Unit Tests** (pytest):
```python
# backend/src/chat/test_handler.py
import pytest
from handler import lambda_handler

def test_chat_handler_valid_input():
    event = {
        'body': '{"message": "Hello", "language": "en"}',
        'headers': {'X-Session-Id': 'test-session'}
    }
    
    response = lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert 'response' in json.loads(response['body'])

def test_chat_handler_missing_message():
    event = {'body': '{}'}
    
    response = lambda_handler(event, None)
    
    assert response['statusCode'] == 400
```

**Property-Based Tests** (Hypothesis):
```python
from hypothesis import given, strategies as st

@given(st.text(min_size=1, max_size=1000))
def test_message_processing_never_crashes(message):
    """Any valid message should not crash the handler."""
    event = {'body': json.dumps({'message': message})}
    response = lambda_handler(event, None)
    assert response['statusCode'] in [200, 400, 500]
```

**Run Tests**:
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run property tests
pytest tests/property/

# Run specific test
pytest src/chat/test_handler.py::test_chat_handler_valid_input
```

### Frontend Testing

**Component Tests** (Vitest + React Testing Library):
```typescript
// frontend/src/components/Message.test.tsx
import { render, screen } from '@testing-library/react';
import { Message } from './Message';

describe('Message Component', () => {
  it('renders user message correctly', () => {
    render(
      <Message
        content="Hello"
        role="user"
        timestamp={Date.now()}
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('applies correct CSS class for role', () => {
    const { container } = render(
      <Message content="Test" role="assistant" timestamp={Date.now()} />
    );
    
    expect(container.firstChild).toHaveClass('message-assistant');
  });
});
```

**Run Tests**:
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Integration Tests

Test complete flows:

```python
# tests/integration/test_chat_flow.py
def test_complete_chat_flow():
    # Create session
    session_id = create_session()
    
    # Send message
    response = send_chat_message(session_id, "Hello")
    assert response['statusCode'] == 200
    
    # Verify session updated
    session = get_session(session_id)
    assert len(session['messages']) == 2  # User + assistant
```

### Test Coverage Goals

- Backend: > 80% coverage
- Frontend: > 70% coverage
- Critical paths: 100% coverage

---


## Contributing Guidelines

### Git Workflow

**Branch Naming**:
- Feature: `feature/description`
- Bug fix: `bugfix/description`
- Hotfix: `hotfix/description`
- Documentation: `docs/description`

**Commit Messages**:
Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(chat): add voice input support

Implement voice recording and transcription using Web Audio API
and Amazon Transcribe service.

Closes #123
```

```
fix(eligibility): correct age validation logic

Age validation was rejecting valid ages due to off-by-one error.

Fixes #456
```

### Pull Request Process

1. **Create Branch**: From `develop` branch
2. **Make Changes**: Follow coding standards
3. **Write Tests**: Ensure coverage
4. **Run Tests**: All tests must pass
5. **Update Docs**: If needed
6. **Create PR**: With clear description
7. **Code Review**: Address feedback
8. **Merge**: Squash and merge

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Code Review Guidelines

**For Reviewers**:
- Check code quality and style
- Verify tests are adequate
- Look for security issues
- Ensure documentation is updated
- Test locally if possible
- Be constructive and respectful

**For Authors**:
- Respond to all comments
- Make requested changes
- Explain design decisions
- Keep PRs focused and small
- Be open to feedback

---


## API Development

### Adding New Endpoints

1. **Define Lambda Function**:

```python
# backend/src/new_feature/handler.py
import json
from shared.models import RequestModel, ResponseModel
from shared.utils import validate_request, handle_errors

@handle_errors
def lambda_handler(event, context):
    # Validate request
    request = validate_request(event, RequestModel)
    
    # Process request
    result = process_request(request)
    
    # Return response
    return {
        'statusCode': 200,
        'body': json.dumps(result.dict())
    }
```

2. **Add to SAM Template**:

```yaml
# infrastructure/template.yaml
NewFeatureFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ../backend/src/new_feature/
    Handler: handler.lambda_handler
    Runtime: python3.12
    Timeout: 30
    MemorySize: 512
    Environment:
      Variables:
        DYNAMODB_TABLE: !Ref DataTable
    Events:
      Api:
        Type: Api
        Properties:
          RestApiId: !Ref ApiGateway
          Path: /new-feature
          Method: POST
```

3. **Write Tests**:

```python
# backend/src/new_feature/test_handler.py
def test_new_feature_handler():
    event = {'body': json.dumps({'param': 'value'})}
    response = lambda_handler(event, None)
    assert response['statusCode'] == 200
```

4. **Update API Documentation**:

Add endpoint details to `docs/API.md`

5. **Deploy**:

```bash
sam build
sam deploy
```

### Request Validation

Use Pydantic models:

```python
from pydantic import BaseModel, Field, validator

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: str = Field(default="en", regex="^(en|hi|mr|...)$")
    
    @validator('message')
    def sanitize_message(cls, v):
        return v.strip()
```

### Error Handling

```python
from shared.utils import APIError

def process_request(request):
    if not valid_input(request):
        raise APIError(
            status_code=400,
            error_type="ValidationError",
            message="Invalid input",
            field="message"
        )
    
    try:
        result = external_service_call()
    except Exception as e:
        raise APIError(
            status_code=500,
            error_type="InternalError",
            message="Service unavailable"
        )
    
    return result
```

---


## Frontend Development

### Creating Components

**Functional Component with TypeScript**:

```typescript
// src/components/SchemeCard.tsx
import React from 'react';
import { Scheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
  onCheckEligibility: (schemeId: string) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onCheckEligibility
}) => {
  return (
    <div className="glass-card">
      <h3>{scheme.name}</h3>
      <p>{scheme.description}</p>
      <button onClick={() => onCheckEligibility(scheme.id)}>
        Check Eligibility
      </button>
    </div>
  );
};
```

### Custom Hooks

```typescript
// src/hooks/useSession.ts
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => {
    // Get or create session ID
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
  }, []);
  
  const clearSession = () => {
    localStorage.removeItem('sessionId');
    setSessionId(uuidv4());
  };
  
  return { sessionId, clearSession };
};
```

### State Management

Use React Context for global state:

```typescript
// src/context/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AppState {
  language: string;
  isDarkMode: boolean;
  isLowBandwidth: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    isDarkMode: false,
    isLowBandwidth: false
  });
  
  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### API Integration

```typescript
// src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

export const api = {
  async chat(message: string, language?: string, sessionId?: string) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'X-Session-Id': sessionId })
      },
      body: JSON.stringify({ message, language })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  async getSchemes(category?: string) {
    const url = new URL(`${API_BASE_URL}/schemes`);
    if (category) url.searchParams.set('category', category);
    
    const response = await fetch(url.toString());
    return response.json();
  }
};
```

### Styling with Tailwind

```typescript
// Use Tailwind utility classes
<div className="glass-card p-6 rounded-xl backdrop-blur-lg bg-white/10">
  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
    Title
  </h2>
  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
    Description
  </p>
</div>

// Custom classes in tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        'indian-green': '#138808'
      }
    }
  }
}
```

---


## Backend Development

### Lambda Function Structure

```python
# Standard Lambda handler structure
import json
import logging
from typing import Dict, Any

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda function handler.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    try:
        # Log request
        logger.info(f"Request: {json.dumps(event)}")
        
        # Parse request
        body = json.loads(event.get('body', '{}'))
        
        # Process request
        result = process_request(body)
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return error_response(400, "ValidationError", str(e))
        
    except Exception as e:
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        return error_response(500, "InternalError", "An error occurred")

def error_response(status_code: int, error_type: str, message: str) -> Dict:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'error': error_type,
            'message': message
        })
    }
```

### DynamoDB Operations

```python
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('bharat-sahayak-data')

# Put item
def create_session(session_id: str, language: str):
    table.put_item(
        Item={
            'PK': f'SESSION#{session_id}',
            'SK': 'METADATA',
            'sessionId': session_id,
            'language': language,
            'createdAt': int(time.time()),
            'ttl': int(time.time()) + 86400  # 24 hours
        }
    )

# Get item
def get_session(session_id: str):
    response = table.get_item(
        Key={
            'PK': f'SESSION#{session_id}',
            'SK': 'METADATA'
        }
    )
    return response.get('Item')

# Query items
def get_messages(session_id: str):
    response = table.query(
        KeyConditionExpression=Key('PK').eq(f'SESSION#{session_id}') & 
                             Key('SK').begins_with('MESSAGE#')
    )
    return response['Items']

# Update item
def update_session(session_id: str, message_count: int):
    table.update_item(
        Key={
            'PK': f'SESSION#{session_id}',
            'SK': 'METADATA'
        },
        UpdateExpression='SET messageCount = :count, lastAccessedAt = :time',
        ExpressionAttributeValues={
            ':count': message_count,
            ':time': int(time.time())
        }
    )
```

### AWS Service Integration

**Bedrock (Claude 3)**:
```python
import boto3
import json

bedrock = boto3.client('bedrock-runtime')

def call_claude(prompt: str, max_tokens: int = 1000):
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229',
        body=json.dumps({
            'anthropic_version': 'bedrock-2023-05-31',
            'max_tokens': max_tokens,
            'messages': [
                {'role': 'user', 'content': prompt}
            ]
        })
    )
    
    result = json.loads(response['body'].read())
    return result['content'][0]['text']
```

**Transcribe**:
```python
import boto3
import time

transcribe = boto3.client('transcribe')
s3 = boto3.client('s3')

def transcribe_audio(audio_data: bytes, job_name: str):
    # Upload to S3
    bucket = 'bharat-sahayak-temp'
    key = f'{job_name}.webm'
    s3.put_object(Bucket=bucket, Key=key, Body=audio_data)
    
    # Start transcription
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': f's3://{bucket}/{key}'},
        MediaFormat='webm',
        LanguageCode='hi-IN',  # Or use IdentifyLanguage=True
        Settings={
            'ShowSpeakerLabels': False
        }
    )
    
    # Wait for completion
    while True:
        status = transcribe.get_transcription_job(
            TranscriptionJobName=job_name
        )
        if status['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
        time.sleep(2)
    
    # Get transcript
    if status['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
        transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
        # Fetch and parse transcript
        return parse_transcript(transcript_uri)
    
    raise Exception('Transcription failed')
```

---


## Database Schema

### DynamoDB Table Design

**Table Name**: `bharat-sahayak-data`

**Primary Key**:
- Partition Key (PK): String
- Sort Key (SK): String

**Global Secondary Index**:
- CategoryIndex: `category` (PK)

### Entity Types

**Session Metadata**:
```python
{
    'PK': 'SESSION#<uuid>',
    'SK': 'METADATA',
    'sessionId': '<uuid>',
    'language': 'hi',
    'createdAt': 1704067200,
    'lastAccessedAt': 1704070800,
    'messageCount': 5,
    'ttl': 1704153600
}
```

**Message**:
```python
{
    'PK': 'SESSION#<uuid>',
    'SK': 'MESSAGE#<timestamp>',
    'messageId': '<uuid>',
    'role': 'user',  # or 'assistant'
    'content': 'Message text',
    'timestamp': 1704067200000,
    'language': 'hi',
    'schemes': ['pm-kisan'],  # For assistant messages
    'ttl': 1704153600
}
```

**Scheme**:
```python
{
    'PK': 'SCHEME#<scheme-id>',
    'SK': 'METADATA',
    'schemeId': 'pm-kisan',
    'name': 'PM-KISAN',
    'nameTranslations': {'hi': '...', 'ta': '...'},
    'description': '...',
    'category': 'agriculture',
    'eligibilityRules': [...],
    'benefits': '...',
    'applicationSteps': [...],
    'documents': [...],
    'officialWebsite': 'https://...',
    'version': 1,
    'lastUpdated': 1704067200
}
```

### Access Patterns

| Pattern | Key Condition | Index |
|---------|--------------|-------|
| Get session | PK = SESSION#id, SK = METADATA | Primary |
| Get messages | PK = SESSION#id, SK begins_with MESSAGE# | Primary |
| Get scheme | PK = SCHEME#id, SK = METADATA | Primary |
| List schemes by category | category = value | GSI |

### Data Modeling Best Practices

1. **Single Table Design**: All entities in one table
2. **Composite Keys**: Use PK/SK for relationships
3. **TTL**: Automatic expiration for sessions
4. **Sparse Indexes**: GSI only on schemes (has category attribute)
5. **Denormalization**: Store translations inline

---

se timeout in template.yaml
- Optimize database queries
- Use provisioned concurrency

**DynamoDB Throttling**:
- Check CloudWatch metrics
- Review access patterns
- Add caching
- Consider on-demand capacity

**API Gateway 502**:
- Lambda function error
- Check Lambda logs
- Verify IAM permissions
- Check timeout settings

---

+%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/'
```

### X-Ray Tracing

Enable X-Ray for distributed tracing:

```python
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

patch_all()

@xray_recorder.capture('process_message')
def process_message(message):
    # Function is traced
    pass
```

View traces in AWS X-Ray console.

### Common Issues

**Lambda Timeout**:
- Check CloudWatch logs for slow operations
- Increa

**Frontend**:
```bash
# Run with source maps
npm run dev

# Use browser DevTools
# React DevTools extension
# Redux DevTools (if using Redux)
```

### CloudWatch Logs

```bash
# Tail logs
aws logs tail /aws/lambda/bharat-sahayak-chat-dev --follow

# Query logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/bharat-sahayak-chat-dev \
  --filter-pattern "ERROR"

# Insights query
aws logs start-query \
  --log-group-name /aws/lambda/bharat-sahayak-chat-dev \
  --start-time $(date -d '1 hour ago' list

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backup created (prod)
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## Debugging

### Local Debugging

**Backend**:
```bash
# Run Lambda locally
sam local invoke ChatFunction -e events/chat-event.json

# Start local API
sam local start-api --debug

# Attach debugger (VS Code)
# Add breakpoint, then:
sam local invoke ChatFunction -e events/chat-event.json -d 5858
```
## Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for comprehensive deployment guide.

### Quick Deployment

**Development**:
```bash
cd infrastructure
./scripts/deploy.sh dev
./scripts/deploy-frontend.sh dev
```

**Production**:
```bash
./scripts/deploy.sh prod
./scripts/deploy-frontend.sh prod
```

### CI/CD Pipeline

GitHub Actions automatically deploys:
- `develop` branch → dev environment
- `staging` branch → staging environment
- `main` branch → production environment (with approval)

### Deployment Check

## Performance Optimization

### Backend Optimization

**Lambda Memory Sizing**:
```python
# Right-size memory for optimal price/performance
# Chat function: 1024 MB (CPU-intensive with LLM calls)
# Voice functions: 512 MB (I/O bound)
# Eligibility: 256 MB (simple computation)
```

**Connection Pooling**:
```python
# Reuse connections across invocations
import boto3
from functools import lru_cache

@lru_cache(maxsize=1)
def get_dynamodb_client():
    return boto3.client('dynamodb')

# Use in handler
dynamodb = get_dynamodb_client()
```

**Caching**:
```python
# Cache scheme data in Lambda memory
scheme_cache = {}
CACHE_TTL = 300  # 5 minutes

def get_scheme(scheme_id: str):
    if scheme_id in scheme_cache:
        cached_data, timestamp = scheme_cache[scheme_id]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data
    
    # Fetch from DynamoDB
    data = fetch_from_db(scheme_id)
    scheme_cache[scheme_id] = (data, time.time())
    return data
```

### Frontend Optimization

**Code Splitting**:
```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const ChatPage = lazy(() => import('./pages/ChatPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Image Optimization**:
```typescript
// Use WebP with fallback
<picture>
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero" loading="lazy" />
</picture>
```

**Memoization**:
```typescript
import { useMemo, useCallback } from 'react';

function SchemeList({ schemes, onSelect }) {
  // Memoize expensive computations
  const sortedSchemes = useMemo(() => {
    return schemes.sort((a, b) => a.name.localeCompare(b.name));
  }, [schemes]);
  
  // Memoize callbacks
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);
  
  return sortedSchemes.map(scheme => (
    <SchemeCard key={scheme.id} scheme={scheme} onSelect={handleSelect} />
  ));
}
```

---


## Security Best Practices

### Input Validation

**Backend**:
```python
import bleach
from pydantic import BaseModel, validator

class ChatRequest(BaseModel):
    message: str
    
    @validator('message')
    def sanitize_message(cls, v):
        # Remove HTML tags
        cleaned = bleach.clean(v, tags=[], strip=True)
        # Remove null bytes
        cleaned = cleaned.replace('\x00', '')
        # Limit length
        if len(cleaned) > 1000:
            raise ValueError('Message too long')
        return cleaned.strip()
```

**Frontend**:
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

### Authentication & Authorization

```python
# Verify session ownership
def verify_session(session_id: str, user_id: str):
    session = get_session(session_id)
    if not session or session.get('userId') != user_id:
        raise UnauthorizedError('Invalid session')
```

### Secrets Management

```python
# Use AWS Secrets Manager
import boto3
import json

secrets_client = boto3.client('secretsmanager')

def get_secret(secret_name: str):
    response = secrets_client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Use in code
api_key = get_secret('bharat-sahayak/api-keys')['bedrock_key']
```

### Rate Limiting

```python
from functools import wraps
from datetime import datetime, timedelta

rate_limit_cache = {}

def rate_limit(max_requests: int, window_seconds: int):
    def decorator(func):
        @wraps(func)
        def wrapper(event, context):
            ip = event['requestContext']['identity']['sourceIp']
            now = datetime.now()
            
            # Clean old entries
            rate_limit_cache[ip] = [
                ts for ts in rate_limit_cache.get(ip, [])
                if now - ts < timedelta(seconds=window_seconds)
            ]
            
            # Check limit
            if len(rate_limit_cache.get(ip, [])) >= max_requests:
                return {
                    'statusCode': 429,
                    'body': json.dumps({'error': 'Rate limit exceeded'})
                }
            
            # Add request
            rate_limit_cache.setdefault(ip, []).append(now)
            
            return func(event, context)
        return wrapper
    return decorator

@rate_limit(max_requests=10, window_seconds=60)
def lambda_handler(event, context):
    pass
```

### HTTPS Enforcement

```yaml
# CloudFront configuration
ViewerProtocolPolicy: redirect-to-https
MinimumProtocolVersion: TLSv1.2_2021
```

---


## Resources

### Documentation
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing

### Community
- GitHub Discussions
- Slack Channel: #bharat-sahayak-dev
- Stack Overflow: Tag `bharat-sahayak`

---

## Glossary

**Lambda**: AWS serverless compute service
**API Gateway**: AWS managed API service
**DynamoDB**: AWS NoSQL database
**SAM**: Serverless Application Model (IaC framework)
**CloudFormation**: AWS infrastructure as code service
**Bedrock**: AWS managed AI service
**TTL**: Time To Live (automatic expiration)
**GSI**: Global Secondary Index (DynamoDB)
**PK/SK**: Partition Key / Sort Key (DynamoDB)
**CORS**: Cross-Origin Resource Sharing
**WAF**: Web Application Firewall
**CDN**: Content Delivery Network
**IaC**: Infrastructure as Code

---

## FAQ

**Q: How do I add a new language?**
A: Add translation files in `frontend/src/i18n/locales/`, update language list in config, and add voice mappings for Polly.

**Q: How do I add a new scheme?**
A: Run the seeding script with new scheme data or use the admin API (if implemented).

**Q: How do I test Lambda functions locally?**
A: Use `sam local invoke` or `sam local start-api` with test events.

**Q: How do I debug production issues?**
A: Check CloudWatch Logs, use X-Ray tracing, and review CloudWatch metrics.

**Q: How do I roll back a deployment?**
A: Use CloudFormation rollback or update Lambda alias to previous version.

**Q: How do I optimize costs?**
A: Enable caching, right-size Lambda memory, use on-demand DynamoDB, implement request throttling.

---

## Changelog

### Version 1.0 (January 2024)
- Initial release
- 11 language support
- Voice input/output
- Eligibility checker
- 150+ schemes

### Upcoming Features
- Mobile apps
- Offline support
- More languages
- Advanced search
- Scheme comparison
- Application tracking

---

## Support

**For Developers**:
- Email: dev@bharatsahayak.in
- Slack: #bharat-sahayak-dev
- GitHub Issues: Bug reports and feature requests

**Documentation**:
- [API Documentation](./API.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Architecture Guide](./architecture.md)
- [User Guide](./USER_GUIDE.md)

---

*Happy coding! Thank you for contributing to Bharat Sahayak.*

*Last Updated: January 2024*
