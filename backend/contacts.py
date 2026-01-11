from database import ContactMessage, SessionLocal
from schema import ContactCreate
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

    return{"status": "Message received"}

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
