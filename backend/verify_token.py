from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from backend.database import SessionLocal
from backend.models import Users
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

#jwt.decode checks automatically if token is valid, if not launches a JWTError
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        db = SessionLocal()

        res = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        email = res.get("sub")
                
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(Users).filter(Users.email == email).first()

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return email
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")