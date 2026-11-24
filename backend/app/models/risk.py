import enum
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import get_uuid_str, utc_now

class RiskSeverity(str, enum.Enum):
    INFORMATIONAL = "INFORMATIONAL"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    POTENTIAL_INCONSISTENCY = "POTENTIAL_INCONSISTENCY"
    HIGH_PRIORITY_REVIEW = "HIGH_PRIORITY_REVIEW"

class FindingReviewStatus(str, enum.Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

class RiskFinding(Base):
    __tablename__ = "risk_findings"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    category = Column(String(100), default="DATA_VALIDATION", nullable=False)
    
    severity = Column(SQLEnum(RiskSeverity), default=RiskSeverity.NEEDS_REVIEW, nullable=False)
    review_status = Column(SQLEnum(FindingReviewStatus), default=FindingReviewStatus.OPEN, nullable=False)
    
    resolution_notes = Column(Text, nullable=True)
    resolved_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="risk_findings")
    document = relationship("Document", back_populates="risk_findings")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id])
