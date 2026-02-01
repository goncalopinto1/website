from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from contacts import create_contact_in_db, delete_contacts, fetch_contacts, mark_read, reply, get_contact_by_id, check_rate_limit, message_length
from github_projects import fetch_projects
from schema import ContactCreate, ContactOut, ContactReadUpdate, Project, ReplyMessage, PostCreate, PostOut, PostUpdate
from database import engine, Base
from admin_login import admin_login
from verify_token import verify_token
from email_validation import email_validator_address
from posts import get_all_posts, create_posts, delete_posts, update_posts, get_post_by_id

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permite qualquer origem (para testes)
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(tags=["Authentication"])

@app.get("/contact", response_model=list[ContactOut])
def get_contact(current_user: str = Depends(verify_token)):
    return fetch_contacts()

@app.get("/contact/{contact_id}")
def get_contact(contact_id: int, current_user: str = Depends(verify_token)):
    return get_contact_by_id(contact_id)

@app.post("/contact")
def contact(contact: ContactCreate, request: Request):
    client_ip = request.client.host

    check_rate_limit(client_ip)
    email_validator_address(contact.email)
    message_length(contact.message)
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

@app.post("/contact/{contact_id}/reply")
def reply_to_message(contact_id: int, message: ReplyMessage, current_user: str = Depends(verify_token)):
    return reply(contact_id, message)

@app.get("/post", response_model=list[PostOut])
def get_posts():
    return get_all_posts()

@app.get("/post/{post_id}", response_model=list[PostOut])
def get_posts(post_id: int):
    return get_post_by_id(post_id)

@app.post("/post")
def create_post(post: PostCreate, user_credentials: str = Depends(verify_token)):
    return create_posts(post)

@app.delete("/post/{post_id}")
def delete_post(post_id: int, user_credentials: str = Depends(verify_token)):
    return delete_posts(post_id)

@app.patch("/post/{post_id}")
def update_post(post_id: int, update: PostUpdate, user_credentials: str = Depends(verify_token)):
    return update_posts(post_id, update)