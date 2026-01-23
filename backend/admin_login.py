from passlib.context import CryptContext
from database import SessionLocal
from models import Users

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

db = SessionLocal()

admin_email = "admin@email.com"
admin_password = "BestAdmin"

hashed_pass = pwd_context.hash(admin_password)

admin_user = Users(
    email=admin_email,
    hashed_password=hashed_pass
)

db.add(admin_user)
db.commit()
db.close()

print(f"✅ Admin profile created with email: {admin_email}")