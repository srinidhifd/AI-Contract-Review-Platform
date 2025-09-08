"""
Contract analysis models and data structures.
Defines the models for contract analysis results and risk assessments.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class RiskAssessment(BaseModel):
    """Model for individual risk assessment."""
    
    category: str = Field(..., description="Risk category (e.g., Legal, Financial, Operational)")
    severity: str = Field(..., description="Risk severity: High, Medium, Low")
    description: str = Field(..., description="Detailed description of the risk")
    recommendation: str = Field(..., description="Recommended mitigation strategy")
    original_clause: Optional[str] = Field(None, description="The actual clause text from the contract")
    ai_suggestion: Optional[str] = Field(None, description="Improved version of the clause")
    impact_score: Optional[float] = Field(None, ge=0, le=10, description="Impact score from 0-10")
    likelihood_score: Optional[float] = Field(None, ge=0, le=10, description="Likelihood score from 0-10")
    overall_score: Optional[float] = Field(None, ge=0, le=10, description="Overall risk score from 0-10")


class ContractSummary(BaseModel):
    """Model for contract analysis summary."""
    
    document_id: str
    summary: str = Field(..., description="Brief summary of the contract")
    risk_score: float = Field(..., ge=0, le=100, description="Overall risk score from 0-100")
    total_clauses: int = Field(..., ge=0, description="Total number of clauses analyzed")
    key_points: List[str] = Field(..., description="Key points and important clauses")
    risk_assessments: List[RiskAssessment] = Field(..., description="Detailed risk assessments")
    suggested_revisions: List[str] = Field(..., description="Suggested contract revisions")
    
    # Metadata
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    processing_time: Optional[float] = Field(None, description="Analysis processing time in seconds")
    model_used: Optional[str] = Field(None, description="AI model used for analysis")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Analysis confidence score")


class ContractAnalysisRequest(BaseModel):
    """Model for contract analysis requests."""
    
    document_id: str
    analysis_type: str = Field(default="comprehensive", description="Type of analysis to perform")
    include_recommendations: bool = Field(default=True, description="Include revision recommendations")
    risk_categories: Optional[List[str]] = Field(None, description="Specific risk categories to focus on")


class ContractAnalysisResponse(BaseModel):
    """Model for contract analysis responses."""
    
    success: bool
    message: str
    analysis: Optional[ContractSummary] = None
    error_details: Optional[str] = None


class DocumentChunk(BaseModel):
    """Model for document text chunks."""
    
    chunk_id: str
    document_id: str
    chunk_index: int
    content: str
    word_count: int
    character_count: int
    start_position: Optional[int] = None
    end_position: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class DocumentProcessingStatus(BaseModel):
    """Model for document processing status."""
    
    document_id: str
    status: str = Field(..., description="Processing status: pending, processing, completed, failed")
    progress_percentage: float = Field(0, ge=0, le=100, description="Processing progress percentage")
    current_step: Optional[str] = Field(None, description="Current processing step")
    error_message: Optional[str] = Field(None, description="Error message if processing failed")
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None


class ChatContext(BaseModel):
    """Model for chat context and conversation state."""
    
    document_id: str
    user_id: str
    session_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)
    document_summary: Optional[str] = None
    relevant_chunks: Optional[List[str]] = None
    context_window: int = Field(default=10, description="Number of previous messages to include in context")


class AIResponse(BaseModel):
    """Model for AI-generated responses."""
    
    response: str
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    sources: Optional[List[str]] = Field(None, description="Source references for the response")
    reasoning: Optional[str] = Field(None, description="AI reasoning for the response")
    model_used: Optional[str] = None
    processing_time: Optional[float] = None
    token_usage: Optional[Dict[str, int]] = None


class FileUploadResult(BaseModel):
    """Model for file upload results."""
    
    success: bool
    message: str
    document_id: Optional[str] = None
    filename: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    content_hash: Optional[str] = None
    error_details: Optional[str] = None


class SearchResult(BaseModel):
    """Model for document search results."""
    
    document_id: str
    filename: str
    relevance_score: float
    matched_content: str
    context: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BulkAnalysisRequest(BaseModel):
    """Model for bulk document analysis requests."""
    
    document_ids: List[str]
    analysis_type: str = Field(default="comprehensive")
    priority: str = Field(default="normal", description="Processing priority: low, normal, high")
    callback_url: Optional[str] = Field(None, description="URL to call when analysis is complete")


class BulkAnalysisResponse(BaseModel):
    """Model for bulk analysis responses."""
    
    batch_id: str
    total_documents: int
    queued_documents: int
    estimated_completion_time: Optional[datetime] = None
    status_url: str = Field(..., description="URL to check batch status")