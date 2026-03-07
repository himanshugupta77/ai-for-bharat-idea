# Security Implementation Summary

This document summarizes the security features implemented for the Bharat Sahayak AI Assistant platform.

## Overview

All security requirements from Requirements 7.4, 7.5, 17.1, 17.2, 17.3, and 17.4 have been implemented across infrastructure, backend, and frontend layers.

## 1. Content Security Policy (CSP) Headers

### Implementation Location
- `infrastructure/template.yaml` - SecurityHeadersPolicy resource

### Security Headers Configured

#### Strict-Transport-Security (HSTS)
- Max age: 2 years (63072000 seconds)
- Include subdomains: Yes
- Preload: Yes
- Forces HTTPS for all connections

#### Content-Security-Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https:;
connect-src 'self' https://*.execute-api.*.amazonaws.com https://*.amazonaws.com;
media-src 'self' blob: data:;
object-src 'none';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

#### Additional Security Headers
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts geolocation, camera, payment, USB

## 2. Input Sanitization

### Backend Implementation

#### Location
- `backend/src/shared/utils.py`

#### Functions Implemented

1. **sanitize_input(text, max_length)**
   - Removes null bytes (\x00)
   - Removes control characters (except newlines and tabs)
   - Strips leading/trailing whitespace
   - Enforces maximum length
   - Validates non-empty after sanitization

2. **sanitize_html(text)**
   - Escapes HTML special characters
   - Prevents XSS attacks

3. **sanitize_text_for_storage(text)**
   - Combines input sanitization and HTML escaping
   - Safe for database storage

4. **validate_language_code(language)**
   - Validates against allowed language codes
   - Prevents injection attacks

5. **validate_scheme_id(scheme_id)**
   - Allows only alphanumeric and hyphens
   - Length validation (1-100 characters)

6. **validate_audio_format(format)**
   - Validates against allowed formats (webm, mp3, wav)

#### Lambda Handler Updates

All Lambda handlers updated to use sanitization:

1. **Chat Handler** (`backend/src/chat/handler.py`)
   - Sanitizes message input (max 1000 chars)
   - Validates language code

2. **Voice-to-Text Handler** (`backend/src/voice/voice_to_text_handler.py`)
   - Validates audio format
   - Validates audio data presence

3. **Text-to-Speech Handler** (`backend/src/voice/text_to_speech_handler.py`)
   - Sanitizes text input (max 3000 chars)
   - Validates language code

4. **Eligibility Handler** (`backend/src/eligibility/handler.py`)
   - Validates scheme ID format
   - Sanitizes user info fields

### Frontend Implementation

#### Location
- `frontend/src/utils/helpers.ts`
- `frontend/src/utils/api.ts`

#### Functions Implemented

1. **sanitizeInput(text)**
   - Removes null bytes
   - Removes control characters
   - Trims whitespace

2. **sanitizeHTML(text)**
   - Escapes HTML using DOM API
   - Prevents XSS in displayed content

3. **escapeHTML(text)**
   - Manual HTML entity escaping
   - Escapes: &, <, >, ", ', /

4. **sanitizeURL(url)**
   - Blocks dangerous protocols (javascript:, data:, vbscript:, file:)
   - Prevents XSS via URLs

#### API Client Updates

All API calls sanitize inputs before sending:
- Chat messages
- Text-to-speech text
- Eligibility check user info

## 3. Encryption Configuration

### KMS Encryption

#### KMS Key Configuration
- Location: `infrastructure/template.yaml` - KMSKey resource
- Key alias: `alias/bharat-sahayak-{environment}`
- Automatic key rotation: Enabled (AWS managed)

#### Services with KMS Encryption

1. **DynamoDB Table**
   - SSE enabled with KMS
   - Encrypts all data at rest
   - Encrypts session data, messages, and scheme information

2. **S3 Buckets**
   - **Frontend Bucket**: KMS encryption with bucket keys
   - **Temp Bucket**: KMS encryption with bucket keys
   - Bucket keys reduce KMS API calls and costs

