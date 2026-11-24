from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.transaction import TransactionResponse
from app.schemas.risk import RiskFindingResponse

class RecentActivityItem(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    description: str
    timestamp: str
    user_name: Optional[str] = None

class DashboardStatsResponse(BaseModel):
    total_properties: int
    active_transactions: int
    pending_documents: int
    documents_processed: int
    transactions_awaiting_review: int
    high_priority_risks_count: int
    status_breakdown: Dict[str, int]
    recent_activity: List[RecentActivityItem]
    recent_transactions: List[TransactionResponse]
