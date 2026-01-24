from sqlalchemy import  create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'db.sqlite'}"

#create the conection with the database
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
#creates a session fabrick whith these properties
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
#creates special Base class ofSQLalchemy
#everu class that receives Base represent data tables
Base = declarative_base()
