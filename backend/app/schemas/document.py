from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.document import DocumentCategory, DocumentProcessingStatus
from app.schemas.user import UserResponse

class ExtractedFieldItem(BaseModel):
    value: Any = None
    confidence: float = 1.0
    source_page: Optional[int] = 1
    source_text_snippet: Optional[str] = None
    review_status: str = "UNVERIFIED" # UNVERIFIED, VERIFIED, FLAGGED

class DocumentExtractionSchema(BaseModel):
    document_type: str = "UNKNOWN"
    document_title: Optional[str] = None
    property_address: ExtractedFieldItem = ExtractedFieldItem()
    seller_names: ExtractedFieldItem = ExtractedFieldItem()
    buyer_names: ExtractedFieldItem = ExtractedFieldItem()
    parcel_pin: ExtractedFieldItem = ExtractedFieldItem()
    legal_description: ExtractedFieldItem = ExtractedFieldItem()
    recording_info: ExtractedFieldItem = ExtractedFieldItem()
    document_date: ExtractedFieldItem = ExtractedFieldItem()
    mortgage_info: ExtractedFieldItem = ExtractedFieldItem()
    lien_references: ExtractedFieldItem = ExtractedFieldItem()
    financial_amounts: ExtractedFieldItem = ExtractedFieldItem()
    additional_notes: Optional[str] = None

class ExtractionResultResponse(BaseModel):
    id: str
    document_id: str
    provider: str
    classification_confidence: float
    raw_text: Optional[str] = None
    extracted_data: Dict[str, Any]
    status: str
    is_verified: bool
    verified_by_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ExtractionVerifyRequest(BaseModel):
    is_verified: bool = True
    updated_fields: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: str
    transaction_id: str
    uploaded_by_id: str
    filename: str
    original_filename: str
    file_size_bytes: int
    mime_type: str
    category: DocumentCategory
    processing_status: DocumentProcessingStatus
    page_count: Optional[int] = None
    ocr_applied: bool = False
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    uploaded_by: Optional[UserResponse] = None
    extraction_result: Optional[ExtractionResultResponse] = None

    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    category: Optional[DocumentCategory] = None
    processing_status: Optional[DocumentProcessingStatus] = None
