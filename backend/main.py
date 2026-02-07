from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles  
from fastapi.responses import FileResponse
from backend.contacts import create_contact_in_db, delete_contacts, fetch_contacts, mark_read, reply, get_contact_by_id, check_rate_limit, message_length
from backend.github_projects import fetch_projects
from backend.schema import ContactCreate, ContactOut, ContactReadUpdate, Project, ReplyMessage, PostCreate, PostOut, PostUpdate
from backend.database import engine, Base
from backend.admin_login import admin_login
from backend.verify_token import verify_token
from backend.email_validation import email_validator_address
from backend.posts import get_all_posts, create_posts, delete_posts, update_posts, get_post_by_id
from pathlib import Path  
from backend.models import Users
import os  

from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mounts específicos
app.mount("/scripts", StaticFiles(directory=str(FRONTEND_DIR / "scripts")), name="scripts")
app.mount("/data", StaticFiles(directory=str(FRONTEND_DIR / "data")), name="data")
app.mount("/pages", StaticFiles(directory=str(FRONTEND_DIR / "pages")), name="pages")
app.mount("/docs", StaticFiles(directory=str(BASE_DIR / "docs")), name="docs")
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/", include_in_schema=False)
async def serve_frontend():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/styles.css")
async def serve_css():
    return FileResponse(str(FRONTEND_DIR / "styles.css"))


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

@app.get("/post/{post_id}", response_model=PostOut)
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

# ⚠️ ENDPOINT TEMPORÁRIO - REMOVER DEPOIS!
@app.post("/secret-setup-admin-xyz123")
async def setup_admin(secret_key: str):
    # Proteção básica
    if secret_key != "meu-portfolio-2026-setup":
        raise HTTPException(status_code=403, detail="Forbidden")
    
    from passlib.context import CryptContext
    from backend.models import Users
    from backend.database import SessionLocal
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Verifica se já existe admin
    db = SessionLocal()
    existing = db.query(Users).filter(Users.email == "goncalo.luis.pinto@gmail.com").first()
    
    if existing:
        db.close()
        return {"message": "Admin já existe!"}
    
    # Cria admin
    admin = Users(
        email="goncalo.luis.pinto@gmail.com",
        hashed_password=pwd_context.hash("BestAdmin")  # ← MUDA ISTO!
    )
    db.add(admin)
    db.commit()
    db.close()
    
    return {"message": "✅ Admin criado com sucesso!", "email": "goncalo.luis.pinto@gmail.com"}

@app.get("/{page_name}", include_in_schema=False)
async def serve_page(page_name: str, request: Request):  
    if request.method != "GET":
        raise HTTPException(status_code=405, detail="Method not allowed")
    
    allowed_pages = ["admin", "admin-login", "add-post", "edit-post", "filters", "reply"]
    
    if page_name in allowed_pages:
        file_path = FRONTEND_DIR / "pages" / f"{page_name}.html"
        if file_path.exists():
            return FileResponse(str(file_path))
    
    raise HTTPException(status_code=404, detail="Page not found")

