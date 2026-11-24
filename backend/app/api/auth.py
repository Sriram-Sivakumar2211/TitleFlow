from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        entity_type="USER",
        entity_id=user.id,
        details={"email": user.email, "role": user.role.value},
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

    access_token = create_access_token(subject=user.id, role=user.role.value)

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False # Set to True in HTTPS production
    )

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="USER",
        entity_id=user.id,
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
