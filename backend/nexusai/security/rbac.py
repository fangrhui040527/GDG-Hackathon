"""RBAC helpers."""


ROLE_HIERARCHY = {
    "SUPER_ADMIN": 100,
    "ECOSYSTEM_ADMIN": 80,
    "MENTOR": 40,
    "PARTNER": 40,
    "SERVICE_PROVIDER": 40,
    "COMPANY": 40,
    "PENDING": 0,
}


def has_role(user_role: str, *required_roles: str) -> bool:
    """Return True if user_role is in the required set."""
    return user_role in required_roles


def is_admin(role: str) -> bool:
    return role in ("SUPER_ADMIN", "ECOSYSTEM_ADMIN")
