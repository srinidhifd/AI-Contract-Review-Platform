"""
Configuration management for the AI Contract Review Platform.
Handles environment variables, settings validation, and AI configuration.
"""

import os
import logging
from typing import Dict, Any, Optional
from pydantic import Field, validator

# Handle both Pydantic v1 and v2 compatibility
try:
    from pydantic import BaseSettings
except ImportError:
    from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Core Application Settings
    APP_NAME: str = "AI Contract Review Platform"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Security Settings
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 999999999  # Truly unlimited (999999999 minutes = ~1900 years)
    
    # Mistral AI Configuration
    MISTRAL_API_KEY: str = Field(..., env="MISTRAL_API_KEY")
    MISTRAL_MODEL: str = Field(default="mistral-large-latest", env="MISTRAL_MODEL")
    MISTRAL_MAX_TOKENS: int = Field(default=4000, env="MISTRAL_MAX_TOKENS")
    MISTRAL_TEMPERATURE: float = Field(default=0.1, env="MISTRAL_TEMPERATURE")
    
    # MongoDB Configuration
    MONGODB_URL: str = Field(..., env="MONGODB_URL")
    MONGODB_DATABASE: str = Field(default="contract_review", env="MONGODB_DATABASE")
    
    # File Upload Settings
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    ALLOWED_FILE_TYPES: str = Field(default=".pdf,.docx,.doc,.txt", env="ALLOWED_FILE_TYPES")
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    
    # CORS Settings
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,https://ai-contract-review-platform.vercel.app",
        env="CORS_ORIGINS"
    )
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Contract Review Platform"
    
    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @validator("MISTRAL_API_KEY")
    def validate_mistral_key(cls, v):
        if not v or v == "your_mistral_api_key_here":
            # Allow placeholder for testing without Mistral AI
            return v
        if len(v) < 20:
            raise ValueError("MISTRAL_API_KEY must be a valid Mistral AI API key (too short)")
        return v
    
    @validator("MONGODB_URL")
    def validate_mongodb_url(cls, v):
        if not v or not v.startswith("mongodb"):
            raise ValueError("MONGODB_URL must be a valid MongoDB connection string")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_file_types_list(self) -> list:
        """Convert ALLOWED_FILE_TYPES string to list."""
        return [ext.strip() for ext in self.ALLOWED_FILE_TYPES.split(",")]
    
    @property
    def cors_origins_list(self) -> list:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


