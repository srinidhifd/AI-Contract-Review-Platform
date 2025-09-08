#!/usr/bin/env python3
"""
Simple startup script for Railway deployment.
Assumes uvicorn is already installed during build phase.
"""

import os
import sys

def main():
    """Main function to start the application."""
    print("🚀 Starting AI Contract Review Platform...")
    
    # Set Python path
    sys.path.insert(0, '/app')
    os.environ['PYTHONPATH'] = '/app'
    
    # Get port from environment
    port = int(os.environ.get('PORT', 8000))
    
    print(f"🚀 Starting server on port {port}")
    
    try:
        # Import uvicorn
        import uvicorn
        print("✅ uvicorn imported successfully")
        
        # Import the app
        from main import app
        print("✅ Application imported successfully")
        
        # Run the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("❌ uvicorn should be installed during build phase")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
