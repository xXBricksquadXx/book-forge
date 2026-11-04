import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_URI)

# Define the database and collections
db = client.book_forge
chapters_col = db.chapters
projects_col = db.projects