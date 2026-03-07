# Monitoring Tests Summary

## Overview

This document summarizes the monitoring and logging tests implemented for the Bharat Sahayak AI Assistant backend. These tests validate that the structured logging, performance metrics, and token usage tracking are working correctly as specified in Requirements 18.1 and 18.2.

## Test File

**Location**: `backend/src/shared/test_monitoring.py`

## Test Coverage

### 1. JSON Log Format Tests (`TestJSONFormatter`)

Tests that validate the structured JSON logging format:

- **test_basic_log_format**: Verifies logs are valid JSON with required fields (timestamp, level, message, logger, function, line)
- **test_log_with_correlation_id**: Ensures correlation IDs are included in log output for request tracing
- **test_log_with_request_id**: Validates request IDs are logged for API Gateway integration
- **test_log_with_session_id**: Confirms session IDs are included for user session tracking
- **test_log_with_performance_metrics**: Tests that duration metrics are logged correctly
- **test_log_with_token_usage**: Validates token usage metrics (input/output tokens) are logged
- **test_log_with_exception**: Ensures exceptions are formatted with stack traces
- **test_log_with_extra_data**: Tests that custom structured data can be added to logs
- **test_log_excludes_pii**: **Critical security test** - Verifies that PII (email, phone, name, address, aadhaar) is NOT logged

**Validates**: Requirement 18.1 (structured logging with JSON format)

### 2. Contextual Logging Tests (`TestLogWithContext`)

Tests for the `log_with_context` utility function:

- **test_log_with_correlation_id**: Validates correlation ID is passed to logger
- **test_log_with_request_id**: Tests request ID logging
- **test_log_with_session_id**: Tests session ID logging
- **test_log_with_duration**: Validates duration metrics are logged
- **test_log_with_extra_data**: Tests custom structured data logging

**Validates**: Requirement 18.1 (structured logging with context)

### 3. Performance Metrics Tests (`TestPerformanceMetrics`)

Tests for performance metric logging:

- **test_log_performance_metric**: Validates performance metrics are logged with operation name, duration, and correlation ID
- **test_log_performance_metric_with_metadata**: Tests that additional metadata can be included with performance metrics

**Validates**: Requirement 18.2 (performance metrics logging - latency)

### 4. Token Usage Metrics Tests (`TestTokenUsageMetrics`)

Tests for LLM token usage tracking:

- **test_log_token_usage**: Validates token usage is logged with input/output/total tokens, operation, and model ID
- **test_log_token_usage_without_model_id**: Tests token logging when model ID is not provided

**Validates**: Requirement 18.2 (token usage and cost tracking)

### 5. API Call Metrics Tests (`TestAPICallMetrics`)

Tests for AWS service API call logging:

- **test_log_successful_api_call**: Validates successful API calls are logged with service, operation, duration, and success status
- **test_log_failed_api_call**: Tests that failed API calls are logged with error information

**Validates**: Requirement 18.1 (API request logging)

### 6. Correlation ID Tests (`TestCorrelationID`)

Tests for correlation ID generation:

- **test_get_correlation_id_format**: Validates correlation IDs are valid UUIDs
- **test_get_correlation_id_uniqueness**: Ensures each correlation ID is unique

**Validates**: Requirement 18.1 (correlation IDs for request tracing)

### 7. Exception Handler Decorator Tests (`TestHandleExceptionsDecorator`)

Tests for the `@handle_exceptions` decorator:

- **test_decorator_adds_correlation_id**: Validates decorator adds correlation ID to events
- **test_decorator_logs_request_start**: Tests that request start is logged with HTTP method and path
- **test_decorator_logs_request_completion**: Validates request completion is logged with duration
- **test_decorator_logs_errors**: Tests that errors are logged with stack traces

**Validates**: Requirements 18.1, 18.2 (comprehensive request/response logging)

### 8. Metric Emission Tests (`TestMetricEmission`)

Tests that validate metrics are emitted in the correct format for CloudWatch:

- **test_performance_metric_emission**: Validates performance metrics have correct structure (metricType, operation, durationMs)
- **test_token_usage_metric_emission**: Tests token usage metrics structure (metricType, inputTokens, outputTokens, totalTokens)
- **test_api_call_metric_emission**: Validates API call metrics structure (metricType, service, operation, success)

**Validates**: Requirement 18.2 (metric emission for CloudWatch monitoring)

## Test Results

All 29 tests pass successfully:

