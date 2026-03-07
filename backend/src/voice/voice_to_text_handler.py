"""Voice-to-Text Lambda function handler."""

import base64
import json
import os
import sys
import time
import uuid
from typing import Any, Dict

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.models import VoiceToTextRequest, VoiceToTextResponse
from shared.utils import (
    handle_exceptions,
    parse_request_body,
    get_s3_client,
    get_transcribe_client,
    create_response,
    create_error_response,
    validate_audio_format,
    logger
)


@handle_exceptions
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Transcribe audio to text using Amazon Transcribe.
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response with transcript
    """
    # Parse and validate request
    body = parse_request_body(event)
    
    # Validate audio format
    audio_format = validate_audio_format(body.get('format', ''))
    
    # Validate audio data is present
    audio_data = body.get('audioData', '')
    if not audio_data:
        return create_error_response(
            400,
            'ValidationError',
            'audioData field is required'
        )
    
    # Create validated request
    request = VoiceToTextRequest(audioData=audio_data, format=audio_format)
    
    # Decode base64 audio data
    try:
        audio_bytes = base64.b64decode(request.audioData)
    except Exception as e:
        logger.error(f"Failed to decode audio data: {e}")
        return create_error_response(
            400,
            'InvalidAudioData',
            'Audio data must be valid base64-encoded string'
        )
    
    # Check audio size (max 10MB)
    if len(audio_bytes) > 10 * 1024 * 1024:
        return create_error_response(
            413,
            'PayloadTooLarge',
            'Audio file exceeds maximum size of 10MB',
            retry_after=None
        )
    
    # Upload to S3 temporary bucket
    s3_key = None
    
    try:
        s3_key = upload_to_s3(audio_bytes, request.format)
        
        # Start transcription job
        job_name = start_transcription_job(s3_key, request.format)
        
        # Wait for completion
        transcript, language, confidence = wait_for_transcription(job_name)
        
        # Create response
        response = VoiceToTextResponse(
            transcript=transcript,
            detectedLanguage=language,
            confidence=confidence
        )
        
        return create_response(200, response.dict())
    
    except ValueError as e:
        # Handle audio quality errors
        error_msg = str(e)
        if "Audio quality is too low" in error_msg:
            return create_error_response(
                400,
                'AudioQualityError',
                error_msg
            )
        raise
        
    finally:
        # Clean up S3 object
        if s3_key:
            delete_from_s3(s3_key)


def upload_to_s3(audio_bytes: bytes, format: str) -> str:
    """Upload audio to S3 temporary bucket with 1-hour expiration."""
    s3_client = get_s3_client()
    bucket_name = os.environ.get('S3_TEMP_BUCKET')
    
    if not bucket_name:
        raise ValueError("S3_TEMP_BUCKET environment variable not set")
    
    # Generate unique key
    file_extension = format
    s3_key = f'audio/{uuid.uuid4()}.{file_extension}'
    
    # Calculate expiration time (1 hour from now)
    from datetime import datetime, timedelta
    expiration = datetime.utcnow() + timedelta(hours=1)
    
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=audio_bytes,
            ContentType=f'audio/{format}',
            Expires=expiration,
            Metadata={
                'ttl': str(int(expiration.timestamp()))
            }
        )
        
        logger.info(f"Uploaded audio to s3://{bucket_name}/{s3_key} with 1-hour TTL")
        return s3_key
        
    except Exception as e:
        logger.error(f"Failed to upload to S3: {e}")
        raise


def start_transcription_job(s3_key: str, format: str) -> str:
    """Start Amazon Transcribe job."""
    transcribe_client = get_transcribe_client()
    bucket_name = os.environ.get('S3_TEMP_BUCKET')
    
    job_name = f'transcribe-{uuid.uuid4()}'
    
    # Map format to Transcribe media format
    media_format_map = {
        'webm': 'webm',
        'mp3': 'mp3',
        'wav': 'wav'
    }
    
    media_format = media_format_map.get(format, 'mp3')
    
    try:
        transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={
                'MediaFileUri': f's3://{bucket_name}/{s3_key}'
            },
            MediaFormat=media_format,
            IdentifyLanguage=True,
            LanguageOptions=[
                'en-IN', 'hi-IN', 'mr-IN', 'ta-IN', 'te-IN',
                'bn-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN'
            ]
        )
        
        logger.info(f"Started transcription job: {job_name}")
        return job_name
        
    except Exception as e:
        logger.error(f"Failed to start transcription job: {e}")
        raise


def wait_for_transcription(job_name: str, max_wait: int = 30) -> tuple:
    """
    Wait for transcription job to complete.
    
    Args:
        job_name: Transcription job name
        max_wait: Maximum wait time in seconds
    
    Returns:
        Tuple of (transcript, language, confidence)
    """
    transcribe_client = get_transcribe_client()
    
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            response = transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            
            status = response['TranscriptionJob']['TranscriptionJobStatus']
            
            if status == 'COMPLETED':
                # Get transcript
                transcript_uri = response['TranscriptionJob']['Transcript']['TranscriptFileUri']
                transcript_data = get_transcript_from_uri(transcript_uri)
                
                # Extract transcript text
                transcripts = transcript_data['results'].get('transcripts', [])
                if not transcripts or not transcripts[0].get('transcript'):
                    logger.warning("Empty transcript received")
                    raise ValueError(
                        "No speech detected in audio. Please speak clearly and try again."
                    )
                
                transcript = transcripts[0]['transcript']
                
                # Get detected language
                language_code = response['TranscriptionJob'].get('LanguageCode', 'en-IN')
                language = language_code.split('-')[0]  # Extract language code (e.g., 'en' from 'en-IN')
                
                # Get confidence (average of all items)
                items = transcript_data['results'].get('items', [])
                confidences = [
                    float(item.get('alternatives', [{}])[0].get('confidence', 0))
                    for item in items
                    if 'alternatives' in item
                ]
                confidence = sum(confidences) / len(confidences) if confidences else 0.0
                
                # Check if confidence is too low (audio quality issue)
                if confidence < 0.5:
                    logger.warning(f"Low confidence transcription: {confidence}")
                    raise ValueError(
                        f"Audio quality is too low for transcription (confidence: {confidence:.2f}). "
                        "Please speak clearly and try again."
                    )
                
                logger.info(f"Transcription completed: {transcript[:50]}... (confidence: {confidence:.2f})")
                return transcript, language, confidence
                
            elif status == 'FAILED':
                failure_reason = response['TranscriptionJob'].get('FailureReason', 'Unknown')
                logger.error(f"Transcription failed: {failure_reason}")
                raise ValueError(f"Transcription failed: {failure_reason}")
            
            # Wait before polling again
            time.sleep(1)
            
        except Exception as e:
            logger.error(f"Error checking transcription status: {e}")
            raise
    
    # Timeout
    logger.error(f"Transcription timeout after {max_wait}s")
    raise TimeoutError(f"Transcription did not complete within {max_wait} seconds")


def get_transcript_from_uri(uri: str) -> dict:
    """Fetch transcript JSON from URI."""
    import urllib.request
    
    try:
        with urllib.request.urlopen(uri) as response:
            return json.loads(response.read())
    except Exception as e:
        logger.error(f"Failed to fetch transcript: {e}")
        raise


def delete_from_s3(s3_key: str):
    """Delete audio file from S3."""
    s3_client = get_s3_client()
    bucket_name = os.environ.get('S3_TEMP_BUCKET')
    
    try:
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=s3_key
        )
        logger.info(f"Deleted s3://{bucket_name}/{s3_key}")
    except Exception as e:
        logger.warning(f"Failed to delete S3 object: {e}")
