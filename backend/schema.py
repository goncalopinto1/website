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

class PostCreate(BaseModel):
    title: str
    content: str
    published: bool = False

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    published: bool
    
    class Config:
        from_attributes = True

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    published: bool | None = None