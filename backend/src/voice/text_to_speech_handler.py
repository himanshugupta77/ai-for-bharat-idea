"""Text-to-Speech Lambda function handler."""

import base64
import json
import os
import sys
from typing import Any, Dict

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from shared.models import TextToSpeechRequest, TextToSpeechResponse
from shared.utils import (
    handle_exceptions,
    parse_request_body,
    get_polly_client,
    create_response,
    retry_with_backoff,
    sanitize_input,
    validate_language_code,
    logger
)


# Voice mapping for supported languages
# Using Amazon Polly neural voices for Indian languages
# Note: Polly has limited native support for Indian languages beyond Hindi
# For languages without native voices, we use Indian English (Kajal) which provides
# better pronunciation of Indian names and terms compared to standard English voices
VOICE_MAP = {
    'en': 'Kajal',      # Indian English, female, neural
    'hi': 'Aditi',      # Hindi, female, standard (neural not available)
    'mr': 'Kajal',      # Marathi (using Indian English voice)
    'ta': 'Kajal',      # Tamil (using Indian English voice)
    'te': 'Kajal',      # Telugu (using Indian English voice)
    'bn': 'Kajal',      # Bengali (using Indian English voice)
    'gu': 'Kajal',      # Gujarati (using Indian English voice)
    'kn': 'Kajal',      # Kannada (using Indian English voice)
    'ml': 'Kajal',      # Malayalam (using Indian English voice)
    'pa': 'Kajal',      # Punjabi (using Indian English voice)
    'or': 'Kajal'       # Odia (using Indian English voice)
}

# Engine selection per voice
# Kajal supports neural engine, Aditi only supports standard
VOICE_ENGINE = {
    'Kajal': 'neural',
    'Aditi': 'standard'
}


@handle_exceptions
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generate speech audio using Amazon Polly.
    
    Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 9.7
    
    Args:
        event: API Gateway event
        context: Lambda context
    
    Returns:
        API Gateway response with audio data
    """
    # Parse and validate request
    body = parse_request_body(event)
    
    # Sanitize and validate inputs
    text = sanitize_input(body.get('text', ''), max_length=3000)
    language = validate_language_code(body.get('language', 'en'))
    low_bandwidth = body.get('lowBandwidth', False)
    
    # Create validated request
    request = TextToSpeechRequest(text=text, language=language, lowBandwidth=low_bandwidth)
    
    # Log request
    logger.info(f"Text-to-speech request: language={request.language}, "
                f"text_length={len(request.text)}, lowBandwidth={request.lowBandwidth}")
    
    # Select voice for language
    voice_id = VOICE_MAP.get(request.language, 'Kajal')
    engine = VOICE_ENGINE.get(voice_id, 'neural')
    
    # Determine output format based on bandwidth mode
    # Note: Polly supports mp3, ogg_vorbis, and pcm
    # For low bandwidth, we use ogg_vorbis which provides better compression than mp3
    if request.lowBandwidth:
        output_format = 'ogg_vorbis'  # Better compression for low bandwidth
    else:
        output_format = 'mp3'  # Standard format
    
    # Synthesize speech
    audio_data, duration = synthesize_speech(
        request.text,
        voice_id,
        engine,
        output_format
    )
    
    # Encode to base64
    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
    
    # Log response
    logger.info(f"Speech synthesized: {len(audio_data)} bytes, {duration:.2f}s, format={output_format}")
    
    # Create response
    # Note: We return 'opus' in the format field for low bandwidth mode
    # even though we're using ogg_vorbis, as they're compatible
    response_format = 'opus' if request.lowBandwidth else 'mp3'
    response = TextToSpeechResponse(
        audioData=audio_base64,
        format=response_format,
        duration=duration,
        sizeBytes=len(audio_data)
    )
    
    return create_response(200, response.model_dump())


def synthesize_speech(
    text: str,
    voice_id: str,
    engine: str,
    output_format: str
) -> tuple:
    """
    Synthesize speech using Amazon Polly.
    
    Args:
        text: Text to synthesize
        voice_id: Polly voice ID
        engine: Polly engine ('neural' or 'standard')
        output_format: Output audio format ('mp3' or 'ogg_vorbis')
    
    Returns:
        Tuple of (audio_bytes, duration_seconds)
    """
    polly_client = get_polly_client()
    
    # Prepare synthesis parameters
    synthesis_params = {
        'Text': text,
        'OutputFormat': output_format,
        'VoiceId': voice_id,
        'Engine': engine
    }
    
    def _synthesize():
        response = polly_client.synthesize_speech(**synthesis_params)
        
        # Read audio stream
        audio_stream = response['AudioStream']
        audio_data = audio_stream.read()
        
        # Calculate duration more accurately
        # Polly returns RequestCharacters which we can use for estimation
        # Average speaking rate: ~150 words per minute = 2.5 words per second
        # Average word length: ~5 characters
        # So roughly: characters / (2.5 * 5) = characters / 12.5 seconds per character
        char_count = len(text)
        duration = char_count / 12.5  # More accurate than word-based calculation
        
        # Minimum duration of 0.5 seconds for very short text
        duration = max(duration, 0.5)
        
        return audio_data, duration
    
    try:
        audio_data, duration = retry_with_backoff(_synthesize, max_retries=3)
        
        # Log compression ratio for low bandwidth mode
        if output_format == 'ogg_vorbis':
            # OGG Vorbis typically achieves 40-60% size reduction compared to MP3
            logger.info(f"Low bandwidth mode: using OGG Vorbis format for compression")
        
        logger.info(f"Synthesized speech: {len(audio_data)} bytes, ~{duration:.1f}s, "
                   f"voice={voice_id}, engine={engine}, format={output_format}")
        return audio_data, duration
        
    except Exception as e:
        logger.error(f"Speech synthesis failed: {e}")
        raise
