from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from models import Users

def admin_login(user: Users):
    admin_email = user.email
    admin_password = user.hashed_password

    