from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path

# Carrega variáveis de ambiente
load_dotenv()

# BASE_DIR para SQLite local
BASE_DIR = Path(__file__).resolve().parent

# Usa DATABASE_URL do ambiente (produção) ou SQLite (local)
DATABASE_URL = os.getenv("DATABASE_URL")

# Se não houver DATABASE_URL no .env, usa SQLite local
if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'db.sqlite'}"
    connect_args = {"check_same_thread": False}
else:
    # Fix para Render: muda postgres:// para postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {}

# Cria a conexão com a base de dados
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Cria uma session factory com estas propriedades
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Cria classe Base especial do SQLAlchemy
# Cada classe que herda de Base representa uma tabela
Base = declarative_base()

# Helper function para usar nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()