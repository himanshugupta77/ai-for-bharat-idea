"""Privacy tests for Bharat Sahayak backend.

Tests session expiration, data deletion, and PII handling.
Validates Requirements 7.2, 7.3, 7.6.
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import time
from typing import Dict, Any

# Import privacy modules
try:
    from shared.session_manager import (
        create_session,
        get_session_metadata,
        is_session_expired,
        get_session_time_remaining,
        should_show_expiration_warning,
        delete_session_data,
        update_session_access_time,
        get_session_info,
        SESSION_TTL_HOURS,
        SESSION_WARNING_HOURS
    )
    from shared.data_privacy import (
        detect_pii,
        sanitize_pii,
        filter_essential_fields,
        remove_prohibited_fields,
        anonymize_user_info,
        sanitize_message_content,
        validate_data_minimization,
        get_data_retention_info,
        PROHIBITED_FIELDS,
        ESSENTIAL_ELIGIBILITY_FIELDS
    )
    from shared.utils import get_ttl_timestamp, get_current_timestamp
except ImportError as e:
    print(f"Warning: Could not import privacy modules: {e}")
    raise


class TestSessionExpiration(unittest.TestCase):
    """Test session expiration after 24 hours.
    
    Validates Requirement 7.2: Session data with automatic expiration after 24 hours.
    """
    
    def test_session_ttl_is_24_hours(self):
        """Test that session TTL is configured for 24 hours."""
        self.assertEqual(SESSION_TTL_HOURS, 24)
    
    @patch('shared.session_manager.get_dynamodb_table')
    @patch('shared.session_manager.get_current_timestamp')
    @patch('shared.session_manager.get_ttl_timestamp')
    def test_create_session_sets_ttl(self, mock_ttl, mock_timestamp, mock_table):
        """Test that creating a session sets TTL for 24 hours."""
        # Mock timestamps
        current_time = 1704067200  # Jan 1, 2024 00:00:00
        ttl_time = current_time + (24 * 3600)  # 24 hours later
        
        mock_timestamp.return_value = current_time
        mock_ttl.return_value = ttl_time
        
        # Mock DynamoDB table
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        
        # Create session
        session = create_session(language='en')
        
        # Verify TTL was set
        self.assertEqual(session['ttl'], ttl_time)
        self.assertEqual(session['ttl'] - session['createdAt'], 24 * 3600)
        
        # Verify put_item was called with TTL
        mock_table_instance.put_item.assert_called_once()
        call_args = mock_table_instance.put_item.call_args
        item = call_args.kwargs['Item']
        self.assertIn('ttl', item)
        self.assertEqual(item['ttl'], ttl_time)
    
    def test_is_session_expired_with_expired_session(self):
        """Test that expired sessions are correctly identified."""
        # Create session metadata with expired TTL
        current_time = int(time.time())
        expired_ttl = current_time - 3600  # Expired 1 hour ago
        
        session_metadata = {
            'sessionId': 'test-session',
            'createdAt': current_time - (25 * 3600),  # Created 25 hours ago
            'ttl': expired_ttl
        }
        
        # Check if expired
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            is_expired = is_session_expired(session_metadata)
        
        self.assertTrue(is_expired)
    
    def test_is_session_expired_with_active_session(self):
        """Test that active sessions are not marked as expired."""
        # Create session metadata with future TTL
        current_time = int(time.time())
        future_ttl = current_time + (23 * 3600)  # Expires in 23 hours
        
        session_metadata = {
            'sessionId': 'test-session',
            'createdAt': current_time - 3600,  # Created 1 hour ago
            'ttl': future_ttl
        }
        
        # Check if expired
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            is_expired = is_session_expired(session_metadata)
        
        self.assertFalse(is_expired)
    
    def test_get_session_time_remaining(self):
        """Test calculation of remaining session time."""
        current_time = int(time.time())
        ttl = current_time + (5 * 3600)  # 5 hours remaining
        
        session_metadata = {
            'sessionId': 'test-session',
            'ttl': ttl
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            remaining = get_session_time_remaining(session_metadata)
        
        # Should be approximately 5 hours (18000 seconds)
        self.assertAlmostEqual(remaining, 5 * 3600, delta=5)
    
    def test_get_session_time_remaining_expired(self):
        """Test that expired sessions return 0 remaining time."""
        current_time = int(time.time())
        ttl = current_time - 3600  # Expired 1 hour ago
        
        session_metadata = {
            'sessionId': 'test-session',
            'ttl': ttl
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            remaining = get_session_time_remaining(session_metadata)
        
        self.assertEqual(remaining, 0)
    
    def test_should_show_expiration_warning(self):
        """Test that expiration warning is shown when 1 hour remains."""
        current_time = int(time.time())
        ttl = current_time + 1800  # 30 minutes remaining
        
        session_metadata = {
            'sessionId': 'test-session',
            'ttl': ttl
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            show_warning = should_show_expiration_warning(session_metadata)
        
        self.assertTrue(show_warning)
    
    def test_no_warning_when_plenty_of_time(self):
        """Test that no warning is shown when plenty of time remains."""
        current_time = int(time.time())
        ttl = current_time + (5 * 3600)  # 5 hours remaining
        
        session_metadata = {
            'sessionId': 'test-session',
            'ttl': ttl
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            show_warning = should_show_expiration_warning(session_metadata)
        
        self.assertFalse(show_warning)
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_get_session_info_expired(self, mock_table):
        """Test getting info for an expired session."""
        current_time = int(time.time())
        expired_ttl = current_time - 3600
        
        # Mock DynamoDB response
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        mock_table_instance.get_item.return_value = {
            'Item': {
                'sessionId': 'test-session',
                'createdAt': current_time - (25 * 3600),
                'lastAccessedAt': current_time - (2 * 3600),
                'ttl': expired_ttl,
                'messageCount': 5
            }
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            info = get_session_info('test-session')
        
        self.assertTrue(info['exists'])
        self.assertTrue(info['expired'])
        self.assertEqual(info['timeRemaining'], 0)
        self.assertFalse(info['showWarning'])


class TestDataDeletion(unittest.TestCase):
    """Test data deletion functionality.
    
    Validates Requirement 7.3: Platform shall not store PII beyond session duration.
    Validates Requirement 7.6: Database shall automatically delete all associated user data.
    """
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_delete_session_data_removes_all_items(self, mock_table):
        """Test that delete_session_data removes all session items."""
        session_id = 'test-session-123'
        
        # Mock DynamoDB table
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        
        # Mock query response with multiple items
        mock_table_instance.query.return_value = {
            'Items': [
                {'PK': f'SESSION#{session_id}', 'SK': 'METADATA'},
                {'PK': f'SESSION#{session_id}', 'SK': 'MESSAGE#1704067200000'},
                {'PK': f'SESSION#{session_id}', 'SK': 'MESSAGE#1704067300000'},
                {'PK': f'SESSION#{session_id}', 'SK': 'MESSAGE#1704067400000'}
            ]
        }
        
        # Delete session
        success = delete_session_data(session_id)
        
        # Verify success
        self.assertTrue(success)
        
        # Verify query was called
        mock_table_instance.query.assert_called_once()
        
        # Verify delete_item was called for each item
        self.assertEqual(mock_table_instance.delete_item.call_count, 4)
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_delete_session_data_handles_empty_session(self, mock_table):
        """Test that deleting non-existent session doesn't fail."""
        session_id = 'non-existent-session'
        
        # Mock DynamoDB table
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        
        # Mock empty query response
        mock_table_instance.query.return_value = {
            'Items': []
        }
        
        # Delete session
        success = delete_session_data(session_id)
        
        # Should still return success
        self.assertTrue(success)
        
        # Verify no delete_item calls
        mock_table_instance.delete_item.assert_not_called()
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_delete_session_data_handles_errors(self, mock_table):
        """Test that delete_session_data handles errors gracefully."""
        session_id = 'test-session'
        
        # Mock DynamoDB table to raise exception
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        mock_table_instance.query.side_effect = Exception('DynamoDB error')
        
        # Delete session
        success = delete_session_data(session_id)
        
        # Should return False on error
        self.assertFalse(success)
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_update_session_access_time(self, mock_table):
        """Test that session access time is updated."""
        session_id = 'test-session'
        current_time = int(time.time())
        
        # Mock DynamoDB table
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            success = update_session_access_time(session_id)
        
        # Verify success
        self.assertTrue(success)
        
        # Verify update_item was called
        mock_table_instance.update_item.assert_called_once()
        call_args = mock_table_instance.update_item.call_args
        
        # Verify correct key
        self.assertEqual(call_args.kwargs['Key']['PK'], f'SESSION#{session_id}')
        self.assertEqual(call_args.kwargs['Key']['SK'], 'METADATA')
        
        # Verify timestamp was updated
        self.assertIn(':timestamp', call_args.kwargs['ExpressionAttributeValues'])
        self.assertEqual(
            call_args.kwargs['ExpressionAttributeValues'][':timestamp'],
            current_time
        )


