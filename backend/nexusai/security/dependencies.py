"""FastAPI auth dependencies."""
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from nexusai.database import User, UserSession
from nexusai.security.jwt import decode_session_jwt


def get_current_user_optional(request: Request) -> dict[str, Any] | None:
    """Extract user from JWT in Authorization header. Returns None if no header."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth[7:]
    secret = request.app.state.jwt_secret
    try:
        claims = decode_session_jwt(token, secret)
    except Exception:
        return None

    # Check revocation
    db: Session = request.state.db if hasattr(request.state, "db") else None
    if db:
        sess = db.query(UserSession).filter(
            UserSession.jwt_jti == claims.get("jti"),
            UserSession.revoked_at.is_(None),
        ).first()
        if not sess:
            return None

    return {
        "user_id": int(claims["sub"]),
        "role": claims.get("role", "PENDING"),
        "linked_entity_id": claims.get("linked_entity_id"),
        "jti": claims.get("jti"),
    }


def get_current_user(request: Request) -> dict[str, Any]:
    """Require valid auth. Raises 401 if missing/invalid."""
    user = get_current_user_optional(request)
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def require_roles(*roles: str):
    """Dependency factory that checks the user has one of the given roles."""
    def checker(request: Request) -> dict[str, Any]:
        user = get_current_user(request)
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker
