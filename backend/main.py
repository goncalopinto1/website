from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import ContactMessage, SessionLocal
from github_projects import fetch_projects
from models import Project

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem (para testes)
    allow_methods=["*"],
    allow_headers=["*"],
)

#BaseModel serves to validate data, convert json to python type and check types
class Contact(BaseModel):
    name: str
    email: str
    message: str

@app.post("/contact")
def contact(contact: Contact):
    #store on sqlite
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

#created an /projects endpoint
#fast api receives a list[Project] python object and calls .dump to revert it to json and then sends it to the frontend via http request
#pydantic with BaseModel gives to the Project class the methods to converto to json automatically
@app.get("/projects", response_model=list[Project])
def get_project():
    return fetch_projects()