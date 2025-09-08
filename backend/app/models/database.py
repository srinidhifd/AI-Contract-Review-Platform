"""
Database models for the AI Contract Review Platform
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Database setup
import os
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./contract_review.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="owner")
    sessions = relationship("UserSession", back_populates="user")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    content_hash = Column(String, nullable=False)  # For deduplication
    upload_date = Column(DateTime, default=func.now())
    analysis_status = Column(String, default="pending")  # pending, completed, failed
    supports_chat = Column(Boolean, default=False)
    supports_analysis = Column(Boolean, default=False)
    
    # Analysis results
    summary = Column(Text)  # JSON string
    risk_score = Column(Float)
    key_points = Column(Text)  # JSON string
    risk_assessments = Column(Text)  # JSON string
    suggested_revisions = Column(Text)  # JSON string
    
    # Vector storage reference
    embedding_id = Column(String, unique=True, index=True)
    
    # Relationships
    owner = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")
    chat_messages = relationship("ChatMessage", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding_id = Column(String, unique=True, index=True)  # Reference to vector DB
    chunk_metadata = Column(Text)  # JSON string with metadata
    
    # Relationships
    document = relationship("Document", back_populates="chunks")

# Pydantic models for API
class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    department: str
    role: str = "user"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    department: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class DocumentCreate(BaseModel):
    filename: str
    file_size: int
    file_type: str
    content_hash: str

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="chat_messages")
    user = relationship("User")

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    file_type: str
    upload_date: datetime
    analysis_status: str
    risk_score: Optional[float] = None
    supports_chat: bool = False
    supports_analysis: bool = False

    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    document_id: int
    message: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Database utilities
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine) 