"""
Models package initialization.
"""

from .mongodb_models import (
    User, Document, DocumentChunk, ChatMessage, ChatSession,
    UserCreate, UserResponse, DocumentResponse, ChatMessageResponse,
    ChatSessionResponse, AnalysisRequest, AnalysisResponse,
    Token, TokenData, UserLogin, HealthCheck
)

from .contract import (
    RiskAssessment, ContractSummary, ContractAnalysisRequest,
    ContractAnalysisResponse, DocumentChunk as ContractDocumentChunk,
    DocumentProcessingStatus, ChatContext, AIResponse,
    FileUploadResult, SearchResult, BulkAnalysisRequest, BulkAnalysisResponse
)

__all__ = [
    # MongoDB Models
    "User", "Document", "DocumentChunk", "ChatMessage", "ChatSession",
    "UserCreate", "UserResponse", "DocumentResponse", "ChatMessageResponse",
    "ChatSessionResponse", "AnalysisRequest", "AnalysisResponse",
    "Token", "TokenData", "UserLogin", "HealthCheck",
    
    # Contract Models
    "RiskAssessment", "ContractSummary", "ContractAnalysisRequest",
    "ContractAnalysisResponse", "ContractDocumentChunk", "DocumentProcessingStatus",
    "ChatContext", "AIResponse", "FileUploadResult", "SearchResult",
    "BulkAnalysisRequest", "BulkAnalysisResponse"
]