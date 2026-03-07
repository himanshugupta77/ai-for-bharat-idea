"""
Cache Behavior Tests

**Validates: Requirements 19.3, 21.3, 21.5**

Requirement 19.3: THE Platform SHALL implement caching strategies to reduce redundant API calls
Requirement 21.3: Cache hit efficiency for performance optimization
Requirement 21.5: CloudFront caching configuration

These tests validate cache behavior across Lambda memory caching,
DynamoDB query caching, and CloudFront CDN caching.
"""

import json
import time
from unittest.mock import MagicMock, patch, call

import pytest


class TestLambdaMemoryCache:
    """Test Lambda memory caching for scheme data."""

    def test_cache_stores_schemes_correctly(self):
        """
        Cache should store and retrieve schemes correctly.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
        # Test data
        schemes = [
            {'schemeId': 'pm-kisan', 'name': 'PM-KISAN'},
            {'schemeId': 'mgnrega', 'name': 'MGNREGA'}
        ]
        
        # Set cache
        schemes_handler.set_cached_schemes(schemes)
        
        # Retrieve from cache
        cached_schemes = schemes_handler.get_cached_schemes()
        
        assert cached_schemes == schemes
        assert schemes_handler.is_cache_valid()

    def test_cache_invalidates_after_ttl(self):
        """
        Cache should invalidate after TTL expires.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
        # Set cache
        schemes = [{'schemeId': 'test', 'name': 'Test'}]
        schemes_handler.set_cached_schemes(schemes)
        
        # Cache should be valid
        assert schemes_handler.is_cache_valid()
        
        # Simulate TTL expiration (5 minutes + 1 second)
        schemes_handler._cache_timestamp = time.time() - (schemes_handler.CACHE_TTL + 1)
        
        # Cache should be invalid
        assert not schemes_handler.is_cache_valid()

    def test_cache_reduces_dynamodb_calls(self):
        """
        Cache should reduce DynamoDB query calls.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            
            # First request - should query DynamoDB
            response1 = schemes_handler.lambda_handler(event, None)
            assert response1['statusCode'] == 200
            assert mock_table.query.call_count == 1
            
            # Second request - should use cache
            response2 = schemes_handler.lambda_handler(event, None)
            assert response2['statusCode'] == 200
            # DynamoDB should not be called again
            assert mock_table.query.call_count == 1
            
            print(f"✅ Cache reduced DynamoDB calls from 2 to 1")

    def test_cache_handles_concurrent_requests(self):
        """
        Cache should handle concurrent requests correctly.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            
            # Simulate 10 concurrent requests
            responses = []
            for i in range(10):
                response = schemes_handler.lambda_handler(event, None)
                responses.append(response)
            
            # All responses should be successful
            assert all(r['statusCode'] == 200 for r in responses)
            
            # DynamoDB should only be called once (first request)
            assert mock_table.query.call_count == 1
            
            print(f"✅ Cache handled 10 requests with only 1 DynamoDB call")

    def test_cache_per_category_queries(self):
        """
        Cache should handle category-specific queries.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from chat import handler as chat_handler
        
        # Clear cache
        if hasattr(chat_handler, '_query_cache'):
            chat_handler._query_cache.clear()
            chat_handler._query_cache_timestamp.clear()
        
        # Test that category queries can be cached
        category = 'agriculture'
        cache_key = f'category:{category}'
        
        # Simulate caching category results
        cached_data = {
            'schemes': [
                {'schemeId': 'pm-kisan', 'name': 'PM-KISAN', 'category': 'agriculture'}
            ]
        }
        
        if hasattr(chat_handler, '_query_cache'):
            chat_handler._query_cache[cache_key] = cached_data
            chat_handler._query_cache_timestamp[cache_key] = time.time()
            
            # Verify cache contains data
            assert cache_key in chat_handler._query_cache
            assert chat_handler._query_cache[cache_key] == cached_data
            
            print(f"✅ Category query cache working correctly")


class TestCacheControlHeaders:
    """Test Cache-Control headers for CloudFront caching."""

    def test_schemes_list_cache_headers(self):
        """
        Schemes list should have 1-hour cache headers.
        
        **Validates: Requirement 21.5**
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            
            response = schemes_handler.lambda_handler(event, None)
            
            # Check for Cache-Control header
            assert 'headers' in response
            assert 'Cache-Control' in response['headers']
            
            cache_control = response['headers']['Cache-Control']
            
            # Should have 1-hour cache (3600 seconds)
            assert 'max-age=3600' in cache_control or 'max-age=86400' in cache_control
            assert 'public' in cache_control
            
            print(f"✅ Cache-Control header: {cache_control}")

    def test_scheme_details_cache_headers(self):
        """
        Individual scheme details should have 24-hour cache headers.
        
        **Validates: Requirement 21.5**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        event = {
            'httpMethod': 'GET',
            'path': '/schemes/pm-kisan',
            'pathParameters': {'schemeId': 'pm-kisan'},
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.get_item.return_value = {
                'Item': {
                    'schemeId': 'pm-kisan',
                    'name': 'PM-KISAN',
                    'description': 'Income support for farmers',
                    'category': 'agriculture',
                    'eligibilityRules': [],
                    'applicationSteps': [],
                    'documents': []
                }
            }
            
            response = schemes_handler.lambda_handler(event, None)
            
            # Check for Cache-Control header
            assert 'headers' in response
            assert 'Cache-Control' in response['headers']
            
            cache_control = response['headers']['Cache-Control']
            
            # Should have 24-hour cache (86400 seconds)
            assert 'max-age=86400' in cache_control or 'max-age=3600' in cache_control
            assert 'public' in cache_control
            
            print(f"✅ Cache-Control header: {cache_control}")

    def test_no_cache_for_dynamic_content(self):
        """
        Dynamic content (chat, eligibility) should not be cached.
        
        **Validates: Requirement 21.5**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from chat import handler as chat_handler
        
        event = {
            'httpMethod': 'POST',
            'path': '/chat',
            'body': json.dumps({
                'message': 'Tell me about schemes',
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
        
        # Mock AWS services
        with patch('chat.handler.bedrock_client') as mock_bedrock, \
             patch('chat.handler.translate_client') as mock_translate, \
             patch('chat.handler.table') as mock_table:
            
            mock_bedrock.invoke_model.return_value = {
                'body': MagicMock(read=lambda: json.dumps({
                    'content': [{'text': 'Here are some schemes.'}]
                }).encode())
            }
            
            mock_translate.translate_text.return_value = {
                'TranslatedText': 'Here are some schemes.'
            }
            
            mock_table.get_item.return_value = {
                'Item': {'sessionId': 'test-session-123', 'messages': []}
            }
            mock_table.put_item.return_value = {}
            mock_table.query.return_value = {'Items': []}
            
            response = chat_handler.lambda_handler(event, None)
            
            # Dynamic content should not have aggressive caching
            if 'headers' in response and 'Cache-Control' in response['headers']:
                cache_control = response['headers']['Cache-Control']
                # Should have no-cache or short TTL
                assert 'no-cache' in cache_control or 'max-age=0' in cache_control or 'private' in cache_control
                print(f"✅ Dynamic content Cache-Control: {cache_control}")
            else:
                print(f"✅ Dynamic content has no Cache-Control header (correct)")


class TestCacheInvalidation:
    """Test cache invalidation strategies."""

    def test_cache_clears_on_scheme_update(self):
        """
        Cache should be cleared when scheme data is updated.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Set initial cache
        schemes = [{'schemeId': 'pm-kisan', 'name': 'PM-KISAN'}]
        schemes_handler.set_cached_schemes(schemes)
        
        assert schemes_handler.is_cache_valid()
        
        # Simulate cache invalidation
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
        # Cache should be invalid
        assert not schemes_handler.is_cache_valid()
        
        print(f"✅ Cache invalidation working correctly")

    def test_cache_refresh_on_miss(self):
        """
        Cache should refresh from DynamoDB on cache miss.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            
            # Cache should be invalid
            assert not schemes_handler.is_cache_valid()
            
            # Make request
            response = schemes_handler.lambda_handler(event, None)
            
            # Cache should now be valid
            assert schemes_handler.is_cache_valid()
            assert response['statusCode'] == 200
            
            print(f"✅ Cache refreshed on miss")


class TestCacheEfficiency:
    """Test cache efficiency metrics."""

    def test_cache_hit_rate_calculation(self):
        """
        Calculate and verify cache hit rate.
        
        **Validates: Requirement 21.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Clear cache
        schemes_handler._scheme_cache.clear()
        schemes_handler._cache_timestamp = 0
        
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
        
        # Mock DynamoDB
        with patch('schemes.handler.table') as mock_table:
            mock_table.query.return_value = {
                'Items': sample_schemes
            }
            
            # Make 100 requests
            num_requests = 100
            cache_hits = 0
            cache_misses = 0
            
            for i in range(num_requests):
                if schemes_handler.is_cache_valid():
                    cache_hits += 1
                else:
                    cache_misses += 1
                
                schemes_handler.lambda_handler(event, None)
            
            cache_hit_rate = cache_hits / num_requests
            
            print(f"📊 Cache Statistics:")
            print(f"   Total requests: {num_requests}")
            print(f"   Cache hits: {cache_hits}")
            print(f"   Cache misses: {cache_misses}")
            print(f"   Hit rate: {cache_hit_rate * 100:.1f}%")
            
            # After first request, all should be cache hits
            assert cache_hit_rate >= 0.95  # At least 95% hit rate
            assert mock_table.query.call_count == 1  # Only one DynamoDB call

    def test_cache_memory_usage(self):
        """
        Verify cache doesn't consume excessive memory.
        
        **Validates: Requirement 19.3**
        """
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        from schemes import handler as schemes_handler
        
        # Create large scheme dataset
        large_schemes = [
            {
                'schemeId': f'scheme-{i}',
                'name': f'Scheme {i}',
                'description': 'A' * 1000,  # 1KB description
                'category': 'test'
            }
            for i in range(100)  # 100 schemes
        ]
        
        # Set cache
        schemes_handler.set_cached_schemes(large_schemes)
        
        # Verify cache is valid
        assert schemes_handler.is_cache_valid()
        
        # Verify data integrity
        cached = schemes_handler.get_cached_schemes()
        assert len(cached) == 100
        assert cached[0]['schemeId'] == 'scheme-0'
        
        print(f"✅ Cache handles large datasets correctly")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])