class TestPIIHandling(unittest.TestCase):
    """Test PII detection and sanitization.
    
    Validates Requirement 7.3: Platform shall not store PII beyond session duration.
    """
    
    def test_detect_aadhaar_number(self):
        """Test detection of Aadhaar numbers."""
        text = "My Aadhaar number is 1234 5678 9012"
        detected = detect_pii(text)
        
        self.assertIn('aadhaar', detected)
    
    def test_detect_pan_number(self):
        """Test detection of PAN card numbers."""
        text = "My PAN is ABCDE1234F"
        detected = detect_pii(text)
        
        self.assertIn('pan', detected)
    
    def test_detect_phone_number(self):
        """Test detection of phone numbers."""
        text = "Call me at 9876543210"
        detected = detect_pii(text)
        
        self.assertIn('phone', detected)
    
    def test_detect_email_address(self):
        """Test detection of email addresses."""
        text = "Email me at user@example.com"
        detected = detect_pii(text)
        
        self.assertIn('email', detected)
    
    def test_detect_multiple_pii_types(self):
        """Test detection of multiple PII types in one text."""
        text = "Contact: user@example.com, 9876543210, PAN: ABCDE1234F"
        detected = detect_pii(text)
        
        self.assertIn('email', detected)
        self.assertIn('phone', detected)
        self.assertIn('pan', detected)
    
    def test_sanitize_aadhaar_number(self):
        """Test sanitization of Aadhaar numbers."""
        text = "My Aadhaar is 1234 5678 9012"
        sanitized = sanitize_pii(text)
        
        self.assertNotIn('1234 5678 9012', sanitized)
        self.assertIn('[AADHAAR_REDACTED]', sanitized)
    
    def test_sanitize_pan_number(self):
        """Test sanitization of PAN numbers."""
        text = "PAN: ABCDE1234F"
        sanitized = sanitize_pii(text)
        
        self.assertNotIn('ABCDE1234F', sanitized)
        self.assertIn('[PAN_REDACTED]', sanitized)
    
    def test_sanitize_phone_number(self):
        """Test sanitization of phone numbers."""
        text = "Call 9876543210"
        sanitized = sanitize_pii(text)
        
        self.assertNotIn('9876543210', sanitized)
        self.assertIn('[PHONE_REDACTED]', sanitized)
    
    def test_sanitize_email_address(self):
        """Test sanitization of email addresses."""
        text = "Email: user@example.com"
        sanitized = sanitize_pii(text)
        
        self.assertNotIn('user@example.com', sanitized)
        self.assertIn('[EMAIL_REDACTED]', sanitized)
    
    def test_sanitize_message_content(self):
        """Test sanitization of message content before storage."""
        message = "Hi, my email is user@example.com and phone is 9876543210"
        sanitized = sanitize_message_content(message)
        
        # Should not contain original PII
        self.assertNotIn('user@example.com', sanitized)
        self.assertNotIn('9876543210', sanitized)
        
        # Should contain redacted markers
        self.assertIn('[EMAIL_REDACTED]', sanitized)
        self.assertIn('[PHONE_REDACTED]', sanitized)
    
    def test_filter_essential_fields(self):
        """Test filtering to only essential eligibility fields."""
        user_info = {
            'age': 30,
            'gender': 'male',
            'income': 250000,
            'state': 'Maharashtra',
            'aadhaar_number': '1234 5678 9012',  # Should be filtered out
            'phone_number': '9876543210',  # Should be filtered out
            'email': 'user@example.com'  # Should be filtered out
        }
        
        filtered = filter_essential_fields(user_info)
        
        # Should contain essential fields
        self.assertIn('age', filtered)
        self.assertIn('gender', filtered)
        self.assertIn('income', filtered)
        self.assertIn('state', filtered)
        
        # Should not contain non-essential fields
        self.assertNotIn('aadhaar_number', filtered)
        self.assertNotIn('phone_number', filtered)
        self.assertNotIn('email', filtered)
    
    def test_remove_prohibited_fields(self):
        """Test removal of prohibited PII fields."""
        data = {
            'age': 30,
            'income': 250000,
            'aadhaar_number': '1234567890',
            'pan_number': 'ABCDE1234F',
            'phone_number': '9876543210',
            'bank_account': '1234567890'
        }
        
        cleaned = remove_prohibited_fields(data)
        
        # Should contain allowed fields
        self.assertIn('age', cleaned)
        self.assertIn('income', cleaned)
        
        # Should not contain prohibited fields
        for field in PROHIBITED_FIELDS:
            self.assertNotIn(field, cleaned)
    
    def test_anonymize_user_info(self):
        """Test complete anonymization of user info."""
        user_info = {
            'age': 30,
            'gender': 'male',
            'income': 250000,
            'state': 'Maharashtra',
            'occupation': 'farmer',
            'aadhaar_number': '1234 5678 9012',
            'phone_number': '9876543210',
            'notes': 'Contact at user@example.com'
        }
        
        anonymized = anonymize_user_info(user_info)
        
        # Should contain essential fields
        self.assertIn('age', anonymized)
        self.assertIn('gender', anonymized)
        self.assertIn('income', anonymized)
        
        # Should not contain prohibited fields
        self.assertNotIn('aadhaar_number', anonymized)
        self.assertNotIn('phone_number', anonymized)
        
        # Should not contain non-essential fields
        self.assertNotIn('notes', anonymized)
    
    def test_validate_data_minimization_passes(self):
        """Test that minimal data passes validation."""
        minimal_data = {
            'age': 30,
            'gender': 'male',
            'income': 250000,
            'state': 'Maharashtra'
        }
        
        is_valid = validate_data_minimization(minimal_data)
        
        self.assertTrue(is_valid)
    
    def test_validate_data_minimization_fails_with_prohibited_fields(self):
        """Test that data with prohibited fields fails validation."""
        data_with_pii = {
            'age': 30,
            'aadhaar_number': '1234567890',
            'phone_number': '9876543210'
        }
        
        is_valid = validate_data_minimization(data_with_pii)
        
        self.assertFalse(is_valid)
    
    def test_get_data_retention_info(self):
        """Test retrieval of data retention policy information."""
        info = get_data_retention_info()
        
        # Verify key information is present
        self.assertIn('sessionDuration', info)
        self.assertEqual(info['sessionDuration'], '24 hours')
        
        self.assertIn('automaticDeletion', info)
        self.assertTrue(info['automaticDeletion'])
        
        self.assertIn('piiStorage', info)
        self.assertIn('None', info['piiStorage'])
        
        self.assertIn('dataMinimization', info)
        self.assertIn('userControl', info)
        self.assertIn('encryption', info)


