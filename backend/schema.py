from pydantic import BaseModel

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

    class Config:
        orm_mode = True

class ContactReadUpdate(BaseModel):
    is_read: bool