import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, JSONType

def get_uuid_str():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class OrganizationType(str, enum.Enum):
    TITLE_COMPANY = "TITLE_COMPANY"
    ESCROW_COMPANY = "ESCROW_COMPANY"
    LAW_FIRM = "LAW_FIRM"
    LENDER = "LENDER"
    REAL_ESTATE_AGENCY = "REAL_ESTATE_AGENCY"
    OTHER = "OTHER"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    name = Column(String(255), nullable=False)
    org_type = Column(SQLEnum(OrganizationType), default=OrganizationType.TITLE_COMPANY, nullable=False)
    website = Column(String(255), nullable=True)
    business_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    country = Column(String(100), default="United States", nullable=False)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Workspace settings
    team_size = Column(String(50), default="1-5", nullable=True)
    monthly_closing_volume = Column(String(50), default="10-50", nullable=True)
    primary_use_case = Column(String(255), nullable=True)
    settings = Column(JSONType, default=dict, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    members = relationship("User", back_populates="organization")
