from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def list_users(
    role: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.is_active == True)
    if role:
        try:
            role_enum = UserRole(role.upper())
            query = query.filter(User.role == role_enum)
        except ValueError:
            pass
    return query.order_by(User.full_name.asc()).all()
