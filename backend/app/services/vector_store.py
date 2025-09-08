"""
Full LangChain Vector Store Service for Document Storage and Retrieval
"""

import os
import hashlib
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.schema import Document
from langchain_mistralai import ChatMistralAI
from langchain.prompts import PromptTemplate

import logging

logger = logging.getLogger(__name__)

class VectorStoreService:
    """Service for managing document embeddings and vector search with full LangChain"""
    
    def __init__(self, persist_directory: str = "data/vector_store"):
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        # Initialize embeddings model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Initialize vector store
        self.vector_store = None
        self._initialize_vector_store()
        
        # Initialize Mistral AI for Q&A
        self.mistral_llm = ChatMistralAI(
            model="mistral-large-latest",
            temperature=0.3,
            max_tokens=2000
        )
        
        logger.info("Full LangChain vector store service initialized")
    
    def _initialize_vector_store(self):
        """Initialize or load existing vector store"""
        try:
            if self.persist_directory.exists() and any(self.persist_directory.iterdir()):
                self.vector_store = Chroma(
                    persist_directory=str(self.persist_directory),
                    embedding_function=self.embeddings
                )
                logger.info("Loaded existing ChromaDB vector store")
            else:
                self.vector_store = Chroma(
                    persist_directory=str(self.persist_directory),
                    embedding_function=self.embeddings
                )
                logger.info("Created new ChromaDB vector store")
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            raise
    
    def add_document(self, content: str, metadata: Dict[str, Any]) -> List[str]:
        """
        Add document to vector store and return chunk IDs
        """
        try:
            document_id = metadata.get("document_id")
            if not document_id:
                raise ValueError("document_id is required in metadata")
            
            # Split document into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Create documents with metadata
            documents = []
            chunk_ids = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{document_id}_chunk_{i}"
                chunk_ids.append(chunk_id)
                
                # Add chunk-specific metadata
                chunk_metadata = {
                    **metadata,
                    "chunk_index": i,
                    "chunk_id": chunk_id,
                    "chunk_size": len(chunk),
                    "total_chunks": len(chunks)
                }
                
                doc = Document(
                    page_content=chunk,
                    metadata=chunk_metadata
                )
                documents.append(doc)
            
            # Add to vector store
            self.vector_store.add_documents(documents)
            
            logger.info(f"Added document {document_id} with {len(chunks)} chunks to ChromaDB")
            return chunk_ids
            
        except Exception as e:
            logger.error(f"Error adding document to vector store: {e}")
            raise
    
    def search_documents(self, query: str, k: int = 5, filter_metadata: Optional[Dict] = None) -> List[Document]:
        """
        Search for relevant documents using semantic search
        """
        try:
            if filter_metadata:
                results = self.vector_store.similarity_search(
                    query, 
                    k=k,
                    filter=filter_metadata
                )
            else:
                results = self.vector_store.similarity_search(query, k=k)
            
            return results
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            raise
    
    def get_qa_chain(self, filter_metadata: Optional[Dict] = None):
        """
        Create a Q&A interface with enhanced answer generation
        """
        class EnhancedQAChain:
            def __init__(self, vector_store, filter_metadata, mistral_llm):
                self.vector_store = vector_store
                self.filter_metadata = filter_metadata
                self.mistral_llm = mistral_llm
            
            def __call__(self, query_dict):
                query = query_dict.get("query", "")
                results = self.vector_store.search_documents(query, k=5, filter_metadata=self.filter_metadata)
                
                if not results:
                    return {
                        "result": "No relevant information found in the contract.",
                        "source_documents": []
                    }
                
                # Enhanced answer generation using Mistral AI
                context = "\n\n".join([doc.page_content for doc in results])
                
                # Create prompt for Mistral AI
                prompt = f"""You are a legal contract analysis expert. Answer the user's question based on the provided contract context.\n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer the question in a clear, professional manner. If the information is not available in the context, say so.\nProvide specific references to contract sections when possible.\n\nAnswer:"""
                
                try:
                    # Get response from Mistral AI
                    response = self.mistral_llm.invoke(prompt)
                    answer = response.content
                except Exception as e:
                    # Fallback to simple answer if Mistral AI fails
                    answer = f"""Based on the contract analysis, here's what I found:\n\n{context[:1500]}{'...' if len(context) > 1500 else ''}\n\nThis information is extracted from the relevant contract sections that match your question."""
                
                return {
                    "result": answer,
                    "source_documents": results
                }
        
        return EnhancedQAChain(self, filter_metadata, self.mistral_llm)
    
    def delete_document(self, document_id: str):
        """
        Delete document chunks from vector store
        """
        try:
            filter_metadata = {"document_id": document_id}
            existing_chunks = self.vector_store.get(where=filter_metadata)
            if existing_chunks and existing_chunks['ids']:
                self.vector_store.delete(ids=existing_chunks['ids'])
                logger.info(f"Deleted document {document_id} from ChromaDB vector store")
            else:
                logger.warning(f"No chunks found for document {document_id}")
        except Exception as e:
            logger.error(f"Error deleting document from vector store: {e}")
            raise
    
    def delete_all_documents(self):
        """
        Delete all documents from vector store
        """
        try:
            all_docs = self.vector_store.get()
            if all_docs and all_docs['ids']:
                self.vector_store.delete(ids=all_docs['ids'])
                logger.info(f"Deleted all documents from ChromaDB vector store")
            else:
                logger.info("No documents to delete")
        except Exception as e:
            logger.error(f"Error deleting all documents from vector store: {e}")
            raise
    
    def get_document_stats(self) -> Dict[str, Any]:
        """
        Get vector store statistics
        """
        try:
            all_docs = self.vector_store.get()
            stats = {
                "total_documents": len(all_docs['ids']) if all_docs['ids'] else 0,
                "total_embeddings": len(all_docs['embeddings']) if all_docs['embeddings'] else 0,
                "persist_directory": str(self.persist_directory),
                "last_updated": datetime.now().isoformat(),
                "langchain_version": "full",
                "vector_store": "ChromaDB",
                "embeddings_model": "sentence-transformers/all-MiniLM-L6-v2"
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting vector store stats: {e}")
            return {"error": str(e)}

# Global vector store instance
vector_store_service = VectorStoreService() 