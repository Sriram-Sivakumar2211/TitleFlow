from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.transaction import Transaction
from app.models.risk import RiskFinding, FindingReviewStatus
from app.schemas.risk import RiskFindingResponse, RiskFindingUpdate

router = APIRouter(prefix="/risks", tags=["Risk Findings"])

@router.get("/transaction/{transaction_id}", response_model=List[RiskFindingResponse])
def get_transaction_risks(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    findings = db.query(RiskFinding).filter(RiskFinding.transaction_id == transaction_id).order_by(RiskFinding.created_at.asc()).all()
    return findings

@router.put("/{finding_id}/review", response_model=RiskFindingResponse)
def review_risk_finding(
    finding_id: str,
    update_data: RiskFindingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only closing agents and admins can resolve title findings")

    finding = db.query(RiskFinding).filter(RiskFinding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk finding not found")

    finding.review_status = update_data.review_status
    if update_data.resolution_notes is not None:
        finding.resolution_notes = update_data.resolution_notes

    finding.resolved_by_id = current_user.id
    finding.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(finding)
    return finding
