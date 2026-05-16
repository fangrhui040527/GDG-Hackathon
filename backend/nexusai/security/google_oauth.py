"""Google OAuth ID token verification (no Firebase)."""
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


def verify_google_id_token(token: str, client_id: str) -> dict:
    """Verify a Google ID token and return the claims dict.

    Raises ValueError if invalid.
    """
    return id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
