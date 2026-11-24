import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.property import Property
from app.models.transaction import Transaction, TransactionStatus
from app.models.document import Document
from app.models.risk import RiskFinding
from app.models.audit import AuditLog
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from ai_engine.analysis.risk_engine import evaluate_transaction_risks

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def generate_transaction_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    while True:
        rand_num = random.randint(10000, 99999)
        num_str = f"TXN-{year}-{rand_num}"
        exists = db.query(Transaction).filter(Transaction.transaction_number == num_str).first()
        if not exists:
            return num_str

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    status_filter: Optional[TransactionStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    # Scoping by role
    if current_user.role == UserRole.BUYER:
        query = query.filter(Transaction.buyer_id == current_user.id)
    elif current_user.role == UserRole.SELLER:
        query = query.filter(Transaction.seller_id == current_user.id)
    elif current_user.role == UserRole.CLOSING_AGENT:
        # Closing agent can view all transactions or their assigned ones
        pass

    if status_filter:
        query = query.filter(Transaction.status == status_filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.join(Transaction.property).filter(
            or_(
                Transaction.transaction_number.ilike(search_term),
                Property.address_line1.ilike(search_term),
                Property.city.ilike(search_term),
                Property.apn_pin.ilike(search_term)
            )
        )

    txns = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    # Populate counts
    res = []
    for t in txns:
        doc_count = db.query(Document).filter(Document.transaction_id == t.id).count()
        risk_count = db.query(RiskFinding).filter(RiskFinding.transaction_id == t.id).count()
        txn_resp = TransactionResponse.model_validate(t)
        txn_resp.document_count = doc_count
        txn_resp.risk_finding_count = risk_count
        res.append(txn_resp)

    return res

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    txn_in: TransactionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only closing agents and admins can create transactions")

    # Property resolution: either existing property_id OR create inline
    property_id = txn_in.property_id
    if not property_id:
        if not txn_in.address_line1 or not txn_in.city or not txn_in.state or not txn_in.postal_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either a valid property_id or inline address (line1, city, state, postal_code) must be provided"
            )
        new_prop = Property(
            address_line1=txn_in.address_line1,
            address_line2=txn_in.address_line2,
            city=txn_in.city,
            state=txn_in.state,
            postal_code=txn_in.postal_code,
            county=txn_in.county,
            property_type=txn_in.property_type or "SINGLE_FAMILY",
            apn_pin=txn_in.apn_pin,
            legal_description=txn_in.legal_description
        )
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)
        property_id = new_prop.id
    else:
        prop_exists = db.query(Property).filter(Property.id == property_id).first()
        if not prop_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified property_id does not exist")

    # Default closing agent to current user if not provided
    closing_agent_id = txn_in.closing_agent_id or current_user.id
    txn_number = generate_transaction_number(db)

    txn = Transaction(
        transaction_number=txn_number,
        property_id=property_id,
        closing_agent_id=closing_agent_id,
        buyer_id=txn_in.buyer_id,
        seller_id=txn_in.seller_id,
        status=TransactionStatus.DOCUMENTS_PENDING,
        purchase_price=txn_in.purchase_price,
        earnest_money_deposit=txn_in.earnest_money_deposit,
        escrow_account_number=txn_in.escrow_account_number,
        estimated_closing_date=txn_in.estimated_closing_date,
        notes=txn_in.notes
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # Initial risk evaluation (triggers initial checks and legal disclaimers)
    evaluate_transaction_risks(txn.id, db)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="TRANSACTION_CREATED",
        entity_type="TRANSACTION",
        entity_id=txn.id,
        details={"transaction_number": txn.transaction_number, "property_id": property_id},
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    txn_resp = TransactionResponse.model_validate(txn)
    txn_resp.document_count = 0
    txn_resp.risk_finding_count = db.query(RiskFinding).filter(RiskFinding.transaction_id == txn.id).count()
    return txn_resp

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    # Authorization
    if current_user.role == UserRole.BUYER and txn.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this transaction")
    if current_user.role == UserRole.SELLER and txn.seller_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this transaction")

    doc_count = db.query(Document).filter(Document.transaction_id == txn.id).count()
    risk_count = db.query(RiskFinding).filter(RiskFinding.transaction_id == txn.id).count()
    
    txn_resp = TransactionResponse.model_validate(txn)
    txn_resp.document_count = doc_count
    txn_resp.risk_finding_count = risk_count
    return txn_resp

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    txn_in: TransactionUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update transaction")

    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    old_status = txn.status
    update_data = txn_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(txn, field, val)

    db.commit()
    db.refresh(txn)

    # If status changed, log audit
    if txn.status != old_status:
        audit = AuditLog(
            user_id=current_user.id,
            action="TRANSACTION_STATUS_UPDATED",
            entity_type="TRANSACTION",
            entity_id=txn.id,
            details={"old_status": old_status.value, "new_status": txn.status.value},
            ip_address=request.client.host if request.client else None
        )
        db.add(audit)
        db.commit()

    txn_resp = TransactionResponse.model_validate(txn)
    txn_resp.document_count = db.query(Document).filter(Document.transaction_id == txn.id).count()
    txn_resp.risk_finding_count = db.query(RiskFinding).filter(RiskFinding.transaction_id == txn.id).count()
    return txn_resp

@router.post("/{transaction_id}/evaluate-risks")
def trigger_risk_evaluation(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    findings = evaluate_transaction_risks(transaction_id, db)
    return {"message": "Risk evaluation completed", "findings_count": len(findings)}
