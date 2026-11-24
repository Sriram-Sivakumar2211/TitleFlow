from sqlalchemy import Column, String, DateTime, ForeignKey
from app.core.database import Base, JSONType
from app.models.user import get_uuid_str, utc_now

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=get_uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "USER_LOGIN", "TRANSACTION_CREATED", "DOCUMENT_UPLOADED"
    entity_type = Column(String(50), nullable=False) # "TRANSACTION", "DOCUMENT", "RISK_FINDING", "USER"
    entity_id = Column(String(36), nullable=True)
    details = Column(JSONType, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
