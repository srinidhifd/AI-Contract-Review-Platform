#!/bin/bash

# Prepare AI Contract Review Platform for GitHub
# This script cleans up the repository and prepares it for version control

echo "🧹 Preparing AI Contract Review Platform for GitHub"
echo "=================================================="

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

# Function to check if a directory exists and is not empty
is_dir_not_empty() {
    [ -d "$1" ] && [ "$(ls -A "$1" 2>/dev/null)" ]
}

# Clean up function
cleanup() {
    print_status "Cleaning up repository..."
    
    # Remove node_modules if it exists
    if is_dir_not_empty "frontend/node_modules"; then
        print_status "Removing frontend/node_modules..."
        rm -rf frontend/node_modules
        print_success "Removed frontend/node_modules"
    fi
    
    # Remove dist folder if it exists
    if is_dir_not_empty "frontend/dist"; then
        print_status "Removing frontend/dist..."
        rm -rf frontend/dist
        print_success "Removed frontend/dist"
    fi
    
    # Remove Python virtual environment if it exists
    if is_dir_not_empty "backend/venv"; then
        print_status "Removing backend/venv..."
        rm -rf backend/venv
        print_success "Removed backend/venv"
    fi
    
    # Remove __pycache__ directories
    print_status "Removing Python cache files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    print_success "Removed Python cache files"
    
    # Remove uploaded files (keep the directory structure)
    if is_dir_not_empty "backend/uploads"; then
        print_status "Clearing uploaded files..."
        rm -rf backend/uploads/*
        print_success "Cleared uploaded files"
    fi
    
    # Remove vector store data
    if is_dir_not_empty "backend/data"; then
        print_status "Clearing vector store data..."
        rm -rf backend/data/*
        print_success "Cleared vector store data"
    fi
    
    # Remove any .env files (they should not be committed)
    print_status "Checking for .env files..."
    find . -name ".env" -type f -delete 2>/dev/null || true
    print_success "Removed .env files"
    
    # Remove IDE files
    print_status "Removing IDE files..."
    find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.swp" -delete 2>/dev/null || true
    find . -name "*.swo" -delete 2>/dev/null || true
    print_success "Removed IDE files"
    
    # Remove OS files
    print_status "Removing OS files..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    print_success "Removed OS files"
    
    # Remove log files
    print_status "Removing log files..."
    find . -name "*.log" -delete 2>/dev/null || true
    print_success "Removed log files"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create uploads directory
    mkdir -p backend/uploads
    mkdir -p uploads
    
    # Create data directory
    mkdir -p backend/data
    
    # Create .gitkeep files to maintain directory structure
    touch backend/uploads/.gitkeep
    touch uploads/.gitkeep
    touch backend/data/.gitkeep
    
    print_success "Created necessary directories"
}

# Verify .gitignore files
verify_gitignore() {
    print_status "Verifying .gitignore files..."
    
    if [ ! -f ".gitignore" ]; then
        print_error "Root .gitignore file not found!"
        return 1
    fi
    
    if [ ! -f "frontend/.gitignore" ]; then
        print_error "Frontend .gitignore file not found!"
        return 1
    fi
    
    if [ ! -f "backend/.gitignore" ]; then
        print_error "Backend .gitignore file not found!"
        return 1
    fi
    
    print_success "All .gitignore files are present"
}

# Check file sizes
check_file_sizes() {
    print_status "Checking for large files..."
    
    # Find files larger than 10MB
    large_files=$(find . -type f -size +10M 2>/dev/null | grep -v ".git" || true)
    
    if [ -n "$large_files" ]; then
        print_warning "Large files found:"
        echo "$large_files"
        print_warning "Consider adding these to .gitignore or using Git LFS"
    else
        print_success "No large files found"
    fi
}

# Main function
main() {
    echo "Starting repository cleanup..."
    echo ""
    
    # Clean up
    cleanup
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    # Verify .gitignore
    verify_gitignore
    echo ""
    
    # Check file sizes
    check_file_sizes
    echo ""
    
    print_success "Repository cleanup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes: git status"
    echo "2. Add files: git add ."
    echo "3. Commit: git commit -m 'Initial commit'"
    echo "4. Push to GitHub: git push origin main"
    echo ""
    echo "Important:"
    echo "- Make sure to set up environment variables in your hosting platforms"
    echo "- Never commit .env files with real API keys"
    echo "- Test your application after deployment"
}

# Run main function
main
