"""
File service for document upload, processing, and text extraction.
Handles file validation, storage, and content extraction from various formats.
"""

import os
import hashlib
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path
from datetime import datetime

# Try to import magic, fallback to mimetypes if not available
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    import mimetypes
    MAGIC_AVAILABLE = False

# Document processing imports
import PyPDF2
from docx import Document as DocxDocument
import io

from app.config import settings
from app.models.mongodb_models import Document, DocumentChunk
from app.services.mongodb_service import mongodb_service

logger = logging.getLogger(__name__)


class FileService:
    """Service class for file operations."""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_file_types = settings.ALLOWED_FILE_TYPES
        
        # Ensure upload directory exists
        self.upload_dir.mkdir(exist_ok=True)
    
    def validate_file(self, filename: str, file_size: int, content: bytes) -> Dict[str, Any]:
        """
        Validate uploaded file.
        
        Args:
            filename: The filename
            file_size: The file size in bytes
            content: The file content
            
        Returns:
            Validation result with success status and message
        """
        try:
            # Check file size
            if file_size > self.max_file_size:
                return {
                    "success": False,
                    "message": f"File size exceeds maximum allowed size of {self.max_file_size / (1024*1024):.1f}MB"
                }
            
            # Check file extension
            file_ext = Path(filename).suffix.lower()
            if file_ext not in self.allowed_file_types:
                return {
                    "success": False,
                    "message": f"File type {file_ext} is not allowed. Allowed types: {', '.join(self.allowed_file_types)}"
                }
            
            # Check file type using magic or fallback to mimetypes
            try:
                if MAGIC_AVAILABLE:
                    file_type = magic.from_buffer(content, mime=True)
                else:
                    # Fallback to mimetypes based on file extension
                    file_type, _ = mimetypes.guess_type(filename)
                    if file_type is None:
                        file_type = "unknown"
                logger.info(f"Detected file type: {file_type} for file: {filename}")
            except Exception as e:
                logger.warning(f"Could not detect file type: {e}")
                file_type = "unknown"
            
            # Basic content validation
            if len(content) == 0:
                return {
                    "success": False,
                    "message": "File is empty"
                }
            
            return {
                "success": True,
                "message": "File validation successful",
                "file_type": file_type,
                "file_extension": file_ext
            }
            
        except Exception as e:
            logger.error(f"File validation failed: {e}")
            return {
                "success": False,
                "message": f"File validation error: {str(e)}"
            }
    
    def calculate_file_hash(self, content: bytes) -> str:
        """
        Calculate SHA256 hash of file content.
        
        Args:
            content: The file content
            
        Returns:
            SHA256 hash string
        """
        try:
            return hashlib.sha256(content).hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate file hash: {e}")
            raise
    
    async def save_file(self, filename: str, content: bytes, user_id: str) -> Dict[str, Any]:
        """
        Save uploaded file to disk and create database record.
        
        Args:
            filename: The filename
            content: The file content
            user_id: The user ID
            
        Returns:
            Save result with document information
        """
        try:
            # Validate file
            validation = self.validate_file(filename, len(content), content)
            if not validation["success"]:
                return validation
            
            # Calculate file hash
            content_hash = self.calculate_file_hash(content)
            
            # Check if file already exists
            existing_doc = await self.get_document_by_hash(content_hash, user_id)
            if existing_doc:
                return {
                    "success": False,
                    "message": "A document with the same content already exists",
                    "existing_document_id": str(existing_doc.id)
                }
            
            # Generate unique filename
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            safe_filename = self._sanitize_filename(filename)
            unique_filename = f"{timestamp}_{safe_filename}"
            file_path = self.upload_dir / unique_filename
            
            # Save file to disk
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Get user object for Link
            user = await mongodb_service.get_user_by_id(user_id)
            if not user:
                raise ValueError(f"User not found: {user_id}")
            
            # Create document record
            document_data = {
                "user_id": user,  # Pass User object for Link
                "filename": filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "file_type": validation["file_extension"],
                "content_hash": content_hash,
                "analysis_status": "pending",
                "supports_chat": True,
                "supports_analysis": True
            }
            
            document = await mongodb_service.create_document(document_data)
            
            logger.info(f"File saved successfully: {filename} -> {unique_filename}")
            
            return {
                "success": True,
                "message": "File uploaded successfully",
                "document_id": str(document.id),
                "filename": filename,
                "file_size": len(content),
                "file_type": validation["file_extension"]
            }
                
        except Exception as e:
            logger.error(f"Failed to save file {filename}: {e}")
            return {
                "success": False,
                "message": f"Failed to save file: {str(e)}"
            }
    
    def _sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for safe storage.
        
        Args:
            filename: The original filename
            
        Returns:
            Sanitized filename
        """
        # Remove or replace unsafe characters
        unsafe_chars = '<>:"/\\|?*'
        safe_filename = filename
        for char in unsafe_chars:
            safe_filename = safe_filename.replace(char, '_')
        
        # Limit filename length
        if len(safe_filename) > 100:
            name, ext = os.path.splitext(safe_filename)
            safe_filename = name[:95] + ext
        
        return safe_filename
    
    async def get_document_by_hash(self, content_hash: str, user_id: str) -> Optional[Document]:
        """
        Get document by content hash and user ID.
        
        Args:
            content_hash: The content hash
            user_id: The user ID
            
        Returns:
            Document if found, None otherwise
        """
        try:
            # This would need to be implemented in mongodb_service
            # For now, return None
            return None
        except Exception as e:
            logger.error(f"Failed to get document by hash: {e}")
            return None
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF file.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {file_path}: {e}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """
        Extract text from DOCX file.
        
        Args:
            file_path: Path to the DOCX file
            
        Returns:
            Extracted text content
        """
        try:
            doc = DocxDocument(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
                
        except Exception as e:
            logger.error(f"Failed to extract text from DOCX {file_path}: {e}")
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")
    
    def extract_text_from_txt(self, file_path: str) -> str:
        """
        Extract text from TXT file.
        
        Args:
            file_path: Path to the TXT file
            
        Returns:
            Extracted text content
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
                
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read().strip()
            except Exception as e:
                logger.error(f"Failed to extract text from TXT {file_path}: {e}")
                raise Exception(f"Failed to extract text from TXT: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to extract text from TXT {file_path}: {e}")
            raise Exception(f"Failed to extract text from TXT: {str(e)}")
    
    async def extract_document_content(self, document: Document) -> str:
        """
        Extract text content from a document.
        
        Args:
            document: The document object
            
        Returns:
            Extracted text content
        """
        try:
            file_path = document.file_path
            file_type = document.file_type.lower()
            
            # Fix path - it might be relative to backend directory
            if not os.path.exists(file_path):
                # Try with backend prefix
                backend_path = os.path.join("backend", file_path)
                if os.path.exists(backend_path):
                    file_path = backend_path
                else:
                    logger.error(f"File not found: {file_path} or {backend_path}")
                    raise Exception(f"Document file not found: {file_path}. The file may have been deleted or moved.")
            
            if file_type == '.pdf':
                return self.extract_text_from_pdf(file_path)
            elif file_type == '.docx':
                return self.extract_text_from_docx(file_path)
            elif file_type == '.txt':
                return self.extract_text_from_txt(file_path)
            else:
                raise Exception(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Failed to extract content from document {document.id}: {e}")
            raise
    
    async def chunk_document_content(self, content: str, document_id: str, chunk_size: int = 4000, overlap: int = 200) -> List[DocumentChunk]:
        """
        Split document content into chunks for processing.
        
        Args:
            content: The document content
            document_id: The document ID
            chunk_size: Size of each chunk
            overlap: Overlap between chunks
            
        Returns:
            List of document chunks
        """
        try:
            chunks = []
            words = content.split()
            
            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_content = ' '.join(chunk_words)
                
                chunk_data = {
                    "document_id": document_id,
                    "chunk_index": len(chunks),
                    "content": chunk_content,
                    "chunk_metadata": {
                        "word_count": len(chunk_words),
                        "start_word": i,
                        "end_word": min(i + chunk_size, len(words))
                    }
                }
                
                chunk = await mongodb_service.create_document_chunk(chunk_data)
                chunks.append(chunk)
            
            logger.info(f"Created {len(chunks)} chunks for document {document_id}")
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to chunk document {document_id}: {e}")
            raise
    
    async def delete_file(self, document: Document) -> bool:
        """
        Delete a file from disk and database.
        
        Args:
            document: The document to delete
            
        Returns:
            True if deletion successful, False otherwise
        """
        try:
            # Delete file from disk
            file_path = Path(document.file_path)
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted file: {file_path}")
            
            # Delete document from database (this will also delete chunks and chat messages)
            success = await mongodb_service.delete_document(str(document.id))
            
            if success:
                logger.info(f"Deleted document: {document.filename}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to delete document {document.id}: {e}")
            return False


# Global file service instance
file_service = FileService()