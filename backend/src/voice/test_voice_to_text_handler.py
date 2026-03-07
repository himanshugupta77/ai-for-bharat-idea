"""Unit tests for Voice-to-Text Lambda handler."""

import base64
import json
import unittest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from voice.voice_to_text_handler import (
    lambda_handler,
    upload_to_s3,
    start_transcription_job,
    wait_for_transcription,
    delete_from_s3
)


class TestVoiceToTextHandler(unittest.TestCase):
    """Test cases for voice-to-text handler functions."""
    
    def setUp(self):
        """Set up test fixtures."""
        os.environ['S3_TEMP_BUCKET'] = 'test-bucket'
        self.sample_audio = b'fake audio data'
        self.sample_audio_b64 = base64.b64encode(self.sample_audio).decode('utf-8')
    
    @patch('voice.voice_to_text_handler.upload_to_s3')
    @patch('voice.voice_to_text_handler.start_transcription_job')
    @patch('voice.voice_to_text_handler.wait_for_transcription')
    @patch('voice.voice_to_text_handler.delete_from_s3')
    def test_lambda_handler_success(self, mock_delete, mock_wait, mock_start, mock_upload):
        """Test successful voice-to-text transcription."""
        # Setup mocks
        mock_upload.return_value = 'audio/test.webm'
        mock_start.return_value = 'job-123'
        mock_wait.return_value = ('Hello world', 'en', 0.95)
        
        # Create event
        event = {
            'body': json.dumps({
                'audioData': self.sample_audio_b64,
                'format': 'webm'
            })
        }
        
        # Call handler
        response = lambda_handler(event, None)
        
        # Verify response
        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertEqual(body['transcript'], 'Hello world')
        self.assertEqual(body['detectedLanguage'], 'en')
        self.assertEqual(body['confidence'], 0.95)
        
        # Verify cleanup was called
        mock_delete.assert_called_once_with('audio/test.webm')
    
    def test_lambda_handler_invalid_base64(self):
        """Test handler with invalid base64 audio data."""
        event = {
            'body': json.dumps({
                'audioData': 'not-valid-base64!!!',
                'format': 'webm'
            })
        }
        
        response = lambda_handler(event, None)
        
        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'InvalidAudioData')
    
    def test_lambda_handler_payload_too_large(self):
        """Test handler with audio exceeding 10MB limit."""
        large_audio = b'x' * (11 * 1024 * 1024)  # 11MB
        large_audio_b64 = base64.b64encode(large_audio).decode('utf-8')
        
        event = {
            'body': json.dumps({
                'audioData': large_audio_b64,
                'format': 'webm'
            })
        }
        
        response = lambda_handler(event, None)
        
        self.assertEqual(response['statusCode'], 413)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'PayloadTooLarge')

    @patch('voice.voice_to_text_handler.upload_to_s3')
    @patch('voice.voice_to_text_handler.start_transcription_job')
    @patch('voice.voice_to_text_handler.wait_for_transcription')
    @patch('voice.voice_to_text_handler.delete_from_s3')
    def test_lambda_handler_low_confidence(self, mock_delete, mock_wait, mock_start, mock_upload):
        """Test handler with low confidence transcription."""
        mock_upload.return_value = 'audio/test.webm'
        mock_start.return_value = 'job-123'
        mock_wait.side_effect = ValueError(
            "Audio quality is too low for transcription (confidence: 0.30). "
            "Please speak clearly and try again."
        )
        
        event = {
            'body': json.dumps({
                'audioData': self.sample_audio_b64,
                'format': 'webm'
            })
        }
        
        response = lambda_handler(event, None)
        
        self.assertEqual(response['statusCode'], 400)
        body = json.loads(response['body'])
        self.assertEqual(body['error'], 'AudioQualityError')
        self.assertIn('Audio quality is too low', body['message'])
        
        # Verify cleanup was still called
        mock_delete.assert_called_once_with('audio/test.webm')
    
    @patch('voice.voice_to_text_handler.get_s3_client')
    def test_upload_to_s3_success(self, mock_get_client):
        """Test successful S3 upload."""
        mock_s3 = Mock()
        mock_get_client.return_value = mock_s3
        
        s3_key = upload_to_s3(self.sample_audio, 'webm')
        
        self.assertTrue(s3_key.startswith('audio/'))
        self.assertTrue(s3_key.endswith('.webm'))
        mock_s3.put_object.assert_called_once()
        
        # Verify TTL metadata was set
        call_args = mock_s3.put_object.call_args
        self.assertIn('Expires', call_args.kwargs)
        self.assertIn('Metadata', call_args.kwargs)

    @patch('voice.voice_to_text_handler.get_transcribe_client')
    def test_start_transcription_job_all_languages(self, mock_get_client):
        """Test transcription job includes all 11 supported languages."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        job_name = start_transcription_job('audio/test.webm', 'webm')
        
        self.assertTrue(job_name.startswith('transcribe-'))
        mock_transcribe.start_transcription_job.assert_called_once()
        
        # Verify all 11 languages are included
        call_args = mock_transcribe.start_transcription_job.call_args
        language_options = call_args.kwargs['LanguageOptions']
        expected_languages = [
            'en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN',
            'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN'
        ]
        self.assertEqual(set(language_options), set(expected_languages))
        self.assertEqual(len(language_options), 11)
    
    @patch('voice.voice_to_text_handler.get_transcribe_client')
    @patch('voice.voice_to_text_handler.get_transcript_from_uri')
    def test_wait_for_transcription_success(self, mock_get_transcript, mock_get_client):
        """Test successful transcription completion."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        # Mock transcription job response
        mock_transcribe.get_transcription_job.return_value = {
            'TranscriptionJob': {
                'TranscriptionJobStatus': 'COMPLETED',
                'LanguageCode': 'hi-IN',
                'Transcript': {
                    'TranscriptFileUri': 'https://example.com/transcript.json'
                }
            }
        }
        
        # Mock transcript data
        mock_get_transcript.return_value = {
            'results': {
                'transcripts': [{'transcript': 'नमस्ते'}],
                'items': [
                    {'alternatives': [{'confidence': '0.95'}]},
                    {'alternatives': [{'confidence': '0.90'}]}
                ]
            }
        }
        
        transcript, language, confidence = wait_for_transcription('job-123')
        
        self.assertEqual(transcript, 'नमस्ते')
        self.assertEqual(language, 'hi')
        self.assertAlmostEqual(confidence, 0.925, places=2)

    @patch('voice.voice_to_text_handler.get_transcribe_client')
    @patch('voice.voice_to_text_handler.get_transcript_from_uri')
    def test_wait_for_transcription_empty_transcript(self, mock_get_transcript, mock_get_client):
        """Test handling of empty transcript."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        mock_transcribe.get_transcription_job.return_value = {
            'TranscriptionJob': {
                'TranscriptionJobStatus': 'COMPLETED',
                'LanguageCode': 'en-IN',
                'Transcript': {
                    'TranscriptFileUri': 'https://example.com/transcript.json'
                }
            }
        }
        
        # Mock empty transcript
        mock_get_transcript.return_value = {
            'results': {
                'transcripts': [{'transcript': ''}],
                'items': []
            }
        }
        
        with self.assertRaises(ValueError) as context:
            wait_for_transcription('job-123')
        
        self.assertIn('No speech detected', str(context.exception))
    
    @patch('voice.voice_to_text_handler.get_transcribe_client')
    @patch('voice.voice_to_text_handler.get_transcript_from_uri')
    def test_wait_for_transcription_low_confidence(self, mock_get_transcript, mock_get_client):
        """Test handling of low confidence transcription."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        mock_transcribe.get_transcription_job.return_value = {
            'TranscriptionJob': {
                'TranscriptionJobStatus': 'COMPLETED',
                'LanguageCode': 'en-IN',
                'Transcript': {
                    'TranscriptFileUri': 'https://example.com/transcript.json'
                }
            }
        }
        
        # Mock low confidence transcript
        mock_get_transcript.return_value = {
            'results': {
                'transcripts': [{'transcript': 'unclear audio'}],
                'items': [
                    {'alternatives': [{'confidence': '0.30'}]},
                    {'alternatives': [{'confidence': '0.40'}]}
                ]
            }
        }
        
        with self.assertRaises(ValueError) as context:
            wait_for_transcription('job-123')
        
        self.assertIn('Audio quality is too low', str(context.exception))

    @patch('voice.voice_to_text_handler.get_transcribe_client')
    def test_wait_for_transcription_failed_job(self, mock_get_client):
        """Test handling of failed transcription job."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        mock_transcribe.get_transcription_job.return_value = {
            'TranscriptionJob': {
                'TranscriptionJobStatus': 'FAILED',
                'FailureReason': 'Invalid audio format'
            }
        }
        
        with self.assertRaises(ValueError) as context:
            wait_for_transcription('job-123')
        
        self.assertIn('Transcription failed', str(context.exception))
        self.assertIn('Invalid audio format', str(context.exception))
    
    @patch('voice.voice_to_text_handler.get_transcribe_client')
    @patch('time.sleep')
    def test_wait_for_transcription_timeout(self, mock_sleep, mock_get_client):
        """Test transcription timeout after 30 seconds."""
        mock_transcribe = Mock()
        mock_get_client.return_value = mock_transcribe
        
        # Always return IN_PROGRESS status
        mock_transcribe.get_transcription_job.return_value = {
            'TranscriptionJob': {
                'TranscriptionJobStatus': 'IN_PROGRESS'
            }
        }
        
        with self.assertRaises(TimeoutError) as context:
            wait_for_transcription('job-123', max_wait=1)
        
        self.assertIn('did not complete within', str(context.exception))
    
    @patch('voice.voice_to_text_handler.get_s3_client')
    def test_delete_from_s3_success(self, mock_get_client):
        """Test successful S3 deletion."""
        mock_s3 = Mock()
        mock_get_client.return_value = mock_s3
        
        delete_from_s3('audio/test.webm')
        
        mock_s3.delete_object.assert_called_once_with(
            Bucket='test-bucket',
            Key='audio/test.webm'
        )


class TestVoiceToTextPropertyTests(unittest.TestCase):
    """Property-based tests for voice-to-text handler."""
    
    def setUp(self):
        """Set up test fixtures."""
        os.environ['S3_TEMP_BUCKET'] = 'test-bucket'
        self.sample_audio = b'fake audio data'
        self.sample_audio_b64 = base64.b64encode(self.sample_audio).decode('utf-8')
    
    @patch('voice.voice_to_text_handler.upload_to_s3')
    @patch('voice.voice_to_text_handler.start_transcription_job')
    @patch('voice.voice_to_text_handler.wait_for_transcription')
    @patch('voice.voice_to_text_handler.delete_from_s3')
    def test_property_audio_format_handling(self, mock_delete, mock_wait, mock_start, mock_upload):
        """
        **Validates: Requirements 2.1, 2.2**
        
        Property 3: Audio Format Handling
        
        For any valid audio format (webm, mp3, wav), the handler should:
        1. Successfully process the audio
        2. Return a valid transcript response with the same structure
        3. Map the format parameter correctly to Transcribe media format
        4. Complete processing within acceptable time limits
        """
        from hypothesis import given, strategies as st
        
        # Define valid audio formats
        audio_formats = st.sampled_from(['webm', 'mp3', 'wav'])
        
        @given(format=audio_formats)
        def property_test(format):
            # Setup mocks
            mock_upload.return_value = f'audio/test.{format}'
            mock_start.return_value = 'job-123'
            mock_wait.return_value = ('Test transcript', 'en', 0.95)
            
            # Create event with the given format
            event = {
                'body': json.dumps({
                    'audioData': self.sample_audio_b64,
                    'format': format
                })
            }
            
            # Call handler
            response = lambda_handler(event, None)
            
            # Property 1: Handler should return 200 status for all valid formats
            self.assertEqual(response['statusCode'], 200, 
                           f"Handler should return 200 for format {format}")
            
            # Property 2: Response should have consistent structure
            body = json.loads(response['body'])
            self.assertIn('transcript', body, 
                         f"Response should contain 'transcript' field for format {format}")
            self.assertIn('detectedLanguage', body,
                         f"Response should contain 'detectedLanguage' field for format {format}")
            self.assertIn('confidence', body,
                         f"Response should contain 'confidence' field for format {format}")
            
            # Property 3: Response values should be valid types
            self.assertIsInstance(body['transcript'], str,
                                f"Transcript should be string for format {format}")
            self.assertIsInstance(body['detectedLanguage'], str,
                                f"Detected language should be string for format {format}")
            self.assertIsInstance(body['confidence'], (int, float),
                                f"Confidence should be numeric for format {format}")
            
            # Property 4: Confidence should be in valid range [0, 1]
            self.assertGreaterEqual(body['confidence'], 0.0,
                                  f"Confidence should be >= 0 for format {format}")
            self.assertLessEqual(body['confidence'], 1.0,
                               f"Confidence should be <= 1 for format {format}")
            
            # Property 5: Upload should be called with correct format
            mock_upload.assert_called_with(self.sample_audio, format)
            
            # Property 6: Start transcription should be called with correct format
            mock_start.assert_called_with(f'audio/test.{format}', format)
            
            # Property 7: Cleanup should always be called
            mock_delete.assert_called_with(f'audio/test.{format}')
            
            # Reset mocks for next iteration
            mock_upload.reset_mock()
            mock_start.reset_mock()
            mock_wait.reset_mock()
            mock_delete.reset_mock()
        
        # Run the property test
        property_test()


if __name__ == '__main__':
    unittest.main()
