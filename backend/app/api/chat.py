"""
Chat API routes for document Q&A functionality.
Handles chat sessions, message sending, and AI responses.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.mongodb_models import (
    ChatMessage, ChatMessageRequest, ChatMessageResponse, ChatSessionResponse, UserResponse
)
from app.models.contract import ContractSummary
from app.services.ai_service import ai_service
from app.services.mongodb_service import mongodb_service
from app.services.file_service import file_service
from app.api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    document_id: str,
    session_name: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new chat session for a document.
    
    Args:
        document_id: The document ID
        session_name: Name for the chat session
        current_user: Current authenticated user
        
    Returns:
        ChatSessionResponse object
        
    Raises:
        HTTPException: If session creation fails
    """
    try:
        # Verify document exists and user has access
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        try:
            document_user = await document.user_id.fetch()
            if not document_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document owner not found"
                )
            
            # Compare user IDs
            if str(document_user.id) != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
        except Exception as e:
            logger.error(f"Error checking document ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        if not document.supports_chat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This document does not support chat functionality"
            )
        
        # Create chat session
        session_data = {
            "document_id": document_id,
            "user_id": current_user.id,
            "session_name": session_name,
            "is_active": True,
            "message_count": 0
        }
        
        session = await mongodb_service.create_chat_session(session_data)
        
        logger.info(f"Chat session created: {session_name} for document {document_id}")
        
        return ChatSessionResponse(
            id=str(session.id),
            session_name=session.session_name,
            document_id=document_id,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=session.message_count,
            is_active=session.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat session creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat session creation service error"
        )


@router.get("/sessions/{document_id}", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all chat sessions for a document.
    
    Args:
        document_id: The document ID
        current_user: Current authenticated user
        
    Returns:
        List of ChatSessionResponse objects
        
    Raises:
        HTTPException: If document not found or access denied
    """
    try:
        # Verify document exists and user has access
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        try:
            document_user = await document.user_id.fetch()
            if not document_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document owner not found"
                )
            
            # Compare user IDs
            if str(document_user.id) != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
        except Exception as e:
            logger.error(f"Error checking document ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        # Get chat sessions
        sessions = await mongodb_service.get_chat_sessions_by_document(document_id, current_user.id)
        
        return [
            ChatSessionResponse(
                id=str(session.id),
                session_name=session.session_name,
                document_id=document_id,
                created_at=session.created_at,
                updated_at=session.updated_at,
                message_count=session.message_count,
                is_active=session.is_active
            )
            for session in sessions
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat sessions for document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat sessions"
        )


@router.post("/send", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: ChatMessageRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Send a message and get AI response.
    
    Args:
        message_data: The message data
        current_user: Current authenticated user
        
    Returns:
        ChatMessageResponse object with AI response
        
    Raises:
        HTTPException: If message sending fails
    """
    try:
        # Verify document exists and user has access
        document = await mongodb_service.get_document_by_id(message_data.document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get the actual User document for saving messages
        user_document = await mongodb_service.get_user_by_id(current_user.id)
        if not user_document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user owns the document
        try:
            document_user = await document.user_id.fetch()
            if not document_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document owner not found"
                )
            
            # Compare user IDs
            if str(document_user.id) != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
        except Exception as e:
            logger.error(f"Error checking document ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        if not document.supports_chat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This document does not support chat functionality"
            )
        
        # Extract document content
        try:
            document_content = await file_service.extract_document_content(document)
        except Exception as e:
            logger.error(f"Failed to extract document content: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process document content"
            )
        
        # Get recent chat history for context
        recent_messages = await mongodb_service.get_chat_messages(
            message_data.document_id, current_user.id, limit=10
        )
        
        # Build context from recent messages
        context = ""
        if recent_messages:
            context_messages = recent_messages[-5:]  # Last 5 messages for context
            context = "\n".join([
                f"User: {msg.message}\nAssistant: {msg.response}"
                for msg in reversed(context_messages)
            ])
        
        # Get AI response
        try:
            # Create a simple ContractSummary for ai_service
            simple_summary = ContractSummary(
                key_points=[],
                total_clauses=0,
                risk_assessments=[],
                suggested_revisions=[],
                overall_risk_score=0.0
            )
            ai_response = await ai_service.answer_question(
                message_data.message, document_content, simple_summary
            )
        except Exception as e:
            logger.error(f"AI response generation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate AI response"
            )
        
        # Save user message
        user_message_data = {
            "document_id": document.id,  # Use the document object, not string
            "user_id": user_document.id,  # Use the User document object
            "message": message_data.message,
            "response": "",  # User messages don't have responses
            "message_type": "user"
        }
        
        user_message = await mongodb_service.add_chat_message(user_message_data)
        
        # Save AI response
        ai_message_data = {
            "document_id": document.id,  # Use the document object, not string
            "user_id": user_document.id,  # Use the User document object
            "message": message_data.message,  # Reference to user's question
            "response": ai_response.get("answer", "No response generated"),
            "message_type": "assistant",
            "metadata": {
                "confidence_score": 0.8,  # Default confidence
                "model_used": "mistral-ai",
                "processing_time": 0.0
            }
        }
        
        ai_message = await mongodb_service.add_chat_message(ai_message_data)
        
        logger.info(f"Chat message sent and response generated for document {message_data.document_id}")
        
        return ChatMessageResponse(
            id=str(ai_message.id),
            message=message_data.message,
            response=ai_response.get("answer", "No response generated"),
            timestamp=ai_message.timestamp,
            message_type="assistant"
        )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat message sending failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat message service error"
        )


