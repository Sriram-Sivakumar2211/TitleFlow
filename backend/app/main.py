import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import (
    User, UserRole, Property, PropertyType, Transaction, TransactionStatus,
    Document, DocumentCategory, DocumentProcessingStatus, ExtractionResult,
    RiskFinding, RiskSeverity, FindingReviewStatus, AuditLog
)
from app.core.security import get_password_hash
from app.api import auth, dashboard, properties, transactions, documents, risks, users

def seed_sample_data():
    """Seeds realistic sample accounts and initial records for development"""
    db = SessionLocal()
    try:
        # Check if users already seeded
        admin = db.query(User).filter(User.email == "admin@titleflow.com").first()
        if not admin:
            # 1. ADMIN
            admin = User(
                email="admin@titleflow.com",
                hashed_password=get_password_hash("AdminPass123!"),
                full_name="Alexander Hamilton",
                role=UserRole.ADMIN,
                phone="+1 (555) 019-2831",
                is_active=True
            )
            # 2. CLOSING_AGENT
            agent = User(
                email="agent.sarah@titleflow.com",
                hashed_password=get_password_hash("AgentPass123!"),
                full_name="Sarah Jenkins, Escrow Officer",
                role=UserRole.CLOSING_AGENT,
                phone="+1 (555) 014-9922",
                is_active=True
            )
            # 3. BUYER
            buyer = User(
                email="buyer.john@example.com",
                hashed_password=get_password_hash("BuyerPass123!"),
                full_name="Johnathan Vance",
                role=UserRole.BUYER,
                phone="+1 (555) 018-7733",
                is_active=True
            )
            # 4. SELLER
            seller = User(
                email="seller.robert@example.com",
                hashed_password=get_password_hash("SellerPass123!"),
                full_name="Robert M. Sterling",
                role=UserRole.SELLER,
                phone="+1 (555) 017-4411",
                is_active=True
            )
            db.add_all([admin, agent, buyer, seller])
            db.commit()

            # Seed realistic initial property
            prop1 = Property(
                address_line1="742 Evergreen Terrace",
                address_line2="Suite 400",
                city="Springfield",
                state="OR",
                postal_code="97477",
                county="Lane County",
                property_type="SINGLE_FAMILY",
                apn_pin="042-881-992-01",
                legal_description="Lot 12, Block 4, Evergreen Hills Subdivision, as per plat recorded in Book 45, Page 12, Records of Lane County, Oregon.",
                year_built=1998
            )
            prop2 = Property(
                address_line1="1204 Biscayne Parkway",
                city="Miami",
                state="FL",
                postal_code="33132",
                county="Miami-Dade County",
                property_type="CONDOMINIUM",
                apn_pin="01-3122-094-1100",
                legal_description="Unit 14B, Marina Palms Condominium, Miami-Dade County, Florida.",
                year_built=2015
            )
            db.add_all([prop1, prop2])
            db.commit()

            # Seed sample active transaction
            from datetime import date, timedelta
            txn1 = Transaction(
                transaction_number="TXN-2026-10492",
                property_id=prop1.id,
                closing_agent_id=agent.id,
                buyer_id=buyer.id,
                seller_id=seller.id,
                status=TransactionStatus.UNDER_REVIEW,
                purchase_price=485000.0,
                earnest_money_deposit=15000.0,
                escrow_account_number="ESC-992014-CHASE",
                estimated_closing_date=date.today() + timedelta(days=14),
                notes="Standard conventional residential purchase. Title search requested. Loan commitment issued by First National Bank."
            )
            txn2 = Transaction(
                transaction_number="TXN-2026-10493",
                property_id=prop2.id,
                closing_agent_id=agent.id,
                buyer_id=buyer.id,
                seller_id=seller.id,
                status=TransactionStatus.DOCUMENTS_PENDING,
                purchase_price=675000.0,
                earnest_money_deposit=25000.0,
                escrow_account_number="ESC-992015-WF",
                estimated_closing_date=date.today() + timedelta(days=28),
                notes="Condo closing - awaiting HOA estoppel letter and insurance certificate."
            )
            db.add_all([txn1, txn2])
            db.commit()

            # Seed audit log
            audit1 = AuditLog(
                user_id=agent.id,
                action="TRANSACTION_INITIALIZED",
                entity_type="TRANSACTION",
                entity_id=txn1.id,
                details={"transaction_number": txn1.transaction_number, "price": 485000.0}
            )
            db.add(audit1)
            db.commit()

            # Run initial risk check for sample transactions
            from ai_engine.analysis.risk_engine import evaluate_transaction_risks
            evaluate_transaction_risks(txn1.id, db)
            evaluate_transaction_risks(txn2.id, db)
    finally:
        db.close()

# Ensure tables are created and seeded on module import
Base.metadata.create_all(bind=engine)
seed_sample_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Cloud Platform for Digital Title & Escrow Closing Infrastructure",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(dashboard.router, prefix=api_v1)
app.include_router(properties.router, prefix=api_v1)
app.include_router(transactions.router, prefix=api_v1)
app.include_router(documents.router, prefix=api_v1)
app.include_router(risks.router, prefix=api_v1)
app.include_router(users.router, prefix=api_v1)

@app.get("/health", tags=["System"])
@app.get(f"{api_v1}/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER
    }
