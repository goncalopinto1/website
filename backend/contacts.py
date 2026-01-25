from database import SessionLocal
from models import ContactMessage
from schema import ContactCreate, ContactReadUpdate, ReplyMessage
import resend
from dotenv import load_dotenv
import os

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")


def fetch_contacts():
    db = SessionLocal()
    contacts = db.query(ContactMessage).all() #returns a list with all objects from the table
    db.close()
    return contacts

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
        return {"error": "Contact not found"}
    
    db.close()
    return contact

def delete_contacts(contact_id: int):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        return {"error": "Contact not found"}
    
    db.delete(contact)
    db.commit()
    db.close()

    return {"status": "deleted"}

def mark_read(contact_id: int, is_read: ContactReadUpdate):
    db = SessionLocal()

    contact = db.query(ContactMessage).filter(ContactMessage.id == contact_id).first()

    if not contact:
        db.close()
        return {"error": "Contact not found"}
    
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
        return {"error": "Contact not found"}
    
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