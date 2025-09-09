"""
MongoDB service for database operations.
Handles connection, user management, document storage, and chat functionality.
"""

import logging
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import certifi
from app.config import settings
from app.models.mongodb_models import (
    User, Document, DocumentChunk, ChatMessage, ChatSession
)

logger = logging.getLogger(__name__)


class MongoDBService:
    """Service class for MongoDB operations."""
    
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[str] = None
    
    async def connect(self):
        """Initialize MongoDB connection and Beanie ODM."""
        if self.client is None:
            try:
                # Create MongoDB client - try different connection approaches
                connection_successful = False
                
                # URL encode the MongoDB URL to handle special characters
                from urllib.parse import quote_plus
                import re
                
                # Extract and encode username/password from URL
                # Handle both mongodb:// and mongodb+srv:// URLs
                if 'mongodb+srv://' in settings.MONGODB_URL:
                    # Handle mongodb+srv:// URLs
                    # Parse URL manually to handle passwords with @ symbols
                    try:
                        # Remove mongodb+srv:// prefix
                        url_without_prefix = settings.MONGODB_URL.replace('mongodb+srv://', '')
                        
                        # Find the last @ symbol (separates credentials from host)
                        last_at_index = url_without_prefix.rfind('@')
                        if last_at_index == -1:
                            raise ValueError("No @ symbol found in URL")
                        
                        # Split into credentials and host parts
                        credentials_part = url_without_prefix[:last_at_index]
                        host_part = url_without_prefix[last_at_index + 1:]
                        
                        # Split credentials into username and password
                        colon_index = credentials_part.find(':')
                        if colon_index == -1:
                            raise ValueError("No : symbol found in credentials")
                        
                        username = credentials_part[:colon_index]
                        password = credentials_part[colon_index + 1:]
                        
                        # Encode username and password
                        encoded_username = quote_plus(username)
                        encoded_password = quote_plus(password)
                        encoded_url = f"mongodb+srv://{encoded_username}:{encoded_password}@{host_part}"
                        
                        logger.info(f"URL encoding applied for +srv: {username[:3]}***, {password[:3]}***")
                        
                    except Exception as e:
                        logger.warning(f"Failed to parse mongodb+srv URL: {e}, using original URL")
                        encoded_url = settings.MONGODB_URL
                else:
                    # Handle regular mongodb:// URLs
                    try:
                        # Remove mongodb:// prefix
                        url_without_prefix = settings.MONGODB_URL.replace('mongodb://', '')
                        
                        # Find the last @ symbol (separates credentials from host)
                        last_at_index = url_without_prefix.rfind('@')
                        if last_at_index == -1:
                            raise ValueError("No @ symbol found in URL")
                        
                        # Split into credentials and host parts
                        credentials_part = url_without_prefix[:last_at_index]
                        host_part = url_without_prefix[last_at_index + 1:]
                        
                        # Split credentials into username and password
                        colon_index = credentials_part.find(':')
                        if colon_index == -1:
                            raise ValueError("No : symbol found in credentials")
                        
                        username = credentials_part[:colon_index]
                        password = credentials_part[colon_index + 1:]
                        
                        # Encode username and password
                        encoded_username = quote_plus(username)
                        encoded_password = quote_plus(password)
                        encoded_url = f"mongodb://{encoded_username}:{encoded_password}@{host_part}"
                        
                        logger.info(f"URL encoding applied for regular: {username[:3]}***, {password[:3]}***")
                        
                    except Exception as e:
                        logger.warning(f"Failed to parse mongodb URL: {e}, using original URL")
                        encoded_url = settings.MONGODB_URL
                
                logger.info(f"Attempting MongoDB connection with encoded URL")
                
                # Approach 1: Try with SSL and certifi
                try:
                    self.client = AsyncIOMotorClient(
                        encoded_url,
                        tls=True,
                        tlsCAFile=certifi.where(),
                        serverSelectionTimeoutMS=10000,
                        connectTimeoutMS=10000,
                        socketTimeoutMS=10000
                    )
                    await self.client.admin.command('ping')
                    logger.info("MongoDB connected successfully with TLS + certifi")
                    connection_successful = True
                except Exception as e1:
                    logger.warning(f"TLS + certifi failed: {e1}")
                
                # Approach 2: Try with SSL but no certifi
                if not connection_successful:
                    try:
                        self.client = AsyncIOMotorClient(
                            encoded_url,
                            tls=True,
                            serverSelectionTimeoutMS=10000,
                            connectTimeoutMS=10000,
                            socketTimeoutMS=10000
                        )
                        await self.client.admin.command('ping')
                        logger.info("MongoDB connected successfully with TLS only")
                        connection_successful = True
                    except Exception as e2:
                        logger.warning(f"TLS only failed: {e2}")
                
                # Approach 3: Try with SSL but allow invalid certificates (for Railway)
                if not connection_successful:
                    try:
                        self.client = AsyncIOMotorClient(
                            encoded_url,
                            tls=True,
                            tlsAllowInvalidCertificates=True,
                            tlsAllowInvalidHostnames=True,
                            serverSelectionTimeoutMS=10000,
                            connectTimeoutMS=10000,
                            socketTimeoutMS=10000
                        )
                        await self.client.admin.command('ping')
                        logger.info("MongoDB connected successfully with SSL (no cert verification)")
                        connection_successful = True
                    except Exception as e3:
                        logger.warning(f"SSL no cert verification failed: {e3}")
                
                # Approach 4: Try without SSL (convert srv to regular)
                if not connection_successful:
                    try:
                        url_without_ssl = encoded_url.replace('mongodb+srv://', 'mongodb://')
                        self.client = AsyncIOMotorClient(
                            url_without_ssl,
                            serverSelectionTimeoutMS=10000,
                            connectTimeoutMS=10000,
                            socketTimeoutMS=10000
                        )
                        await self.client.admin.command('ping')
                        logger.info("MongoDB connected successfully without SSL")
                        connection_successful = True
                    except Exception as e4:
                        logger.warning(f"No SSL failed: {e4}")
                
                # Approach 5: Try original URL without encoding
                if not connection_successful:
                    try:
                        logger.info("Trying original URL without encoding")
                        self.client = AsyncIOMotorClient(
                            settings.MONGODB_URL,
                            serverSelectionTimeoutMS=10000,
                            connectTimeoutMS=10000,
                            socketTimeoutMS=10000
                        )
                        await self.client.admin.command('ping')
                        logger.info("MongoDB connected successfully with original URL")
                        connection_successful = True
                    except Exception as e5:
                        logger.warning(f"Original URL failed: {e5}")
                
                if not connection_successful:
                    raise Exception("All MongoDB connection approaches failed")
                self.database = settings.MONGODB_DATABASE
                
                # Initialize Beanie with document models
                await init_beanie(
                    database=self.client.get_default_database(),
                    document_models=[User, Document, DocumentChunk, ChatMessage, ChatSession]
                )
                
                logger.info(f"Connected to MongoDB Atlas. Database: {self.database}")
                
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB Atlas: {e}")
                raise
    
    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            self.client = None
            logger.info("Disconnected from MongoDB Atlas.")
    
    async def health_check(self) -> bool:
        """Check MongoDB connection health."""
        try:
            if self.client:
                await self.client.admin.command('ping')
                return True
            return False
        except Exception as e:
            logger.error(f"MongoDB health check failed: {e}")
            return False
    
    # User Management Methods
    async def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user."""
        try:
            user = User(**user_data)
            await user.insert()
            logger.info(f"Created user: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise
    

    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email (case-insensitive)."""
        try:
            # Convert email to lowercase for case-insensitive lookup
            email_lower = email.lower().strip()
            
            # Try exact match first (for performance)
            user = await User.find_one(User.email == email_lower)
            if user:
                return user
            
            # If not found, try case-insensitive search using raw MongoDB query
            # This handles cases where existing users might have mixed case emails
            if self.database:
                collection = self.client[self.database].users
                user_doc = await collection.find_one(
                    {"email": {"$regex": f"^{email_lower}$", "$options": "i"}}
                )
                if user_doc:
                    return User(**user_doc)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user by email: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            return await User.get(user_id)
        except Exception as e:
            logger.error(f"Failed to get user by ID: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user information."""
        try:
            user = await User.get(user_id)
            if user:
                for key, value in update_data.items():
                    setattr(user, key, value)
                await user.save()
                logger.info(f"Updated user: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            return None
    
    # Document Management Methods
    async def create_document(self, document_data: Dict[str, Any]) -> Document:
        """Create a new document record."""
        try:
            document = Document(**document_data)
            await document.insert()
            logger.info(f"Created document: {document.filename}")
            return document
        except Exception as e:
            logger.error(f"Failed to create document: {e}")
            raise
    
    async def get_document_by_id(self, document_id: str) -> Optional[Document]:
        """Get document by ID."""
        try:
            return await Document.get(document_id)
        except Exception as e:
            logger.error(f"Failed to get document by ID: {e}")
            return None
    
    async def get_documents_by_user(self, user_id: str, limit: int = 50, skip: int = 0) -> List[Document]:
        """Get documents for a specific user."""
        try:
            # Get user object first
            user = await self.get_user_by_id(user_id)
            if not user:
                logger.error(f"User not found: {user_id}")
                return []
            
            # Try different approaches to find documents
            # Approach 1: Use the user object directly
            try:
                documents = await Document.find(
                    Document.user_id == user
                ).sort(-Document.upload_date).skip(skip).limit(limit).to_list()
                
                if documents:
                    logger.info(f"Found {len(documents)} documents for user {user_id} using user object")
                    return documents
            except Exception as e1:
                logger.warning(f"Approach 1 failed: {e1}")
            
            # Approach 2: Use ObjectId comparison
            try:
                from bson import ObjectId
                user_object_id = ObjectId(user_id)
                documents = await Document.find(
                    Document.user_id == user_object_id
                ).sort(-Document.upload_date).skip(skip).limit(limit).to_list()
                
                if documents:
                    logger.info(f"Found {len(documents)} documents for user {user_id} using ObjectId")
                    return documents
            except Exception as e2:
                logger.warning(f"Approach 2 failed: {e2}")
            
            # Approach 3: Use raw MongoDB query
            try:
                from bson import ObjectId
                user_object_id = ObjectId(user_id)
                documents = await Document.find(
                    {"user_id": user_object_id}
            ).sort(-Document.upload_date).skip(skip).limit(limit).to_list()
                
                if documents:
                    logger.info(f"Found {len(documents)} documents for user {user_id} using raw query")
                    return documents
            except Exception as e3:
                logger.warning(f"Approach 3 failed: {e3}")
            
            # Approach 4: Get all documents and filter (fallback)
            try:
                all_documents = await Document.find_all().to_list()
                user_documents = []
                for doc in all_documents:
                    try:
                        # Try to fetch the linked user
                        doc_user = await doc.user_id.fetch()
                        if doc_user and str(doc_user.id) == user_id:
                            user_documents.append(doc)
                    except:
                        # If fetch fails, try to compare IDs directly
                        if hasattr(doc.user_id, 'id') and str(doc.user_id.id) == user_id:
                            user_documents.append(doc)
                
                # Sort by upload date
                user_documents.sort(key=lambda x: x.upload_date, reverse=True)
                user_documents = user_documents[skip:skip+limit]
                
                if user_documents:
                    logger.info(f"Found {len(user_documents)} documents for user {user_id} using fallback method")
                    return user_documents
            except Exception as e4:
                logger.warning(f"Approach 4 failed: {e4}")
            
            logger.warning(f"No documents found for user {user_id} using any approach")
            return []
            
        except Exception as e:
            logger.error(f"Failed to get documents by user: {e}")
            return []
    
    async def update_document(self, document_id: str, update_data: Dict[str, Any]) -> Optional[Document]:
        """Update document information."""
        try:
            document = await Document.get(document_id)
            if document:
                for key, value in update_data.items():
                    setattr(document, key, value)
                await document.save()
                logger.info(f"Updated document: {document.filename}")
            return document
        except Exception as e:
            logger.error(f"Failed to update document: {e}")
            return None
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and its associated data."""
        try:
            document = await Document.get(document_id)
            if document:
                # Delete associated chunks
                await DocumentChunk.find(DocumentChunk.document_id == document_id).delete()
                
                # Delete associated chat messages
                from bson import ObjectId
                await ChatMessage.find(ChatMessage.document_id == ObjectId(document_id)).delete()
                
                # Delete associated chat sessions
                await ChatSession.find(ChatSession.document_id == ObjectId(document_id)).delete()
                
                # Delete the document
                await document.delete()
                logger.info(f"Deleted document: {document.filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete document: {e}")
            return False
    
    # Document Chunk Methods
    async def create_document_chunk(self, chunk_data: Dict[str, Any]) -> DocumentChunk:
        """Create a new document chunk."""
        try:
            chunk = DocumentChunk(**chunk_data)
            await chunk.insert()
            return chunk
        except Exception as e:
            logger.error(f"Failed to create document chunk: {e}")
            raise
    
    async def get_document_chunks(self, document_id: str) -> List[DocumentChunk]:
        """Get all chunks for a document."""
        try:
            return await DocumentChunk.find(
                DocumentChunk.document_id == document_id
            ).sort(DocumentChunk.chunk_index).to_list()
        except Exception as e:
            logger.error(f"Failed to get document chunks: {e}")
            return []
    
    # Chat Session Methods
    async def create_chat_session(self, session_data: Dict[str, Any]) -> ChatSession:
        """Create a new chat session."""
        try:
            session = ChatSession(**session_data)
            await session.insert()
            logger.info(f"Created chat session: {session.session_name}")
            return session
        except Exception as e:
            logger.error(f"Failed to create chat session: {e}")
            raise
    
    async def get_chat_sessions_by_document(self, document_id: str, user_id: str) -> List[ChatSession]:
        """Get chat sessions for a document and user."""
        try:
            return await ChatSession.find(
                ChatSession.document_id == document_id,
                ChatSession.user_id == user_id,
                ChatSession.is_active == True
            ).sort(-ChatSession.updated_at).to_list()
        except Exception as e:
            logger.error(f"Failed to get chat sessions: {e}")
            return []
    
    async def get_chat_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        """Get chat session by ID."""
        try:
            return await ChatSession.get(session_id)
        except Exception as e:
            logger.error(f"Failed to get chat session by ID: {e}")
            return None
    
    async def update_chat_session(self, session_id: str, update_data: Dict[str, Any]) -> Optional[ChatSession]:
        """Update chat session."""
        try:
            session = await ChatSession.get(session_id)
            if session:
                for key, value in update_data.items():
                    setattr(session, key, value)
                await session.save()
            return session
        except Exception as e:
            logger.error(f"Failed to update chat session: {e}")
            return None
    
    # Chat Message Methods
    async def add_chat_message(self, message_data: Dict[str, Any]) -> ChatMessage:
        """Add a new chat message."""
        try:
            message = ChatMessage(**message_data)
            await message.insert()
            
            # Update session message count
            if message_data.get('session_id'):
                session = await ChatSession.get(message_data['session_id'])
                if session:
                    session.message_count += 1
                    session.updated_at = message.timestamp
                    await session.save()
            
            logger.info(f"Added chat message for document: {message.document_id}")
            return message
        except Exception as e:
            logger.error(f"Failed to add chat message: {e}")
            raise
    
    async def get_chat_messages(self, document_id: str, user_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat messages for a document and user."""
        try:
            from bson import ObjectId, DBRef
            
            logger.info(f"Getting chat messages for document: {document_id}, user: {user_id}")
            
            # Try querying with DBRef objects (how they're actually stored)
            document_dbref = DBRef("documents", ObjectId(document_id))
            user_dbref = DBRef("users", ObjectId(user_id))
            
            messages = await ChatMessage.find(
                ChatMessage.document_id == document_dbref,
                ChatMessage.user_id == user_dbref
            ).sort(ChatMessage.timestamp).limit(limit).to_list()
            
            logger.info(f"Found {len(messages)} chat messages with DBRef query")
            
            # If no messages found, try with ObjectId as fallback
            if len(messages) == 0:
                logger.info("Trying fallback query with ObjectId...")
                document_oid = ObjectId(document_id)
                user_oid = ObjectId(user_id)
                
                messages = await ChatMessage.find(
                    ChatMessage.document_id == document_oid,
                    ChatMessage.user_id == user_oid
                ).sort(ChatMessage.timestamp).limit(limit).to_list()
                logger.info(f"Found {len(messages)} chat messages with ObjectId query")
            
            # If still no messages, try with document/user references
            if len(messages) == 0:
                logger.info("Trying fallback query with document/user references...")
                document = await Document.get(document_id)
                user = await User.get(user_id)
                
                if document and user:
                    messages = await ChatMessage.find(
                        ChatMessage.document_id == document,
                        ChatMessage.user_id == user
                    ).sort(ChatMessage.timestamp).limit(limit).to_list()
                    logger.info(f"Found {len(messages)} chat messages with document/user references")
            
            return messages
        except Exception as e:
            logger.error(f"Failed to get chat messages: {e}")
            return []
    
    async def get_chat_messages_by_session(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """Get chat messages for a specific session."""
        try:
            return await ChatMessage.find(
                ChatMessage.session_id == session_id
            ).sort(ChatMessage.timestamp).limit(limit).to_list()
        except Exception as e:
            logger.error(f"Failed to get chat messages by session: {e}")
            return []
    
    # Utility Methods
    async def get_document_count_by_user(self, user_id: str) -> int:
        """Get total document count for a user."""
        try:
            return await Document.find(Document.user_id == user_id).count()
        except Exception as e:
            logger.error(f"Failed to get document count: {e}")
            return 0
    
    async def search_documents(self, user_id: str, query: str, limit: int = 20) -> List[Document]:
        """Search documents by filename or content."""
        try:
            # Simple text search - in production, you might want to use MongoDB's text search
            documents = await Document.find(
                Document.user_id == user_id
            ).to_list()
            
            # Filter by filename containing query
            filtered_docs = [
                doc for doc in documents 
                if query.lower() in doc.filename.lower()
            ]
            
            return filtered_docs[:limit]
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            return []


# Global MongoDB service instance
mongodb_service = MongoDBService()