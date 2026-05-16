from collections.abc import Iterator
from contextlib import contextmanager
from datetime import date, datetime, time, timezone
from typing import Any, Optional

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from sqlalchemy.pool import StaticPool

import enum


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Enums matching PostgreSQL types ───────────────────────────

class EntityTypeEnum(str, enum.Enum):
    Company = "Company"
    FollowUp = "Follow up"
    Mentor = "Mentor"
    Partner = "Partner"
    ServiceProvider = "Service Provider"
    Admin = "Admin"


class OrgTypeEnum(str, enum.Enum):
    Personal = "Personal"
    Business = "Business"
    Listed = "Listed"
    International = "International"


class ServiceProviderTypeEnum(str, enum.Enum):
    NotSpecified = "Not Specified"


class CountryRegionEnum(str, enum.Enum):
    NotSpecified = "Not Specified"


class TargetCompanyStageEnum(str, enum.Enum):
    NotSpecified = "Not Specified"


class PricingModelEnum(str, enum.Enum):
    NotSpecified = "Not Specified"


class CurrentCapacityEnum(str, enum.Enum):
    NotSpecified = "Not Specified"


# ── Timestamp mixin ───────────────────────────────────────────

class TimestampMixin:
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


# ── Auth Models ───────────────────────────────────────────────

class RoleEnum(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ECOSYSTEM_ADMIN = "ECOSYSTEM_ADMIN"
    MENTOR = "MENTOR"
    PARTNER = "PARTNER"
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
    COMPANY = "COMPANY"
    PENDING = "PENDING"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    google_sub: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    picture_url: Mapped[Optional[str]] = mapped_column(String(1024))
    role: Mapped[str] = mapped_column(String(50), default="PENDING")
    linked_entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    linked_entity_id: Mapped[Optional[int]] = mapped_column(Integer)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    disabled_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class UserSession(Base):
    __tablename__ = "user_sessions"

    session_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    jwt_jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    ip: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(String(500))
    issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


# ── Models ────────────────────────────────────────────────────

class Event(Base, TimestampMixin):
    __tablename__ = "events"

    event_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_name: Mapped[str] = mapped_column(String(255), nullable=False)
    event_description: Mapped[Optional[str]] = mapped_column(Text)
    event_date: Mapped[Optional[date]] = mapped_column(Date)
    event_location: Mapped[Optional[str]] = mapped_column(String(255))

    companies: Mapped[list["Company"]] = relationship(back_populates="event")
    participants: Mapped[list["EventParticipant"]] = relationship(back_populates="event")


class Programme(Base, TimestampMixin):
    """Ecosystem programme — the top-level container for matching & management."""
    __tablename__ = "programmes"

    programme_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="draft")
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500))

    # Requirements
    target_industry: Mapped[Optional[str]] = mapped_column(String(255))
    target_country: Mapped[Optional[str]] = mapped_column(String(255))
    target_company_stage: Mapped[Optional[str]] = mapped_column(String(100))
    required_mentors: Mapped[int] = mapped_column(Integer, default=0)
    required_companies: Mapped[int] = mapped_column(Integer, default=0)
    required_partners: Mapped[int] = mapped_column(Integer, default=0)
    required_service_providers: Mapped[int] = mapped_column(Integer, default=0)
    eligibility_criteria: Mapped[Optional[str]] = mapped_column(Text)

    # Tracking
    organiser_id: Mapped[Optional[str]] = mapped_column(String(255))
    organiser_name: Mapped[Optional[str]] = mapped_column(String(255))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class Mentor(Base, TimestampMixin):
    __tablename__ = "mentors"

    mentor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cv: Mapped[Optional[str]] = mapped_column(Text)
    video: Mapped[Optional[str]] = mapped_column(Text)
    short_bio: Mapped[Optional[str]] = mapped_column(Text)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    job_title: Mapped[Optional[str]] = mapped_column(String(255))
    organization_name: Mapped[Optional[str]] = mapped_column(String(255))
    linkedin_profile_url: Mapped[Optional[str]] = mapped_column(String(255))
    preferred_company_stage: Mapped[Optional[str]] = mapped_column(Text)
    preferred_industry: Mapped[Optional[str]] = mapped_column(Text)
    type_of_support_offered: Mapped[Optional[str]] = mapped_column(Text)
    available_hours_per_month: Mapped[Optional[int]] = mapped_column(Integer)
    max_companies_to_mentor: Mapped[Optional[int]] = mapped_column(Integer)
    current_availability_status: Mapped[Optional[str]] = mapped_column(String(255), default="Available")
    country: Mapped[Optional[str]] = mapped_column(String(255))


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    company_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_description: Mapped[Optional[str]] = mapped_column(Text)
    country: Mapped[Optional[str]] = mapped_column(String(255))
    industry: Mapped[Optional[str]] = mapped_column(String(255))
    business_stage: Mapped[Optional[str]] = mapped_column(Text)
    support_needed: Mapped[Optional[str]] = mapped_column(Text)
    availability: Mapped[Optional[str]] = mapped_column(String(255))
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey("events.event_id"))

    event: Mapped[Optional[Event]] = relationship(back_populates="companies")
    follow_ups: Mapped[list["FollowUp"]] = relationship(back_populates="company")


