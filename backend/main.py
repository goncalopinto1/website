from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from contacts import create_contact_in_db, delete_contacts, fetch_contacts, mark_read
from github_projects import fetch_projects
from schema import ContactCreate, ContactOut, ContactReadUpdate, Project
from database import engine, Base
from admin_login import admin_login
from verify_token import verify_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem (para testes)
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(tags=["Authentication"])

# Depends tells that the function inside must be performed before the endpoint one
@app.get("/contact", response_model=list[ContactOut])
def get_contact(current_user: str = Depends(verify_token)):
    contacts = fetch_contacts()
    return[ContactOut.model_validate(c, from_attributes=True) for c in contacts]

@app.post("/contact")
def contact(contact: ContactCreate):
    return create_contact_in_db(contact)

@app.delete("/contact/{contact_id}")
def delete_contact(contact_id: int, current_user: str = Depends(verify_token)):
    return delete_contacts(contact_id)

@app.patch("/contact/{contact_id}")
def mark_as_read(contact_id: int, is_read: ContactReadUpdate, current_user: str = Depends(verify_token)):
    return mark_read(contact_id, is_read)

#created an /projects endpoint
#fast api receives a list[Project] python object and calls .dump to revert it to json and then sends it to the frontend via http request
#pydantic with BaseModel gives to the Project class the methods to converto to json automatically
@app.get("/projects", response_model=list[Project])
def get_project():
    return fetch_projects()

@app.post("/admin/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends()):
    return admin_login(user_credentials)