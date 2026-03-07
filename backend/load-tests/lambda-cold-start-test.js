/**
 * Load Test: Lambda Cold Start Performance
 * Tests Lambda cold start performance and provisioned concurrency
 * Validates: Requirement 24.6
 * 
 * Run with: k6 run lambda-cold-start-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics
const coldStartDuration = new Trend('cold_start_duration');
const warmStartDuration = new Trend('warm_start_duration');
const coldStarts = new Counter('cold_starts');
const warmStarts = new Counter('warm_starts');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Test cold starts with burst traffic
    cold_start_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '10s', target: 50 },  // Burst to 50 req/s
        { duration: '20s', target: 0 },   // Cool down
      ],
      exec: 'testColdStart',
    },
    
    // Scenario 2: Test warm starts with sustained traffic
    warm_start_sustained: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 20,
      maxVUs: 50,
      exec: 'testWarmStart',
      startTime: '40s', // Start after cold start test
    },
  },
  thresholds: {
    'cold_start_duration': ['p(95)<3000'], // Cold starts should be < 3s
    'warm_start_duration': ['p(95)<500'],  // Warm starts should be < 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.bharatsahayak.in';

// Test cold start by calling with unique session IDs
export function testColdStart() {
  const sessionId = `cold-start-${Date.now()}-${Math.random()}`;
  
  const payload = JSON.stringify({
    message: 'Test cold start',
    language: 'en',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
      'X-Test-Type': 'cold-start',
    },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/chat`, payload, params);
  const duration = Date.now() - startTime;
  
  // Assume cold start if duration > 1s
  if (duration > 1000) {
    coldStartDuration.add(duration);
    coldStarts.add(1);
  } else {
    warmStartDuration.add(duration);
    warmStarts.add(1);
  }
  
  check(response, {
    'cold start status is 200': (r) => r.status === 200,
    'cold start response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  sleep(1);
}

// Test warm start by reusing session IDs
export function testWarmStart() {
  // Reuse session ID to hit warm Lambda
  const sessionId = `warm-start-${__VU}`;
  
  const payload = JSON.stringify({
    message: 'Test warm start',
    language: 'en',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
      'X-Test-Type': 'warm-start',
    },
  };
  
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/chat`, payload, params);
  const duration = Date.now() - startTime;
  
  warmStartDuration.add(duration);
  warmStarts.add(1);
  
  check(response, {
    'warm start status is 200': (r) => r.status === 200,
    'warm start response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(0.5);
}

export function handleSummary(data) {
  const summary = {
    coldStarts: data.metrics.cold_starts ? data.metrics.cold_starts.values.count : 0,
    warmStarts: data.metrics.warm_starts ? data.metrics.warm_starts.values.count : 0,
    coldStartP95: data.metrics.cold_start_duration ? data.metrics.cold_start_duration.values['p(95)'] : 0,
    warmStartP95: data.metrics.warm_start_duration ? data.metrics.warm_start_duration.values['p(95)'] : 0,
  };
  
  return {
    'load-test-results/lambda-cold-start-summary.json': JSON.stringify(summary, null, 2),
    stdout: `
Lambda Cold Start Test Summary
==============================

Cold Starts: ${summary.coldStarts}
Warm Starts: ${summary.warmStarts}
Cold Start P95: ${summary.coldStartP95.toFixed(2)}ms
Warm Start P95: ${summary.warmStartP95.toFixed(2)}ms

Recommendation: ${summary.coldStartP95 > 3000 ? 'Consider increasing provisioned concurrency' : 'Cold start performance is acceptable'}
`,
  };
}
