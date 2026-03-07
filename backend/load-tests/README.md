# Load Testing

## Overview

Comprehensive load tests for the Bharat Sahayak AI Assistant platform using k6. These tests validate system performance under high load, Lambda cold start behavior, DynamoDB throughput, and auto-scaling capabilities.

**Requirement Validated:** 24.6

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```bash
choco install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

## Test Suites

### 1. Chat API Load Test (`chat-load-test.js`)

Tests API Gateway under high load (1000 req/s).

**Test Stages:**
- Ramp up to 100 users (2 min)
- Ramp up to 500 users (5 min)
- Ramp up to 1000 users (5 min)
- Stay at 1000 users (5 min)
- Ramp down to 0 users (2 min)

**Metrics:**
- Request rate (req/s)
- Response time (min, avg, med, p90, p95, p99, max)
- Error rate
- Success rate

**Thresholds:**
- 95% of requests < 5 seconds
- Error rate < 5%

**Run:**
```bash
k6 run chat-load-test.js --env API_URL=https://api.bharatsahayak.in
```

### 2. Lambda Cold Start Test (`lambda-cold-start-test.js`)

Tests Lambda cold start performance and provisioned concurrency.

**Scenarios:**
1. Cold Start Burst: Burst to 50 req/s to trigger cold starts
2. Warm Start Sustained: 10 req/s sustained to test warm starts

**Metrics:**
- Cold start count
- Warm start count
- Cold start duration (P95)
- Warm start duration (P95)

**Thresholds:**
- Cold starts < 3 seconds (P95)
- Warm starts < 500ms (P95)

**Run:**
```bash
k6 run lambda-cold-start-test.js --env API_URL=https://api.bharatsahayak.in
```

### 3. DynamoDB Throughput Test (`dynamodb-throughput-test.js`)

Tests DynamoDB throughput limits and auto-scaling.

**Scenarios:**
1. Read Throughput: Ramp from 10 to 200 reads/s
2. Write Throughput: Ramp from 10 to 200 writes/s

**Metrics:**
- Read latency (avg, P95)
- Write latency (avg, P95)
- Throttled requests count
- Throttle rate

**Thresholds:**
- Read latency < 100ms (P95)
- Write latency < 100ms (P95)
- Throttle rate < 1%

**Run:**
```bash
k6 run dynamodb-throughput-test.js --env API_URL=https://api.bharatsahayak.in
```

### 4. Auto-Scaling Test (`auto-scaling-test.js`)

Tests auto-scaling behavior under variable load patterns.

**Test Stages (simulates daily traffic):**
- Morning: 50 users (5 min)
- Midday Spike: 500 users (6 min)
- Afternoon: 200 users (4 min)
- Evening Spike: 1000 users (6 min)
- Night: 50 users (3 min)

**Endpoints Tested:**
- POST /chat (60% of traffic)
- GET /schemes (20% of traffic)
- POST /eligibility-check (15% of traffic)
- POST /text-to-speech (5% of traffic)

**Metrics:**
- Total requests
- Success rate
- Error count
- Response time (avg, P95, P99)

**Thresholds:**
- Response time < 5 seconds (P95)
- Success rate > 95%
- Error rate < 5%

**Run:**
```bash
k6 run auto-scaling-test.js --env API_URL=https://api.bharatsahayak.in
```

## Running Tests

### Basic Usage

```bash
# Run single test
k6 run chat-load-test.js

# Run with custom API URL
k6 run chat-load-test.js --env API_URL=https://api.bharatsahayak.in

# Run with custom duration
k6 run chat-load-test.js --duration 10m

# Run with custom VUs
k6 run chat-load-test.js --vus 100
```

### Run All Tests

```bash
# Run all tests sequentially
./run-all-load-tests.sh

# Or manually:
k6 run chat-load-test.js --env API_URL=https://api.bharatsahayak.in
k6 run lambda-cold-start-test.js --env API_URL=https://api.bharatsahayak.in
k6 run dynamodb-throughput-test.js --env API_URL=https://api.bharatsahayak.in
k6 run auto-scaling-test.js --env API_URL=https://api.bharatsahayak.in
```

### Run with Docker

```bash
docker run --rm -i grafana/k6 run - <chat-load-test.js
```

### Output Options

```bash
# JSON output
k6 run chat-load-test.js --out json=results.json

# CSV output
k6 run chat-load-test.js --out csv=results.csv

# InfluxDB output (for Grafana dashboards)
k6 run chat-load-test.js --out influxdb=http://localhost:8086/k6

