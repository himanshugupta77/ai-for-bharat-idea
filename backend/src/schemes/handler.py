"""Schemes Lambda function handler."""

import json
import os
import sys
import time
from typing import Any, Dict, List, Optional

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.utils import (
    handle_exceptions,
    get_dynamodb_table,
    create_response,
    create_error_response,
    logger
)

# Lambda memory cache with 5-minute TTL
_scheme_cache: Dict[str, Any] = {}
_cache_timestamp: float = 0
CACHE_TTL_SECONDS = 300  # 5 minutes


@handle_exceptions
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Retrieve scheme information.
    
    Handles:
    - GET /schemes - List all schemes with pagination and category filtering
    - GET /schemes/{schemeId} - Get specific scheme details with translations
    
    Features:
    - Lambda memory caching with 5-minute TTL
    - Efficient pagination with DynamoDB LastEvaluatedKey
    - Category filtering using GSI
    - Translation support for scheme names and descriptions
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response with scheme data
    """
    http_method = event.get('httpMethod')
    path_parameters = event.get('pathParameters') or {}
    query_parameters = event.get('queryStringParameters') or {}
    
    table = get_dynamodb_table()
    
    # Route based on path
    if path_parameters.get('schemeId'):
        # GET /schemes/{schemeId}
        return get_scheme_details(table, path_parameters['schemeId'], query_parameters, event)
    else:
        # GET /schemes
        return list_schemes(table, query_parameters)


def is_cache_valid() -> bool:
    """Check if the cache is still valid (within TTL)."""
    global _cache_timestamp
    current_time = time.time()
    return (current_time - _cache_timestamp) < CACHE_TTL_SECONDS


def get_cached_schemes() -> Optional[List[Dict[str, Any]]]:
    """Get schemes from cache if valid."""
    if is_cache_valid() and 'all_schemes' in _scheme_cache:
        logger.info("Returning schemes from cache")
        return _scheme_cache['all_schemes']
    return None


def set_cached_schemes(schemes: List[Dict[str, Any]]):
    """Store schemes in cache with current timestamp."""
    global _cache_timestamp, _scheme_cache
    _scheme_cache['all_schemes'] = schemes
    _cache_timestamp = time.time()
    logger.info(f"Cached {len(schemes)} schemes")


def get_cached_scheme(scheme_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific scheme from cache if valid."""
    if is_cache_valid() and scheme_id in _scheme_cache:
        logger.info(f"Returning scheme {scheme_id} from cache")
        return _scheme_cache[scheme_id]
    return None


def set_cached_scheme(scheme_id: str, scheme: Dict[str, Any]):
    """Store a specific scheme in cache."""
    global _cache_timestamp, _scheme_cache
    _scheme_cache[scheme_id] = scheme
    if _cache_timestamp == 0:
        _cache_timestamp = time.time()
    logger.info(f"Cached scheme {scheme_id}")


def list_schemes(table, query_params: Dict[str, str]) -> Dict[str, Any]:
    """
    List all schemes with optional filtering and pagination.
    
    Query parameters:
    - category: Filter by category (uses GSI)
    - limit: Number of results (default: 50, max: 100)
    - offset: Pagination offset (default: 0)
    - language: Language for translations (optional)
    
    Features:
    - Lambda memory caching with 5-minute TTL
    - Efficient pagination using DynamoDB pagination tokens
    - Category filtering using GSI
    """
    category = query_params.get('category')
    limit = min(int(query_params.get('limit', 50)), 100)
    offset = int(query_params.get('offset', 0))
    language = query_params.get('language', 'en')
    
    try:
        # Check cache first for non-filtered requests
        if not category:
            cached_schemes = get_cached_schemes()
            if cached_schemes:
                # Apply pagination to cached results
                paginated_schemes = cached_schemes[offset:offset + limit]
                schemes_with_translations = [
                    apply_translations(scheme, language) for scheme in paginated_schemes
                ]
                
                return create_response(200, {
                    'schemes': schemes_with_translations,
                    'total': len(cached_schemes),
                    'limit': limit,
                    'offset': offset
                }, cache_control='public, max-age=3600')  # 1 hour cache
        
        # Fetch from DynamoDB
        if category:
            # Query by category using GSI
            response = table.query(
                IndexName='CategoryIndex',
                KeyConditionExpression='category = :category',
                ExpressionAttributeValues={
                    ':category': category
                }
            )
            items = response.get('Items', [])
            
            # Handle pagination manually for GSI queries
            total = len(items)
            items = items[offset:offset + limit]
            
        else:
            # Scan all schemes - fetch all for caching
            items = []
            scan_kwargs = {
                'FilterExpression': 'begins_with(PK, :prefix) AND SK = :sk',
                'ExpressionAttributeValues': {
                    ':prefix': 'SCHEME#',
                    ':sk': 'METADATA'
                }
            }
            
            # Paginate through all results for caching
            while True:
                response = table.scan(**scan_kwargs)
                items.extend(response.get('Items', []))
                
                # Check if there are more items
                last_key = response.get('LastEvaluatedKey')
                if not last_key:
                    break
                scan_kwargs['ExclusiveStartKey'] = last_key
            
            # Cache all schemes
            formatted_all = [format_scheme_summary(item) for item in items]
            set_cached_schemes(formatted_all)
            
            # Apply pagination
            total = len(items)
            items = items[offset:offset + limit]
        
        # Format schemes for response
        schemes = []
        for item in items:
            scheme = format_scheme_summary(item)
            scheme = apply_translations(scheme, language)
            schemes.append(scheme)
        
        response_body = {
            'schemes': schemes,
            'total': total,
            'limit': limit,
            'offset': offset
        }
        
        # Add cache-control header: 1 hour for scheme list
        return create_response(200, response_body, cache_control='public, max-age=3600')
        
    except Exception as e:
        logger.error(f"Failed to list schemes: {e}")
        return create_error_response(
            500,
            'InternalError',
            'Failed to retrieve schemes'
        )


