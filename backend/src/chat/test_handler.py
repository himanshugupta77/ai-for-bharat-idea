"""Unit tests for Chat Lambda handler."""

import json
import os
import sys
import unittest
from unittest.mock import Mock, patch, MagicMock
from hypothesis import given, strategies as st, settings, assume

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from chat.handler import (
    detect_language,
    build_prompt,
    extract_schemes,
    get_session_context,
    get_relevant_schemes,
    lambda_handler
)
from shared.models import SupportedLanguage


class TestChatHandler(unittest.TestCase):
    """Test cases for chat handler functions."""
    
    def test_detect_language_english(self):
        """Test language detection for English text."""
        text = "Hello, I need help with government schemes"
        result = detect_language(text)
        self.assertEqual(result, 'en')
    
    def test_detect_language_hindi(self):
        """Test language detection for Hindi text."""
        text = "मुझे सरकारी योजनाओं के बारे में जानकारी चाहिए"
        result = detect_language(text)
        self.assertEqual(result, 'hi')
    
    def test_build_prompt_without_schemes(self):
        """Test prompt building without scheme context."""
        message = "Tell me about agriculture schemes"
        context = []
        
        prompt = build_prompt(message, context)
        
        self.assertIn("Bharat Sahayak", prompt)
        self.assertIn(message, prompt)
        self.assertIn("agriculture", prompt)
    
    def test_build_prompt_with_schemes(self):
        """Test prompt building with scheme context."""
        message = "Tell me about agriculture schemes"
        context = []
        schemes = [
            {
                'schemeId': 'pm-kisan',
                'name': 'PM-KISAN',
                'category': 'agriculture',
                'description': 'Income support for farmers',
                'targetAudience': 'Small farmers'
            }
        ]
        
        prompt = build_prompt(message, context, schemes)
        
        self.assertIn("PM-KISAN", prompt)
        self.assertIn("agriculture", prompt)
        self.assertIn("Available Government Schemes", prompt)
    
    def test_build_prompt_with_context(self):
        """Test prompt building with conversation context."""
        message = "What are the eligibility criteria?"
        context = [
            {'role': 'user', 'content': 'Tell me about PM-KISAN'},
            {'role': 'assistant', 'content': 'PM-KISAN is a scheme for farmers'}
        ]
        
        prompt = build_prompt(message, context)
        
        self.assertIn("PM-KISAN", prompt)
        self.assertIn("eligibility criteria", prompt)
    
    @patch('chat.handler.get_dynamodb_table')
    def test_extract_schemes_with_pattern(self, mock_get_table):
        """Test scheme extraction with [SCHEME:id] pattern."""
        # Mock DynamoDB table
        mock_table = Mock()
        mock_table.get_item.return_value = {'Item': {}}
        mock_get_table.return_value = mock_table
        
        response = "I recommend [SCHEME:pm-kisan] for farmers and [SCHEME:mgnrega] for rural employment."
        schemes_db = [
            {
                'schemeId': 'pm-kisan',
                'name': 'PM-KISAN',
                'description': 'Income support',
                'targetAudience': 'Farmers',
                'applicationSteps': ['Step 1', 'Step 2']
            },
            {
                'schemeId': 'mgnrega',
                'name': 'MGNREGA',
                'description': 'Employment guarantee',
                'targetAudience': 'Rural workers',
                'applicationSteps': ['Step 1']
            }
        ]
        
        schemes = extract_schemes(response, schemes_db)
        
        self.assertEqual(len(schemes), 2)
        self.assertEqual(schemes[0].id, 'pm-kisan')
        self.assertEqual(schemes[1].id, 'mgnrega')
    
    def test_extract_schemes_no_pattern(self):
        """Test scheme extraction without pattern."""
        response = "There are various schemes available for farmers."
        schemes_db = []
        
        schemes = extract_schemes(response, schemes_db)
        
        self.assertEqual(len(schemes), 0)
    
    @patch('chat.handler.get_dynamodb_table')
    def test_get_session_context_success(self, mock_get_table):
        """Test successful session context retrieval."""
        mock_table = Mock()
        mock_table.query.return_value = {
            'Items': [
                {'role': 'user', 'content': 'Hello'},
                {'role': 'assistant', 'content': 'Hi there'}
            ]
        }
        mock_get_table.return_value = mock_table
        
        context = get_session_context(mock_table, 'test-session-id')
        
        self.assertEqual(len(context), 2)
        mock_table.query.assert_called_once()
    
    @patch('chat.handler.get_dynamodb_table')
    def test_get_session_context_error(self, mock_get_table):
        """Test session context retrieval with error."""
        mock_table = Mock()
        mock_table.query.side_effect = Exception("DynamoDB error")
        mock_get_table.return_value = mock_table
        
        context = get_session_context(mock_table, 'test-session-id')
        
        self.assertEqual(len(context), 0)
    
    @patch('chat.handler.get_dynamodb_table')
    def test_get_relevant_schemes_success(self, mock_get_table):
        """Test successful scheme retrieval."""
        mock_table = Mock()
        mock_table.scan.return_value = {
            'Items': [
                {'schemeId': 'pm-kisan', 'name': 'PM-KISAN'},
                {'schemeId': 'mgnrega', 'name': 'MGNREGA'}
            ]
        }
        mock_get_table.return_value = mock_table
        
        schemes = get_relevant_schemes(mock_table)
        
        self.assertEqual(len(schemes), 2)
        mock_table.scan.assert_called_once()