3. **CloudWatch Logs**
   - All Lambda function log groups encrypted with KMS
   - API Gateway logs encrypted
   - Retention: 30 days (prod), 7 days (dev)

#### KMS Key Policy

Grants access to:
- IAM root (full access)
- Lambda (decrypt, describe)
- DynamoDB (encrypt, decrypt, describe, create grants)
- S3 (encrypt, decrypt, generate data key, describe)
- CloudWatch Logs (encrypt, decrypt, generate data key, describe, create grants)

### HTTPS Enforcement

#### CloudFront Distribution
- Viewer protocol policy: `redirect-to-https`
- Automatically redirects HTTP to HTTPS
- TLS 1.2 minimum

#### API Gateway
- Resource policy denies non-HTTPS requests
- Condition: `aws:SecureTransport = false` → Deny

#### S3 Bucket Policies

Both buckets enforce HTTPS-only access:

```yaml
- Sid: DenyInsecureTransport
  Effect: Deny
  Principal: '*'
  Action: 's3:*'
  Condition:
    Bool:
      'aws:SecureTransport': 'false'
```

## 4. Additional Security Measures

### Rate Limiting
- WAF: 100 requests per minute per IP
- Lambda: 10 requests per 60 seconds per IP (chat endpoint)
- API Gateway: 500 burst, 1000 req/s rate limit

### WAF Rules
- SQL injection protection
- XSS protection
- Geographic blocking (India only)
- Rate limiting

### IAM Least Privilege
- Lambda functions have minimal required permissions
- Separate policies for DynamoDB, Bedrock, Translate, Transcribe, Polly
- No wildcard permissions on sensitive resources

### Data Privacy
- Session TTL: 24 hours (automatic deletion)
- Temporary audio files: 1-hour lifecycle policy
- No PII stored beyond session duration

## Security Testing Recommendations

### Manual Testing
1. Test CSP headers with browser developer tools
2. Verify HTTPS enforcement (try HTTP requests)
3. Test input sanitization with special characters
4. Verify XSS prevention with script injection attempts
5. Test rate limiting with rapid requests

### Automated Testing
1. Run OWASP ZAP security scan
2. Use AWS Security Hub for compliance checks
3. Enable AWS GuardDuty for threat detection
4. Use AWS Config rules for encryption verification

### Penetration Testing
Consider professional penetration testing before production deployment to validate:
- Input validation effectiveness
- XSS prevention
- CSRF protection
- Authentication/authorization (if added)
- API security

## Compliance

### Requirements Validated

- ✅ 7.4: HTTPS-only communication enforced
- ✅ 7.5: IAM least privilege access controls
- ✅ 17.1: Content Security Policy headers configured
- ✅ 17.2: Input sanitization implemented (HTML escaping)
- ✅ 17.3: Dangerous character removal implemented
- ✅ 17.4: KMS encryption for DynamoDB, S3, CloudWatch Logs

### Security Standards
- OWASP Top 10 mitigations implemented
- AWS Well-Architected Security Pillar best practices
- Data encryption at rest and in transit
- Defense in depth approach

## Maintenance

### Regular Security Tasks
1. Review CloudWatch Logs for security events
2. Monitor WAF metrics for blocked requests
3. Update dependencies regularly
4. Review and update CSP as needed
5. Rotate credentials every 90 days
6. Review IAM policies quarterly

### Incident Response
1. CloudWatch Alarms configured for high error rates
2. SNS notifications for production alarms
3. Detailed logging for forensic analysis
4. Automated session cleanup prevents data leakage

## Future Enhancements

Consider implementing:
1. AWS Shield Advanced for DDoS protection
2. AWS Secrets Manager for credential rotation
3. Amazon Cognito for user authentication
4. API Gateway usage plans for per-user rate limiting
5. AWS Certificate Manager for custom domain SSL
6. Security Information and Event Management (SIEM) integration
