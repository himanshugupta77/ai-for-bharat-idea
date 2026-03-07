# API Documentation

## Overview

The Bharat Sahayak API provides RESTful endpoints for accessing the multilingual AI welfare assistant platform. All endpoints use HTTPS and return JSON responses.

**Base URL**: `https://api.bharatsahayak.in` (production)

**API Version**: v1

**Authentication**: No authentication required (public API with rate limiting)

## Table of Contents

- [Endpoints](#endpoints)
  - [POST /chat](#post-chat)
  - [POST /voice-to-text](#post-voice-to-text)
  - [POST /text-to-speech](#post-text-to-speech)
  - [POST /eligibility-check](#post-eligibility-check)
  - [GET /schemes](#get-schemes)
  - [GET /schemes/{schemeId}](#get-schemesschemeid)
- [Common Headers](#common-headers)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Troubleshooting](#troubleshooting)

---

## Endpoints

### POST /chat

Process text-based user queries and generate AI responses with scheme recommendations.

#### Request

**Headers**:
```
Content-Type: application/json
X-Session-Id: <uuid> (optional, created if not provided)
```

**Body**:
```json
{
  "message": "मुझे कृषि योजनाओं के बारे में बताएं",
  "language": "hi"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message (1-1000 characters) |
| language | string | No | Language code (en, hi, mr, ta, te, bn, gu, kn, ml, pa, or). Auto-detected if not provided. |

#### Response

**Success (200 OK)**:
```json
{
  "response": "यहाँ कुछ कृषि योजनाएं हैं जो आपके लिए उपयोगी हो सकती हैं...",
  "language": "hi",
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "प्रधानमंत्री किसान सम्मान निधि",
      "description": "किसान परिवारों के लिए आय सहायता",
      "eligibilitySummary": "2 हेक्टेयर तक की कृषि भूमि वाले किसान",
      "applicationSteps": [
        "PM-KISAN पोर्टल पर जाएं",
        "आधार से पंजीकरण करें",
        "आवेदन फॉर्म भरें"
      ]
    }
  ],
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| response | string | AI-generated response in user's language |
| language | string | Detected or specified language code |
| schemes | array | List of recommended schemes (may be empty) |
| sessionId | string | Session identifier for conversation continuity |

#### Example

```bash
curl -X POST https://api.bharatsahayak.in/chat \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "message": "I need help finding education schemes",
    "language": "en"
  }'
```

#### Performance

- **Target Response Time**: < 5 seconds (95th percentile)
- **Timeout**: 30 seconds

---

### POST /voice-to-text

Transcribe audio input to text with automatic language detection.

#### Request

**Headers**:
```
Content-Type: application/json
X-Session-Id: <uuid>
```

**Body**:
```json
{
  "audioData": "base64-encoded-audio-data",
  "format": "webm"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| audioData | string | Yes | Base64-encoded audio data |
| format | string | Yes | Audio format: webm, mp3, or wav |

**Constraints**:
- Maximum audio duration: 60 seconds
- Maximum file size: 10 MB
- Supported sample rates: 8kHz - 48kHz

#### Response

**Success (200 OK)**:
```json
{
  "transcript": "मुझे कृषि योजनाओं के बारे में बताएं",
  "detectedLanguage": "hi",
  "confidence": 0.95
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| transcript | string | Transcribed text |
| detectedLanguage | string | Detected language code |
| confidence | number | Transcription confidence (0.0-1.0) |

#### Example

```bash
# Record audio and convert to base64
AUDIO_BASE64=$(base64 -w 0 audio.webm)

curl -X POST https://api.bharatsahayak.in/voice-to-text \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -d "{
    \"audioData\": \"$AUDIO_BASE64\",
    \"format\": \"webm\"
  }"
```

#### Performance

- **Target Response Time**: < 3 seconds (95th percentile)
- **Timeout**: 35 seconds

---

### POST /text-to-speech

Generate speech audio from text in any supported language.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "text": "यहाँ कुछ कृषि योजनाएं हैं",
  "language": "hi",
  "lowBandwidth": false
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to convert to speech (1-3000 characters) |
| language | string | Yes | Language code (en, hi, mr, ta, te, bn, gu, kn, ml, pa, or) |
| lowBandwidth | boolean | No | Enable compression for slow connections (default: false) |

#### Response

**Success (200 OK)**:
```json
{
  "audioData": "base64-encoded-audio-data",
  "format": "mp3",
  "duration": 4.5,
  "sizeBytes": 72000
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| audioData | string | Base64-encoded audio data |
| format | string | Audio format (mp3 or opus) |
| duration | number | Audio duration in seconds |
| sizeBytes | number | Audio file size in bytes |

**Audio Specifications**:
- Standard mode: MP3, 128kbps (~16KB per second)
- Low bandwidth mode: Opus, 24kbps (~3KB per second, 70% size reduction)

#### Example

```bash
curl -X POST https://api.bharatsahayak.in/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Bharat Sahayak",
    "language": "en",
    "lowBandwidth": false
  }' | jq -r '.audioData' | base64 -d > output.mp3
```

#### Performance

- **Target Response Time**: < 2 seconds for text under 500 characters (95th percentile)
- **Timeout**: 10 seconds

---

### POST /eligibility-check

Evaluate user eligibility for a specific government scheme with detailed explanations.

#### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "schemeId": "pm-kisan",
  "userInfo": {
    "age": 45,
    "gender": "male",
    "income": 250000,
    "state": "Maharashtra",
    "category": "general",
    "occupation": "farmer",
    "ownsLand": true,
    "landSize": 1.5,
    "hasDisability": false,
    "isBPL": false
  }
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| schemeId | string | Yes | Unique scheme identifier |
| userInfo | object | Yes | User information for eligibility evaluation |

**UserInfo Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| age | integer | No | User's age (0-120) |
| gender | string | No | Gender: male, female, or other |
| income | integer | No | Annual income in INR |
| state | string | No | State of residence |
| category | string | No | Category: general, obc, sc, or st |
| occupation | string | No | Occupation |
| ownsLand | boolean | No | Land ownership status |
| landSize | number | No | Land size in hectares |
| hasDisability | boolean | No | Disability status |
| isBPL | boolean | No | Below Poverty Line status |

*Note: Required fields vary by scheme. Provide all available information for accurate evaluation.*

#### Response

**Success - Eligible (200 OK)**:
```json
{
  "eligible": true,
  "explanation": {
    "criteria": [
      {
        "criterion": "Land Ownership",
        "required": "Must own agricultural land",
        "userValue": "Yes",
        "met": true
      },
      {
        "criterion": "Land Size",
        "required": "Land holding up to 2 hectares",
        "userValue": "1.5 hectares",
        "met": true
      }
    ],
    "summary": "You are eligible for PM-KISAN scheme. You meet all 2 eligibility criteria."
  },
  "schemeDetails": {
    "name": "PM-KISAN",
    "benefits": "₹6000 per year in three installments",
    "applicationProcess": [
      "Visit PM-KISAN portal at https://pmkisan.gov.in",
      "Register with Aadhaar number",
      "Fill application form with land details",
      "Submit land ownership documents",
      "Wait for verification by local authorities"
    ],
    "requiredDocuments": [
      "Aadhaar card",
      "Land ownership documents",
      "Bank account details"
    ]
  }
}
```

**Success - Not Eligible (200 OK)**:
```json
{
  "eligible": false,
  "explanation": {
    "criteria": [
      {
        "criterion": "Land Ownership",
        "required": "Must own agricultural land",
        "userValue": "No",
        "met": false
      }
    ],
    "summary": "You are not eligible for PM-KISAN scheme. You do not meet 1 out of 2 criteria. Specifically: You must own agricultural land to qualify."
  },
  "alternativeSchemes": [
    {
      "id": "mgnrega",
      "name": "MGNREGA",
      "reason": "Provides employment guarantee for rural households"
    }
  ]
}
```

#### Example

```bash
curl -X POST https://api.bharatsahayak.in/eligibility-check \
  -H "Content-Type: application/json" \
  -d '{
    "schemeId": "pm-kisan",
    "userInfo": {
      "age": 45,
      "occupation": "farmer",
      "ownsLand": true,
      "landSize": 1.5
    }
  }'
```

#### Performance

- **Target Response Time**: < 1 second (95th percentile)
- **Timeout**: 5 seconds

---

### GET /schemes

Retrieve a list of all available government schemes with optional filtering.

#### Request

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category (e.g., agriculture, education, health) |
| limit | integer | No | Number of results (default: 50, max: 100) |
| offset | integer | No | Pagination offset (default: 0) |

#### Response

**Success (200 OK)**:
```json
{
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "PM-KISAN",
      "description": "Income support for farmer families",
      "category": "agriculture",
      "targetAudience": "Small and marginal farmers"
    },
    {
      "id": "ayushman-bharat",
      "name": "Ayushman Bharat",
      "description": "Health insurance for economically vulnerable families",
      "category": "health",
      "targetAudience": "Families with annual income below ₹5 lakhs"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| schemes | array | List of scheme summaries |
| total | integer | Total number of schemes matching filter |
| limit | integer | Number of results returned |
| offset | integer | Pagination offset |

#### Example

```bash
# Get all schemes
curl https://api.bharatsahayak.in/schemes

# Get agriculture schemes
curl https://api.bharatsahayak.in/schemes?category=agriculture

# Pagination
curl https://api.bharatsahayak.in/schemes?limit=20&offset=40
```

#### Caching

- CloudFront cache: 1 hour
- Lambda memory cache: 5 minutes

---

### GET /schemes/{schemeId}

Retrieve detailed information about a specific government scheme.

#### Request

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| schemeId | string | Yes | Unique scheme identifier |

#### Response

**Success (200 OK)**:
```json
{
  "id": "pm-kisan",
  "name": "PM-KISAN",
  "nameTranslations": {
    "hi": "प्रधानमंत्री किसान सम्मान निधि",
    "ta": "பிரதமர் கிசான் சம்மான் நிதி",
    "te": "ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి"
  },
  "description": "Income support for farmer families owning cultivable land",
  "category": "agriculture",
  "eligibilityRules": [
    {
      "criterion": "landOwnership",
      "requirement": "Must own agricultural land"
    },
    {
      "criterion": "landSize",
      "requirement": "Land holding up to 2 hectares"
    }
  ],
  "benefits": "₹6000 per year in three equal installments of ₹2000 each",
  "applicationSteps": [
    "Visit PM-KISAN portal at https://pmkisan.gov.in",
    "Register with Aadhaar number",
    "Fill application form with land details",
    "Submit land ownership documents",
    "Wait for verification by local authorities"
  ],
  "documents": [
    "Aadhaar card",
    "Land ownership documents (7/12 extract, land passbook)",
    "Bank account details with IFSC code"
  ],
  "officialWebsite": "https://pmkisan.gov.in",
  "lastUpdated": 1704067200
}
```

#### Example

```bash
curl https://api.bharatsahayak.in/schemes/pm-kisan
```

#### Caching

- CloudFront cache: 24 hours
- Lambda memory cache: 5 minutes

---

## Common Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| Content-Type | Yes (POST) | Must be `application/json` |
| X-Session-Id | No | UUID for session continuity. Generated if not provided. |
| User-Agent | No | Client identification |

### Response Headers

| Header | Description |
|--------|-------------|
| Content-Type | Always `application/json` |
| X-Request-Id | Unique request identifier for debugging |
| X-RateLimit-Limit | Rate limit per time window |
| X-RateLimit-Remaining | Remaining requests in current window |
| X-RateLimit-Reset | Unix timestamp when rate limit resets |

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - Request body exceeds limit |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Temporary issue |

### Error Response Format

All errors return a JSON response with the following structure:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error description",
  "field": "fieldName",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Common Errors

#### 400 Bad Request

**ValidationError**:
```json
{
  "error": "ValidationError",
  "message": "Message cannot be empty",
  "field": "message"
}
```

**InvalidLanguage**:
```json
{
  "error": "InvalidLanguage",
  "message": "Language 'xyz' is not supported. Supported languages: en, hi, mr, ta, te, bn, gu, kn, ml, pa, or",
  "field": "language"
}
```

**AudioQualityError**:
```json
{
  "error": "AudioQualityError",
  "message": "Audio quality is too low for transcription. Please speak clearly and try again.",
  "confidence": 0.3
}
```

#### 404 Not Found

**SchemeNotFound**:
```json
{
  "error": "SchemeNotFound",
  "message": "Scheme with ID 'invalid-scheme' does not exist",
  "schemeId": "invalid-scheme"
}
```

#### 413 Payload Too Large

**PayloadTooLarge**:
```json
{
  "error": "PayloadTooLarge",
  "message": "Audio file exceeds maximum size of 10MB",
  "maxSize": 10485760
}
```

#### 429 Too Many Requests

**RateLimitExceeded**:
```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

#### 500 Internal Server Error

**InternalError**:
```json
{
  "error": "InternalError",
  "message": "An error occurred while processing your request. Please try again.",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Rate Limiting

### Limits

- **Per IP Address**: 100 requests per minute
- **Burst Limit**: 500 requests
- **Global Limit**: 1000 requests per second

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

### Handling Rate Limits

When rate limited (429 response):

1. Check `X-RateLimit-Reset` header for reset time
2. Wait until reset time before retrying
3. Implement exponential backoff for retries
4. Consider caching responses to reduce API calls

**Example Retry Logic**:

```javascript
async function callApiWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = (resetTime * 1000) - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## Troubleshooting

### Common Issues

#### 1. Session Not Persisting

**Problem**: Conversation context is lost between requests.

**Solution**: Include `X-Session-Id` header in all requests:

```bash
SESSION_ID=$(uuidgen)
curl -H "X-Session-Id: $SESSION_ID" ...
```

#### 2. Language Not Detected Correctly

**Problem**: Wrong language detected for voice or text input.

**Solution**: Explicitly specify language in request:

```json
{
  "message": "Your message",
  "language": "hi"
}
```

#### 3. Audio Transcription Fails

**Problem**: Voice-to-text returns low confidence or error.

**Solutions**:
- Ensure audio is clear with minimal background noise
- Use supported formats: WebM, MP3, or WAV
- Keep audio under 60 seconds
- Ensure file size is under 10MB
- Use sample rate between 8kHz and 48kHz

#### 4. Slow Response Times

**Problem**: API responses take longer than expected.

**Solutions**:
- Check network connectivity
- Enable low bandwidth mode for text-to-speech
- Use pagination for scheme lists
- Implement client-side caching
- Consider using CloudFront edge locations

#### 5. CORS Errors

**Problem**: Browser blocks API requests due to CORS policy.

**Solution**: Ensure your domain is whitelisted. Contact support to add your domain to allowed origins.

### Getting Help

For API issues:

1. **Check Status**: Monitor [status.bharatsahayak.in](https://status.bharatsahayak.in)
2. **Review Logs**: Include `X-Request-Id` from error response
3. **Contact Support**: support@bharatsahayak.in with request details
4. **Documentation**: Refer to this guide and [architecture docs](./architecture.md)

### Debug Mode

For development, enable verbose logging:

```bash
curl -v https://api.bharatsahayak.in/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## Best Practices

### 1. Session Management

- Generate a UUID for each user session
- Store session ID in browser localStorage
- Include session ID in all requests for context continuity
- Clear session ID after 24 hours

### 2. Error Handling

- Always check HTTP status code
- Parse error response for details
- Implement retry logic with exponential backoff
- Display user-friendly error messages

### 3. Performance

- Cache scheme list and details locally
- Implement request debouncing for chat input
- Use low bandwidth mode on slow connections
- Compress audio before uploading

### 4. Security

- Never expose API keys (public API doesn't require keys)
- Validate and sanitize user input before sending
- Use HTTPS for all requests
- Implement CSRF protection in your application

### 5. Accessibility

- Provide text alternatives for voice features
- Support keyboard navigation
- Include ARIA labels for screen readers
- Respect user's language preferences

---

## SDK and Libraries

### JavaScript/TypeScript

```typescript
// Example API client
class BharatSahayakClient {
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  async chat(message: string, language?: string) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': this.sessionId
      },
      body: JSON.stringify({ message, language })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getSchemes(category?: string) {
    const url = new URL(`${this.baseUrl}/schemes`);
    if (category) url.searchParams.set('category', category);

    const response = await fetch(url.toString());
    return response.json();
  }
}

// Usage
const client = new BharatSahayakClient('https://api.bharatsahayak.in');
const result = await client.chat('Tell me about education schemes', 'en');
```

### Python

```python
import requests
import uuid

class BharatSahayakClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session_id = str(uuid.uuid4())
    
    def chat(self, message: str, language: str = None):
        response = requests.post(
            f"{self.base_url}/chat",
            headers={
                "Content-Type": "application/json",
                "X-Session-Id": self.session_id
            },
            json={"message": message, "language": language}
        )
        response.raise_for_status()
        return response.json()
    
    def get_schemes(self, category: str = None):
        params = {"category": category} if category else {}
        response = requests.get(f"{self.base_url}/schemes", params=params)
        response.raise_for_status()
        return response.json()

# Usage
client = BharatSahayakClient("https://api.bharatsahayak.in")
result = client.chat("Tell me about education schemes", "en")
```

---

## Changelog

### Version 1.0 (Current)

- Initial API release
- Support for 11 Indian languages
- Chat, voice, eligibility, and schemes endpoints
- Rate limiting and security features

---

## Support

- **Email**: support@bharatsahayak.in
- **Documentation**: https://docs.bharatsahayak.in
- **Status Page**: https://status.bharatsahayak.in
- **GitHub**: https://github.com/bharatsahayak/api

---

*Last Updated: January 2024*
