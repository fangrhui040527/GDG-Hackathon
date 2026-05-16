"""Session JWT helpers (HS256, no Firebase)."""
import uuid
from datetime import datetime, timedelta, timezone

import jwt


def create_session_jwt(
    user_id: int,
    role: str,
    secret: str,
    ttl_hours: int = 168,
    linked_entity_id: int | None = None,
) -> tuple[str, str, datetime]:
    """Return (token, jti, expires_at)."""
    jti = uuid.uuid4().hex
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=ttl_hours)
    payload = {
        "sub": str(user_id),
        "role": role,
        "linked_entity_id": linked_entity_id,
        "exp": expires_at,
        "iat": now,
        "jti": jti,
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token, jti, expires_at


def decode_session_jwt(token: str, secret: str) -> dict:
    """Decode and verify. Raises jwt.exceptions on failure."""
    return jwt.decode(token, secret, algorithms=["HS256"])
