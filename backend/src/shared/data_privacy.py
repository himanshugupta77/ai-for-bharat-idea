"""Data privacy and minimization utilities for Bharat Sahayak backend."""

import logging
import re
from typing import Dict, Any, Optional, List

logger = logging.getLogger()

# PII patterns to detect and sanitize
PII_PATTERNS = {
    'aadhaar': re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b'),  # Aadhaar number
    'pan': re.compile(r'\b[A-Z]{5}\d{4}[A-Z]\b'),  # PAN card
    'phone': re.compile(r'\b\d{10}\b'),  # 10-digit phone number
    'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
    'address': re.compile(r'\b\d+[,\s]+[A-Za-z\s]+[,\s]+\d{6}\b'),  # Simple address pattern
}

# Fields that should never be stored
PROHIBITED_FIELDS = [
    'aadhaar_number',
    'pan_number',
    'phone_number',
    'email_address',
    'full_address',
    'bank_account',
    'credit_card',
    'passport_number',
    'driving_license'
]

# Essential fields for eligibility checking only
ESSENTIAL_ELIGIBILITY_FIELDS = [
    'age',
    'gender',
    'income',
    'state',
    'category',
    'occupation',
    'hasDisability',
    'isBPL',
    'ownsLand',
    'landSize'
]


def detect_pii(text: str) -> List[str]:
    """
    Detect potential PII in text.
    
    Args:
        text: Text to scan for PII
    
    Returns:
        List of detected PII types
    """
    detected = []
    
    for pii_type, pattern in PII_PATTERNS.items():
        if pattern.search(text):
            detected.append(pii_type)
    
    return detected


def sanitize_pii(text: str) -> str:
    """
    Remove or mask PII from text.
    
    Args:
        text: Text to sanitize
    
    Returns:
        Sanitized text with PII masked
    """
    sanitized = text
    
    # Mask Aadhaar numbers
    sanitized = PII_PATTERNS['aadhaar'].sub('[AADHAAR_REDACTED]', sanitized)
    
    # Mask PAN numbers
    sanitized = PII_PATTERNS['pan'].sub('[PAN_REDACTED]', sanitized)
    
    # Mask phone numbers
    sanitized = PII_PATTERNS['phone'].sub('[PHONE_REDACTED]', sanitized)
    
    # Mask email addresses
    sanitized = PII_PATTERNS['email'].sub('[EMAIL_REDACTED]', sanitized)
    
    # Mask addresses
    sanitized = PII_PATTERNS['address'].sub('[ADDRESS_REDACTED]', sanitized)
    
    return sanitized


def filter_essential_fields(user_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Filter user info to include only essential fields for eligibility checking.
    
    Args:
        user_info: User information dictionary
    
    Returns:
        Filtered dictionary with only essential fields
    """
    filtered = {}
    
    for field in ESSENTIAL_ELIGIBILITY_FIELDS:
        if field in user_info:
            filtered[field] = user_info[field]
    
    return filtered


def remove_prohibited_fields(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove prohibited PII fields from data.
    
    Args:
        data: Data dictionary
    
    Returns:
        Data with prohibited fields removed
    """
    cleaned = data.copy()
    
    for field in PROHIBITED_FIELDS:
        if field in cleaned:
            logger.warning(f"Removing prohibited field: {field}")
            del cleaned[field]
    
    return cleaned


def anonymize_user_info(user_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Anonymize user information by removing identifiable details.
    
    Args:
        user_info: User information dictionary
    
    Returns:
        Anonymized user information
    """
    # Filter to essential fields only
    anonymized = filter_essential_fields(user_info)
    
    # Remove any prohibited fields
    anonymized = remove_prohibited_fields(anonymized)
    
    # Sanitize string fields
    for key, value in anonymized.items():
        if isinstance(value, str):
            # Check for PII in string values
            detected_pii = detect_pii(value)
            if detected_pii:
                logger.warning(f"PII detected in field {key}: {detected_pii}")
                anonymized[key] = sanitize_pii(value)
    
    return anonymized


def sanitize_message_content(content: str) -> str:
    """
    Sanitize message content before storage.
    
    Args:
        content: Message content
    
    Returns:
        Sanitized content with PII masked
    """
    # Detect PII
    detected_pii = detect_pii(content)
    
    if detected_pii:
        logger.info(f"PII detected in message: {detected_pii}")
        # Sanitize the content
        return sanitize_pii(content)
    
    return content


def validate_data_minimization(data: Dict[str, Any]) -> bool:
    """
    Validate that data follows minimization principles.
    
    Args:
        data: Data to validate
    
    Returns:
        True if data is minimal, False otherwise
    """
    # Check for prohibited fields
    for field in PROHIBITED_FIELDS:
        if field in data:
            logger.error(f"Data minimization violation: prohibited field {field} present")
            return False
    
    # Check for PII in string fields
    for key, value in data.items():
        if isinstance(value, str):
            detected_pii = detect_pii(value)
            if detected_pii:
                logger.warning(f"Potential PII in field {key}: {detected_pii}")
                # Don't fail validation, but log warning
    
    return True


def get_data_retention_info() -> Dict[str, Any]:
    """
    Get information about data retention policies.
    
    Returns:
        Dictionary with retention policy information
    """
    return {
        'sessionDuration': '24 hours',
        'automaticDeletion': True,
        'piiStorage': 'None - PII is not stored',
        'dataMinimization': 'Only essential eligibility information is collected',
        'userControl': 'Users can delete their session data at any time',
        'encryption': 'All data is encrypted at rest and in transit'
    }


def log_data_access(
    operation: str,
    data_type: str,
    session_id: str,
    fields_accessed: Optional[List[str]] = None
):
    """
    Log data access for audit purposes.
    
    Args:
        operation: Type of operation (read, write, delete)
        data_type: Type of data accessed (session, message, user_info)
        session_id: Session identifier
        fields_accessed: List of fields accessed
    """
    log_entry = {
        'eventType': 'dataAccess',
        'operation': operation,
        'dataType': data_type,
        'sessionId': session_id,
        'fieldsAccessed': fields_accessed or [],
        'timestamp': None  # Will be added by logger
    }
    
    logger.info(f"Data access: {operation} {data_type} for session {session_id}")
