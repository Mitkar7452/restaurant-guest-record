from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class GuestEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    pax: int
    check_in_time: str
    place: str
    guest_type: str
    room_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GuestEntryCreate(BaseModel):
    name: str
    phone: str
    pax: int
    check_in_time: str
    place: str
    guest_type: str
    room_number: Optional[str] = None

class Settings(BaseModel):
    whatsapp_target: str

class SettingsUpdate(BaseModel):
    whatsapp_target: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Restaurant Guest Management API"}

@api_router.post("/guests", response_model=GuestEntry)
async def create_guest_entry(input: GuestEntryCreate):
    """Create a new guest entry"""
    guest_dict = input.dict()
    guest_obj = GuestEntry(**guest_dict)
    _ = await db.guests.insert_one(guest_obj.dict())
    return guest_obj

@api_router.get("/guests", response_model=List[GuestEntry])
async def get_guest_entries():
    """Get all guest entries"""
    guests = await db.guests.find().sort("created_at", -1).to_list(1000)
    return [GuestEntry(**guest) for guest in guests]

@api_router.get("/settings")
async def get_settings():
    """Get WhatsApp settings"""
    settings = await db.settings.find_one({"type": "whatsapp"})
    if not settings:
        # Return default empty settings
        return {"whatsapp_target": ""}
    return {"whatsapp_target": settings.get("whatsapp_target", "")}

@api_router.put("/settings")
async def update_settings(input: SettingsUpdate):
    """Update WhatsApp settings"""
    result = await db.settings.update_one(
        {"type": "whatsapp"},
        {"$set": {"whatsapp_target": input.whatsapp_target, "type": "whatsapp"}},
        upsert=True
    )
    return {"whatsapp_target": input.whatsapp_target, "success": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()