"""
Contract management API routes.
Handles document upload, analysis, and retrieval.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models.mongodb_models import (
    DocumentResponse, AnalysisRequest, AnalysisResponse, UserResponse
)
from app.models.contract import ContractSummary
from app.services.file_service import file_service
from app.services.ai_service import ai_service
from app.services.mongodb_service import mongodb_service
from app.api.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contracts", tags=["contracts"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Upload a contract document for analysis.
    
    Args:
        file: The uploaded file
        current_user: Current authenticated user
        
    Returns:
        DocumentResponse object
        
    Raises:
        HTTPException: If upload fails
    """
    try:
        # Read file content
        content = await file.read()
        
        # Save file and create document record
        result = await file_service.save_file(file.filename, content, current_user.id)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
        # Get the created document
        document = await mongodb_service.get_document_by_id(result["document_id"])
        if not document:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve uploaded document"
            )
        
        logger.info(f"Document uploaded successfully: {file.filename} by user {current_user.email}")
        
        return DocumentResponse(
            id=str(document.id),
            filename=document.filename,
            file_size=document.file_size,
            file_type=document.file_type,
            upload_date=document.upload_date,
            analysis_status=document.analysis_status,
            supports_chat=document.supports_chat,
            supports_analysis=document.supports_analysis,
            summary=document.summary,
            risk_score=document.risk_score,
            total_clauses=document.total_clauses,
            key_points=document.key_points,
            risk_assessments=document.risk_assessments,
            suggested_revisions=document.suggested_revisions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document upload service error"
        )


@router.get("/", response_model=List[DocumentResponse])
async def get_user_documents(
    limit: int = 50,
    skip: int = 0,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all documents for the current user.
    
    Args:
        limit: Maximum number of documents to return
        skip: Number of documents to skip
        current_user: Current authenticated user
        
    Returns:
        List of DocumentResponse objects
    """
    try:
        documents = await mongodb_service.get_documents_by_user(current_user.id, limit, skip)
        
        return [
            DocumentResponse(
                id=str(doc.id),
                filename=doc.filename,
                file_size=doc.file_size,
                file_type=doc.file_type,
                upload_date=doc.upload_date,
                analysis_status=doc.analysis_status,
                supports_chat=doc.supports_chat,
                supports_analysis=doc.supports_analysis,
                summary=doc.summary,
                risk_score=doc.risk_score,
                key_points=doc.key_points,
                risk_assessments=doc.risk_assessments,
                suggested_revisions=doc.suggested_revisions
            )
            for doc in documents
        ]
            
    except Exception as e:
        logger.error(f"Failed to get user documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get a specific document by ID.
    
    Args:
        document_id: The document ID
        current_user: Current authenticated user
        
    Returns:
        DocumentResponse object
        
    Raises:
        HTTPException: If document not found or access denied
    """
    try:
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        # For Beanie Link objects, we can fetch the linked object directly
        # or compare the reference
        
        # Method 1: Fetch the linked user object directly
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
            logger.error(f"Error fetching document user: {e}")
            # Fallback: try to get user ID from the link
            try:
                user_id = str(document.user_id.id) if hasattr(document.user_id, 'id') else str(document.user_id)
                if user_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this document"
                    )
            except Exception as fallback_error:
                logger.error(f"Fallback user check failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        return DocumentResponse(
            id=str(document.id),
            filename=document.filename,
            file_size=document.file_size,
            file_type=document.file_type,
            upload_date=document.upload_date,
            analysis_status=document.analysis_status,
            supports_chat=document.supports_chat,
            supports_analysis=document.supports_analysis,
            summary=document.summary,
            risk_score=document.risk_score,
            total_clauses=document.total_clauses,
            key_points=document.key_points,
            risk_assessments=document.risk_assessments,
            suggested_revisions=document.suggested_revisions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )


