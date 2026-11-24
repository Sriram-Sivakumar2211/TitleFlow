import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.user import UserRole

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.CLOSING_AGENT
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, v_clean):
            raise ValueError("Invalid email format")
        return v_clean

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    organization_id: Optional[str] = None
    job_title: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