class Partner(Base, TimestampMixin):
    __tablename__ = "partner"

    partner_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organisation_name: Mapped[str] = mapped_column(String(255), nullable=False)
    organisation_type: Mapped[OrgTypeEnum] = mapped_column(
        Enum(OrgTypeEnum, name="org_type_enum", create_type=False), nullable=False
    )
    country: Mapped[str] = mapped_column(String(255), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255))
    contact_person_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    organisation_description: Mapped[str] = mapped_column(String(255), nullable=False)
    industries_of_interest: Mapped[str] = mapped_column(String(255), nullable=False)
    requirements: Mapped[str] = mapped_column(Text, nullable=False)
    preferred_collaboration_type: Mapped[Optional[str]] = mapped_column(String(255))
    resources_provided: Mapped[str] = mapped_column(Text, nullable=False)
    support_offered: Mapped[str] = mapped_column(String(255), nullable=False)
    support_capacity: Mapped[Optional[str]] = mapped_column(String(255))


class ServiceProvider(Base, TimestampMixin):
    __tablename__ = "service_provider"

    sp_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    organisation_name: Mapped[str] = mapped_column(String(255), nullable=False)
    service_provider_type: Mapped[ServiceProviderTypeEnum] = mapped_column(
        Enum(ServiceProviderTypeEnum, name="service_provider_type_enum", create_type=False),
        nullable=False,
        default=ServiceProviderTypeEnum.NotSpecified,
    )
    country_region: Mapped[CountryRegionEnum] = mapped_column(
        Enum(CountryRegionEnum, name="country_region_enum", create_type=False),
        nullable=False,
        default=CountryRegionEnum.NotSpecified,
    )
    website_url: Mapped[Optional[str]] = mapped_column(Text)
    contact_person_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    company_description: Mapped[str] = mapped_column(Text, nullable=False)
    services_offered: Mapped[str] = mapped_column(Text, nullable=False)
    detailed_service_description: Mapped[str] = mapped_column(Text, nullable=False)
    target_company_stage: Mapped[TargetCompanyStageEnum] = mapped_column(
        Enum(TargetCompanyStageEnum, name="target_company_stage_enum", create_type=False),
        nullable=False,
        default=TargetCompanyStageEnum.NotSpecified,
    )
    pricing_model: Mapped[PricingModelEnum] = mapped_column(
        Enum(PricingModelEnum, name="pricing_model_enum", create_type=False),
        nullable=False,
        default=PricingModelEnum.NotSpecified,
    )
    current_capacity: Mapped[CurrentCapacityEnum] = mapped_column(
        Enum(CurrentCapacityEnum, name="current_capacity_enum", create_type=False),
        nullable=False,
        default=CurrentCapacityEnum.NotSpecified,
    )