class TestPrivacyIntegration(unittest.TestCase):
    """Integration tests for privacy features."""
    
    def test_essential_fields_list_is_minimal(self):
        """Test that essential fields list contains only necessary fields."""
        # Should not contain more than 15 fields
        self.assertLessEqual(len(ESSENTIAL_ELIGIBILITY_FIELDS), 15)
        
        # Should not contain any prohibited fields
        for field in ESSENTIAL_ELIGIBILITY_FIELDS:
            self.assertNotIn(field, PROHIBITED_FIELDS)
    
    def test_prohibited_fields_list_is_comprehensive(self):
        """Test that prohibited fields list covers common PII."""
        # Should contain at least 8 prohibited fields
        self.assertGreaterEqual(len(PROHIBITED_FIELDS), 8)
        
        # Should include common PII types
        pii_keywords = ['aadhaar', 'pan', 'phone', 'email', 'address', 'account']
        found_keywords = 0
        
        for field in PROHIBITED_FIELDS:
            for keyword in pii_keywords:
                if keyword in field.lower():
                    found_keywords += 1
                    break
        
        # At least 6 of the keywords should be covered
        self.assertGreaterEqual(found_keywords, 6)
    
    def test_session_ttl_matches_requirement(self):
        """Test that session TTL matches 24-hour requirement."""
        # Requirement 7.2: automatic expiration after 24 hours
        self.assertEqual(SESSION_TTL_HOURS, 24)
        
        # TTL timestamp should be 24 hours from now
        current_time = int(time.time())
        ttl = get_ttl_timestamp(SESSION_TTL_HOURS)
        
        expected_ttl = current_time + (24 * 3600)
        self.assertAlmostEqual(ttl, expected_ttl, delta=5)
    
    @patch('shared.session_manager.get_dynamodb_table')
    def test_complete_privacy_workflow(self, mock_table):
        """Test complete privacy workflow: create, use, expire, delete."""
        # Mock DynamoDB
        mock_table_instance = MagicMock()
        mock_table.return_value = mock_table_instance
        
        current_time = int(time.time())
        
        # 1. Create session with TTL
        with patch('shared.session_manager.get_current_timestamp', return_value=current_time):
            with patch('shared.session_manager.get_ttl_timestamp', return_value=current_time + 86400):
                session = create_session(language='hi')
        
        # Verify TTL is set
        self.assertIn('ttl', session)
        self.assertEqual(session['ttl'], current_time + 86400)
        
        # 2. Simulate session near expiration
        near_expiry_time = current_time + 86400 - 1800  # 30 minutes before expiry
        session_metadata = {
            'sessionId': session['sessionId'],
            'createdAt': current_time,
            'ttl': current_time + 86400
        }
        
        with patch('shared.session_manager.get_current_timestamp', return_value=near_expiry_time):
            show_warning = should_show_expiration_warning(session_metadata)
        
        # Should show warning
        self.assertTrue(show_warning)
        
        # 3. Simulate session expiration
        expired_time = current_time + 86400 + 3600  # 1 hour after expiry
        
        with patch('shared.session_manager.get_current_timestamp', return_value=expired_time):
            is_expired = is_session_expired(session_metadata)
        
        # Should be expired
        self.assertTrue(is_expired)
        
        # 4. Delete session data
        mock_table_instance.query.return_value = {
            'Items': [
                {'PK': f'SESSION#{session["sessionId"]}', 'SK': 'METADATA'}
            ]
        }
        
        success = delete_session_data(session['sessionId'])
        
        # Should successfully delete
        self.assertTrue(success)
        mock_table_instance.delete_item.assert_called()


if __name__ == '__main__':
    unittest.main()
