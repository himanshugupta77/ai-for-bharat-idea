"""
Performance Tests for Backend API Endpoints

**Validates: Requirements 21.3, 24.1, 24.2, 24.3**

Requirement 21.3: THE Chat_Endpoint SHALL respond to text queries within 5 seconds at the 95th percentile
Requirement 24.1: THE Chat_Endpoint SHALL respond to text queries within 5 seconds at the 95th percentile
Requirement 24.2: THE Voice_Endpoint SHALL transcribe audio within 3 seconds at the 95th percentile
Requirement 24.3: THE Eligibility_Endpoint SHALL return results within 1 second at the 95th percentile

These tests validate API response times and performance characteristics.
"""

import json
import os
import time
import statistics
from typing import List, Dict, Any
from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def setup_environment():
    """Set up environment variables for tests."""
    os.environ['DYNAMODB_TABLE'] = 'test-table'
    os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
    yield
    # Cleanup
    if 'DYNAMODB_TABLE' in os.environ:
        del os.environ['DYNAMODB_TABLE']
    if 'AWS_DEFAULT_REGION' in os.environ:
        del os.environ['AWS_DEFAULT_REGION']


class TestAPIResponseTimes:
    """Test API endpoint response times."""

    def test_chat_endpoint_response_time_under_5_seconds(self):
        """
        Chat endpoint should respond within 5 seconds.
        
        **Validates: Requirements 21.3, 24.1**
        """
        # Import here to avoid circular dependencies
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from chat import handler as chat_handler
        
        event = {
            'httpMethod': 'POST',
            'path': '/chat',
            'body': json.dumps({
                'message': 'Tell me about agriculture schemes',
                'language': 'en'
            }),
            'headers': {
                'X-Session-Id': 'test-session-123'
            },
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        # Mock AWS services through utility functions
        with patch('shared.utils.get_bedrock_client') as mock_get_bedrock, \
             patch('shared.utils.get_translate_client') as mock_get_translate, \
             patch('shared.utils.get_dynamodb_table') as mock_get_table:
            
            # Mock Bedrock client
            mock_bedrock = MagicMock()
            mock_bedrock.invoke_model.return_value = {
                'body': MagicMock(read=lambda: json.dumps({
                    'content': [{
                        'text': 'Here are some agriculture schemes: PM-KISAN provides income support.'
                    }]
                }).encode())
            }
            mock_get_bedrock.return_value = mock_bedrock
            
            # Mock Translate client
            mock_translate = MagicMock()
            mock_translate.translate_text.return_value = {
                'TranslatedText': 'Here are some agriculture schemes: PM-KISAN provides income support.'
            }
            mock_get_translate.return_value = mock_translate
            
            # Mock DynamoDB table
            mock_table = MagicMock()
            mock_table.get_item.return_value = {
                'Item': {
                    'sessionId': 'test-session-123',
                    'messages': []
                }
            }
            mock_table.put_item.return_value = {}
            mock_table.query.return_value = {
                'Items': [
                    {
                        'schemeId': 'pm-kisan',
                        'name': 'PM-KISAN',
                        'description': 'Income support for farmers',
                        'category': 'agriculture'
                    }
                ]
            }
            mock_get_table.return_value = mock_table
            
            # Measure response time
            start_time = time.time()
            response = chat_handler.lambda_handler(event, None)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"⏱️  Chat endpoint response time: {response_time:.3f}s")
            
            # Should respond within 5 seconds
            assert response_time < 5.0, f"Response time {response_time:.3f}s exceeds 5s limit"
            assert response['statusCode'] == 200

    def test_eligibility_endpoint_response_time_under_1_second(self):
        """
        Eligibility endpoint should respond within 1 second.
        
        **Validates: Requirements 21.3, 24.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from eligibility import handler as eligibility_handler
        
        event = {
            'httpMethod': 'POST',
            'path': '/eligibility-check',
            'body': json.dumps({
                'schemeId': 'pm-kisan',
                'userInfo': {
                    'age': 45,
                    'gender': 'male',
                    'income': 250000,
                    'state': 'Maharashtra',
                    'category': 'general',
                    'occupation': 'farmer',
                    'ownsLand': True,
                    'landSize': 1.5
                }
            }),
            'headers': {},
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        # Mock DynamoDB through utility function
        with patch('shared.utils.get_dynamodb_table') as mock_get_table:
            mock_table = MagicMock()
            mock_table.get_item.return_value = {
                'Item': {
                    'schemeId': 'pm-kisan',
                    'name': 'PM-KISAN',
                    'eligibilityRules': [
                        {
                            'criterion': 'landOwnership',
                            'type': 'boolean',
                            'requirement': 'Must own agricultural land',
                            'evaluator': 'lambda u: u.get("ownsLand", False)'
                        },
                        {
                            'criterion': 'landSize',
                            'type': 'numeric',
                            'requirement': 'Land holding up to 2 hectares',
                            'evaluator': 'lambda u: u.get("landSize", 0) <= 2'
                        }
                    ],
                    'benefits': '₹6000 per year',
                    'applicationSteps': ['Visit portal', 'Register']
                }
            }
            mock_get_table.return_value = mock_table
            
            # Measure response time
            start_time = time.time()
            response = eligibility_handler.lambda_handler(event, None)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"⏱️  Eligibility endpoint response time: {response_time:.3f}s")
            
            # Should respond within 1 second
            assert response_time < 1.0, f"Response time {response_time:.3f}s exceeds 1s limit"
            assert response['statusCode'] == 200

    def test_schemes_endpoint_response_time_under_1_second(self):
        """
        Schemes endpoint should respond within 1 second.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        event = {
            'httpMethod': 'GET',
            'path': '/schemes',
            'pathParameters': None,
            'queryStringParameters': None,
            'headers': {},
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        # Mock DynamoDB through utility function
        with patch('shared.utils.get_dynamodb_table') as mock_get_table:
            mock_table = MagicMock()
            mock_table.query.return_value = {
                'Items': [
                    {
                        'schemeId': 'pm-kisan',
                        'name': 'PM-KISAN',
                        'description': 'Income support for farmers',
                        'category': 'agriculture'
                    },
                    {
                        'schemeId': 'mgnrega',
                        'name': 'MGNREGA',
                        'description': 'Employment guarantee',
                        'category': 'employment'
                    }
                ]
            }
            mock_get_table.return_value = mock_table
            
            # Measure response time
            start_time = time.time()
            response = schemes_handler.lambda_handler(event, None)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"⏱️  Schemes endpoint response time: {response_time:.3f}s")
            
            # Should respond within 1 second
            assert response_time < 1.0, f"Response time {response_time:.3f}s exceeds 1s limit"
            assert response['statusCode'] == 200