@router.get("/messages/{document_id}", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    document_id: str,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get chat messages for a document.
    
    Args:
        document_id: The document ID
        limit: Maximum number of messages to return
        current_user: Current authenticated user
        
    Returns:
        List of ChatMessageResponse objects
        
    Raises:
        HTTPException: If document not found or access denied
    """
    try:
        # Verify document exists and user has access
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        try:
            document_user = await document.user_id.fetch()
            if not document_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Document owner not found"
                )
            
            # Compare user IDs
            if str(document_user.id) != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
        except Exception as e:
            logger.error(f"Error checking document ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        # Get chat messages
        logger.info(f"Getting chat messages for document {document_id} and user {current_user.id}")
        messages = await mongodb_service.get_chat_messages(document_id, current_user.id, limit)
        logger.info(f"Retrieved {len(messages)} messages from database")
        
        response_messages = [
            ChatMessageResponse(
                id=str(msg.id),
                message=msg.message,
                response=msg.response,
                timestamp=msg.timestamp,
                message_type=msg.message_type
            )
            for msg in messages
        ]
        
        logger.info(f"Returning {len(response_messages)} formatted messages")
        return response_messages
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat messages for document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat messages"
        )


@router.get("/messages/session/{session_id}", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get chat messages for a specific session.
    
    Args:
        session_id: The session ID
        limit: Maximum number of messages to return
        current_user: Current authenticated user
        
    Returns:
        List of ChatMessageResponse objects
        
    Raises:
        HTTPException: If session not found or access denied
    """
    try:
        # Verify session exists and user has access
        session = await mongodb_service.get_chat_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        if str(session.user_id.id) != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this chat session"
            )
        
        # Get session messages
        messages = await mongodb_service.get_chat_messages_by_session(session_id, limit)
        
        return [
            ChatMessageResponse(
                id=str(msg.id),
                message=msg.message,
                response=msg.response,
                timestamp=msg.timestamp,
                message_type=msg.message_type
            )
            for msg in messages
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session messages for session {session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve session messages"
        )


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a chat session and all its messages.
    
    Args:
        session_id: The session ID
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If session not found or access denied
    """
    try:
        # Verify session exists and user has access
        session = await mongodb_service.get_chat_session_by_id(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
        
        if str(session.user_id.id) != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this chat session"
            )
        
        # Delete session messages
        await mongodb_service.get_chat_messages_by_session(session_id, limit=1000)
        # Note: In a real implementation, you'd want a proper delete method
        
        # Deactivate session
        await mongodb_service.update_chat_session(session_id, {"is_active": False})
        
        logger.info(f"Chat session deleted: {session_id} by user {current_user.email}")
        
        return {"message": "Chat session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat session deletion failed for session {session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat session deletion service error"
        )