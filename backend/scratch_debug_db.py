import os
from dotenv import load_dotenv

print(f"Current working directory: {os.getcwd()}")
print(f"Checking for .env file: {os.path.exists('.env')}")

load_dotenv()
uri = os.getenv("MONGODB_URI")
print(f"MONGODB_URI: {'[HIDDEN]' if uri else 'NOT FOUND'}")

if uri:
    from pymongo import MongoClient
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("MongoDB Ping successful!")
    except Exception as e:
        print(f"MongoDB Ping failed: {e}")
