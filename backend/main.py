from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contacts import create_contact_in_db, delete_contacts, fetch_contacts
from github_projects import fetch_projects
from schema import ContactCreate, ContactOut, Project

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem (para testes)
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/contact", response_model=list[ContactOut])
def get_contact():
    contacts = fetch_contacts()
    return[ContactOut.model_validate(c, from_attributes=True) for c in contacts]

@app.post("/contact")
def contact(contact: ContactCreate):
    return create_contact_in_db(contact)

@app.delete("/contact/{contact_id}")
def delete_contact(contact_id: int):
    return delete_contacts(contact_id)

#created an /projects endpoint
#fast api receives a list[Project] python object and calls .dump to revert it to json and then sends it to the frontend via http request
#pydantic with BaseModel gives to the Project class the methods to converto to json automatically
@app.get("/projects", response_model=list[Project])
def get_project():
    return fetch_projects()
