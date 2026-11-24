import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, field_validator
from app.models.organization import OrganizationType

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class OrganizationBase(BaseModel):
    name: str
    org_type: OrganizationType = OrganizationType.TITLE_COMPANY
    website: Optional[str] = None
    business_email: Optional[str] = None
    phone: Optional[str] = None
    country: str = "United States"
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    team_size: Optional[str] = "1-5"
    monthly_closing_volume: Optional[str] = "10-50"
    primary_use_case: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OnboardingAccountData(BaseModel):
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None
    job_title: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, v_clean):
            raise ValueError("Invalid email format")
        return v_clean

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class OnboardingOrganizationData(BaseModel):
    name: str
    org_type: OrganizationType = OrganizationType.TITLE_COMPANY
    website: Optional[str] = None
    business_email: Optional[str] = None
    phone: Optional[str] = None
    country: str = "United States"
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None

class OnboardingWorkspaceData(BaseModel):
    team_size: Optional[str] = "1-5"
    monthly_closing_volume: Optional[str] = "10-50"
    primary_use_case: Optional[str] = None
    invited_team_members: Optional[List[str]] = []

class OnboardingRequest(BaseModel):
    account: OnboardingAccountData
    organization: OnboardingOrganizationData
    workspace: OnboardingWorkspaceData

class OnboardingResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    user_email: str
    full_name: str
    organization_id: str
    organization_name: str
    org_type: str
