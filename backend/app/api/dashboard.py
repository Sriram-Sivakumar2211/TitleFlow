from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.property import Property
from app.models.transaction import Transaction, TransactionStatus
from app.models.document import Document, DocumentProcessingStatus
from app.models.risk import RiskFinding, RiskSeverity
from app.models.audit import AuditLog
from app.schemas.dashboard import DashboardStatsResponse, RecentActivityItem
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Build base queries with role-based scoping
    txn_query = db.query(Transaction)
    doc_query = db.query(Document)
    prop_query = db.query(Property)

    if current_user.role == UserRole.BUYER:
        txn_query = txn_query.filter(Transaction.buyer_id == current_user.id)
        txn_ids = [t.id for t in txn_query.all()]
        doc_query = doc_query.filter(Document.transaction_id.in_(txn_ids))
    elif current_user.role == UserRole.SELLER:
        txn_query = txn_query.filter(Transaction.seller_id == current_user.id)
        txn_ids = [t.id for t in txn_query.all()]
        doc_query = doc_query.filter(Document.transaction_id.in_(txn_ids))

    total_properties = prop_query.count() if current_user.role in [UserRole.ADMIN, UserRole.CLOSING_AGENT] else txn_query.count()
    
    active_statuses = [
        TransactionStatus.DOCUMENTS_PENDING,
        TransactionStatus.UNDER_REVIEW,
        TransactionStatus.READY_FOR_CLOSING
    ]
    active_transactions = txn_query.filter(Transaction.status.in_(active_statuses)).count()
    
    pending_documents = doc_query.filter(
        Document.processing_status.in_([DocumentProcessingStatus.UPLOADED, DocumentProcessingStatus.PROCESSING])
    ).count()

    documents_processed = doc_query.filter(
        Document.processing_status == DocumentProcessingStatus.PROCESSED
    ).count()

    transactions_awaiting_review = txn_query.filter(
        Transaction.status == TransactionStatus.UNDER_REVIEW
    ).count()

    # Risk counts
    high_priority_risks_count = db.query(RiskFinding).filter(
        RiskFinding.severity == RiskSeverity.HIGH_PRIORITY_REVIEW,
        RiskFinding.review_status != "RESOLVED"
    ).count()

    # Status breakdown
    all_statuses = [s.value for s in TransactionStatus]
    status_counts = dict.fromkeys(all_statuses, 0)
    counts_raw = txn_query.with_entities(Transaction.status, func.count(Transaction.id)).group_by(Transaction.status).all()
    for status_enum, count in counts_raw:
        if status_enum:
            status_counts[status_enum.value] = count

    # Recent transactions
    recent_txns = txn_query.order_by(Transaction.created_at.desc()).limit(5).all()
    recent_txns_response = [
        TransactionResponse.model_validate(t) for t in recent_txns
    ]

    # Recent activity from audit logs
    audit_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    recent_activity = []
    for log in audit_logs:
        user_name = "System"
        if log.user_id:
            u = db.query(User).filter(User.id == log.user_id).first()
            if u:
                user_name = u.full_name

        action_title = log.action.replace("_", " ").title()
        desc = f"{action_title} on {log.entity_type.lower()}"
        if log.details and "email" in log.details:
            desc = f"{action_title}: {log.details['email']}"
        elif log.details and "filename" in log.details:
            desc = f"Uploaded document {log.details['filename']}"

        recent_activity.append(RecentActivityItem(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            description=desc,
            timestamp=log.created_at.strftime("%b %d, %Y %I:%M %p"),
            user_name=user_name
        ))

    return DashboardStatsResponse(
        total_properties=total_properties,
        active_transactions=active_transactions,
        pending_documents=pending_documents,
        documents_processed=documents_processed,
        transactions_awaiting_review=transactions_awaiting_review,
        high_priority_risks_count=high_priority_risks_count,
        status_breakdown=status_counts,
        recent_activity=recent_activity,
        recent_transactions=recent_txns_response
    )
