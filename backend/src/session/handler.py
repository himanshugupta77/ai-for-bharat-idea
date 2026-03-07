"""Session management Lambda handler."""

import json
import logging
from typing import Dict, Any

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.utils import (
    handle_exceptions,
    create_response,
    create_error_response,
    get_session_id_from_event,
    parse_request_body
)
from shared.session_manager import (
    get_session_info,
    delete_session_data,
    update_session_access_time
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)


@handle_exceptions
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle session management requests.
    
    Endpoints:
    - GET /session/info - Get session information and expiration status
    - DELETE /session - Delete session data immediately
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response
    """
    http_method = event.get('httpMethod')
    path = event.get('path', '')
    
    # Get session ID from headers
    session_id = get_session_id_from_event(event)
    
    if not session_id:
        return create_error_response(
            400,
            'MissingSessionId',
            'Session ID is required in X-Session-Id header'
        )
    
    # Route to appropriate handler
    if http_method == 'GET' and path.endswith('/info'):
        return handle_get_session_info(session_id)
    elif http_method == 'DELETE':
        return handle_delete_session(session_id)
    else:
        return create_error_response(
            404,
            'NotFound',
            f'Endpoint not found: {http_method} {path}'
        )


def handle_get_session_info(session_id: str) -> Dict[str, Any]:
    """
    Get session information including expiration status.
    
    Args:
        session_id: Session identifier
    
    Returns:
        API Gateway response with session info
    """
    try:
        session_info = get_session_info(session_id)
        
        # Update access time if session exists and not expired
        if session_info['exists'] and not session_info['expired']:
            update_session_access_time(session_id)
        
        response_body = {
            'sessionId': session_id,
            'exists': session_info['exists'],
            'expired': session_info['expired'],
            'timeRemainingSeconds': session_info['timeRemaining'],
            'showExpirationWarning': session_info['showWarning'],
            'messageCount': session_info.get('messageCount', 0)
        }
        
        # Add timestamps if session exists
        if session_info['exists']:
            response_body['createdAt'] = session_info.get('createdAt')
            response_body['lastAccessedAt'] = session_info.get('lastAccessedAt')
        
        logger.info(f"Retrieved session info for {session_id}: expired={session_info['expired']}, remaining={session_info['timeRemaining']}s")
        
        return create_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Error getting session info: {e}", exc_info=True)
        return create_error_response(
            500,
            'InternalError',
            'Failed to retrieve session information'
        )


def handle_delete_session(session_id: str) -> Dict[str, Any]:
    """
    Delete all session data immediately.
    
    Args:
        session_id: Session identifier
    
    Returns:
        API Gateway response confirming deletion
    """
    try:
        success = delete_session_data(session_id)
        
        if success:
            logger.info(f"Successfully deleted session {session_id}")
            return create_response(200, {
                'message': 'Session data deleted successfully',
                'sessionId': session_id
            })
        else:
            return create_error_response(
                500,
                'DeletionFailed',
                'Failed to delete session data'
            )
            
    except Exception as e:
        logger.error(f"Error deleting session: {e}", exc_info=True)
        return create_error_response(
            500,
            'InternalError',
            'Failed to delete session data'
        )
