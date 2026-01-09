from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import ContactMessage, SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem (para testes)
    allow_methods=["*"],
    allow_headers=["*"],
)

class Contact(BaseModel):
    name: str
    email: str
    message: str

@app.post("/contact")
def contact(contact: Contact):
    #store on sqlite
    db = SessionLocal()
    db_message = ContactMessage(
        name=contact.name,
        email=contact.email,
        message=contact.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db.close()

    return{"status": "Message received"}