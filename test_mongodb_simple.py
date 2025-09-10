#!/usr/bin/env python3
"""
Test MongoDB connection directly without config
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from urllib.parse import quote_plus

async def test_mongodb_simple():
    print("🔍 Testing MongoDB connection directly...")
    
    # Use the correct credentials
    username = "srinidhikulkarni25"
    password = "Srinidhi@7"
    encoded_username = quote_plus(username)
    encoded_password = quote_plus(password)
    mongodb_url = f"mongodb+srv://{encoded_username}:{encoded_password}@cluster0.khva9st.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Encoded username: {encoded_username}")
    print(f"Encoded password: {encoded_password}")
    print(f"MongoDB URL: {mongodb_url[:50]}...")
    
    client = None
    try:
        print("\n1. Trying with TLS + certifi...")
        client = AsyncIOMotorClient(
            mongodb_url,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        
        # Test ping
        result = await client.admin.command('ping')
        print(f"✅ Ping successful: {result}")
        
        # Test database access
        db = client.get_database("contract_review")
        print(f"Database name: {db.name}")
        
        # Test collection access
        users_collection = db.users
        print(f"Users collection exists: {users_collection is not None}")
        
        # Test a simple query
        user_count = await users_collection.count_documents({})
        print(f"Total users in database: {user_count}")
        
        # Test creating a user
        print("\n2. Testing user creation...")
        test_user = {
            "email": "test@example.com",
            "full_name": "Test User",
            "department": "Engineering",
            "hashed_password": "test_hash",
            "is_active": True,
            "role": "user"
        }
        
        result = await users_collection.insert_one(test_user)
        print(f"✅ User created with ID: {result.inserted_id}")
        
        # Test finding the user
        found_user = await users_collection.find_one({"email": "test@example.com"})
        if found_user:
            print(f"✅ User found: {found_user['full_name']}")
        else:
            print("❌ User not found")
        
        # Clean up test user
        await users_collection.delete_one({"email": "test@example.com"})
        print("✅ Test user cleaned up")
        
        print("\n🎉 MongoDB is fully working with correct credentials!")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    success = asyncio.run(test_mongodb_simple())
    if success:
        print("\n🎉 MongoDB connection is working!")
    else:
        print("\n💥 MongoDB connection failed!")
