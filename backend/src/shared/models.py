"""Shared data models for Bharat Sahayak backend."""

from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
import bleach


SupportedLanguage = Literal['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'pa', 'or']


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(min_length=1, max_length=1000)
    language: Optional[SupportedLanguage] = 'en'
    
    @validator('message')
    def sanitize_message(cls, v):
        """Remove HTML tags and dangerous characters."""
        cleaned = bleach.clean(v, tags=[], strip=True)
        cleaned = cleaned.replace('\x00', '')
        return cleaned.strip()


class SchemeCard(BaseModel):
    """Scheme information card."""
    id: str
    name: str
    description: str
    eligibilitySummary: str
    applicationSteps: List[str]


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    language: str
    schemes: List[SchemeCard] = []
    sessionId: str
    sessionExpiring: Optional[bool] = False
    sessionTimeRemaining: Optional[int] = None


class VoiceToTextRequest(BaseModel):
    """Request model for voice-to-text endpoint."""
    audioData: str = Field(description="Base64-encoded audio data")
    format: Literal['webm', 'mp3', 'wav']


class VoiceToTextResponse(BaseModel):
    """Response model for voice-to-text endpoint."""
    transcript: str
    detectedLanguage: str
    confidence: float = Field(ge=0.0, le=1.0)


class TextToSpeechRequest(BaseModel):
    """Request model for text-to-speech endpoint."""
    text: str = Field(min_length=1, max_length=3000)
    language: SupportedLanguage
    lowBandwidth: bool = False


class TextToSpeechResponse(BaseModel):
    """Response model for text-to-speech endpoint."""
    audioData: str = Field(description="Base64-encoded audio data")
    format: Literal['mp3', 'opus']
    duration: float
    sizeBytes: int


class UserInfo(BaseModel):
    """User information for eligibility checking."""
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[Literal['male', 'female', 'other']] = None
    income: Optional[int] = Field(None, ge=0)
    state: Optional[str] = None
    category: Optional[Literal['general', 'obc', 'sc', 'st']] = None
    occupation: Optional[str] = None
    ownsLand: Optional[bool] = None
    landSize: Optional[float] = Field(None, ge=0)
    hasDisability: Optional[bool] = None
    isBPL: Optional[bool] = None


class EligibilityRequest(BaseModel):
    """Request model for eligibility check endpoint."""
    schemeId: str = Field(pattern=r'^[a-z0-9-]+$')
    userInfo: UserInfo


class EligibilityCriterion(BaseModel):
    """Single eligibility criterion evaluation."""
    criterion: str
    required: str
    userValue: str
    met: bool


class EligibilityExplanation(BaseModel):
    """Explanation of eligibility decision."""
    criteria: List[EligibilityCriterion]
    summary: str


class SchemeDetails(BaseModel):
    """Detailed scheme information."""
    name: str
    benefits: str
    applicationProcess: List[str]
    requiredDocuments: Optional[List[str]] = None


class EligibilityResponse(BaseModel):
    """Response model for eligibility check endpoint."""
    eligible: bool
    explanation: EligibilityExplanation
    schemeDetails: SchemeDetails
    alternativeSchemes: Optional[List[Dict[str, str]]] = None


class SessionMetadata(BaseModel):
    """Session metadata stored in DynamoDB."""
    sessionId: str = Field(pattern=r'^[0-9a-f-]{36}$')
    language: SupportedLanguage
    createdAt: int = Field(gt=0)
    lastAccessedAt: int = Field(gt=0)
    messageCount: int = Field(ge=0)
    ttl: int = Field(gt=0)


class Message(BaseModel):
    """Message stored in DynamoDB."""
    messageId: str
    role: Literal['user', 'assistant']
    content: str = Field(min_length=1, max_length=5000)
    timestamp: int = Field(gt=0)
    language: str
    schemes: List[str] = []


class EligibilityRule(BaseModel):
    """Eligibility rule definition."""
    criterion: str
    type: Literal['boolean', 'numeric', 'string', 'enum']
    requirement: str
    evaluator: str  # Python lambda expression as string


class Scheme(BaseModel):
    """Government scheme information."""
    schemeId: str = Field(pattern=r'^[a-z0-9-]+$')
    name: str = Field(min_length=1, max_length=200)
    nameTranslations: Optional[Dict[str, str]] = None
    description: str = Field(min_length=1, max_length=1000)
    descriptionTranslations: Optional[Dict[str, str]] = None
    category: str
    targetAudience: str
    benefits: str
    eligibilityRules: List[EligibilityRule]
    applicationSteps: List[str]
    documents: List[str]
    officialWebsite: str = Field(pattern=r'^https?://')
    version: int = Field(ge=1)
    lastUpdated: int = Field(gt=0)


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    message: str
    field: Optional[str] = None
    requestId: Optional[str] = None
    timestamp: Optional[int] = None
    retryAfter: Optional[int] = None
