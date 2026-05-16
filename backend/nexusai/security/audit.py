"""Audit logging utilities."""
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from nexusai.database import AuditLog


def log_audit(
    db: Session,
    *,
    action: str,
    entity_type: str,
    entity_id: int,
    actor: str | None = None,
    detail: str | None = None,
) -> None:
    db.add(AuditLog(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        detail=detail,
        created_at=datetime.now(),
    ))
    db.flush()


def get_audit_history(
    db: Session,
    entity_type: str,
    entity_id: int,
) -> list[dict[str, Any]]:
    rows = (
        db.query(AuditLog)
        .filter(AuditLog.entity_type == entity_type, AuditLog.entity_id == entity_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )
    return [
        {
            "log_id": r.log_id,
            "actor": r.actor,
            "action": r.action,
            "entity_type": r.entity_type,
            "entity_id": r.entity_id,
            "detail": r.detail,
            "created_at": str(r.created_at) if r.created_at else None,
        }
        for r in rows
    ]
