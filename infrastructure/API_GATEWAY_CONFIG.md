# API Gateway Configuration Summary

## Overview
This document summarizes the API Gateway configuration for the Bharat Sahayak AI Assistant platform.

## API Type
- **Type**: REST API (required for AWS WAF support)
- **Name**: `bharat-sahayak-api-{Environment}`
- **Stage**: Environment-based (dev/staging/prod)

## Endpoints

### POST /chat
- **Lambda**: ChatFunction
- **Purpose**: Process text-based chat queries with AI
- **Request Model**: ChatRequest (validated)
- **Timeout**: 30 seconds
- **Memory**: 1024 MB

### POST /voice-to-text
- **Lambda**: VoiceToTextFunction
- **Purpose**: Transcribe audio to text using Amazon Transcribe
- **Request Model**: VoiceToTextRequest (validated)
- **Timeout**: 35 seconds
- **Memory**: 512 MB

### POST /text-to-speech
- **Lambda**: TextToSpeechFunction
- **Purpose**: Generate speech audio using Amazon Polly
- **Request Model**: TextToSpeechRequest (validated)
- **Timeout**: 10 seconds
- **Memory**: 512 MB

### POST /eligibility-check
- **Lambda**: EligibilityFunction
- **Purpose**: Check scheme eligibility using rule-based logic
- **Request Model**: EligibilityRequest (validated)
- **Timeout**: 5 seconds
- **Memory**: 256 MB

### GET /schemes
- **Lambda**: SchemesFunction
- **Purpose**: List all available schemes
- **Timeout**: 5 seconds
- **Memory**: 256 MB

### GET /schemes/{schemeId}
- **Lambda**: SchemesFunction
- **Purpose**: Get detailed information for a specific scheme
- **Timeout**: 5 seconds
- **Memory**: 256 MB

## CORS Configuration

```yaml
AllowOrigin: 'https://{DomainName}'
AllowMethods: 'GET,POST,OPTIONS'
AllowHeaders: 'Content-Type,X-Session-Id,Authorization'
MaxAge: 3600 seconds
```

## Request Validation

All POST endpoints have JSON schema validation enabled:

### ChatRequest Schema
```json
{
  "type": "object",
  "required": ["message"],
  "properties": {
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 1000
    },
    "language": {
      "type": "string",
      "enum": ["en", "hi", "mr", "ta", "te", "bn", "gu", "kn", "ml", "pa", "or"]
    }
  }
}
```

### VoiceToTextRequest Schema
```json
{
  "type": "object",
  "required": ["audioData", "format"],
  "properties": {
    "audioData": {
      "type": "string"
    },
    "format": {
      "type": "string",
      "enum": ["webm", "mp3", "wav"]
    }
  }
}
```

### TextToSpeechRequest Schema
```json
{
  "type": "object",
  "required": ["text", "language"],
  "properties": {
    "text": {
      "type": "string",
      "minLength": 1,
      "maxLength": 3000
    },
    "language": {
      "type": "string",
      "enum": ["en", "hi", "mr", "ta", "te", "bn", "gu", "kn", "ml", "pa", "or"]
    },
    "lowBandwidth": {
      "type": "boolean"
    }
  }
}
```

### EligibilityRequest Schema
```json
{
  "type": "object",
  "required": ["schemeId", "userInfo"],
  "properties": {
    "schemeId": {
      "type": "string"
    },
    "userInfo": {
      "type": "object"
    }
  }
}
```

## Throttling Configuration

- **Burst Limit**: 500 requests
- **Rate Limit**: 1000 requests per second
- **Per-IP Limit**: 100 requests per minute (enforced by AWS WAF)

## Custom Error Responses

### 400 Bad Request (BAD_REQUEST_BODY)
```json
{
  "error": "ValidationError",
  "message": "Invalid request format. Please check your request body."
}
```

### 429 Too Many Requests (THROTTLED)
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```
**Headers**: `Retry-After: 60`

### 500 Internal Server Error (DEFAULT_5XX)
```json
{
  "error": "InternalError",
  "message": "An error occurred while processing your request. Please try again."
}
```

### 400 Bad Request (DEFAULT_4XX)
```json
{
  "error": "BadRequest",
  "message": "Invalid request. Please check your request and try again."
}
```

All error responses include CORS headers for cross-origin requests.

## IAM Execution Roles

Each Lambda function has appropriate IAM policies:

### ChatFunction Policies
- DynamoDBCrudPolicy (full access to DataTable)
- Bedrock InvokeModel permission
- Amazon Translate permission

### VoiceToTextFunction Policies
- S3CrudPolicy (access to TempBucket)
- Amazon Transcribe permissions (StartTranscriptionJob, GetTranscriptionJob)

### TextToSpeechFunction Policies
- Amazon Polly SynthesizeSpeech permission

### EligibilityFunction Policies
- DynamoDBReadPolicy (read access to DataTable)

### SchemesFunction Policies
- DynamoDBReadPolicy (read access to DataTable)

## Logging and Monitoring

- **Access Logs**: Enabled with detailed request/response logging
- **CloudWatch Logs**: All Lambda functions log to dedicated log groups
- **X-Ray Tracing**: Enabled for distributed tracing
- **Metrics**: Request count, latency, errors tracked in CloudWatch

## Security

- **HTTPS Only**: All endpoints enforce HTTPS
- **AWS WAF**: Integrated for DDoS protection, rate limiting, SQL injection, and XSS prevention
- **Request Validation**: JSON schema validation on all POST endpoints
- **IAM Roles**: Least privilege access for Lambda functions
- **Encryption**: KMS encryption for logs and data at rest

## Deployment

The API Gateway is deployed using AWS SAM:

```bash
sam build
sam deploy --parameter-overrides Environment=dev
```

The API endpoint URL is available in the CloudFormation outputs:
```
https://{ApiGatewayId}.execute-api.{Region}.amazonaws.com/{Environment}
```

## Testing

Test the API endpoints:

```bash
# Chat endpoint
curl -X POST https://api-endpoint/dev/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about agriculture schemes", "language": "en"}'

# Voice-to-text endpoint
curl -X POST https://api-endpoint/dev/voice-to-text \
  -H "Content-Type: application/json" \
  -d '{"audioData": "base64-encoded-audio", "format": "webm"}'

# Text-to-speech endpoint
curl -X POST https://api-endpoint/dev/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "language": "en", "lowBandwidth": false}'

# Eligibility check endpoint
curl -X POST https://api-endpoint/dev/eligibility-check \
  -H "Content-Type: application/json" \
  -d '{"schemeId": "pm-kisan", "userInfo": {...}}'

# List schemes endpoint
curl https://api-endpoint/dev/schemes

# Get scheme details endpoint
curl https://api-endpoint/dev/schemes/pm-kisan
```
