import os
import json
from pathlib import Path
from typing import List, Union
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root if present
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Detect Vercel serverless environment or AWS Lambda container
IS_VERCEL = bool(
    os.getenv("VERCEL") 
    or os.getenv("VERCEL_ENV") 
    or os.getenv("AWS_LAMBDA_FUNCTION_NAME")
    or "/var/task" in str(Path(__file__).resolve())
)

# Determine safe database URL and storage directory
_default_db = "sqlite:////tmp/title_escrow.db" if IS_VERCEL else "sqlite:///./title_escrow.db"
_env_db = os.getenv("DATABASE_URL")
if not _env_db:
    _final_db = _default_db
else:
    # If on Vercel and pointing to a relative SQLite path, reroute to /tmp
    if IS_VERCEL and ("sqlite:///." in _env_db or _env_db == "sqlite:///./title_escrow.db"):
        _final_db = "sqlite:////tmp/title_escrow.db"
    else:
        _final_db = _env_db

_default_storage = "/tmp/storage/documents" if IS_VERCEL else "./storage/documents"
_env_storage = os.getenv("STORAGE_LOCAL_DIR")
if not _env_storage or (IS_VERCEL and _env_storage.startswith("./")):
    _final_storage = _default_storage
else:
    _final_storage = _env_storage

# Pre-create writable storage folder if possible
try:
    os.makedirs(_final_storage, exist_ok=True)
except Exception:
    pass

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Digital Title & Escrow Infrastructure")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    ENVIRONMENT: str = "production" if IS_VERCEL else os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "development_secret_key_change_in_production_title_escrow_jwt_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    DATABASE_URL: str = _final_db

    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local")
    STORAGE_LOCAL_DIR: str = _final_storage
    STORAGE_MAX_FILE_SIZE_MB: int = int(os.getenv("STORAGE_MAX_FILE_SIZE_MB", "25"))

    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "fallback-deterministic")
    AI_OCR_ENABLED: bool = os.getenv("AI_OCR_ENABLED", "True").lower() in ("true", "1", "yes")

    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
