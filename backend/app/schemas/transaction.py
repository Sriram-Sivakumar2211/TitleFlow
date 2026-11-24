from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel
from app.models.transaction import TransactionStatus
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse

class TransactionBase(BaseModel):
    property_id: str
    closing_agent_id: Optional[str] = None
    buyer_id: Optional[str] = None
    seller_id: Optional[str] = None
    status: TransactionStatus = TransactionStatus.DRAFT
    purchase_price: Optional[float] = None
    earnest_money_deposit: Optional[float] = None
    escrow_account_number: Optional[str] = None
    estimated_closing_date: Optional[date] = None
    notes: Optional[str] = None

class TransactionCreate(BaseModel):
    # Support either existing property_id OR inline property creation
    property_id: Optional[str] = None
    
    # Inline property fields if creating property alongside transaction
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    county: Optional[str] = None
    property_type: Optional[str] = "SINGLE_FAMILY"
    apn_pin: Optional[str] = None
    legal_description: Optional[str] = None

    # Transaction fields
    closing_agent_id: Optional[str] = None
    buyer_id: Optional[str] = None
    seller_id: Optional[str] = None
    purchase_price: Optional[float] = None
    earnest_money_deposit: Optional[float] = None
    escrow_account_number: Optional[str] = None
    estimated_closing_date: Optional[date] = None
    notes: Optional[str] = None

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    closing_agent_id: Optional[str] = None
    buyer_id: Optional[str] = None
    seller_id: Optional[str] = None
    purchase_price: Optional[float] = None
    earnest_money_deposit: Optional[float] = None
    escrow_account_number: Optional[str] = None
    estimated_closing_date: Optional[date] = None
    actual_closing_date: Optional[date] = None
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    transaction_number: str
    property_id: str
    closing_agent_id: Optional[str] = None
    buyer_id: Optional[str] = None
    seller_id: Optional[str] = None
    status: TransactionStatus
    purchase_price: Optional[float] = None
    earnest_money_deposit: Optional[float] = None
    escrow_account_number: Optional[str] = None
    estimated_closing_date: Optional[date] = None
    actual_closing_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    property: PropertyResponse
    closing_agent: Optional[UserResponse] = None
    buyer: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None

    document_count: Optional[int] = 0
    risk_finding_count: Optional[int] = 0

    class Config:
        from_attributes = True