def get_scheme_details(table, scheme_id: str, query_params: Dict[str, str], event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get detailed information about a specific scheme.
    
    Query parameters:
    - language: Language for translations (optional, default: en)
    
    Features:
    - Lambda memory caching with 5-minute TTL
    - Translation support for scheme names and descriptions
    """
    language = query_params.get('language', 'en')
    
    try:
        # Check cache first
        cached_scheme = get_cached_scheme(scheme_id)
        if cached_scheme:
            scheme_with_translation = apply_translations(cached_scheme, language)
            # Add cache-control header: 24 hours for scheme details
            return create_response(200, scheme_with_translation, cache_control='public, max-age=86400')
        
        # Fetch from DynamoDB
        response = table.get_item(
            Key={
                'PK': f'SCHEME#{scheme_id}',
                'SK': 'METADATA'
            }
        )
        
        item = response.get('Item')
        
        if not item:
            return create_error_response(
                404,
                'SchemeNotFound',
                f"Scheme with ID '{scheme_id}' does not exist",
                request_id=event.get('requestContext', {}).get('requestId')
            )
        
        # Format scheme details
        scheme_details = format_scheme_details(item)
        
        # Cache the scheme
        set_cached_scheme(scheme_id, scheme_details)
        
        # Apply translations
        scheme_with_translation = apply_translations(scheme_details, language)
        
        # Add cache-control header: 24 hours for scheme details
        return create_response(200, scheme_with_translation, cache_control='public, max-age=86400')
        
    except Exception as e:
        logger.error(f"Failed to get scheme details: {e}")
        return create_error_response(
            500,
            'InternalError',
            'Failed to retrieve scheme details'
        )


def format_scheme_summary(item: Dict[str, Any]) -> Dict[str, Any]:
    """Format scheme item for list response."""
    return {
        'id': item.get('schemeId', ''),
        'name': item.get('name', ''),
        'nameTranslations': item.get('nameTranslations', {}),
        'description': item.get('description', ''),
        'descriptionTranslations': item.get('descriptionTranslations', {}),
        'category': item.get('category', ''),
        'targetAudience': item.get('targetAudience', '')
    }


def format_scheme_details(item: Dict[str, Any]) -> Dict[str, Any]:
    """Format scheme item for detailed response."""
    return {
        'id': item.get('schemeId', ''),
        'name': item.get('name', ''),
        'nameTranslations': item.get('nameTranslations', {}),
        'description': item.get('description', ''),
        'descriptionTranslations': item.get('descriptionTranslations', {}),
        'category': item.get('category', ''),
        'eligibilityRules': format_eligibility_rules(item.get('eligibilityRules', [])),
        'benefits': item.get('benefits', ''),
        'applicationSteps': item.get('applicationSteps', []),
        'documents': item.get('documents', []),
        'officialWebsite': item.get('officialWebsite', ''),
        'lastUpdated': item.get('lastUpdated', 0)
    }


def apply_translations(scheme: Dict[str, Any], language: str) -> Dict[str, Any]:
    """
    Apply language translations to scheme data.
    
    If a translation exists for the requested language, it replaces the default
    English name/description. Otherwise, the English version is used.
    
    Args:
        scheme: Scheme dictionary with nameTranslations and descriptionTranslations
        language: Target language code (e.g., 'hi', 'ta', 'en')
    
    Returns:
        Scheme dictionary with translated name and description
    """
    result = scheme.copy()
    
    # Apply name translation if available
    name_translations = scheme.get('nameTranslations', {})
    if language != 'en' and language in name_translations:
        result['name'] = name_translations[language]
        logger.debug(f"Applied name translation for language: {language}")
    
    # Apply description translation if available
    desc_translations = scheme.get('descriptionTranslations', {})
    if language != 'en' and language in desc_translations:
        result['description'] = desc_translations[language]
        logger.debug(f"Applied description translation for language: {language}")
    
    # Remove translation dictionaries from response to keep it clean
    result.pop('nameTranslations', None)
    result.pop('descriptionTranslations', None)
    
    return result


def format_eligibility_rules(rules: List[Dict]) -> List[Dict]:
    """Format eligibility rules for public API response."""
    formatted_rules = []
    
    for rule in rules:
        formatted_rules.append({
            'criterion': rule.get('criterion', ''),
            'requirement': rule.get('requirement', '')
        })
    
    return formatted_rules
