"""
MongoDB document models using Beanie ODM.
Defines the data structures for users, documents, and chat messages.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from beanie import Document as BeanieDocument, Indexed, Link
from pydantic import Field, EmailStr, BaseModel


class User(BeanieDocument):
    """User document model for MongoDB."""
    
    email: Indexed(EmailStr, unique=True)
    full_name: str
    department: str
    role: str = "user"
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "created_at",
        ]


class DocumentChunk(BeanieDocument):
    """Document chunk model for storing processed document segments."""
    
    document_id: Link["Document"]
    chunk_index: int
    content: str
    embedding: Optional[List[float]] = None  # Store embeddings directly in MongoDB
    chunk_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "document_chunks"
        indexes = [
            "document_id",
            "chunk_index",
        ]


class Document(BeanieDocument):
    """Document model for storing uploaded contracts and their metadata."""
    
    user_id: Link[User]
    filename: str
    file_path: str
    file_size: int
    file_type: str
    content_hash: str
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    
    # Analysis status and results
    analysis_status: str = "pending"  # pending, processing, completed, failed
    supports_chat: bool = False
    supports_analysis: bool = False
    
    # Analysis results
    summary: Optional[str] = None
    risk_score: Optional[float] = None
    total_clauses: Optional[int] = None
    key_points: Optional[List[str]] = None
    risk_assessments: Optional[List[Dict[str, Any]]] = None
    suggested_revisions: Optional[List[str]] = None
    
    # Processing metadata
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Settings:
        name = "documents"
        indexes = [
            "user_id",
            "filename",
            "content_hash",
            "upload_date",
            "analysis_status",
        ]


class ChatMessage(BeanieDocument):
    """Chat message model for storing conversation history."""
    
    document_id: Link["Document"]
    user_id: Link[User]
    message: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = "user"  # user, assistant, system
    metadata: Optional[Dict[str, Any]] = None
    
    class Settings:
        name = "chat_messages"
        indexes = [
            "document_id",
            "user_id",
            "timestamp",
        ]


class ChatSession(BeanieDocument):
    """Chat session model for grouping related messages."""
    
    document_id: Link[Document]
    user_id: Link[User]
    session_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    message_count: int = 0
    
    class Settings:
        name = "chat_sessions"
        indexes = [
            "document_id",
            "user_id",
            "created_at",
            "is_active",
        ]


# Pydantic models for API requests and responses
class UserCreate(BaseModel):
    """Model for user creation requests."""
    email: EmailStr
    full_name: str
    department: str
    password: str


class UserResponse(BaseModel):
    """Model for user response data."""
    id: str
    email: str
    full_name: str
    department: str
    role: str
    is_active: bool
    created_at: datetime


class DocumentUpload(BaseModel):
    """Model for document upload requests."""
    filename: str
    file_type: str
    file_size: int


class DocumentResponse(BaseModel):
    """Model for document response data."""
    id: str
    filename: str
    file_size: int
    file_type: str
    upload_date: datetime
    analysis_status: str
    supports_chat: bool
    supports_analysis: bool
    summary: Optional[str] = None
    risk_score: Optional[float] = None
    total_clauses: Optional[int] = None
    key_points: Optional[List[str]] = None
    risk_assessments: Optional[List[Dict[str, Any]]] = None
    suggested_revisions: Optional[List[str]] = None


class ChatMessageRequest(BaseModel):
    """Model for chat message requests."""
    message: str
    document_id: str


class ChatMessageResponse(BaseModel):
    """Model for chat message responses."""
    id: str
    message: str
    response: str
    timestamp: datetime
    message_type: str


class ChatSessionResponse(BaseModel):
    """Model for chat session responses."""
    id: str
    session_name: str
    document_id: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    is_active: bool


class AnalysisRequest(BaseModel):
    """Model for contract analysis requests."""
    document_id: str


class AnalysisResponse(BaseModel):
    """Model for contract analysis responses."""
    document_id: str
    analysis_status: str
    summary: Optional[str] = None
    risk_score: Optional[float] = None
    key_points: Optional[List[str]] = None
    risk_assessments: Optional[List[Dict[str, Any]]] = None
    suggested_revisions: Optional[List[str]] = None
    processing_time: Optional[float] = None
    error_message: Optional[str] = None


# Token models for authentication
class Token(BaseModel):
    """Model for JWT token response."""
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    """Model for JWT token data."""
    email: Optional[str] = None


class UserLogin(BaseModel):
    """Model for user login requests."""
    email: str
    password: str


# Health check model
class HealthCheck(BaseModel):
    """Model for health check responses."""
    status: str
    timestamp: datetime
    version: str
    environment: str
    services: Dict[str, str]