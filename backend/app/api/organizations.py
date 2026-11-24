from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType
from app.models.audit import AuditLog
from app.schemas.organization import (
    OnboardingRequest, OnboardingResponse, OrganizationResponse, OrganizationCreate
)
from app.core.security import get_password_hash, create_access_token

router = APIRouter(prefix="/organizations", tags=["Organizations & Onboarding"])

@router.post("/onboarding", response_model=OnboardingResponse, status_code=status.HTTP_201_CREATED)
def complete_onboarding(data: OnboardingRequest, request: Request, db: Session = Depends(get_db)):
    """
    Complete end-to-end customer registration & workspace provisioning:
    1. Validates that the account email does not already exist.
    2. Provisions the Organization workspace.
    3. Provisions the initial Account Holder as CLOSING_AGENT / Workspace Owner.
    4. Records an audit entry.
    5. Returns JWT access token and workspace identity for instant dashboard access.
    """
    account_email = data.account.email.lower().strip()

    # Check for duplicate user email
    existing_user = db.query(User).filter(User.email == account_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    try:
        # 1. Create Organization
        org = Organization(
            name=data.organization.name.strip(),
            org_type=data.organization.org_type,
            website=data.organization.website.strip() if data.organization.website else None,
            business_email=data.organization.business_email.strip().lower() if data.organization.business_email else None,
            phone=data.organization.phone.strip() if data.organization.phone else None,
            country=data.organization.country.strip() if data.organization.country else "United States",
            state=data.organization.state.strip() if data.organization.state else None,
            city=data.organization.city.strip() if data.organization.city else None,
            address=data.organization.address.strip() if data.organization.address else None,
            postal_code=data.organization.postal_code.strip() if data.organization.postal_code else None,
            team_size=data.workspace.team_size,
            monthly_closing_volume=data.workspace.monthly_closing_volume,
            primary_use_case=data.workspace.primary_use_case,
            settings={
                "invited_team_members": data.workspace.invited_team_members or [],
                "onboarding_completed_at": datetime.now(timezone.utc).isoformat() if hasattr(datetime, "now") else None
            }
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        # 2. Create Workspace Owner User (Assigned CLOSING_AGENT role for standard operations)
        user = User(
            email=account_email,
            hashed_password=get_password_hash(data.account.password),
            full_name=data.account.full_name.strip(),
            phone=data.account.phone.strip() if data.account.phone else None,
            job_title=data.account.job_title.strip() if data.account.job_title else "Managing Officer",
            role=UserRole.CLOSING_AGENT,
            organization_id=org.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # 3. Create Audit Trail
        try:
            audit = AuditLog(
                user_id=user.id,
                action="ORGANIZATION_ONBOARDED",
                entity_type="ORGANIZATION",
                entity_id=org.id,
                details={
                    "org_name": org.name,
                    "org_type": org.org_type.value,
                    "email": user.email,
                    "team_size": org.team_size
                },
                ip_address=request.client.host if request.client else None
            )
            db.add(audit)
            db.commit()
        except Exception:
            db.rollback()

        # 4. Generate Session Token
        access_token = create_access_token(subject=user.id, role=user.role.value)

        return OnboardingResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            user_email=user.email,
            full_name=user.full_name,
            organization_id=org.id,
            organization_name=org.name,
            org_type=org.org_type.value
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete organization onboarding: {str(e)}"
        )

@router.get("/current", response_model=OrganizationResponse)
def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the organization workspace for the authenticated user"""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with an organization"
        )
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization workspace not found"
        )
    return org
