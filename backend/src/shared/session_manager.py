"""Session management utilities for Bharat Sahayak backend."""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from .utils import (
    get_dynamodb_table,
    get_current_timestamp,
    get_ttl_timestamp,
    generate_session_id
)

logger = logging.getLogger()

# Session expiration constants
SESSION_TTL_HOURS = 24
SESSION_WARNING_HOURS = 23  # Warn when 1 hour remains


def create_session(language: str = 'en') -> Dict[str, Any]:
    """
    Create a new session with TTL.
    
    Args:
        language: Initial language for the session
    
    Returns:
        Session metadata dictionary
    """
    session_id = generate_session_id()
    timestamp = get_current_timestamp()
    ttl = get_ttl_timestamp(SESSION_TTL_HOURS)
    
    session_metadata = {
        'PK': f'SESSION#{session_id}',
        'SK': 'METADATA',
        'sessionId': session_id,
        'createdAt': timestamp,
        'lastAccessedAt': timestamp,
        'language': language,
        'messageCount': 0,
        'ttl': ttl
    }
    
    try:
        table = get_dynamodb_table()
        table.put_item(Item=session_metadata)
        logger.info(f"Created new session {session_id} with TTL {ttl}")
        return session_metadata
    except Exception as e:
        logger.error(f"Failed to create session: {e}", exc_info=True)
        raise


def get_session_metadata(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve session metadata from DynamoDB.
    
    Args:
        session_id: Session identifier
    
    Returns:
        Session metadata dictionary or None if not found
    """
    try:
        table = get_dynamodb_table()
        response = table.get_item(
            Key={
                'PK': f'SESSION#{session_id}',
                'SK': 'METADATA'
            }
        )
        return response.get('Item')
    except Exception as e:
        logger.warning(f"Could not retrieve session metadata: {e}")
        return None


def is_session_expired(session_metadata: Dict[str, Any]) -> bool:
    """
    Check if a session has expired based on TTL.
    
    Args:
        session_metadata: Session metadata dictionary
    
    Returns:
        True if session is expired, False otherwise
    """
    if not session_metadata:
        return True
    
    ttl = session_metadata.get('ttl')
    if not ttl:
        return False
    
    current_time = get_current_timestamp()
    return current_time >= ttl


def get_session_time_remaining(session_metadata: Dict[str, Any]) -> int:
    """
    Get remaining time in seconds before session expires.
    
    Args:
        session_metadata: Session metadata dictionary
    
    Returns:
        Remaining seconds, or 0 if expired
    """
    if not session_metadata:
        return 0
    
    ttl = session_metadata.get('ttl')
    if not ttl:
        return SESSION_TTL_HOURS * 3600  # Default to full duration
    
    current_time = get_current_timestamp()
    remaining = ttl - current_time
    return max(0, remaining)


def should_show_expiration_warning(session_metadata: Dict[str, Any]) -> bool:
    """
    Determine if session expiration warning should be shown.
    
    Args:
        session_metadata: Session metadata dictionary
    
    Returns:
        True if warning should be shown, False otherwise
    """
    if not session_metadata:
        return False
    
    time_remaining = get_session_time_remaining(session_metadata)
    warning_threshold = 3600  # 1 hour in seconds
    
    return 0 < time_remaining <= warning_threshold


def delete_session_data(session_id: str) -> bool:
    """
    Immediately delete all session data from DynamoDB.
    
    Args:
        session_id: Session identifier
    
    Returns:
        True if deletion successful, False otherwise
    """
    try:
        table = get_dynamodb_table()
        
        # Query all items for this session
        response = table.query(
            KeyConditionExpression='PK = :pk',
            ExpressionAttributeValues={
                ':pk': f'SESSION#{session_id}'
            }
        )
        
        items = response.get('Items', [])
        
        # Delete each item
        deleted_count = 0
        for item in items:
            table.delete_item(
                Key={
                    'PK': item['PK'],
                    'SK': item['SK']
                }
            )
            deleted_count += 1
        
        logger.info(f"Deleted {deleted_count} items for session {session_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to delete session data: {e}", exc_info=True)
        return False


def update_session_access_time(session_id: str) -> bool:
    """
    Update the last accessed time for a session.
    
    Args:
        session_id: Session identifier
    
    Returns:
        True if update successful, False otherwise
    """
    try:
        table = get_dynamodb_table()
        timestamp = get_current_timestamp()
        
        table.update_item(
            Key={
                'PK': f'SESSION#{session_id}',
                'SK': 'METADATA'
            },
            UpdateExpression='SET lastAccessedAt = :timestamp',
            ExpressionAttributeValues={
                ':timestamp': timestamp
            }
        )
        return True
        
    except Exception as e:
        logger.warning(f"Failed to update session access time: {e}")
        return False


def get_session_info(session_id: str) -> Dict[str, Any]:
    """
    Get comprehensive session information including expiration status.
    
    Args:
        session_id: Session identifier
    
    Returns:
        Dictionary with session info and expiration details
    """
    metadata = get_session_metadata(session_id)
    
    if not metadata:
        return {
            'exists': False,
            'expired': True,
            'timeRemaining': 0,
            'showWarning': False
        }
    
    expired = is_session_expired(metadata)
    time_remaining = get_session_time_remaining(metadata)
    show_warning = should_show_expiration_warning(metadata)
    
    return {
        'exists': True,
        'expired': expired,
        'timeRemaining': time_remaining,
        'showWarning': show_warning,
        'createdAt': metadata.get('createdAt'),
        'lastAccessedAt': metadata.get('lastAccessedAt'),
        'messageCount': metadata.get('messageCount', 0),
        'language': metadata.get('language', 'en')
    }
