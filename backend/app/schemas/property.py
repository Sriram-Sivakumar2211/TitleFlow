from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.property import PropertyType

class PropertyBase(BaseModel):
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    county: Optional[str] = None
    property_type: str = PropertyType.SINGLE_FAMILY.value
    apn_pin: Optional[str] = None
    legal_description: Optional[str] = None
    year_built: Optional[int] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    county: Optional[str] = None
    property_type: Optional[str] = None
    apn_pin: Optional[str] = None
    legal_description: Optional[str] = None
    year_built: Optional[int] = None

class PropertyResponse(PropertyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
