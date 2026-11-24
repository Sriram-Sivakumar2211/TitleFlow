import enum
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import get_uuid_str, utc_now

class PropertyType(str, enum.Enum):
    SINGLE_FAMILY = "SINGLE_FAMILY"
    CONDOMINIUM = "CONDOMINIUM"
    TOWNHOUSE = "TOWNHOUSE"
    MULTI_FAMILY = "MULTI_FAMILY"
    COMMERCIAL = "COMMERCIAL"
    VACANT_LAND = "VACANT_LAND"

class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    county = Column(String(100), nullable=True)
    property_type = Column(String(50), default=PropertyType.SINGLE_FAMILY.value, nullable=False)
    
    # Parcel identification number / APN
    apn_pin = Column(String(100), index=True, nullable=True)
    legal_description = Column(Text, nullable=True)
    year_built = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="property", cascade="all, delete-orphan")