class FollowUp(Base, TimestampMixin):
    __tablename__ = "follow_ups"

    follow_up_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    follow_up_date: Mapped[Optional[date]] = mapped_column(Date)
    follow_up_time: Mapped[Optional[time]] = mapped_column(Time)
    action_decision: Mapped[Optional[str]] = mapped_column(Text)
    discussion: Mapped[Optional[str]] = mapped_column(Text)
    attendees: Mapped[Optional[str]] = mapped_column(Text)
    person_recorded: Mapped[Optional[str]] = mapped_column(String(255))
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.company_id"), nullable=False)

    company: Mapped[Company] = relationship(back_populates="follow_ups")


class EventParticipant(Base):
    __tablename__ = "event_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.event_id"), nullable=False)
    entity_type: Mapped[EntityTypeEnum] = mapped_column(
        Enum(EntityTypeEnum, name="entity_type_enum", create_type=False), nullable=False
    )
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), default=utcnow)

    event: Mapped[Event] = relationship(back_populates="participants")


# ── Selection (first-class match record) ──────────────────────

class ApprovalStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Selection(Base, TimestampMixin):
    __tablename__ = "selections"

    selection_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[Optional[int]] = mapped_column(ForeignKey("events.event_id"))
    purpose: Mapped[Optional[str]] = mapped_column(Text)
    approval_status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    ai_generated: Mapped[bool] = mapped_column(default=False)
    approved_by: Mapped[Optional[str]] = mapped_column(String(255))
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    version: Mapped[int] = mapped_column(Integer, default=1)

    items: Mapped[list["SelectionItem"]] = relationship(back_populates="selection", cascade="all, delete-orphan")
    event: Mapped[Optional[Event]] = relationship()


class SelectionItem(Base):
    __tablename__ = "selection_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    selection_id: Mapped[int] = mapped_column(ForeignKey("selections.selection_id"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # MENTOR, PARTNER, SP, COMPANY
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    entity_name: Mapped[Optional[str]] = mapped_column(String(255))
    match_score: Mapped[Optional[float]] = mapped_column()
    rationale: Mapped[Optional[str]] = mapped_column(Text)

    selection: Mapped[Selection] = relationship(back_populates="items")


# ── Notification ──────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[str] = mapped_column(String(50), nullable=False)  # MATCH_INVITE, SELECTION_APPROVED, FOLLOWUP_DUE, SYSTEM
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=utcnow)


# ── Audit Log ─────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor: Mapped[Optional[str]] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=utcnow)


def create_postgres_engine(database_url: str):
    return create_engine(database_url, pool_pre_ping=True)


def create_cloud_sql_connector_engine(settings: Any):
    from google.cloud.sql.connector import Connector, IPTypes

    required = {
        "CLOUD_SQL_CONNECTION_NAME": settings.cloud_sql_connection_name,
        "DATABASE_USER": settings.database_user,
        "DATABASE_PASSWORD": settings.database_password,
        "DATABASE_NAME": settings.database_name,
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise ValueError(f"Missing Cloud SQL connector settings: {', '.join(missing)}")

    connector = Connector()

    def get_connection():
        return connector.connect(
            settings.cloud_sql_connection_name,
            "pg8000",
            user=settings.database_user,
            password=settings.database_password,
            db=settings.database_name,
            ip_type=IPTypes.PUBLIC,
        )

    return create_engine("postgresql+pg8000://", creator=get_connection, pool_pre_ping=True)


def create_database_engine(settings: Any):
    if settings.cloud_sql_connection_name:
        return create_cloud_sql_connector_engine(settings)
    return create_postgres_engine(settings.database_url)


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
