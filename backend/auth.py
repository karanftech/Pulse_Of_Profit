import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "beat-the-street-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 48

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

try:
    import bcrypt

    def hash_password(password: str) -> str:
        # Encode and truncate password to 72 bytes to adhere to bcrypt specification
        pwd_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
except Exception as e:
    print(f"Fallback to hashlib due to bcrypt import issue: {e}")
    def hash_password(password: str) -> str:
        return hashlib.sha256((password + "bts_salt").encode('utf-8')).hexdigest()

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return hash_password(plain_password) == hashed_password

class TokenData(BaseModel):
    email: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_email(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def ensure_user_not_blocked(email: str) -> None:
    """Reject requests from accounts disabled by an administrator."""
    from database import mongo_manager

    normalized_email = email.strip().lower()
    user = None
    if mongo_manager.is_connected and mongo_manager.db is not None:
        user = mongo_manager.db["users"].find_one({"email": normalized_email}, {"is_blocked": 1})
    else:
        user = next(
            (item for item in mongo_manager.in_memory_users if item.get("email", "").lower() == normalized_email),
            None,
        )

    if user and user.get("is_blocked", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support for help.",
        )

def require_current_user_email(email: Optional[str] = Depends(get_current_user_email)) -> str:
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    ensure_user_not_blocked(email)
    return email

def verify_admin_token(token: Optional[str] = Depends(oauth2_scheme)) -> str:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Missing authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role", "")
        email: str = payload.get("sub", "")
        if role == "admin":
            if email:
                ensure_user_not_blocked(email)
            return email or "admin"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required."
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin authorization token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
