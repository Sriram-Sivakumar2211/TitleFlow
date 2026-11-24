from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from sqlalchemy.dialects import postgresql
from sqlalchemy import JSON
from app.core.config import settings

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

def get_db():
    """Dependency for obtaining database sessions per request"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
