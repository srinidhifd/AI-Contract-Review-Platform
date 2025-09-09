"""
Main entry point for Railway deployment.
This file imports the FastAPI app from the backend module.
"""

# Import the FastAPI app from backend
from backend.main import app

# This makes the app available at the root level for Railway
__all__ = ["app"]