class TestChatHandlerPropertyBased(unittest.TestCase):
    """Property-based tests for chat handler."""
    
    @given(
        language=st.sampled_from(['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or']),
        message=st.text(min_size=1, max_size=100).filter(lambda x: x.strip())
    )
    @settings(max_examples=50, deadline=None)
    @patch('chat.handler.get_dynamodb_table')
    @patch('chat.handler.get_bedrock_client')
    @patch('chat.handler.get_translate_client')
    @patch('chat.handler.detect_language')
    @patch('chat.handler.call_bedrock')
    @patch('chat.handler.translate_text')
    def test_property_language_consistency(
        self,
        mock_translate,
        mock_bedrock,
        mock_detect_lang,
        mock_translate_client,
        mock_bedrock_client,
        mock_get_table,
        language,
        message
    ):
        """
        **Validates: Requirements 1.5, 1.6**
        
        Property: Language consistency - When a user sends a message in a specific 
        language, the response should be returned in that same language.
        
        This property should hold for all 11 supported languages:
        en, hi, mr, ta, te, bn, gu, kn, ml, pa, or
        """
        # Setup mocks
        mock_table = Mock()
        mock_table.query.return_value = {'Items': []}
        mock_table.scan.return_value = {'Items': []}
        mock_table.put_item.return_value = {}
        mock_table.update_item.return_value = {}
        mock_get_table.return_value = mock_table
        
        # Mock Bedrock response
        mock_bedrock.return_value = "This is a helpful response about government schemes."
        
        # Mock language detection to return the input language
        mock_detect_lang.return_value = language
        
        # Mock translation behavior
        def translate_side_effect(text, source_lang, target_lang, correlation_id=None):
            # If translating to English, return English text
            if target_lang == 'en':
                return "This is a helpful response about government schemes."
            # If translating from English to user language, return translated text
            elif source_lang == 'en':
                return f"[{target_lang}] This is a helpful response about government schemes."
            # Same language, return as-is
            return text
        
        mock_translate.side_effect = translate_side_effect
        
        # Create test event
        event = {
            'body': json.dumps({
                'message': message,
                'language': language
            }),
            'headers': {
                'X-Session-Id': 'test-session-123'
            },
            'requestContext': {
                'identity': {
                    'sourceIp': '127.0.0.1'
                },
                'requestId': 'test-request-123'
            }
        }
        
        context = Mock()
        
        # Call the handler
        response = lambda_handler(event, context)
        
        # Parse response
        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        
        # Property assertion: Response language must match input language
        self.assertEqual(
            body['language'],
            language,
            f"Response language {body['language']} does not match input language {language}"
        )
        
        # Additional consistency check: If language is not English, 
        # the response should contain the language marker
        if language != 'en':
            self.assertIn(
                f"[{language}]",
                body['response'],
                f"Response for language {language} should contain language marker"
            )


if __name__ == '__main__':
    unittest.main()
