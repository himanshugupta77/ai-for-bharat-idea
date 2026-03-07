# Chat Lambda Function Enhancements

## Overview
Enhanced the Chat Lambda function to meet all requirements specified in task 2.1.

## Enhancements Made

### 1. Rate Limiting (Requirement 9.2, 22.2)
- **Implementation**: Added `rate_limit` decorator
- **Configuration**: 10 requests per 60 seconds per IP address
- **Storage**: Uses DynamoDB to track request counts per IP
- **Response**: Returns 429 status with retry-after header when limit exceeded
- **Security**: Logs rate limit violations to CloudWatch for monitoring

### 2. Enhanced Prompt Engineering (Requirements 4.1, 4.2, 4.3, 6.3)
- **Scheme Database Context**: Retrieves up to 15 relevant schemes from DynamoDB
- **Contextual Information**: Includes scheme name, category, description, and target audience
- **Structured Output**: Instructs LLM to format scheme recommendations with [SCHEME:id] tags
- **Conversation History**: Maintains last 10 messages for context
- **System Prompt**: Enhanced with clear role definition and formatting instructions

### 3. Improved Scheme Extraction (Requirements 4.1, 4.2, 4.3)
- **Pattern Matching**: Extracts schemes using regex pattern `[SCHEME:scheme-id]`
- **Fallback Logic**: Falls back to name matching if pattern not found
- **Database Lookup**: Retrieves full scheme details from DynamoDB
- **Scheme Cards**: Returns structured SchemeCard objects with:
  - Scheme ID
  - Name
  - Description
  - Eligibility summary
  - Application steps
- **Limit**: Returns up to 5 schemes per response

### 4. Enhanced Error Handling (Requirements 21.1, 21.2, 21.3)
- **Bedrock Errors**: Retry with exponential backoff (3 attempts)
- **Translation Errors**: Graceful fallback to original text
- **Database Errors**: Logged with full stack traces
- **Fallback Response**: User-friendly message with alternative resource link
- **Exception Handling**: Comprehensive try-catch blocks throughout

### 5. CloudWatch Logging (Requirements 9.8, 17.1, 17.2, 17.3)
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Token Usage Tracking**: Logs Bedrock input/output tokens for cost monitoring
- **Translation Metrics**: Logs character counts for translations
- **Session Events**: Logs session creation and updates
- **Error Logging**: Full stack traces with exc_info=True
- **Security Events**: Dedicated logging for rate limit violations

### 6. Session Management (Requirements 6.1, 6.2, 15.1, 15.2, 15.3, 15.4, 15.5)
- **Session Creation**: Automatic session ID generation if not provided
- **Context Retrieval**: Fetches last 10 messages for conversation context
- **Message Storage**: Stores both user and assistant messages with metadata
- **TTL**: Automatic 24-hour expiration for all session data
- **Metadata Tracking**: Tracks message count, language, timestamps

### 7. Language Support (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
- **Auto-Detection**: Uses langdetect library for language identification
- **Translation**: Amazon Translate for bidirectional translation
- **Supported Languages**: All 11 languages (en, hi, mr, ta, te, bn, gu, kn, ml, pa, or)
- **Fallback**: Defaults to English if detection fails

## Code Quality Improvements

### Error Handling
- All functions have comprehensive try-catch blocks
- Errors logged with full context and stack traces
- Graceful degradation when services fail
- User-friendly error messages

### Logging
- Consistent logging throughout
- Structured log entries for parsing
- Performance metrics captured
- Security events tracked

### Code Organization
- Clear function separation
- Comprehensive docstrings
- Type hints for parameters
- Consistent naming conventions

## Testing

### Unit Tests Created
- `test_handler.py` with 10 test cases covering:
  - Language detection (English and Hindi)
  - Prompt building (with/without schemes and context)
  - Scheme extraction (with/without patterns)
  - Session context retrieval (success and error cases)
  - Scheme retrieval (success case)

### Test Coverage
- Language detection: 2 tests
- Prompt engineering: 3 tests
- Scheme extraction: 2 tests
- Database operations: 3 tests

## Dependencies
All required dependencies are already in `requirements.txt`:
- boto3==1.34.34 (AWS SDK)
- pydantic==2.5.3 (Request validation)
- langdetect==1.0.9 (Language detection)
- bleach==6.1.0 (Input sanitization)

## Configuration

### Environment Variables Required
- `DYNAMODB_TABLE`: DynamoDB table name
- `BEDROCK_MODEL_ID`: Claude model ID (default: anthropic.claude-3-sonnet-20240229-v1:0)
- `LOG_LEVEL`: Logging level (default: INFO)

### Lambda Configuration
- Memory: 1024 MB (as per design)
- Timeout: 30 seconds (as per design)
- Runtime: Python 3.12

## Deployment Notes

1. **DynamoDB Table**: Must have CategoryIndex GSI for scheme queries
2. **IAM Permissions**: Lambda needs:
   - DynamoDB: GetItem, PutItem, Query, Scan, UpdateItem
   - Bedrock: InvokeModel
   - Translate: TranslateText
   - CloudWatch: PutLogEvents
3. **Rate Limiting**: Uses DynamoDB for state, no additional infrastructure needed

## Performance Considerations

1. **Caching**: AWS SDK clients cached with @lru_cache
2. **Query Limits**: Session context limited to 10 messages
3. **Scheme Context**: Limited to 15 schemes for prompt
4. **Retry Logic**: Exponential backoff with jitter
5. **TTL**: Automatic cleanup of old data

## Security Features

1. **Input Sanitization**: Pydantic validation + bleach cleaning
2. **Rate Limiting**: Per-IP request throttling
3. **Security Logging**: Rate limit violations tracked
4. **Error Masking**: Internal errors not exposed to users
5. **HTTPS Only**: Enforced by API Gateway

## Compliance

- **Requirements 1.1-1.5**: Multilingual NLU ✓
- **Requirements 4.1-4.4**: Intelligent scheme matching ✓
- **Requirements 6.1-6.4**: Conversational assistance ✓
- **Requirements 9.2, 9.5, 9.8**: AWS serverless architecture ✓
- **Requirement 22.2**: Rate limiting ✓

## Next Steps

1. Deploy Lambda function with SAM template
2. Configure API Gateway integration
3. Set up CloudWatch alarms for errors and latency
4. Load scheme data into DynamoDB
5. Run integration tests with real AWS services
6. Monitor token usage and costs
