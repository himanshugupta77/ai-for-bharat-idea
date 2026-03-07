/**
 * Load Test: DynamoDB Throughput
 * Tests DynamoDB throughput limits and auto-scaling
 * Validates: Requirement 24.6
 * 
 * Run with: k6 run dynamodb-throughput-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const readLatency = new Trend('dynamodb_read_latency');
const writeLatency = new Trend('dynamodb_write_latency');
const throttledRequests = new Counter('throttled_requests');
const throttleRate = new Rate('throttle_rate');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Test read throughput
    read_throughput: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 50 },   // Ramp to 50 reads/s
        { duration: '2m', target: 100 },  // Ramp to 100 reads/s
        { duration: '2m', target: 200 },  // Ramp to 200 reads/s
        { duration: '1m', target: 0 },    // Ramp down
      ],
      exec: 'testRead',
    },
    
    // Scenario 2: Test write throughput
    write_throughput: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 50 },   // Ramp to 50 writes/s
        { duration: '2m', target: 100 },  // Ramp to 100 writes/s
        { duration: '2m', target: 200 },  // Ramp to 200 writes/s
        { duration: '1m', target: 0 },    // Ramp down
      ],
      exec: 'testWrite',
      startTime: '7m', // Start after read test
    },
  },
  thresholds: {
    'dynamodb_read_latency': ['p(95)<100'],  // Read latency < 100ms
    'dynamodb_write_latency': ['p(95)<100'], // Write latency < 100ms
    'throttle_rate': ['rate<0.01'],          // Throttle rate < 1%
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.bharatsahayak.in';

// Test DynamoDB read throughput via schemes endpoint
export function testRead() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/schemes`, params);
  const duration = Date.now() - startTime;
  
  readLatency.add(duration);
  
  const success = check(response, {
    'read status is 200': (r) => r.status === 200,
    'read has schemes': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.schemes && body.schemes.length > 0;
      } catch (e) {
        return false;
      }
    },
    'read latency < 100ms': (r) => r.timings.duration < 100,
  });
  
  // Check for throttling (429 status)
  if (response.status === 429) {
    throttledRequests.add(1);
    throttleRate.add(1);
  } else {
    throttleRate.add(0);
  }
  
  sleep(0.1);
}

// Test DynamoDB write throughput via chat endpoint
export function testWrite() {
  const sessionId = `write-test-${__VU}-${__ITER}`;
  
  const payload = JSON.stringify({
    message: 'Test write throughput',
    language: 'en',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
    },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/chat`, payload, params);
  const duration = Date.now() - startTime;
  
  writeLatency.add(duration);
  
  const success = check(response, {
    'write status is 200': (r) => r.status === 200,
    'write has response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.response && body.sessionId;
      } catch (e) {
        return false;
      }
    },
  });
  
  // Check for throttling
  if (response.status === 429) {
    throttledRequests.add(1);
    throttleRate.add(1);
  } else {
    throttleRate.add(0);
  }
  
  sleep(0.1);
}

export function handleSummary(data) {
  const summary = {
    reads: {
      count: data.metrics.http_reqs ? data.metrics.http_reqs.values.count / 2 : 0,
      latencyP95: data.metrics.dynamodb_read_latency ? data.metrics.dynamodb_read_latency.values['p(95)'] : 0,
      latencyAvg: data.metrics.dynamodb_read_latency ? data.metrics.dynamodb_read_latency.values.avg : 0,
    },
    writes: {
      count: data.metrics.http_reqs ? data.metrics.http_reqs.values.count / 2 : 0,
      latencyP95: data.metrics.dynamodb_write_latency ? data.metrics.dynamodb_write_latency.values['p(95)'] : 0,
      latencyAvg: data.metrics.dynamodb_write_latency ? data.metrics.dynamodb_write_latency.values.avg : 0,
    },
    throttling: {
      count: data.metrics.throttled_requests ? data.metrics.throttled_requests.values.count : 0,
      rate: data.metrics.throttle_rate ? (data.metrics.throttle_rate.values.rate * 100).toFixed(2) : 0,
    },
  };
  
  return {
    'load-test-results/dynamodb-throughput-summary.json': JSON.stringify(summary, null, 2),
    stdout: `
DynamoDB Throughput Test Summary
=================================

Reads:
  Total: ${summary.reads.count}
  Avg Latency: ${summary.reads.latencyAvg.toFixed(2)}ms
  P95 Latency: ${summary.reads.latencyP95.toFixed(2)}ms

Writes:
  Total: ${summary.writes.count}
  Avg Latency: ${summary.writes.latencyAvg.toFixed(2)}ms
  P95 Latency: ${summary.writes.latencyP95.toFixed(2)}ms

Throttling:
  Count: ${summary.throttling.count}
  Rate: ${summary.throttling.rate}%

Status: ${summary.throttling.rate > 1 ? '⚠️  High throttling detected - consider increasing capacity' : '✓ Throughput is acceptable'}
`,
  };
}
