import os
import json
from pathlib import Path
from typing import List, Union
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Digital Title & Escrow Infrastructure")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "development_secret_key_change_in_production_title_escrow_jwt_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./title_escrow.db")

    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local")
    STORAGE_LOCAL_DIR: str = os.getenv("STORAGE_LOCAL_DIR", "./storage/documents")
    STORAGE_MAX_FILE_SIZE_MB: int = int(os.getenv("STORAGE_MAX_FILE_SIZE_MB", "25"))

    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "fallback-deterministic")
    AI_OCR_ENABLED: bool = os.getenv("AI_OCR_ENABLED", "True").lower() in ("true", "1", "yes")

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
