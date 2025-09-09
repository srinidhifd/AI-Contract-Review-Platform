#!/usr/bin/env python3
"""
Startup script for Railway deployment.
This script ensures the correct path is used to start the FastAPI app.
"""

import os
import sys
import subprocess

def main():
    """Start the FastAPI application using hypercorn."""
    print("🚀 Starting AI Contract Review Platform...")
    
    # Set the correct working directory
    os.chdir('/app')
    
    # Get port from environment
    port = os.environ.get('PORT', '8000')
    
    # Start hypercorn with the correct module path
    cmd = [
        'hypercorn',
        'backend.main:app',
        '--bind', f'[::]:{port}',
        '--workers', '1',
        '--log-level', 'info'
    ]
    
    print(f"🚀 Starting server on port {port}")
    print(f"🚀 Command: {' '.join(cmd)}")
    
    try:
        # Run hypercorn
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start application: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("🛑 Shutting down...")
        sys.exit(0)

if __name__ == "__main__":
    main()