@router.post("/{document_id}/analyze", response_model=AnalysisResponse)
async def analyze_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Analyze a contract document.
    
    Args:
        document_id: The document ID
        current_user: Current authenticated user
        
    Returns:
        AnalysisResponse object
        
    Raises:
        HTTPException: If analysis fails
    """
    try:
        # Get document
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        # For Beanie Link objects, we can fetch the linked object directly
        # or compare the reference
        
        # Method 1: Fetch the linked user object directly
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
            logger.error(f"Error fetching document user: {e}")
            # Fallback: try to get user ID from the link
            try:
                user_id = str(document.user_id.id) if hasattr(document.user_id, 'id') else str(document.user_id)
                if user_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this document"
                    )
            except Exception as fallback_error:
                logger.error(f"Fallback user check failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        # Check if document is already being processed
        if document.analysis_status == "processing":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Document is already being analyzed"
            )
        
        # Update status to processing
        from datetime import datetime
        await mongodb_service.update_document(document_id, {
            "analysis_status": "processing",
            "processing_started_at": datetime.utcnow()
        })
        
        try:
            # Extract document content
            logger.info(f"Extracting content from document: {document.filename}")
            content = await file_service.extract_document_content(document)
            logger.info(f"Content extracted, length: {len(content)} characters")
            
            # Perform AI analysis
            logger.info(f"Starting AI analysis for document: {document_id}")
            analysis = ai_service.analyze_contract(content)
            logger.info(f"AI analysis completed for document: {document_id}")
            
            # Update document with analysis results
            await mongodb_service.update_document(document_id, {
                "analysis_status": "completed",
                "processing_completed_at": datetime.utcnow(),
                "summary": analysis.summary,
                "risk_score": analysis.risk_score,
                "total_clauses": analysis.total_clauses,
                "key_points": analysis.key_points,
                "risk_assessments": [risk.dict() for risk in analysis.risk_assessments],
                "suggested_revisions": analysis.suggested_revisions
            })
            
            logger.info(f"Document analysis completed: {document.filename}")
            
            return AnalysisResponse(
                document_id=document_id,
                analysis_status="completed",
                summary=analysis.summary,
                risk_score=analysis.risk_score,
                key_points=analysis.key_points,
                risk_assessments=[risk.dict() for risk in analysis.risk_assessments],
                suggested_revisions=analysis.suggested_revisions,
                processing_time=analysis.processing_time
            )
        
        except Exception as e:
            # Delete the document if analysis fails
            logger.error(f"Document analysis failed: {document.filename} - {e}")
            
            try:
                # Delete the document from database
                await mongodb_service.delete_document(document_id)
                logger.info(f"Deleted failed document: {document.filename}")
                
                # Delete the file from filesystem
                await file_service.delete_file(document.file_path)
                logger.info(f"Deleted file: {document.file_path}")
                
            except Exception as delete_error:
                logger.error(f"Failed to delete document after analysis failure: {delete_error}")
            
            # Return error response
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analysis failed: {str(e)}. Document has been removed. Please try uploading again."
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document analysis error for {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document analysis service error"
        )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a document and all associated data.
    
    Args:
        document_id: The document ID
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If deletion fails
    """
    try:
        # Get document
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        # For Beanie Link objects, we can fetch the linked object directly
        # or compare the reference
        
        # Method 1: Fetch the linked user object directly
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
            logger.error(f"Error fetching document user: {e}")
            # Fallback: try to get user ID from the link
            try:
                user_id = str(document.user_id.id) if hasattr(document.user_id, 'id') else str(document.user_id)
                if user_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this document"
                    )
            except Exception as fallback_error:
                logger.error(f"Fallback user check failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        # Delete document and associated files
        success = await file_service.delete_file(document)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
            )
        
        logger.info(f"Document deleted: {document.filename} by user {current_user.email}")
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document deletion failed for {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document deletion service error"
        )


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get the analysis status of a document.
    
    Args:
        document_id: The document ID
        current_user: Current authenticated user
        
    Returns:
        Document status information
        
    Raises:
        HTTPException: If document not found or access denied
    """
    try:
        document = await mongodb_service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user owns the document
        # For Beanie Link objects, we can fetch the linked object directly
        # or compare the reference
        
        # Method 1: Fetch the linked user object directly
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
            logger.error(f"Error fetching document user: {e}")
            # Fallback: try to get user ID from the link
            try:
                user_id = str(document.user_id.id) if hasattr(document.user_id, 'id') else str(document.user_id)
                if user_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to this document"
                    )
            except Exception as fallback_error:
                logger.error(f"Fallback user check failed: {fallback_error}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this document"
                )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this document"
            )
        
        return {
            "document_id": document_id,
            "filename": document.filename,
            "analysis_status": document.analysis_status,
            "supports_chat": document.supports_chat,
            "supports_analysis": document.supports_analysis,
            "processing_started_at": document.processing_started_at,
            "processing_completed_at": document.processing_completed_at,
            "error_message": document.error_message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document status for {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get document status"
        )