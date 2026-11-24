from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_token_from_request(request: Request, bearer_token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    # Check Bearer header first
    if bearer_token:
        return bearer_token
    # Check cookie fallback
    token_cookie = request.cookies.get("access_token")
    if token_cookie:
        if token_cookie.startswith("Bearer "):
            return token_cookie[7:]
        return token_cookie
    return None

def get_current_user(token: Optional[str] = Depends(get_token_from_request), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise credentials_exception

    return user

def require_roles(*allowed_roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker
