"""Unit tests for Schemes Lambda function."""

import json
import os
import sys
import time
from unittest.mock import MagicMock, patch, ANY

import pytest

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from schemes import handler


@pytest.fixture
def mock_table():
    """Create a mock DynamoDB table."""
    return MagicMock()


@pytest.fixture
def sample_scheme_item():
    """Sample scheme item from DynamoDB."""
    return {
        'PK': 'SCHEME#pm-kisan',
        'SK': 'METADATA',
        'schemeId': 'pm-kisan',
        'name': 'PM-KISAN',
        'nameTranslations': {
            'hi': 'प्रधानमंत्री किसान सम्मान निधि',
            'ta': 'பிரதமர் கிசான் சம்மான் நிதி'
        },
        'description': 'Income support for farmer families',
        'descriptionTranslations': {
            'hi': 'किसान परिवारों के लिए आय सहायता',
            'ta': 'விவசாயி குடும்பங்களுக்கான வருமான ஆதரவு'
        },
        'category': 'agriculture',
        'targetAudience': 'Small and marginal farmers',
        'eligibilityRules': [
            {
                'criterion': 'landOwnership',
                'requirement': 'Must own agricultural land'
            }
        ],
        'benefits': '₹6000 per year',
        'applicationSteps': ['Visit portal', 'Register'],
        'documents': ['Aadhaar', 'Land records'],
        'officialWebsite': 'https://pmkisan.gov.in',
        'lastUpdated': 1704067200
    }


@pytest.fixture
def api_gateway_event():
    """Sample API Gateway event."""
    return {
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


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear cache before each test."""
    handler._scheme_cache.clear()
    handler._cache_timestamp = 0
    yield
    handler._scheme_cache.clear()
    handler._cache_timestamp = 0


class TestCacheFunctions:
    """Test cache management functions."""
    
    def test_cache_initially_invalid(self):
        """Cache should be invalid initially."""
        assert not handler.is_cache_valid()
    
    def test_cache_valid_after_setting(self):
        """Cache should be valid after setting schemes."""
        schemes = [{'id': 'test', 'name': 'Test'}]
        handler.set_cached_schemes(schemes)
        assert handler.is_cache_valid()
        assert handler.get_cached_schemes() == schemes
    
    def test_cache_expires_after_ttl(self):
        """Cache should expire after TTL."""
        schemes = [{'id': 'test', 'name': 'Test'}]
        handler.set_cached_schemes(schemes)
        
        # Simulate time passing beyond TTL
        handler._cache_timestamp = time.time() - handler.CACHE_TTL_SECONDS - 1
        
        assert not handler.is_cache_valid()
        assert handler.get_cached_schemes() is None
    
    def test_cache_valid_within_ttl(self):
        """Cache should remain valid within TTL period."""
        schemes = [{'id': 'test', 'name': 'Test'}]
        handler.set_cached_schemes(schemes)
        
        # Simulate time passing but still within TTL
        handler._cache_timestamp = time.time() - handler.CACHE_TTL_SECONDS + 10
        
        assert handler.is_cache_valid()
        assert handler.get_cached_schemes() == schemes
    
    def test_individual_scheme_caching(self):
        """Individual schemes should be cached."""
        scheme = {'id': 'pm-kisan', 'name': 'PM-KISAN'}
        handler.set_cached_scheme('pm-kisan', scheme)
        
        assert handler.get_cached_scheme('pm-kisan') == scheme
        assert handler.get_cached_scheme('other-scheme') is None
    
    def test_individual_scheme_cache_expiration(self):
        """Individual scheme cache should expire after TTL."""
        scheme = {'id': 'pm-kisan', 'name': 'PM-KISAN'}
        handler.set_cached_scheme('pm-kisan', scheme)
        
        # Simulate time passing beyond TTL
        handler._cache_timestamp = time.time() - handler.CACHE_TTL_SECONDS - 1
        
        assert not handler.is_cache_valid()
        assert handler.get_cached_scheme('pm-kisan') is None
    
    def test_cache_stores_multiple_schemes(self):
        """Cache should store multiple individual schemes."""
        scheme1 = {'id': 'pm-kisan', 'name': 'PM-KISAN'}
        scheme2 = {'id': 'ayushman', 'name': 'Ayushman Bharat'}
        
        handler.set_cached_scheme('pm-kisan', scheme1)
        handler.set_cached_scheme('ayushman', scheme2)
        
        assert handler.get_cached_scheme('pm-kisan') == scheme1
        assert handler.get_cached_scheme('ayushman') == scheme2
    
    def test_cache_timestamp_set_on_first_scheme(self):
        """Cache timestamp should be set when first scheme is cached."""
        assert handler._cache_timestamp == 0
        
        scheme = {'id': 'test', 'name': 'Test'}
        handler.set_cached_scheme('test', scheme)
        
        assert handler._cache_timestamp > 0
    
    def test_cache_all_schemes_updates_timestamp(self):
        """Setting all schemes should update cache timestamp."""
        initial_time = handler._cache_timestamp
        
        schemes = [{'id': 'test', 'name': 'Test'}]
        handler.set_cached_schemes(schemes)
        
        assert handler._cache_timestamp > initial_time
    
    def test_cache_returns_none_when_empty(self):
        """Cache should return None when no schemes are cached."""
        assert handler.get_cached_schemes() is None
        assert handler.get_cached_scheme('any-id') is None


class TestListSchemes:
    """Test list_schemes function."""
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_basic(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test basic scheme listing."""
        mock_get_table.return_value = mock_table
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {}
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'schemes' in body
        assert len(body['schemes']) == 1
        assert body['schemes'][0]['id'] == 'pm-kisan'
        assert body['total'] == 1
        assert body['limit'] == 50
        assert body['offset'] == 0
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_default_pagination(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test default pagination parameters (limit=50, offset=0)."""
        mock_get_table.return_value = mock_table
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = None
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['limit'] == 50
        assert body['offset'] == 0
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_with_pagination(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test scheme listing with pagination."""
        mock_get_table.return_value = mock_table
        
        # Create multiple schemes
        schemes = []
        for i in range(10):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            schemes.append(scheme)
        
        mock_table.scan.return_value = {
            'Items': schemes,
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {
            'limit': '5',
            'offset': '3'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 5
        assert body['limit'] == 5
        assert body['offset'] == 3
        assert body['total'] == 10
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_pagination_max_limit(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that pagination limit is capped at 100."""
        mock_get_table.return_value = mock_table
        
        # Create 150 schemes
        schemes = []
        for i in range(150):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            schemes.append(scheme)
        
        mock_table.scan.return_value = {
            'Items': schemes,
            'LastEvaluatedKey': None
        }
        
        # Request limit of 200, should be capped at 100
        api_gateway_event['queryStringParameters'] = {
            'limit': '200',
            'offset': '0'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['limit'] == 100  # Capped at max
        assert len(body['schemes']) == 100
        assert body['total'] == 150
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_pagination_beyond_total(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test pagination when offset is beyond total items."""
        mock_get_table.return_value = mock_table
        
        schemes = []
        for i in range(5):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            schemes.append(scheme)
        
        mock_table.scan.return_value = {
            'Items': schemes,
            'LastEvaluatedKey': None
        }
        
        # Offset beyond total items
        api_gateway_event['queryStringParameters'] = {
            'limit': '10',
            'offset': '20'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 0  # No items in this range
        assert body['total'] == 5
        assert body['offset'] == 20
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_pagination_last_page(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test pagination on the last page with partial results."""
        mock_get_table.return_value = mock_table
        
        schemes = []
        for i in range(23):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            schemes.append(scheme)
        
        mock_table.scan.return_value = {
            'Items': schemes,
            'LastEvaluatedKey': None
        }
        
        # Request last page: offset=20, limit=10, but only 3 items remain
        api_gateway_event['queryStringParameters'] = {
            'limit': '10',
            'offset': '20'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 3  # Only 3 items on last page
        assert body['total'] == 23
        assert body['limit'] == 10
        assert body['offset'] == 20
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_with_category_filter(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test scheme listing with category filter."""
        mock_get_table.return_value = mock_table
        mock_table.query.return_value = {
            'Items': [sample_scheme_item]
        }
        
        api_gateway_event['queryStringParameters'] = {
            'category': 'agriculture'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 1
        
        # Verify GSI query was used
        mock_table.query.assert_called_once()
        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs['IndexName'] == 'CategoryIndex'
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_category_filter_with_pagination(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test category filtering with pagination."""
        mock_get_table.return_value = mock_table
        
        # Create multiple agriculture schemes
        schemes = []
        for i in range(15):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'agri-scheme-{i}'
            scheme['PK'] = f'SCHEME#agri-scheme-{i}'
            scheme['category'] = 'agriculture'
            schemes.append(scheme)
        
        mock_table.query.return_value = {
            'Items': schemes
        }
        
        api_gateway_event['queryStringParameters'] = {
            'category': 'agriculture',
            'limit': '5',
            'offset': '10'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 5  # Last 5 items
        assert body['total'] == 15
        assert body['limit'] == 5
        assert body['offset'] == 10
        
        # Verify GSI query was used
        mock_table.query.assert_called_once()
        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs['IndexName'] == 'CategoryIndex'
        assert call_kwargs['ExpressionAttributeValues'][':category'] == 'agriculture'
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_category_filter_empty_result(self, mock_get_table, mock_table, api_gateway_event):
        """Test category filter with no matching schemes."""
        mock_get_table.return_value = mock_table
        mock_table.query.return_value = {
            'Items': []
        }
        
        api_gateway_event['queryStringParameters'] = {
            'category': 'nonexistent'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body['schemes']) == 0
        assert body['total'] == 0
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_category_filter_does_not_use_cache(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that category filtering bypasses cache."""
        mock_get_table.return_value = mock_table
        
        # First, populate cache with all schemes
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {}
        handler.lambda_handler(api_gateway_event, None)
        
        # Now query with category filter - should not use cache
        mock_table.query.return_value = {
            'Items': [sample_scheme_item]
        }
        
        api_gateway_event['queryStringParameters'] = {
            'category': 'agriculture'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        # Verify query was called (not using cache)
        mock_table.query.assert_called_once()
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_uses_cache(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that subsequent requests use cache."""
        mock_get_table.return_value = mock_table
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {}
        
        # First request - should hit DynamoDB
        response1 = handler.lambda_handler(api_gateway_event, None)
        assert response1['statusCode'] == 200
        assert mock_table.scan.call_count == 1
        
        # Second request - should use cache
        response2 = handler.lambda_handler(api_gateway_event, None)
        assert response2['statusCode'] == 200
        assert mock_table.scan.call_count == 1  # No additional calls
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_cache_with_different_pagination(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that cache works with different pagination parameters."""
        mock_get_table.return_value = mock_table
        
        schemes = []
        for i in range(20):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            schemes.append(scheme)
        
        mock_table.scan.return_value = {
            'Items': schemes,
            'LastEvaluatedKey': None
        }
        
        # First request with limit=10, offset=0
        api_gateway_event['queryStringParameters'] = {
            'limit': '10',
            'offset': '0'
        }
        response1 = handler.lambda_handler(api_gateway_event, None)
        assert response1['statusCode'] == 200
        body1 = json.loads(response1['body'])
        assert len(body1['schemes']) == 10
        assert mock_table.scan.call_count == 1
        
        # Second request with limit=5, offset=15 - should use cache
        api_gateway_event['queryStringParameters'] = {
            'limit': '5',
            'offset': '15'
        }
        response2 = handler.lambda_handler(api_gateway_event, None)
        assert response2['statusCode'] == 200
        body2 = json.loads(response2['body'])
        assert len(body2['schemes']) == 5
        assert mock_table.scan.call_count == 1  # Still only 1 call
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_cache_expiration(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that cache expires after TTL."""
        mock_get_table.return_value = mock_table
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {}
        
        # First request - populates cache
        response1 = handler.lambda_handler(api_gateway_event, None)
        assert response1['statusCode'] == 200
        assert mock_table.scan.call_count == 1
        
        # Simulate cache expiration
        handler._cache_timestamp = time.time() - handler.CACHE_TTL_SECONDS - 1
        
        # Second request - should hit DynamoDB again
        response2 = handler.lambda_handler(api_gateway_event, None)
        assert response2['statusCode'] == 200
        assert mock_table.scan.call_count == 2  # Cache expired, new call
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_cache_with_dynamodb_pagination(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that cache handles DynamoDB pagination correctly."""
        mock_get_table.return_value = mock_table
        
        # Create two batches of schemes
        batch1 = []
        for i in range(5):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            batch1.append(scheme)
        
        batch2 = []
        for i in range(5, 10):
            scheme = sample_scheme_item.copy()
            scheme['schemeId'] = f'scheme-{i}'
            scheme['PK'] = f'SCHEME#scheme-{i}'
            batch2.append(scheme)
        
        # Mock DynamoDB pagination
        call_count = [0]
        def scan_side_effect(**kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                return {
                    'Items': batch1,
                    'LastEvaluatedKey': {'PK': 'SCHEME#scheme-4', 'SK': 'METADATA'}
                }
            else:
                return {
                    'Items': batch2,
                    'LastEvaluatedKey': None
                }
        
        mock_table.scan.side_effect = scan_side_effect
        
        api_gateway_event['queryStringParameters'] = {}
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['total'] == 10  # All items fetched and cached
        assert mock_table.scan.call_count == 2  # Two DynamoDB calls for pagination
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_list_schemes_with_translation(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test scheme listing with language translation."""
        mock_get_table.return_value = mock_table
        mock_table.scan.return_value = {
            'Items': [sample_scheme_item],
            'LastEvaluatedKey': None
        }
        
        api_gateway_event['queryStringParameters'] = {
            'language': 'hi'
        }
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['schemes'][0]['name'] == 'प्रधानमंत्री किसान सम्मान निधि'
        assert body['schemes'][0]['description'] == 'किसान परिवारों के लिए आय सहायता'
        # Translation dicts should be removed
        assert 'nameTranslations' not in body['schemes'][0]
        assert 'descriptionTranslations' not in body['schemes'][0]


class TestGetSchemeDetails:
    """Test get_scheme_details function."""
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_get_scheme_details_success(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test successful scheme details retrieval."""
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {
            'Item': sample_scheme_item
        }
        
        api_gateway_event['pathParameters'] = {'schemeId': 'pm-kisan'}
        api_gateway_event['queryStringParameters'] = {}
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['id'] == 'pm-kisan'
        assert body['name'] == 'PM-KISAN'
        assert 'eligibilityRules' in body
        assert 'applicationSteps' in body
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_get_scheme_details_not_found(self, mock_get_table, mock_table, api_gateway_event):
        """Test scheme not found error."""
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {}
        
        api_gateway_event['pathParameters'] = {'schemeId': 'invalid-scheme'}
        api_gateway_event['queryStringParameters'] = {}
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['error'] == 'SchemeNotFound'
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_get_scheme_details_with_translation(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test scheme details with language translation."""
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {
            'Item': sample_scheme_item
        }
        
        api_gateway_event['pathParameters'] = {'schemeId': 'pm-kisan'}
        api_gateway_event['queryStringParameters'] = {'language': 'ta'}
        
        response = handler.lambda_handler(api_gateway_event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['name'] == 'பிரதமர் கிசான் சம்மான் நிதி'
        assert body['description'] == 'விவசாயி குடும்பங்களுக்கான வருமான ஆதரவு'
    
    @patch('schemes.handler.get_dynamodb_table')
    def test_get_scheme_details_uses_cache(self, mock_get_table, mock_table, sample_scheme_item, api_gateway_event):
        """Test that subsequent requests use cache."""
        mock_get_table.return_value = mock_table
        mock_table.get_item.return_value = {
            'Item': sample_scheme_item
        }
        
        api_gateway_event['pathParameters'] = {'schemeId': 'pm-kisan'}
        api_gateway_event['queryStringParameters'] = {}
        
        # First request - should hit DynamoDB
        response1 = handler.lambda_handler(api_gateway_event, None)
        assert response1['statusCode'] == 200
        assert mock_table.get_item.call_count == 1
        
        # Second request - should use cache
        response2 = handler.lambda_handler(api_gateway_event, None)
        assert response2['statusCode'] == 200
        assert mock_table.get_item.call_count == 1  # No additional calls


class TestTranslationFunctions:
    """Test translation helper functions."""
    
    def test_apply_translations_hindi(self):
        """Test applying Hindi translations."""
        scheme = {
            'id': 'test',
            'name': 'Test Scheme',
            'nameTranslations': {'hi': 'परीक्षण योजना'},
            'description': 'Test description',
            'descriptionTranslations': {'hi': 'परीक्षण विवरण'}
        }
        
        result = handler.apply_translations(scheme, 'hi')
        
        assert result['name'] == 'परीक्षण योजना'
        assert result['description'] == 'परीक्षण विवरण'
        assert 'nameTranslations' not in result
        assert 'descriptionTranslations' not in result
    
    def test_apply_translations_fallback_to_english(self):
        """Test fallback to English when translation not available."""
        scheme = {
            'id': 'test',
            'name': 'Test Scheme',
            'nameTranslations': {'hi': 'परीक्षण योजना'},
            'description': 'Test description',
            'descriptionTranslations': {}
        }
        
        result = handler.apply_translations(scheme, 'ta')
        
        # Should keep English since Tamil translation not available
        assert result['name'] == 'Test Scheme'
        assert result['description'] == 'Test description'
    
    def test_apply_translations_english(self):
        """Test that English language keeps original text."""
        scheme = {
            'id': 'test',
            'name': 'Test Scheme',
            'nameTranslations': {'hi': 'परीक्षण योजना'},
            'description': 'Test description',
            'descriptionTranslations': {'hi': 'परीक्षण विवरण'}
        }
        
        result = handler.apply_translations(scheme, 'en')
        
        assert result['name'] == 'Test Scheme'
        assert result['description'] == 'Test description'


class TestFormatFunctions:
    """Test formatting helper functions."""
    
    def test_format_scheme_summary(self, sample_scheme_item):
        """Test formatting scheme for list response."""
        result = handler.format_scheme_summary(sample_scheme_item)
        
        assert result['id'] == 'pm-kisan'
        assert result['name'] == 'PM-KISAN'
        assert 'nameTranslations' in result
        assert 'category' in result
        assert 'targetAudience' in result
        # Should not include detailed fields
        assert 'eligibilityRules' not in result
        assert 'applicationSteps' not in result
    
    def test_format_scheme_details(self, sample_scheme_item):
        """Test formatting scheme for detailed response."""
        result = handler.format_scheme_details(sample_scheme_item)
        
        assert result['id'] == 'pm-kisan'
        assert result['name'] == 'PM-KISAN'
        assert 'eligibilityRules' in result
        assert 'applicationSteps' in result
        assert 'documents' in result
        assert 'officialWebsite' in result
    
    def test_format_eligibility_rules(self):
        """Test formatting eligibility rules."""
        rules = [
            {
                'criterion': 'age',
                'requirement': 'Must be 18+',
                'evaluator': 'lambda u: u["age"] >= 18'  # Should be removed
            }
        ]
        
        result = handler.format_eligibility_rules(rules)
        
        assert len(result) == 1
        assert result[0]['criterion'] == 'age'
        assert result[0]['requirement'] == 'Must be 18+'
        # Evaluator should not be in public response
        assert 'evaluator' not in result[0]


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
