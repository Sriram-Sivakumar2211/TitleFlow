import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from sqlalchemy.dialects import postgresql
from sqlalchemy import JSON
from app.core.config import settings

logger = logging.getLogger("titleflow.database")

# Engine configuration with sqlite thread safety check
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

Base = declarative_base()

# Universal JSON type that uses JSONB on PostgreSQL and JSON on SQLite
JSONType = JSON().with_variant(postgresql.JSONB, "postgresql")

_db_initialized = False

def init_db_if_needed():
    """Initializes tables on demand if not yet initialized"""
    global _db_initialized
    if not _db_initialized:
        try:
            Base.metadata.create_all(bind=engine)
            _db_initialized = True
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")

def get_db():
    """Dependency for obtaining database sessions per request"""
    init_db_if_needed()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
