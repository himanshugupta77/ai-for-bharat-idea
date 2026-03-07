/**
 * Load Test: Auto-Scaling Validation
 * Tests auto-scaling behavior under variable load
 * Validates: Requirement 24.6
 * 
 * Run with: k6 run auto-scaling-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('response_time');
const successRate = new Rate('success_rate');
const errorCount = new Counter('error_count');

// Test configuration - simulates variable traffic patterns
export const options = {
  stages: [
    // Morning traffic (low)
    { duration: '2m', target: 50 },
    { duration: '3m', target: 50 },
    
    // Midday spike (high)
    { duration: '1m', target: 500 },
    { duration: '5m', target: 500 },
    
    // Afternoon dip (medium)
    { duration: '1m', target: 200 },
    { duration: '3m', target: 200 },
    
    // Evening spike (very high)
    { duration: '1m', target: 1000 },
    { duration: '5m', target: 1000 },
    
    // Night traffic (low)
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    
    // Ramp down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'],
    'success_rate': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.bharatsahayak.in';

const endpoints = [
  { method: 'POST', path: '/chat', weight: 60 },
  { method: 'GET', path: '/schemes', weight: 20 },
  { method: 'POST', path: '/eligibility-check', weight: 15 },
  { method: 'POST', path: '/text-to-speech', weight: 5 },
];

export default function () {
  // Select endpoint based on weight
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedEndpoint;
  
  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (rand < cumulative) {
      selectedEndpoint = endpoint;
      break;
    }
  }
  
  let response;
  const sessionId = `auto-scale-${__VU}`;
  
  if (selectedEndpoint.method === 'POST') {
    const payload = getPayload(selectedEndpoint.path);
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId,
      },
    };
    
    response = http.post(`${BASE_URL}${selectedEndpoint.path}`, JSON.stringify(payload), params);
  } else {
    response = http.get(`${BASE_URL}${selectedEndpoint.path}`);
  }
  
  // Record metrics
  responseTime.add(response.timings.duration);
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has response body': (r) => r.body.length > 0,
  });
  
  successRate.add(success);
  
  if (!success) {
    errorCount.add(1);
    console.error(`Error: ${selectedEndpoint.path} - ${response.status}`);
  }
  
  sleep(Math.random() * 2 + 1); // 1-3 seconds think time
}

function getPayload(path) {
  switch (path) {
    case '/chat':
      return {
        message: 'Test message for auto-scaling',
        language: 'en',
      };
    case '/eligibility-check':
      return {
        schemeId: 'pm-kisan',
        userInfo: {
          age: 45,
          gender: 'male',
          income: 250000,
          state: 'Maharashtra',
          category: 'general',
          occupation: 'farmer',
          ownsLand: true,
          landSize: 1.5,
        },
      };
    case '/text-to-speech':
      return {
        text: 'Test text for speech synthesis',
        language: 'en',
        lowBandwidth: false,
      };
    default:
      return {};
  }
}

export function handleSummary(data) {
  const stages = [
    { name: 'Morning (50 users)', start: 0, end: 300 },
    { name: 'Midday Spike (500 users)', start: 300, end: 660 },
    { name: 'Afternoon (200 users)', start: 660, end: 900 },
    { name: 'Evening Spike (1000 users)', start: 900, end: 1260 },
    { name: 'Night (50 users)', start: 1260, end: 1440 },
  ];
  
  const summary = {
    totalRequests: data.metrics.http_reqs.values.count,
    successRate: (data.metrics.success_rate.values.rate * 100).toFixed(2),
    errorCount: data.metrics.error_count ? data.metrics.error_count.values.count : 0,
    responseTime: {
      avg: data.metrics.http_req_duration.values.avg.toFixed(2),
      p95: data.metrics.http_req_duration.values['p(95)'].toFixed(2),
      p99: data.metrics.http_req_duration.values['p(99)'].toFixed(2),
    },
  };
  
  return {
    'load-test-results/auto-scaling-summary.json': JSON.stringify(summary, null, 2),
    stdout: `
Auto-Scaling Test Summary
=========================

Total Requests: ${summary.totalRequests}
Success Rate: ${summary.successRate}%
Error Count: ${summary.errorCount}

Response Time:
  Average: ${summary.responseTime.avg}ms
  P95: ${summary.responseTime.p95}ms
  P99: ${summary.responseTime.p99}ms

Test Stages:
  Morning (50 users): 0-5 min
  Midday Spike (500 users): 5-11 min
  Afternoon (200 users): 11-15 min
  Evening Spike (1000 users): 15-21 min
  Night (50 users): 21-24 min

Status: ${summary.successRate > 95 ? '✓ Auto-scaling handled variable load successfully' : '⚠️  Auto-scaling may need tuning'}
`,
  };
}
