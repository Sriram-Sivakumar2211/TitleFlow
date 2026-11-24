from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.risk import RiskSeverity, FindingReviewStatus
from app.schemas.user import UserResponse

class RiskFindingResponse(BaseModel):
    id: str
    transaction_id: str
    document_id: Optional[str] = None
    title: str
    description: str
    reason: str
    category: str
    severity: RiskSeverity
    review_status: FindingReviewStatus
    resolution_notes: Optional[str] = None
    resolved_by_id: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    resolved_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class RiskFindingUpdate(BaseModel):
    review_status: FindingReviewStatus
    resolution_notes: Optional[str] = None
