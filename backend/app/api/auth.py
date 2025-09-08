"""
Authentication API routes.
Handles user registration, login, and token management.
"""

import logging
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.mongodb_models import UserCreate, UserResponse, UserLogin, Token
from app.services.auth_service import auth_service
from app.services.mongodb_service import mongodb_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """
    Get the current authenticated user.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        UserResponse object
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        token = credentials.credentials
        user = await auth_service.get_current_user(token)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            department=user.department,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        
    Returns:
        UserResponse object
        
    Raises:
        HTTPException: If registration fails
    """
    try:
        # Validate input data
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        

        
        # Register user
        user, error_message = await auth_service.register_user(user_data)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message or "Registration failed"
            )
        
        logger.info(f"User registered successfully: {user.email}")
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            department=user.department,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service error"
        )


@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """
    Authenticate user and return access token.
    
    Args:
        login_data: User login credentials
        
    Returns:
        Token object with access token
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Authenticate user
        user, error_message = await auth_service.authenticate_user(login_data.email, login_data.password)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_message or "Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
        access_token = auth_service.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logger.info(f"User logged in successfully: {user.email}")
        
        # Create user response
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            department=user.department,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return Token(access_token=access_token, token_type="bearer", user=user_response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse object
    """
    return current_user


@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Change user password.
    
    Args:
        old_password: Current password
        new_password: New password
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If password change fails
    """
    try:
        # Validate new password
        if len(new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        
        # Update password
        success = await auth_service.update_user_password(
            current_user.id, old_password, new_password
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid current password"
            )
        
        logger.info(f"Password changed successfully for user: {current_user.email}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change service error"
        )


@router.post("/deactivate")
async def deactivate_account(current_user: UserResponse = Depends(get_current_user)):
    """
    Deactivate user account.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If deactivation fails
    """
    try:
        success = await auth_service.deactivate_user(current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to deactivate account"
            )
        
        logger.info(f"Account deactivated for user: {current_user.email}")
        
        return {"message": "Account deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account deactivation failed for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deactivation service error"
        )


@router.get("/validate-token")
async def validate_token(current_user: UserResponse = Depends(get_current_user)):
    """
    Validate the current token.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Token validation result
    """
    return {
        "valid": True,
        "user": current_user,
        "message": "Token is valid"
    }