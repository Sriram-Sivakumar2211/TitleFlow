import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base, JSONType
from app.models.user import get_uuid_str, utc_now

class DocumentCategory(str, enum.Enum):
    PROPERTY_DEED = "PROPERTY_DEED"
    TITLE_REPORT = "TITLE_REPORT"
    MORTGAGE_DOCUMENT = "MORTGAGE_DOCUMENT"
    LIEN_DOCUMENT = "LIEN_DOCUMENT"
    TAX_RECORD = "TAX_RECORD"
    PURCHASE_AGREEMENT = "PURCHASE_AGREEMENT"
    OTHER = "OTHER"

class DocumentProcessingStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False)
    uploaded_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), nullable=False) # Sanitized stored filename
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), index=True, nullable=False) # SHA-256

    category = Column(SQLEnum(DocumentCategory), default=DocumentCategory.OTHER, nullable=False)
    processing_status = Column(SQLEnum(DocumentProcessingStatus), default=DocumentProcessingStatus.UPLOADED, nullable=False)
    
    page_count = Column(Integer, nullable=True)
    ocr_applied = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="documents")
    uploaded_by = relationship("User", back_populates="uploaded_documents")
    extraction_result = relationship("ExtractionResult", back_populates="document", uselist=False, cascade="all, delete-orphan")
    risk_findings = relationship("RiskFinding", back_populates="document")

class ExtractionResult(Base):
    __tablename__ = "extraction_results"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    document_id = Column(String(36), ForeignKey("documents.id"), unique=True, nullable=False)
    
    provider = Column(String(50), default="fallback-deterministic", nullable=False)
    classification_confidence = Column(Float, default=1.0, nullable=False)
    raw_text = Column(Text, nullable=True)
    
    # Structured JSON dictionary of extracted fields
    extracted_data = Column(JSONType, nullable=False, default=dict)
    
    status = Column(String(50), default="SUCCESS", nullable=False) # SUCCESS, PARTIAL, FAILED
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    document = relationship("Document", back_populates="extraction_result")
    verified_by = relationship("User", foreign_keys=[verified_by_id])