```
================================ test session starts ================================
collected 29 items

backend/src/shared/test_monitoring.py::TestJSONFormatter::test_basic_log_format PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_correlation_id PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_request_id PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_session_id PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_performance_metrics PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_token_usage PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_exception PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_with_extra_data PASSED
backend/src/shared/test_monitoring.py::TestJSONFormatter::test_log_excludes_pii PASSED
backend/src/shared/test_monitoring.py::TestLogWithContext::test_log_with_correlation_id PASSED
backend/src/shared/test_monitoring.py::TestLogWithContext::test_log_with_request_id PASSED
backend/src/shared/test_monitoring.py::TestLogWithContext::test_log_with_session_id PASSED
backend/src/shared/test_monitoring.py::TestLogWithContext::test_log_with_duration PASSED
backend/src/shared/test_monitoring.py::TestLogWithContext::test_log_with_extra_data PASSED
backend/src/shared/test_monitoring.py::TestPerformanceMetrics::test_log_performance_metric PASSED
backend/src/shared/test_monitoring.py::TestPerformanceMetrics::test_log_performance_metric_with_metadata PASSED
backend/src/shared/test_monitoring.py::TestTokenUsageMetrics::test_log_token_usage PASSED
backend/src/shared/test_monitoring.py::TestTokenUsageMetrics::test_log_token_usage_without_model_id PASSED
backend/src/shared/test_monitoring.py::TestAPICallMetrics::test_log_successful_api_call PASSED
backend/src/shared/test_monitoring.py::TestAPICallMetrics::test_log_failed_api_call PASSED
backend/src/shared/test_monitoring.py::TestCorrelationID::test_get_correlation_id_format PASSED
backend/src/shared/test_monitoring.py::TestCorrelationID::test_get_correlation_id_uniqueness PASSED
backend/src/shared/test_monitoring.py::TestHandleExceptionsDecorator::test_decorator_adds_correlation_id PASSED
backend/src/shared/test_monitoring.py::TestHandleExceptionsDecorator::test_decorator_logs_request_start PASSED
backend/src/shared/test_monitoring.py::TestHandleExceptionsDecorator::test_decorator_logs_request_completion PASSED
backend/src/shared/test_monitoring.py::TestHandleExceptionsDecorator::test_decorator_logs_errors PASSED
backend/src/shared/test_monitoring.py::TestMetricEmission::test_performance_metric_emission PASSED
backend/src/shared/test_monitoring.py::TestMetricEmission::test_token_usage_metric_emission PASSED
backend/src/shared/test_monitoring.py::TestMetricEmission::test_api_call_metric_emission PASSED

============================== 29 passed in 1.04s ===============================================
```

## Key Features Validated

### 1. Log Format (Requirement 18.1)

✅ **JSON Format**: All logs are valid JSON
✅ **Required Fields**: timestamp, level, message, logger, function, line
✅ **Correlation IDs**: Unique IDs for request tracing across services
✅ **Request IDs**: API Gateway request IDs for debugging
✅ **Session IDs**: User session tracking
✅ **Exception Handling**: Stack traces included for errors

### 2. Log Content (Requirement 18.1)

✅ **PII Exclusion**: No personally identifiable information in logs
✅ **Metadata Only**: Only operation names, durations, and status codes logged
✅ **Sanitized Data**: User input is sanitized before any logging

### 3. Performance Metrics (Requirement 18.2)

✅ **Latency Tracking**: Duration in milliseconds for all operations
✅ **Operation Names**: Clear identification of what was measured
✅ **Correlation**: Metrics linked to requests via correlation IDs
✅ **CloudWatch Format**: Structured for CloudWatch Insights queries

### 4. Token Usage Metrics (Requirement 18.2)

✅ **Input Tokens**: Number of tokens sent to LLM
✅ **Output Tokens**: Number of tokens generated by LLM
✅ **Total Tokens**: Sum for cost calculation
✅ **Model ID**: Which model was used
✅ **Cost Tracking**: Data structure supports cost analysis

## Integration with CloudWatch

The structured logging format enables powerful CloudWatch Insights queries:

### Query Examples

**Find slow requests:**
```
fields @timestamp, operation, durationMs
| filter metricType = "performance" and durationMs > 1000
| sort durationMs desc
```

**Track token usage by operation:**
```
fields @timestamp, operation, inputTokens, outputTokens, totalTokens
| filter metricType = "tokenUsage"
| stats sum(totalTokens) by operation
```

**Trace a specific request:**
```
fields @timestamp, message, level
| filter correlationId = "specific-correlation-id"
| sort @timestamp asc
```

**Monitor API call success rates:**
```
fields @timestamp, service, operation, success
| filter metricType = "apiCall"
| stats count() by service, operation, success
```

## Security Considerations

The tests include a critical security validation (`test_log_excludes_pii`) that ensures:

- No email addresses in logs
- No phone numbers in logs
- No names in logs
- No addresses in logs
- No Aadhaar numbers in logs

This protects user privacy and ensures compliance with data protection requirements (Requirement 7.1).

## Running the Tests

To run the monitoring tests:

```bash
# Run all monitoring tests
python -m pytest backend/src/shared/test_monitoring.py -v

# Run specific test class
python -m pytest backend/src/shared/test_monitoring.py::TestJSONFormatter -v

# Run with coverage
python -m pytest backend/src/shared/test_monitoring.py --cov=backend/src/shared/utils --cov-report=html
```

## Maintenance Notes

When adding new logging functionality:

1. Add corresponding tests to validate the new fields/metrics
2. Ensure PII exclusion test is updated if new data types are logged
3. Verify CloudWatch Insights queries still work with new log structure
4. Update this summary document with new test coverage

## Related Files

- **Implementation**: `backend/src/shared/utils.py`
- **Tests**: `backend/src/shared/test_monitoring.py`
- **Usage Examples**: All Lambda handlers use `@handle_exceptions` decorator
- **CloudWatch Dashboards**: `infrastructure/template.yaml` (Task 17.2)
- **CloudWatch Alarms**: `infrastructure/template.yaml` (Task 17.3)