# Cloud output (k6 Cloud)
k6 run chat-load-test.js --out cloud
```

## Test Results

Results are saved to `load-test-results/` directory:

- `chat-load-test-summary.json` - Chat API test results
- `lambda-cold-start-summary.json` - Cold start test results
- `dynamodb-throughput-summary.json` - DynamoDB test results
- `auto-scaling-summary.json` - Auto-scaling test results

## Interpreting Results

### Response Time
- **Good:** P95 < 2 seconds
- **Acceptable:** P95 < 5 seconds
- **Poor:** P95 > 5 seconds

### Error Rate
- **Good:** < 1%
- **Acceptable:** < 5%
- **Poor:** > 5%

### Cold Start
- **Good:** P95 < 1 second
- **Acceptable:** P95 < 3 seconds
- **Poor:** P95 > 3 seconds

### Throttling
- **Good:** < 0.1%
- **Acceptable:** < 1%
- **Poor:** > 1%

## Monitoring During Tests

### CloudWatch Metrics

Monitor these metrics during load tests:

**API Gateway:**
- Count (requests per minute)
- Latency (average, P95, P99)
- 4XXError, 5XXError
- IntegrationLatency

**Lambda:**
- Invocations
- Duration (average, P95, P99)
- Errors
- Throttles
- ConcurrentExecutions
- ProvisionedConcurrencyUtilization

**DynamoDB:**
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- UserErrors (throttling)
- SystemErrors
- SuccessfulRequestLatency

### CloudWatch Alarms

Ensure these alarms are configured:
- API Gateway 5xx errors > 10 in 5 minutes
- Lambda errors > 5 in 5 minutes
- Lambda duration > 25 seconds
- DynamoDB throttling > 10 in 5 minutes

## Best Practices

1. **Run tests in non-production environment first**
2. **Gradually increase load** - don't start at max capacity
3. **Monitor CloudWatch** during tests
4. **Check costs** - load tests can incur AWS charges
5. **Test during off-peak hours** if testing production
6. **Document baseline metrics** before optimization
7. **Run tests multiple times** for consistency
8. **Analyze bottlenecks** using CloudWatch Insights

## Troubleshooting

### High Error Rate

**Possible causes:**
- API Gateway throttling (check throttle limits)
- Lambda timeout (increase timeout or optimize code)
- DynamoDB throttling (increase capacity or enable auto-scaling)
- Bedrock rate limits (request quota increase)

**Solutions:**
- Increase API Gateway throttle limits
- Enable Lambda provisioned concurrency
- Enable DynamoDB auto-scaling
- Implement exponential backoff in client

### High Response Time

**Possible causes:**
- Lambda cold starts (check cold start metrics)
- DynamoDB latency (check query patterns)
- Bedrock API latency (check token usage)
- Network latency (check CloudFront)

**Solutions:**
- Enable Lambda provisioned concurrency
- Optimize DynamoDB queries (use indexes)
- Implement caching (Lambda memory, CloudFront)
- Use CloudFront edge locations

### Throttling

**Possible causes:**
- DynamoDB capacity exceeded
- API Gateway rate limits
- Lambda concurrency limits
- Bedrock rate limits

**Solutions:**
- Enable DynamoDB on-demand mode
- Increase API Gateway throttle limits
- Request Lambda concurrency increase
- Request Bedrock quota increase

## CI/CD Integration

### GitHub Actions

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * 0' # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load tests
        run: |
          k6 run backend/load-tests/chat-load-test.js --env API_URL=${{ secrets.API_URL }}
          k6 run backend/load-tests/lambda-cold-start-test.js --env API_URL=${{ secrets.API_URL }}
          k6 run backend/load-tests/dynamodb-throughput-test.js --env API_URL=${{ secrets.API_URL }}
          k6 run backend/load-tests/auto-scaling-test.js --env API_URL=${{ secrets.API_URL }}
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: load-test-results/
```

## Performance Targets

Based on requirements, the system should achieve:

- **API Gateway:** Handle 1000 req/s with < 5% error rate
- **Lambda Cold Start:** < 3 seconds (P95)
- **Lambda Warm Start:** < 500ms (P95)
- **DynamoDB Read:** < 100ms (P95)
- **DynamoDB Write:** < 100ms (P95)
- **Chat Response:** < 5 seconds (P95)
- **Voice Transcription:** < 3 seconds (P95)
- **Eligibility Check:** < 1 second (P95)
- **Auto-Scaling:** Maintain performance during 10x traffic spikes

## Cost Estimation

Load testing costs (approximate):

- **API Gateway:** $3.50 per million requests
- **Lambda:** $0.20 per million requests (128MB, 1s avg)
- **DynamoDB:** $0.25 per million read requests, $1.25 per million write requests
- **Bedrock:** $0.003 per 1K input tokens, $0.015 per 1K output tokens
- **CloudWatch:** $0.30 per GB ingested

**Estimated cost for full test suite:** $50-100 per run

## Next Steps

After load testing:

1. Analyze results and identify bottlenecks
2. Optimize code and infrastructure
3. Re-run tests to validate improvements
4. Document baseline metrics
5. Set up continuous load testing in CI/CD
6. Configure CloudWatch alarms based on test results
7. Create runbooks for handling high load scenarios

## Support

For issues or questions:
- Check CloudWatch Logs for errors
- Review AWS X-Ray traces for bottlenecks
- Contact DevOps team for infrastructure issues
- Refer to AWS documentation for service limits
