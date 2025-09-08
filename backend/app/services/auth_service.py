"""
Authentication service for user management and JWT token handling.
Handles user registration, login, password hashing, and token generation.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import settings
from app.models.mongodb_models import User, UserCreate, TokenData
from app.services.mongodb_service import mongodb_service

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service class for authentication operations."""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.
        
        Args:
            plain_password: The plain text password
            hashed_password: The hashed password
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return False
    
    def get_password_hash(self, password: str) -> str:
        """
        Hash a password.
        
        Args:
            password: The plain text password
            
        Returns:
            The hashed password
        """
        try:
            return pwd_context.hash(password)
        except Exception as e:
            logger.error(f"Password hashing failed: {e}")
            raise
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.
        
        Args:
            data: The data to encode in the token
            expires_delta: Optional expiration time override
            
        Returns:
            The encoded JWT token
        """
        try:
            to_encode = data.copy()
            if expires_delta:
                expire = datetime.utcnow() + expires_delta
            else:
                expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
            
            to_encode.update({"exp": expire})
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        
        except Exception as e:
            logger.error(f"Token creation failed: {e}")
            raise
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """
        Verify and decode a JWT token.
        
        Args:
            token: The JWT token to verify
            
        Returns:
            TokenData if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            email: str = payload.get("sub")
            if email is None:
                return None
            return TokenData(email=email)
            
        except JWTError as e:
            logger.warning(f"Token verification failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> tuple[Optional[User], Optional[str]]:
        """
        Authenticate a user with email and password.
        
        Args:
            email: The email address (case-insensitive)
            password: The plain text password (case-sensitive)
            
        Returns:
            Tuple of (User object if authentication successful, error message if failed)
        """
        try:
            # Pass email directly to MongoDB service (it handles case-insensitive lookup)
            user = await mongodb_service.get_user_by_email(email)
            if not user:
                logger.warning(f"Authentication failed: user {email} not found")
                return None, "No account found with this email. Please sign up first or check your email address."
            
            if not self.verify_password(password, user.hashed_password):
                logger.warning(f"Authentication failed: invalid password for user {email}")
                return None, "Invalid email or password. Please check your credentials and try again."
            
            if not user.is_active:
                logger.warning(f"Authentication failed: user {email} is inactive")
                return None, "Your account has been deactivated. Please contact support."
            
            logger.info(f"User {email} authenticated successfully")
            return user, None
            
        except Exception as e:
            logger.error(f"Authentication error for user {email}: {e}")
            return None, "Authentication service error. Please try again."
    
    async def register_user(self, user_data: UserCreate) -> tuple[Optional[User], Optional[str]]:
        """
        Register a new user.
        
        Args:
            user_data: User creation data
            
        Returns:
            Tuple of (User object if registration successful, error message if failed)
        """
        try:
            # Check if user already exists (MongoDB service handles case-insensitive lookup)
            existing_email = await mongodb_service.get_user_by_email(user_data.email)
            if existing_email:
                logger.warning(f"Registration failed: email {user_data.email} already exists")
                return None, "An account with this email already exists. Please use a different email or try logging in."
            
            # Hash password
            hashed_password = self.get_password_hash(user_data.password)
            
            # Create user data (normalize email to lowercase for storage)
            user_dict = {
                "email": user_data.email.lower().strip(),  # Store as lowercase
                "full_name": user_data.full_name,
                "department": user_data.department,
                "hashed_password": hashed_password,
                "is_active": True,
                "role": "user"
            }
            
            # Create user in database
            user = await mongodb_service.create_user(user_dict)
            logger.info(f"User {user_data.email} registered successfully")
            return user, None
            
        except Exception as e:
            logger.error(f"User registration failed for {user_data.email}: {e}")
            return None, "Registration failed. Please try again."
    
    async def get_current_user(self, token: str) -> Optional[User]:
        """
        Get the current user from a JWT token.
        
        Args:
            token: The JWT token
            
        Returns:
            User object if token is valid, None otherwise
        """
        try:
            token_data = self.verify_token(token)
            if token_data is None:
                return None
            
            # Pass email from token to MongoDB service (it handles case-insensitive lookup)
            user = await mongodb_service.get_user_by_email(token_data.email)
            if user is None:
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to get current user from token: {e}")
            return None
        
    async def update_user_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """
        Update a user's password.
        
        Args:
            user_id: The user ID
            old_password: The current password
            new_password: The new password
            
        Returns:
            True if password updated successfully, False otherwise
        """
        try:
            user = await mongodb_service.get_user_by_id(user_id)
            if not user:
                return False
            
            # Verify old password
            if not self.verify_password(old_password, user.hashed_password):
                logger.warning(f"Password update failed: invalid old password for user {user.email}")
                return False
            
            # Hash new password
            new_hashed_password = self.get_password_hash(new_password)
            
            # Update user
            updated_user = await mongodb_service.update_user(user_id, {
                "hashed_password": new_hashed_password,
                "updated_at": datetime.utcnow()
            })
            
            if updated_user:
                logger.info(f"Password updated successfully for user {user.email}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Password update failed for user {user_id}: {e}")
            return False
    
    async def deactivate_user(self, user_id: str) -> bool:
        """
        Deactivate a user account.
        
        Args:
            user_id: The user ID
            
        Returns:
            True if user deactivated successfully, False otherwise
        """
        try:
            updated_user = await mongodb_service.update_user(user_id, {
                "is_active": False,
                "updated_at": datetime.utcnow()
            })
            
            if updated_user:
                logger.info(f"User {updated_user.email} deactivated successfully")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to deactivate user {user_id}: {e}")
            return False
    
    async def activate_user(self, user_id: str) -> bool:
        """
        Activate a user account.
        
        Args:
            user_id: The user ID
            
        Returns:
            True if user activated successfully, False otherwise
        """
        try:
            updated_user = await mongodb_service.update_user(user_id, {
                "is_active": True,
                "updated_at": datetime.utcnow()
            })
            
            if updated_user:
                logger.info(f"User {updated_user.email} activated successfully")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to activate user {user_id}: {e}")
            return False


# Global auth service instance
auth_service = AuthService()
