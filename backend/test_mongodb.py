#!/usr/bin/env python3
"""
Test MongoDB connection script
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.mongodb_service import mongodb_service
from app.config import settings

async def test_mongodb():
    """Test MongoDB connection"""
    print("Testing MongoDB connection...")
    print(f"MongoDB URL: {settings.MONGODB_URL}")
    
    try:
        await mongodb_service.connect()
        print("✅ MongoDB connection successful!")
        
        # Test a simple operation
        if mongodb_service.client:
            # Test ping
            result = await mongodb_service.client.admin.command('ping')
            print(f"✅ Ping result: {result}")
            
            # Test database access
            db = mongodb_service.client.get_default_database()
            print(f"✅ Database: {db.name}")
            
            # Test collection access
            users_collection = db.users
            count = await users_collection.count_documents({})
            print(f"✅ Users collection count: {count}")
            
        else:
            print("❌ MongoDB client is None")
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_mongodb())
