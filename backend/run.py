#!/usr/bin/env python3
"""
Railway deployment script that ensures uvicorn is available and runs the application.
"""

import os
import sys
import subprocess

def install_uvicorn():
    """Install uvicorn if it's not available."""
    try:
        print("Installing uvicorn...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn[standard]==0.24.0"])
        print("✅ uvicorn installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install uvicorn: {e}")
        return False

def check_uvicorn():
    """Check if uvicorn is available."""
    try:
        import uvicorn
        print("✅ uvicorn is available")
        return True
    except ImportError:
        print("⚠️ uvicorn not found, installing...")
        return install_uvicorn()

def main():
    """Main function to start the application."""
    print("🚀 Starting AI Contract Review Platform...")
    
    # Set Python path
    sys.path.insert(0, '/app')
    os.environ['PYTHONPATH'] = '/app'
    
    # Check uvicorn
    if not check_uvicorn():
        print("❌ Failed to ensure uvicorn is available")
        sys.exit(1)
    
    # Get port from environment
    port = int(os.environ.get('PORT', 8000))
    
    print(f"🚀 Starting server on port {port}")
    
    # Import uvicorn
    import uvicorn
    
    # Import the app
    try:
        from main import app
        print("✅ Application imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import application: {e}")
        print("Trying alternative import...")
        try:
            import main
            app = main.app
            print("✅ Application imported via alternative method")
        except Exception as e2:
            print(f"❌ Alternative import also failed: {e2}")
            sys.exit(1)
    
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    main()