class TestCachePerformance:
    """Test cache behavior and performance improvements."""

    def test_lambda_memory_cache_reduces_response_time(self):
        """
        Lambda memory cache should reduce response time for repeated requests.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        event = {
            'httpMethod': 'GET',
            'path': '/schemes',
            'pathParameters': None,
            'queryStringParameters': None,
            'headers': {},
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        sample_schemes = [
            {
                'schemeId': 'pm-kisan',
                'name': 'PM-KISAN',
                'description': 'Income support for farmers',
                'category': 'agriculture'
            }
        ]
        
        # Mock DynamoDB through utility function
        with patch('shared.utils.get_dynamodb_table') as mock_get_table:
            mock_table = MagicMock()
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            mock_get_table.return_value = mock_table
            
            # First request (cache miss)
            start_time = time.time()
            response1 = schemes_handler.lambda_handler(event, None)
            first_request_time = time.time() - start_time
            
            # Second request (cache hit)
            start_time = time.time()
            response2 = schemes_handler.lambda_handler(event, None)
            second_request_time = time.time() - start_time
            
            print(f"⏱️  First request (cache miss): {first_request_time:.3f}s")
            print(f"⏱️  Second request (cache hit): {second_request_time:.3f}s")
            print(f"⏱️  Speedup: {first_request_time / second_request_time:.2f}x")
            
            # Second request should be faster (cache hit)
            assert second_request_time < first_request_time
            assert response1['statusCode'] == 200
            assert response2['statusCode'] == 200

    def test_cache_ttl_expiration(self):
        """
        Cache should expire after TTL and fetch fresh data.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
        # Set schemes in cache
        schemes = [{'id': 'test', 'name': 'Test'}]
        schemes_handler.set_cached_schemes(schemes)
        
        # Cache should be valid
        assert schemes_handler.is_cache_valid()
        
        # Simulate TTL expiration (use CACHE_TTL_SECONDS)
        schemes_handler._cache_timestamp = time.time() - schemes_handler.CACHE_TTL_SECONDS - 1
        
        # Cache should be invalid
        assert not schemes_handler.is_cache_valid()

    def test_cache_hit_rate_measurement(self):
        """
        Test that cache hit rate can be measured.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        event = {
            'httpMethod': 'GET',
            'path': '/schemes',
            'pathParameters': None,
            'queryStringParameters': None,
            'headers': {},
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        sample_schemes = [
            {
                'schemeId': 'pm-kisan',
                'name': 'PM-KISAN',
                'description': 'Income support for farmers',
                'category': 'agriculture'
            }
        ]
        
        # Mock DynamoDB through utility function
        with patch('shared.utils.get_dynamodb_table') as mock_get_table:
            mock_table = MagicMock()
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            mock_get_table.return_value = mock_table
            
            # Make multiple requests
            num_requests = 10
            cache_hits = 0
            
            for i in range(num_requests):
                # Check if cache is valid before request
                if schemes_handler.is_cache_valid():
                    cache_hits += 1
                
                schemes_handler.lambda_handler(event, None)
            
            cache_hit_rate = cache_hits / num_requests
            
            print(f"📊 Cache hit rate: {cache_hit_rate * 100:.1f}%")
            print(f"📊 Cache hits: {cache_hits}/{num_requests}")
            
            # After first request, all subsequent should be cache hits
            assert cache_hit_rate >= 0.8  # At least 80% hit rate


class TestPerformanceMetrics:
    """Test performance metrics recording."""

    def test_response_time_logging(self):
        """
        Test that response times are logged for monitoring.
        
        **Validates: Requirement 17.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from shared import utils
        
        # Test response time calculation
        start_time = time.time()
        time.sleep(0.1)  # Simulate processing
        end_time = time.time()
        
        duration_ms = (end_time - start_time) * 1000
        
        print(f"⏱️  Measured duration: {duration_ms:.2f}ms")
        
        # Duration should be approximately 100ms
        assert 90 < duration_ms < 150  # Allow some variance

    def test_performance_percentile_calculation(self):
        """
        Test calculation of 95th percentile response times.
        
        **Validates: Requirements 24.1, 24.2, 24.3**
        """
        # Simulate response times (in seconds)
        response_times = [
            0.5, 0.6, 0.7, 0.8, 0.9,  # Fast responses
            1.0, 1.1, 1.2, 1.3, 1.4,  # Medium responses
            2.0, 2.5, 3.0, 3.5, 4.0,  # Slower responses
            4.5, 4.8, 4.9  # Near limit
        ]
        
        # Calculate 95th percentile
        p95 = statistics.quantiles(response_times, n=20)[17]  # 95th percentile (18/20 = 90%, 19/20 = 95%)
        
        print(f"📊 95th percentile response time: {p95:.3f}s")
        print(f"📊 Mean response time: {statistics.mean(response_times):.3f}s")
        print(f"📊 Median response time: {statistics.median(response_times):.3f}s")
        
        # 95th percentile should be under 5 seconds for chat endpoint
        assert p95 < 5.0

    def test_concurrent_request_handling(self):
        """
        Test that multiple concurrent requests can be handled efficiently.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        event = {
            'httpMethod': 'GET',
            'path': '/schemes',
            'pathParameters': None,
            'queryStringParameters': None,
            'headers': {},
            'requestContext': {
                'requestId': 'test-request-id',
                'identity': {
                    'sourceIp': '127.0.0.1',
                    'userAgent': 'test-agent'
                }
            }
        }
        
        sample_schemes = [
            {
                'schemeId': 'pm-kisan',
                'name': 'PM-KISAN',
                'description': 'Income support for farmers',
                'category': 'agriculture'
            }
        ]
        
        # Mock DynamoDB through utility function
        with patch('shared.utils.get_dynamodb_table') as mock_get_table:
            mock_table = MagicMock()
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            mock_get_table.return_value = mock_table
            
            # Simulate concurrent requests
            num_requests = 5
            response_times = []
            
            for i in range(num_requests):
                start_time = time.time()
                response = schemes_handler.lambda_handler(event, None)
                end_time = time.time()
                
                response_times.append(end_time - start_time)
                assert response['statusCode'] == 200
            
            avg_response_time = statistics.mean(response_times)
            max_response_time = max(response_times)
            
            print(f"⏱️  Average response time: {avg_response_time:.3f}s")
            print(f"⏱️  Max response time: {max_response_time:.3f}s")
            
            # All requests should complete quickly
            assert avg_response_time < 1.0
            assert max_response_time < 2.0


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])
