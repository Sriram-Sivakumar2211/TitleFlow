from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.get("", response_model=List[PropertyResponse])
def list_properties(
    search: Optional[str] = Query(None, description="Search by address, city, state, or APN/PIN"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Property.address_line1.ilike(search_filter),
                Property.city.ilike(search_filter),
                Property.state.ilike(search_filter),
                Property.apn_pin.ilike(search_filter),
            )
        )
    return query.order_by(Property.created_at.desc()).offset(skip).limit(limit).all()

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    prop_in: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only CLOSING_AGENT and ADMIN can create properties directly
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create properties")

    prop = Property(
        address_line1=prop_in.address_line1,
        address_line2=prop_in.address_line2,
        city=prop_in.city,
        state=prop_in.state,
        postal_code=prop_in.postal_code,
        county=prop_in.county,
        property_type=prop_in.property_type,
        apn_pin=prop_in.apn_pin,
        legal_description=prop_in.legal_description,
        year_built=prop_in.year_built
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    prop_in: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.CLOSING_AGENT]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update properties")

    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    update_data = prop_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(prop, field, val)

    db.commit()
    db.refresh(prop)
    return prop
