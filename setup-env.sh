#!/bin/bash

# Environment Variables Setup Script
# This script helps you set up environment variables for production

echo "🔧 Environment Variables Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate a secure secret key
generate_secret_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(32))"
}

# Function to get user input
get_input() {
    local prompt="$1"
    local default="$2"
    local value
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        echo "${value:-$default}"
    else
        read -p "$prompt: " value
        echo "$value"
    fi
}

# Main setup function
setup_environment() {
    print_status "Setting up environment variables for production..."
    echo ""
    
    # Get OpenAI API Key
    echo "1. OpenAI API Key"
    echo "   Get your API key from: https://platform.openai.com/api-keys"
    OPENAI_API_KEY=$(get_input "Enter your OpenAI API Key")
    
    # Get MongoDB URL
    echo ""
    echo "2. MongoDB Atlas Connection String"
    echo "   Get your connection string from: https://cloud.mongodb.com/"
    echo "   Format: mongodb+srv://username:password@cluster.mongodb.net/database"
    MONGODB_URL=$(get_input "Enter your MongoDB connection string")
    
    # Generate Secret Key
    echo ""
    echo "3. JWT Secret Key"
    SECRET_KEY=$(generate_secret_key)
    print_success "Generated secure secret key: $SECRET_KEY"
    
    # Get Frontend URL
    echo ""
    echo "4. Frontend URL (for CORS)"
    echo "   This will be your Vercel domain (e.g., https://your-app.vercel.app)"
    FRONTEND_URL=$(get_input "Enter your frontend URL" "https://your-app.vercel.app")
    
    # Get Backend URL
    echo ""
    echo "5. Backend URL"
    echo "   This will be your Railway domain (e.g., https://your-app.railway.app)"
    BACKEND_URL=$(get_input "Enter your backend URL" "https://your-app.railway.app")
    
    # Create environment files
    echo ""
    print_status "Creating environment files..."
    
    # Backend .env file
    cat > backend/.env << EOF
# Production Environment Configuration
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.1

MONGODB_URL=$MONGODB_URL
MONGODB_DATABASE=contract_review

SECRET_KEY=$SECRET_KEY

ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
APP_NAME=AI Contract Review Platform
VERSION=2.0.0

MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.docx,.doc,.txt
UPLOAD_DIR=uploads

CORS_ORIGINS=$FRONTEND_URL,http://localhost:3000,http://localhost:5173

API_V1_STR=/api/v1
PROJECT_NAME=AI Contract Review Platform

ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
EOF
    
    # Frontend .env file
    cat > frontend/.env << EOF
VITE_API_BASE_URL=$BACKEND_URL
EOF
    
    print_success "Environment files created successfully!"
    echo ""
    echo "Files created:"
    echo "- backend/.env"
    echo "- frontend/.env"
    echo ""
    print_warning "IMPORTANT: Never commit these .env files to version control!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Set these environment variables in your hosting platforms:"
    echo "   - Railway (Backend): All backend variables"
    echo "   - Vercel (Frontend): VITE_API_BASE_URL"
    echo "3. Deploy your application"
}

# Run setup
setup_environment
