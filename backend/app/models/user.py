import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from app.core.database import Base, JSONType

def get_uuid_str():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CLOSING_AGENT = "CLOSING_AGENT"
    BUYER = "BUYER"
    SELLER = "SELLER"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CLOSING_AGENT, nullable=False)
    phone = Column(String(50), nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="members")
    closing_transactions = relationship("Transaction", foreign_keys="Transaction.closing_agent_id", back_populates="closing_agent")
    buyer_transactions = relationship("Transaction", foreign_keys="Transaction.buyer_id", back_populates="buyer")
    seller_transactions = relationship("Transaction", foreign_keys="Transaction.seller_id", back_populates="seller")
    uploaded_documents = relationship("Document", back_populates="uploaded_by")
