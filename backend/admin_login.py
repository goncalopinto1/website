from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from backend.database import SessionLocal
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from backend.models import Users
from dotenv import load_dotenv
import os
import bcrypt

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def admin_login(user_credentials: OAuth2PasswordRequestForm = Depends()):
    admin_email = user_credentials.username
    admin_password = user_credentials.password

    db = SessionLocal()
    try:
        user = db.query(Users).filter(Users.email == admin_email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not bcrypt.checkpw(
            admin_password.encode("utf-8"),
            user.hashed_password.encode("utf-8")
        ):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        token_data = {
            "sub": user.email,
            "exp": expire
        }

        access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": access_token, "token_type": "bearer"}

    finally:
        db.close()
