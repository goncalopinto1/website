from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Project(BaseModel):
    name: str
    description: str
    url: str
    language: str | None

#BaseModel serves to validate data, convert json to python type and check types
class ContactCreate(BaseModel):
    name: str
    email: str
    message: str

class ContactOut(ContactCreate):
    id: int
    is_read: int
    timestamp: Optional[datetime] = None 
    
    class Config:
        from_attributes = True

class ContactReadUpdate(BaseModel):
    is_read: bool

class ReplyMessage(BaseModel):
    message: str