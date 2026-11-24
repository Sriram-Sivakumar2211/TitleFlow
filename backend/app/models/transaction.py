import enum
from sqlalchemy import Column, String, Float, DateTime, Date, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import get_uuid_str, utc_now

class TransactionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    DOCUMENTS_PENDING = "DOCUMENTS_PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    READY_FOR_CLOSING = "READY_FOR_CLOSING"
    COMPLETED = "COMPLETED"
    ON_HOLD = "ON_HOLD"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    transaction_number = Column(String(50), unique=True, index=True, nullable=False)
    
    property_id = Column(String(36), ForeignKey("properties.id"), nullable=False)
    closing_agent_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    buyer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    seller_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.DRAFT, nullable=False)
    purchase_price = Column(Float, nullable=True)
    earnest_money_deposit = Column(Float, nullable=True)
    escrow_account_number = Column(String(100), nullable=True)
    
    estimated_closing_date = Column(Date, nullable=True)
    actual_closing_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    property = relationship("Property", back_populates="transactions")
    closing_agent = relationship("User", foreign_keys=[closing_agent_id], back_populates="closing_transactions")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="buyer_transactions")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="seller_transactions")
    documents = relationship("Document", back_populates="transaction", cascade="all, delete-orphan")
    risk_findings = relationship("RiskFinding", back_populates="transaction", cascade="all, delete-orphan")
