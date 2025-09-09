"""
Main FastAPI application entry point.
Configures the application, middleware, and routes.
"""

import logging
import logging.config
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings, validate_config, get_logging_config
from app.services.mongodb_service import mongodb_service
from app.services.openai_service import openai_service
from app.api import api_router

# Configure logging
logging.config.dictConfig(get_logging_config())
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting AI Contract Review Platform...")
    
    # Validate configuration
    if not validate_config():
        logger.error("Configuration validation failed")
        raise Exception("Invalid configuration")
    
    # Initialize MongoDB connection
    try:
        await mongodb_service.connect()
        logger.info("MongoDB connection established")
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}")
        logger.warning("Continuing without MongoDB connection for testing...")
        mongodb_service.client = None
    
    # Test OpenAI service
    try:
        if await openai_service.health_check():
            logger.info("OpenAI service is healthy")
        else:
            logger.warning("OpenAI service health check failed")
    except Exception as e:
        logger.warning(f"OpenAI service health check error: {e}")
    
    logger.info("Application startup completed")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Contract Review Platform...")
    await mongodb_service.disconnect()
    logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-powered contract analysis and review platform",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Add compatibility endpoints for frontend
from fastapi import Request
from fastapi.responses import RedirectResponse

@app.post("/api/login")
async def login_compatibility(request: Request):
    """Compatibility endpoint for frontend login calls."""
    return RedirectResponse(url="/api/v1/auth/login", status_code=307)

@app.post("/api/register") 
async def register_compatibility(request: Request):
    """Compatibility endpoint for frontend register calls."""
    return RedirectResponse(url="/api/v1/auth/register", status_code=307)

@app.post("/api/logout")
async def logout_compatibility(request: Request):
    """Compatibility endpoint for frontend logout calls."""
    return {"message": "Logged out successfully"}

# Add explicit OPTIONS handlers for CORS preflight
@app.options("/api/v1/auth/login")
async def login_options():
    """Handle CORS preflight for login."""
    return JSONResponse(
        content={}, 
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://ai-contract-review-platform.vercel.app",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.options("/api/v1/auth/register")
async def register_options():
    """Handle CORS preflight for register."""
    return JSONResponse(
        content={}, 
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://ai-contract-review-platform.vercel.app",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.options("/api/v1/auth/logout")
async def logout_options():
    """Handle CORS preflight for logout."""
    return JSONResponse(
        content={}, 
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "https://ai-contract-review-platform.vercel.app",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/")
async def root():
    """Root endpoint with basic application information."""
    return {
        "message": "AI Contract Review Platform API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs" if settings.DEBUG else "Documentation not available in production"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns the status of all services.
    """
    try:
        # Check MongoDB
        mongodb_healthy = await mongodb_service.health_check()
        
        # Check OpenAI
        openai_healthy = await openai_service.health_check()
        
        # Overall health status
        overall_healthy = mongodb_healthy and openai_healthy
        
        return {
            "status": "healthy" if overall_healthy else "unhealthy",
            "timestamp": "2024-01-01T00:00:00Z",  # This would be datetime.utcnow().isoformat()
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "services": {
                "mongodb": "healthy" if mongodb_healthy else "unhealthy",
                "openai": "healthy" if openai_healthy else "unhealthy"
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2024-01-01T00:00:00Z",
                "version": settings.VERSION,
                "environment": settings.ENVIRONMENT
            }
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler."""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler for unhandled exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )