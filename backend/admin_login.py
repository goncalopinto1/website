from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from database import SessionLocal
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from models import Users
from dotenv import load_dotenv
import os
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def admin_login(user_credentials: OAuth2PasswordRequestForm = Depends()):
    admin_email = user_credentials.username
    admin_password = user_credentials.password

    db = SessionLocal()

    user = db.query(Users).filter(
        Users.email == admin_email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "Invalid credentials"
        )

    if not pwd_context.verify(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "Invalid credentials"
        )

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    token_data = {
        "sub": user.email, # sub = subject(who's token owner)
        "exp": expire # exp = expiration
    }

    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    db.close()
    return {"access_token": access_token, "token_type": "bearer"}