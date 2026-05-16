from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from sqlalchemy.pool import StaticPool


class Base(DeclarativeBase):
    pass


def new_id() -> str:
    return uuid4().hex


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class Mentor(Base, TimestampMixin):
    __tablename__ = "mentors"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    industries: Mapped[list[str]] = mapped_column(JSON, default=list)
    support_types: Mapped[list[str]] = mapped_column(JSON, default=list)
    stages: Mapped[list[str]] = mapped_column(JSON, default=list)
    languages: Mapped[list[str]] = mapped_column(JSON, default=list)
    capacity_score: Mapped[float] = mapped_column(Float, default=0.5)
    bio: Mapped[str] = mapped_column(Text, default="")
    parsed_cv: Mapped[dict] = mapped_column(JSON, default=dict)


class Partner(Base, TimestampMixin):
    __tablename__ = "partners"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    organisation_name: Mapped[str] = mapped_column(String(240), nullable=False)
    partner_type: Mapped[str] = mapped_column(String(80), default="corp")
    industries_of_interest: Mapped[list[str]] = mapped_column(JSON, default=list)
    resources_offered: Mapped[str] = mapped_column(Text, default="")


class ServiceProvider(Base, TimestampMixin):
    __tablename__ = "service_providers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    organisation_name: Mapped[str] = mapped_column(String(240), nullable=False)
    sp_type: Mapped[str] = mapped_column(String(80), default="consulting")
    services_offered: Mapped[list[str]] = mapped_column(JSON, default=list)
    current_capacity: Mapped[str] = mapped_column(String(40), default="available")


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    company_name: Mapped[str] = mapped_column(String(240), nullable=False)
    industry: Mapped[str] = mapped_column(String(120), default="")
    stage: Mapped[str] = mapped_column(String(80), default="")
    support_needed: Mapped[list[str]] = mapped_column(JSON, default=list)
    languages: Mapped[list[str]] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column(Text, default="")


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    event_name: Mapped[str] = mapped_column(String(240), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), default="matchmaking")
    programme_name: Mapped[str] = mapped_column(String(160), default="")
    status: Mapped[str] = mapped_column(String(40), default="draft")


class Selection(Base, TimestampMixin):
    __tablename__ = "selections"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, default="")
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"), nullable=False)
    approval_status: Mapped[str] = mapped_column(String(40), default="pending")
    match_scores: Mapped[dict] = mapped_column(JSON, default=dict)

    event: Mapped[Event] = relationship()
    company: Mapped[Company] = relationship()
    items: Mapped[list["SelectionItem"]] = relationship(cascade="all, delete-orphan")


class SelectionItem(Base, TimestampMixin):
    __tablename__ = "selection_items"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    selection_id: Mapped[str] = mapped_column(ForeignKey("selections.id"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(40), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(32), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0)


class FollowUp(Base, TimestampMixin):
    __tablename__ = "followups"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), nullable=False)
    selection_id: Mapped[str] = mapped_column(ForeignKey("selections.id"), nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    outcome_score: Mapped[float] = mapped_column(Float, default=0.0)


class UploadedDocument(Base, TimestampMixin):
    __tablename__ = "uploaded_documents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    mentor_id: Mapped[str] = mapped_column(ForeignKey("mentors.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(260), nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    extracted_profile: Mapped[dict] = mapped_column(JSON, default=dict)


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(32), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class AgentCheckpoint(Base, TimestampMixin):
    __tablename__ = "agent_checkpoints"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    session_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    state: Mapped[dict] = mapped_column(JSON, default=dict)


def create_postgres_engine(database_url: str):
    return create_engine(database_url, pool_pre_ping=True)


def create_sqlite_engine():
    return create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def create_session_factory(engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


@contextmanager
def session_scope(session_factory: sessionmaker[Session]) -> Iterator[Session]:
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
