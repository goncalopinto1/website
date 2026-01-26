from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException

def email_validator_address(email: str):
    try:
        validate_email(email)
    except EmailNotValidError:
        raise HTTPException(status_code=422, detail="Please provide a valid email address")
    