class AIConfig:
    """AI service configuration and prompt templates."""
    
    @staticmethod
    def get_mistral_config() -> Dict[str, Any]:
        """Get Mistral AI configuration."""
        return {
            "api_key": settings.MISTRAL_API_KEY,
            "model": settings.MISTRAL_MODEL,
            "max_tokens": settings.MISTRAL_MAX_TOKENS,
            "temperature": settings.MISTRAL_TEMPERATURE,
        }
    
    @staticmethod
    def get_analysis_config() -> Dict[str, Any]:
        """Get contract analysis configuration."""
        return {
            "max_chunk_size": 4000,
            "chunk_overlap": 200,
            "analysis_prompt_template": """
You are a professional contract analyst with expertise in legal document review. Your task is to analyze the provided contract and identify potential risks, issues, and areas for improvement.

IMPORTANT: You MUST provide a real, detailed analysis. Do NOT give generic responses like "I'm sorry, but as an AI..." or "I cannot provide legal advice." You are expected to analyze the contract content and provide specific, actionable insights.

Contract Content:
{content}

Analyze this contract thoroughly and provide your assessment in the following EXACT JSON format (no additional text, just the JSON):

IMPORTANT: The risk_score must be calculated using the formula above and MUST be different for each contract. Use decimal places and add variation to ensure uniqueness.

{{
    "summary": "A concise 2-3 sentence summary of what this contract is about and its main purpose",
    "risk_score": 0.0,
    "total_clauses": 0,
    "key_points": [
        "Key point 1 about the contract",
        "Key point 2 about the contract",
        "Key point 3 about the contract"
    ],
    "risk_assessments": [
        {{
            "category": "Financial Risks",
            "severity": "Medium",
            "description": "Specific description of the risk found in the contract",
            "recommendation": "Specific recommendation to mitigate this risk",
            "original_clause": "Exact text from the contract that contains this risk",
            "ai_suggestion": "Improved version of the clause with better terms"
        }},
        {{
            "category": "Legal Compliance",
            "severity": "Low",
            "description": "Another specific risk description",
            "recommendation": "Another specific recommendation",
            "original_clause": "Another exact clause text",
            "ai_suggestion": "Another improved clause version"
        }},
        {{
            "category": "Termination Clauses",
            "severity": "High",
            "description": "Third specific risk description",
            "recommendation": "Third specific recommendation",
            "original_clause": "Third exact clause text",
            "ai_suggestion": "Third improved clause version"
        }}
    ],
    "suggested_revisions": [
        "Specific revision suggestion 1",
        "Specific revision suggestion 2",
        "Specific revision suggestion 3"
    ]
}}

ANALYSIS REQUIREMENTS:
1. Read the entire contract content carefully
2. Identify actual clauses, terms, and conditions
3. Assess real risks based on the contract language
4. Calculate realistic risk scores (0-100) using this EXACT formula:
   - Start with base score of 20 for any contract
   - Add 18 points for each HIGH severity risk found
   - Add 10 points for each MEDIUM severity risk found  
   - Add 4 points for each LOW severity risk found
   - Add 15 points for missing critical clauses (payment terms, termination, etc.)
   - Add 12 points for vague or ambiguous language
   - Add 20 points for one-sided or unfair terms
   - Add 8 points for each missing standard clause (confidentiality, IP, etc.)
   - Add 6 points for each unclear liability clause
   - Add 10 points for each missing dispute resolution clause
   - Add 5 points for each missing confidentiality clause
   - Add 7 points for each missing intellectual property clause
   - Examples: 1 High + 2 Medium + 1 Low = 20 + 18 + 20 + 4 = 62
   - Examples: 2 High + 1 Medium = 20 + 36 + 10 = 66
   - Examples: 1 High + 3 Low + vague language = 20 + 18 + 12 + 12 = 62
   - Ensure scores vary realistically: 15-35 (low risk), 40-65 (medium risk), 70-85 (high risk), 90-100 (critical risk)
   - CRITICAL: NO two contracts should have identical scores unless they are truly identical
   - Use decimal places for variation: 43.2, 67.8, 52.1, etc.
   - MANDATORY: Add random variation of ±3-7 points to make each contract unique
   - Example: If calculation gives 65, use 62.3 or 68.7 instead
   - VARY the base score: Use 18-25 instead of always 20
   - VARY the risk point values: Use 16-20 for High, 8-12 for Medium, 3-6 for Low
5. Count actual clauses/terms in the contract
6. Extract real key points from the contract
7. Find actual problematic clauses and suggest improvements
8. Base all assessments on the actual contract content, not generic responses
9. MUST provide at least 3-5 risk assessments for a comprehensive analysis
10. Each risk assessment must have a different category and severity level
11. Ensure the number of risk assessments matches the total_clauses count

CRITICAL: For AI suggestions, you MUST provide significantly different and improved versions of clauses:
- Add specific details, timeframes, or conditions that are missing
- Include protective language for the disadvantaged party
- Specify consequences, remedies, or enforcement mechanisms
- Add clarity to ambiguous terms
- Include dispute resolution procedures
- Add performance metrics or measurable criteria
- Specify notice requirements and procedures
- Include termination conditions and procedures
- Add confidentiality and non-disclosure protections
- Include intellectual property protections

DO NOT simply rephrase the original clause. Provide substantial improvements that address the identified risks.

RISK SCORING GUIDELINES:
- 0-20: Low risk (well-drafted, clear terms, minimal issues)
- 21-50: Medium risk (some unclear terms, minor issues)
- 51-80: High risk (significant issues, unclear terms, potential problems)
- 81-100: Very high risk (major issues, problematic clauses, significant concerns)

Focus on identifying:
- Unclear or ambiguous language
- Missing important terms
- Unfavorable conditions
- Legal compliance issues
- Financial risks
- Termination and liability clauses
- Intellectual property concerns
- Confidentiality issues
- Dispute resolution mechanisms

Provide a thorough, professional analysis based on the actual contract content.
""",
            "chat_prompt_template": """
You are an expert contract analyst assistant. Answer questions about the following contract content with appropriate response length and detail.

Contract Content:
{content}

User Question: {question}

RESPONSE GUIDELINES:
1. **Response Length Control:**
   - For simple questions (what, who, when, where): 1-3 sentences maximum
   - For complex questions (summarize, analyze, explain): 2-4 paragraphs maximum
   - For yes/no questions: Answer directly with brief explanation
   - For list questions: Provide concise bullet points

2. **Question Type Detection:**
   - "What type of contract?" → 1-2 sentences identifying contract type
   - "Who are the parties?" → List parties with brief roles
   - "What are the key terms?" → 3-5 bullet points
   - "Summarize" → 2-3 paragraph overview
   - "When does it expire?" → Direct date/term answer
   - "What is the payment?" → Specific amount and terms

3. **Context Understanding:**
   - Understand the question intent, not just keywords
   - If question is unrelated to contract, politely redirect
   - If information is not in contract, state clearly
   - Reference specific contract sections when relevant

4. **Response Quality:**
   - Be precise and direct
   - Avoid unnecessary elaboration
   - Use professional but conversational tone
   - Focus on what the user actually asked

5. **Examples of Good Responses:**
   - "This is a service agreement between Company A and Company B."
   - "The parties are: [Company A] (service provider) and [Company B] (client)."
   - "The contract expires on [specific date] or [specific condition]."
   - "Payment is $X per month, due on the 1st of each month."

Answer the question appropriately based on these guidelines.
"""
        }


# Global settings instance
settings = Settings()


def validate_config() -> bool:
    """Validate that all required configuration is present."""
    try:
        # Test Mistral AI API key format
        if len(settings.MISTRAL_API_KEY) < 20:
            logging.error("Invalid Mistral AI API key format (too short)")
            return False
        
        # Test MongoDB URL format
        if not settings.MONGODB_URL.startswith("mongodb"):
            logging.error("Invalid MongoDB URL format")
            return False
        
        # Test secret key length
        if len(settings.SECRET_KEY) < 32:
            logging.error("SECRET_KEY must be at least 32 characters")
            return False
        
        logging.info("Configuration validation successful")
        return True 
        
    except Exception as e:
        logging.error(f"Configuration validation failed: {e}")
        return False


def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration."""
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "default",
                "stream": "ext://sys.stdout",
            },
            # "file": {
            #     "class": "logging.handlers.RotatingFileHandler",
            #     "level": settings.LOG_LEVEL,
            #     "formatter": "detailed",
            #     "filename": "logs/app.log",
            #     "maxBytes": 10485760,  # 10MB
            #     "backupCount": 5,
            # },
        },
        "loggers": {
            "": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }