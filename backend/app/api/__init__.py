"""
API package initialization.
Imports all API routers for the application.
"""

from fastapi import APIRouter
from app.api import auth, contracts, chat

# Create main API router
api_router = APIRouter()

# Include all API routers
api_router.include_router(auth.router)
api_router.include_router(contracts.router)
api_router.include_router(chat.router)

__all__ = ["api_router"]