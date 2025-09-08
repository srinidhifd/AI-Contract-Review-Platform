#!/bin/bash

# AI Contract Review Platform - Deployment Script
# This script helps you deploy the application to production

echo "🚀 AI Contract Review Platform - Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if Python is installed
    if ! command -v python &> /dev/null; then
        print_error "Python is not installed. Please install Python first."
        exit 1
    fi
    
    print_success "All requirements are installed!"
}

# Build frontend for production
build_frontend() {
    print_status "Building frontend for production..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build for production
    print_status "Building frontend..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend built successfully!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    cd ..
}

# Prepare backend for production
prepare_backend() {
    print_status "Preparing backend for production..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Please create one based on environment.example"
        print_status "Copying environment.example to .env..."
        cp environment.example .env
        print_warning "Please edit .env file with your actual values before deploying!"
    fi
    
    cd ..
    print_success "Backend prepared successfully!"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy frontend build
    cp -r frontend/dist deployment/frontend
    
    # Copy backend
    cp -r backend deployment/backend
    
    # Copy configuration files
    cp vercel.json deployment/
    cp Procfile deployment/
    cp railway.json deployment/
    cp deployment-guide.md deployment/
    
    print_success "Deployment package created in 'deployment' directory!"
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Check requirements
    check_requirements
    echo ""
    
    # Build frontend
    build_frontend
    echo ""
    
    # Prepare backend
    prepare_backend
    echo ""
    
    # Create deployment package
    create_deployment_package
    echo ""
    
    print_success "Deployment preparation completed!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Set up MongoDB Atlas (free tier)"
    echo "3. Deploy backend to Railway"
    echo "4. Deploy frontend to Vercel"
    echo "5. Configure environment variables"
    echo ""
    echo "For detailed instructions, see deployment-guide.md"
}

# Run main function
main
