from backend.database import SessionLocal
from backend.models import ContactMessage
from backend.schema import ContactCreate, ContactReadUpdate, ReplyMessage
from datetime import datetime, timedelta
from fastapi import HTTPException
from collections import defaultdict
import resend
from backend.schema import ContactOut
from dotenv import load_dotenv
import os

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

contact_attemps = defaultdict(list)

MAX_ATTEMPTS = 3
TIME_WINDOW = 3600 #1 hour

MIN_LENGTH = 10
MAX_LENGTH = 1000

def check_rate_limit(ip: str):
    now = datetime.now()

    valid_attempts = []

    for timestamp in contact_attemps[ip]:
        time_difference = now - timestamp

        if time_difference < timedelta(seconds=TIME_WINDOW):
            valid_attempts.append(timestamp)

    contact_attemps[ip] = valid_attempts

    if(len(contact_attemps[ip]) >= MAX_ATTEMPTS):
        raise HTTPException(status_code=429, detail=f"Too many requests. Try again in {TIME_WINDOW // 60} minutes")
    
    contact_attemps[ip].append(now)

# contacts.py
def fetch_contacts():
    db = SessionLocal()
    try:
        contacts = db.query(ContactMessage).all()
        
        result = [ContactOut.model_validate(c, from_attributes=True) for c in contacts]
        return result
    finally:
        db.close()

def create_contact_in_db(contact: ContactCreate):
    db = SessionLocal() #creates a session instace that i'll use to talk to the database
    
    db_message = ContactMessage(
        name=contact.name,
        email=contact.email,
        message=contact.message
    )

    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db.close()

    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": os.getenv("ADMIN_EMAIL"),
            "subject": f"New message from {contact.name}",
            "html": f"""
                <h2>New message on your website!</h2>
                <p><strong>From:</strong> {contact.name}</p>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Message:</strong></p>
                <p>{contact.message}</p>
            """
        })
    except Exception as e:
        print(f"Error sending the email: {e}")

    return {"status": "success", "message": "Message received"}

def get_contact_by_id(contact_id: int):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.close()
    return contact

def delete_contacts(contact_id: int):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    db.close()

    return {"status": "deleted"}

def mark_read(contact_id: int, is_read: ContactReadUpdate):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact.is_read = is_read.is_read

    db.commit()
    db.refresh(contact)
    db.close()
    return {"status": "Updated"}

def reply(contact_id: int, message: ReplyMessage):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact_email = contact.email

    r = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": contact_email,
        "subject": "Gonçalo Pinto has sent you a message!",
        "html": f"""
            <p>{message.message}</p>
        """
    })

    db.close()
    return {"status": "Reply sent"}

def message_length(message: str):
    if len(message) < MIN_LENGTH:
        raise HTTPException(status_code=422, detail=f"Message must have at least {MIN_LENGTH} characters")
    if len(message) > MAX_LENGTH:
        raise HTTPException(status_code=422, detail=f"Message must have a maximum of {MAX_LENGTH} characters")