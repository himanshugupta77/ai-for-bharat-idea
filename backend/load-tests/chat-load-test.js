/**
 * Load Test: Chat API Endpoint
 * Tests API Gateway under high load (1000 req/s)
 * Validates: Requirement 24.6
 * 
 * Run with: k6 run chat-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const chatResponseTime = new Trend('chat_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 1000 },  // Ramp up to 1000 users (1000 req/s)
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // 95% of requests should be below 5s
    'http_req_failed': ['rate<0.05'],    // Error rate should be below 5%
    'errors': ['rate<0.05'],
  },
};

// Test data
const messages = [
  'Tell me about farmer schemes',
  'What is PM-KISAN?',
  'I need help with welfare programs',
  'Show me schemes for women',
  'What schemes are available for senior citizens?',
  'Tell me about Ayushman Bharat',
  'I am a farmer looking for government schemes',
  'What are the eligibility criteria for MGNREGA?',
  'Show me education schemes',
  'What benefits can I get as a small business owner?',
];

const languages = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or'];

// Base URL - update with your API Gateway URL
const BASE_URL = __ENV.API_URL || 'https://api.bharatsahayak.in';

export default function () {
  // Generate random session ID
  const sessionId = `load-test-${__VU}-${__ITER}`;
  
  // Select random message and language
  const message = messages[Math.floor(Math.random() * messages.length)];
  const language = languages[Math.floor(Math.random() * languages.length)];
  
  // Prepare request
  const payload = JSON.stringify({
    message: message,
    language: language,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
    },
    timeout: '30s',
  };
  
  // Send request
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/chat`, payload, params);
  const duration = Date.now() - startTime;
  
  // Record metrics
  chatResponseTime.add(duration);
  
  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => r.body.length > 0,
    'response is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'response has required fields': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.response && body.language && body.sessionId;
      } catch (e) {
        return false;
      }
    },
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  // Record errors
  errorRate.add(!success);
  
  // Log errors
  if (!success) {
    console.error(`Request failed: ${response.status} - ${response.body}`);
  }
  
  // Think time (simulate user reading response)
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

export function handleSummary(data) {
  return {
    'load-test-results/chat-load-test-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}Chat API Load Test Summary\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;
  
  // Request metrics
  summary += `${indent}Requests:\n`;
  summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n`;
  summary += `${indent}  Failed: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n\n`;
  
  // Response time metrics
  summary += `${indent}Response Time:\n`;
  summary += `${indent}  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += `${indent}  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Med: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
  summary += `${indent}  P90: ${data.metrics.http_req_duration.values['p(90)'].toFixed(2)}ms\n`;
  summary += `${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;
  
  // Custom metrics
  if (data.metrics.errors) {
    summary += `${indent}Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;
  }
  
  // Thresholds
  summary += `${indent}Thresholds:\n`;
  for (const [name, threshold] of Object.entries(data.thresholds)) {
    const passed = threshold.ok ? '✓' : '✗';
    summary += `${indent}  ${passed} ${name}\n`;
  }
  
  return summary;
}
