from collections.abc import Callable, Iterator
from datetime import date, datetime, time
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from fastapi.middleware.cors import CORSMiddleware

from nexusai.config import get_settings
from nexusai.database import (
    AuditLog,
    Base,
    Company,
    Event,
    EventParticipant,
    FollowUp,
    Mentor,
    Notification,
    Partner,
    Programme,
    ProgrammeShortlistItem,
    Selection,
    SelectionItem,
    ServiceProvider,
    create_database_engine,
    create_session_factory,
    utcnow,
)
from nexusai.matching import CompanyProfile, MentorProfile, recommend_mentors
from nexusai.mcp.registry import build_mcp_registry
from nexusai.services.ai import AIService, VertexAIService
from nexusai.services.mcp import MCPClient
from nexusai.security.audit import get_audit_history, log_audit
from nexusai.security.dependencies import require_roles


MAX_MEDIA_BYTES = 2 * 1024 * 1024
PDF_CONTENT_TYPES = {"application/pdf"}
VIDEO_CONTENT_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


class MentorIn(BaseModel):
    full_name: str
    email: str
    short_bio: str = ""
    job_title: str = ""
    organization_name: str = ""
    linkedin_profile_url: str = ""
    preferred_company_stage: str = ""
    preferred_industry: str = ""
    type_of_support_offered: str = ""
    available_hours_per_month: int | None = None
    max_companies_to_mentor: int | None = None
    current_availability_status: str = "Available"
    country: str = ""


class MentorOut(MentorIn):
    model_config = ConfigDict(from_attributes=True)

    mentor_id: int


class CompanyIn(BaseModel):
    company_name: str
    company_description: str = ""
    country: str = ""
    industry: str = ""
    business_stage: str = ""
    support_needed: str = ""
    availability: str | None = ""
    event_id: int | None = None


class CompanyOut(CompanyIn):
    model_config = ConfigDict(from_attributes=True)

    company_id: int


class PartnerIn(BaseModel):
    organisation_name: str
    organisation_type: str = "Personal"
    country: str = ""
    website: str = ""
    contact_person_name: str = ""
    contact_email: str = ""
    organisation_description: str = ""
    industries_of_interest: str = ""
    requirements: str = ""
    preferred_collaboration_type: str = ""
    resources_provided: str = ""
    support_offered: str = ""
    support_capacity: str = ""


class ServiceProviderIn(BaseModel):
    organisation_name: str
    service_provider_type: str = "Not Specified"
    country_region: str = "Not Specified"
    website_url: str = ""
    contact_person_name: str = ""
    contact_email: str = ""
    company_description: str = ""
    services_offered: str = ""
    detailed_service_description: str = ""
    target_company_stage: str = "Not Specified"
    pricing_model: str = "Not Specified"
    current_capacity: str = "Not Specified"


class EventIn(BaseModel):
    event_name: str
    event_description: str = ""
    event_date: date | None = None
    event_location: str = ""


class EventOut(EventIn):
    model_config = ConfigDict(from_attributes=True)

    event_id: int


class MatchRequest(BaseModel):
    event_id: int
    company_id: int
    top_k: int = 10


class MatchOut(BaseModel):
    entity_id: int
    entity_name: str
    score: float
    fit_factors: list[str]
    rationale: str


class MatchResponse(BaseModel):
    recommendations: list[MatchOut]


class FollowUpIn(BaseModel):
    company_id: int
    follow_up_date: date | None = None
    follow_up_time: time | None = None
    action_decision: str = ""
    discussion: str = ""
    attendees: str = ""
    person_recorded: str = ""


class FollowUpOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    follow_up_id: int
    company_id: int
    follow_up_date: date | None = None
    action_decision: str | None = None
    discussion: str | None = None
    attendees: str | None = None
    person_recorded: str | None = None


class DashboardMetrics(BaseModel):
    mentors: int
    companies: int
    events: int
    followups: int
    selections: int = 0
    approved_selections: int = 0
    average_outcome_score: float = 0.0


class SelectionItemIn(BaseModel):
    entity_type: str  # MENTOR, PARTNER, SP, COMPANY
    entity_id: int
    entity_name: str = ""
    match_score: float | None = None
    rationale: str = ""


class SelectionIn(BaseModel):
    event_id: int | None = None
    purpose: str = ""
    items: list[SelectionItemIn] = []
    ai_generated: bool = False


class SelectionItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    entity_type: str
    entity_id: int
    entity_name: str | None = None
    match_score: float | None = None
    rationale: str | None = None


class SelectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    selection_id: int
    event_id: int | None = None
    purpose: str | None = None
    approval_status: str
    ai_generated: bool
    approved_by: str | None = None
    approved_at: datetime | None = None
    version: int
    items: list[SelectionItemOut] = []


class ShortlistItemIn(BaseModel):
    match_result_id: str
    actor_id: str
    actor_type: str
    actor_name: str
    match_score: float


class ShortlistItemOut(BaseModel):
    id: str
    programme_id: str
    match_result_id: str
    actor_id: str
    actor_type: str
    actor_name: str
    match_score: float
    added_at: str
    added_by: str
    is_admin_selected: bool


class RelationshipGraphNodeOut(BaseModel):
    id: str
    label: str
    category: str
    type: str
    sector: str


class RelationshipGraphEdgeOut(BaseModel):
    id: str
    source: str
    target: str
    score: float
    strength: str


class RelationshipGraphOut(BaseModel):
    nodes: list[RelationshipGraphNodeOut]
    edges: list[RelationshipGraphEdgeOut]


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    notification_id: int
    user_email: str
    kind: str
    title: str
    body: str | None = None
    read_at: datetime | None = None
    created_at: datetime | None = None


class ProgrammeIn(BaseModel):
    name: str
    description: str = ""
    category: str = ""
    start_date: date | None = None
    end_date: date | None = None
    cover_image: str = ""
    target_industry: str = ""
    target_country: str = ""
    target_company_stage: str = ""
    required_mentors: int = 0
    required_companies: int = 0
    required_partners: int = 0
    required_service_providers: int = 0
    eligibility_criteria: str = ""
    organiser_name: str = ""


class ProgrammeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    programme_id: int
    name: str
    description: str | None = None
    category: str | None = None
    status: str
    start_date: date | None = None
    end_date: date | None = None
    cover_image: str | None = None
    target_industry: str | None = None
    target_country: str | None = None
    target_company_stage: str | None = None
    required_mentors: int = 0
    required_companies: int = 0
    required_partners: int = 0
    required_service_providers: int = 0
    eligibility_criteria: str | None = None
    organiser_id: str | None = None
    organiser_name: str | None = None
    submitted_at: datetime | None = None
    published_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


def create_default_session_factory() -> sessionmaker[Session]:
    settings = get_settings()
    engine = create_database_engine(settings)
    return create_session_factory(engine)


def create_default_ai_service() -> AIService:
    settings = get_settings()
    return VertexAIService(
        project=settings.google_cloud_project,
        location=settings.google_cloud_location,
        gemini_model=settings.vertex_gemini_model,
        reasoning_model=settings.vertex_reasoning_model,
        embedding_model=settings.vertex_embedding_model,
    )


def create_default_mcp_client() -> MCPClient:
    settings = get_settings()
    return MCPClient(build_mcp_registry(settings))


def create_app(
    session_factory: sessionmaker[Session] | None = None,
    ai_service: AIService | None = None,
    mcp_client: MCPClient | None = None,
) -> FastAPI:
    session_factory = session_factory or create_default_session_factory()
    ai_service = ai_service or create_default_ai_service()
    mcp_client = mcp_client or create_default_mcp_client()
    settings = get_settings()

    app = FastAPI(title="NexusAI MVP", version="0.1.0")
    app.state.settings = settings
    cors_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    import logging as _logging
    _log = _logging.getLogger("nexusai")
    _jwt = settings.session_jwt_secret
    if settings.app_env == "production" and (not _jwt or _jwt == "dev-secret-change-me"):
        raise RuntimeError("SESSION_JWT_SECRET must be set to a non-default value in production")
    if not _jwt:
        _log.warning("SESSION_JWT_SECRET not set — using insecure development default.")
        _jwt = "dev-secret-change-me"
    app.state.jwt_secret = _jwt

    _oauth_client_id = getattr(settings, "google_oauth_client_id", None)
    if not _oauth_client_id:
        _log.warning("GOOGLE_OAUTH_CLIENT_ID not configured — /auth/google will return 500.")

    @app.get("/")
    def root():
        return {"name": "NexusAI MVP", "version": "0.1.0", "docs": "/docs"}

    def get_db(request: Request) -> Iterator[Session]:
        session = session_factory()
        request.state.db = session  # expose for auth dependencies
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    Db = Annotated[Session, Depends(get_db)]

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/ready")
    def ready() -> dict[str, str]:
        session = session_factory()
        try:
            session.execute(text("SELECT 1"))
        except Exception as exc:
            try:
                session.rollback()
            except Exception:
                pass
            _log.warning("database readiness check failed: %s", exc)
            raise HTTPException(status_code=503, detail="database_unavailable") from None
        finally:
            session.close()
        return {"status": "ready"}

    # ── Auth endpoints ────────────────────────────────────────

    @app.post("/auth/google")
    def auth_google(payload: dict[str, str], db: Db):
        from nexusai.database import User, UserSession
        from nexusai.security.google_oauth import verify_google_id_token
        from nexusai.security.jwt import create_session_jwt

        id_token_str = payload.get("id_token", "")
        if not id_token_str:
            raise HTTPException(status_code=400, detail="id_token required")

        settings = get_settings()
        client_id = getattr(settings, "google_oauth_client_id", None)
        if not client_id:
            raise HTTPException(status_code=500, detail="Google OAuth not configured")

        try:
            claims = verify_google_id_token(id_token_str, client_id)
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Google ID token: {e}")

        google_sub = claims.get("sub")
        email = claims.get("email", "")
        name = claims.get("name", "")
        picture = claims.get("picture", "")

        # Upsert user
        user = db.query(User).filter(User.google_sub == google_sub).first()
        if not user:
            user = User(google_sub=google_sub, email=email, name=name, picture_url=picture, role="PENDING")
            db.add(user)
            db.flush()
        else:
            user.last_login_at = utcnow()
            db.flush()

        jwt_secret = app.state.jwt_secret
        ttl = int(getattr(settings, "session_jwt_ttl_hours", 168) or 168)
        token, jti, expires_at = create_session_jwt(user.user_id, user.role, jwt_secret, ttl)

        db.add(UserSession(user_id=user.user_id, jwt_jti=jti, expires_at=expires_at))
        db.flush()

        return {
            "session_jwt": token,
            "user": {"user_id": user.user_id, "email": user.email, "name": user.name, "role": user.role},
        }

    @app.post("/auth/logout")
    def auth_logout(request: Request, db: Db):
        from nexusai.database import UserSession
        from nexusai.security.dependencies import get_current_user

        user = get_current_user(request)
        jti = user.get("jti")
        if jti:
            sess = db.query(UserSession).filter(UserSession.jwt_jti == jti).first()
            if sess:
                sess.revoked_at = utcnow()
                db.flush()
        return {"status": "logged_out"}

    @app.get("/me")
    def get_me(request: Request, db: Db):
        from nexusai.database import User
        from nexusai.security.dependencies import get_current_user

        user_info = get_current_user(request)
        user = db.get(User, user_info["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user.user_id, "email": user.email, "name": user.name, "role": user.role}

    @app.post("/auth/bootstrap-admin")
    def bootstrap_admin(payload: dict[str, Any], db: Db):
        from nexusai.database import User

        settings = get_settings()
        setup_token = getattr(settings, "setup_token", None)
        if not setup_token:
            raise HTTPException(status_code=403, detail="Bootstrap not available")
        if payload.get("setup_token") != setup_token:
            raise HTTPException(status_code=403, detail="Invalid setup token")
        if db.query(User).filter(User.role == "SUPER_ADMIN").first():
            raise HTTPException(status_code=403, detail="Bootstrap admin has already been used")

        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")
        user = db.get(User, int(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.role = "SUPER_ADMIN"
        db.flush()
        return {"status": "promoted", "user_id": user.user_id, "role": user.role}

    @app.patch("/users/{user_id}/role")
    def update_user_role(
        user_id: int,
        payload: dict[str, str],
        db: Db,
        actor: dict = Depends(require_roles("SUPER_ADMIN")),
    ):
        from nexusai.database import User

        new_role = payload.get("role", "")
        if new_role not in ("SUPER_ADMIN", "ECOSYSTEM_ADMIN", "MENTOR", "PARTNER", "SERVICE_PROVIDER", "COMPANY", "PENDING"):
            raise HTTPException(status_code=400, detail="Invalid role")
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.role = new_role
        db.flush()
        log_audit(db, action="UPDATE_ROLE", entity_type="user", entity_id=user_id, detail=f"role={new_role}")
        return {"user_id": user.user_id, "role": user.role}

    @app.post("/auth/demo-login")
    def demo_login(payload: dict[str, str], db: Db):
        from nexusai.database import User

        if settings.app_env != "development":
            raise HTTPException(status_code=403, detail="demo-login disabled")
        email = payload.get("email", "").strip()
        role = payload.get("role", "").strip().upper()
        if not email:
            raise HTTPException(status_code=400, detail="email required")
        valid_roles = {"SUPER_ADMIN", "ECOSYSTEM_ADMIN", "ORGANIZER", "ADMIN"}
        mapped_role = "SUPER_ADMIN" if role in ("ADMIN", "SUPER_ADMIN") else "ECOSYSTEM_ADMIN"

        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, name=email.split("@")[0].title(), role=mapped_role)
            db.add(user)
            db.flush()
        else:
            user.role = mapped_role
            user.last_login_at = utcnow()
            db.flush()

        return {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        }

    # ── Profile CRUD ──────────────────────────────────────────

    @app.post("/profiles/mentors", response_model=MentorOut)
    def create_mentor(payload: MentorIn, db: Db):
        mentor = Mentor(**payload.model_dump())
        db.add(mentor)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="A mentor with this email already exists")
        return mentor

    @app.get("/profiles/mentors", response_model=list[MentorOut])
    def list_mentors(db: Db):
        return db.scalars(select(Mentor).order_by(Mentor.full_name)).all()

    @app.post("/profiles/companies", response_model=CompanyOut)
    def create_company(payload: CompanyIn, db: Db):
        company = Company(**payload.model_dump())
        db.add(company)
        db.flush()
        return company

    @app.get("/profiles/companies", response_model=list[CompanyOut])
    def list_companies(db: Db):
        return db.scalars(select(Company).order_by(Company.company_name)).all()

    @app.post("/profiles/partners")
    def create_partner(payload: PartnerIn, db: Db):
        partner = Partner(**payload.model_dump())
        db.add(partner)
        db.flush()
        return {"partner_id": partner.partner_id, **payload.model_dump()}

    @app.get("/profiles/partners")
    def list_partners(db: Db):
        return db.scalars(select(Partner).order_by(Partner.organisation_name)).all()

    @app.post("/profiles/service-providers")
    def create_service_provider(payload: ServiceProviderIn, db: Db):
        provider = ServiceProvider(**payload.model_dump())
        db.add(provider)
        db.flush()
        return {"sp_id": provider.sp_id, **payload.model_dump()}

    @app.get("/profiles/service-providers")
    def list_service_providers(db: Db):
        return db.scalars(select(ServiceProvider).order_by(ServiceProvider.organisation_name)).all()

    @app.post("/events", response_model=EventOut)
    def create_event(payload: EventIn, db: Db):
        event = Event(**payload.model_dump())
        db.add(event)
        db.flush()
        return event

    @app.get("/events", response_model=list[EventOut])
    def list_events(db: Db):
        return db.scalars(select(Event).order_by(Event.created_at.desc())).all()

    # ── Programme CRUD ────────────────────────────────────────

    @app.post("/programmes", response_model=ProgrammeOut)
    def create_programme(payload: ProgrammeIn, db: Db):
        programme = Programme(**payload.model_dump())
        programme.status = "draft"
        db.add(programme)
        db.flush()
        log_audit(db, action="CREATE", entity_type="programme", entity_id=programme.programme_id, detail=payload.name)
        return programme

    @app.get("/programmes", response_model=list[ProgrammeOut])
    def list_programmes(db: Db, status: str | None = None):
        q = select(Programme).order_by(Programme.created_at.desc())
        if status:
            q = q.where(Programme.status == status)
        return db.scalars(q).all()

    @app.get("/programmes/{programme_id}", response_model=ProgrammeOut)
    def get_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        return prog

    @app.patch("/programmes/{programme_id}", response_model=ProgrammeOut)
    def update_programme(programme_id: int, payload: dict[str, Any], db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        allowed = {
            "name", "description", "category", "start_date", "end_date",
            "cover_image", "target_industry", "target_country", "target_company_stage",
            "required_mentors", "required_companies", "required_partners",
            "required_service_providers", "eligibility_criteria", "organiser_name",
        }
        for key, val in payload.items():
            if key in allowed:
                setattr(prog, key, val)
        db.flush()
        return prog

    @app.delete("/programmes/{programme_id}", status_code=204)
    def delete_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        db.delete(prog)
        db.flush()
        log_audit(db, action="DELETE", entity_type="programme", entity_id=programme_id)

    @app.post("/programmes/{programme_id}/submit", response_model=ProgrammeOut)
    def submit_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        if prog.status not in ("draft", "changes_requested"):
            raise HTTPException(status_code=400, detail=f"Cannot submit from status '{prog.status}'")
        prog.status = "submitted"
        prog.submitted_at = datetime.now()
        db.flush()
        log_audit(db, action="SUBMIT", entity_type="programme", entity_id=programme_id)
        return prog

    @app.post("/programmes/{programme_id}/approve", response_model=ProgrammeOut)
    def approve_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        prog.status = "approved"
        db.flush()
        log_audit(db, action="APPROVE", entity_type="programme", entity_id=programme_id)
        return prog

    @app.post("/programmes/{programme_id}/publish", response_model=ProgrammeOut)
    def publish_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        prog.status = "published"
        prog.published_at = datetime.now()
        db.flush()
        log_audit(db, action="PUBLISH", entity_type="programme", entity_id=programme_id)
        return prog

    @app.post("/programmes/{programme_id}/reject", response_model=ProgrammeOut)
    def reject_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        prog.status = "rejected"
        db.flush()
        log_audit(db, action="REJECT", entity_type="programme", entity_id=programme_id)
        return prog

    @app.post("/programmes/{programme_id}/request-changes", response_model=ProgrammeOut)
    def request_changes_programme(programme_id: int, db: Db):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")
        prog.status = "changes_requested"
        db.flush()
        return prog

    @app.get("/programmes/{programme_id}/match")
    def match_programme(programme_id: int, db: Db):
        """Score all actors against a programme's target criteria."""
        try:
            return _match_programme_impl(programme_id, db)
        except Exception as exc:
            if isinstance(exc, HTTPException):
                raise
            _log.exception("match_programme failed programme_id=%s", programme_id)
            raise HTTPException(status_code=500, detail="Internal error") from None

    def _match_programme_impl(programme_id: int, db: Session):
        prog = db.get(Programme, programme_id)
        if not prog:
            raise HTTPException(status_code=404, detail="Programme not found")

        def _norm(s: str | None) -> str:
            return (s or "").strip().lower()

        def _tier(score: float) -> str:
            if score >= 0.75:
                return "Excellent"
            if score >= 0.50:
                return "Strong"
            if score >= 0.25:
                return "Good"
            return "Fair"

        def _industry_match(actor_field: str | None, target: str | None) -> bool:
            if not target or not actor_field:
                return False
            return _norm(target) in _norm(actor_field)

        def _stage_match(actor_stage: str | None, target: str | None) -> bool:
            if not target or not actor_stage:
                return False
            return _norm(target) in _norm(actor_stage)

        def _country_match(actor_country: str | None, target: str | None) -> bool:
            if not target or not actor_country:
                return False
            return _norm(target) in _norm(actor_country)

        ti = prog.target_industry
        ts = prog.target_company_stage
        tc = prog.target_country

        mentors_out = []
        for m in db.scalars(select(Mentor)).all():
            score = 0.0
            factors: list[str] = []
            if _industry_match(m.preferred_industry, ti):
                score += 0.40
                factors.append(f"Industry: {ti}")
            if _stage_match(m.preferred_company_stage, ts):
                score += 0.40
                factors.append(f"Stage: {ts}")
            if _country_match(m.country, tc):
                score += 0.20
                factors.append(f"Country: {tc}")
            mentors_out.append({
                "id": f"mentor-{m.mentor_id}",
                "actorId": str(m.mentor_id),
                "actorType": "mentor",
                "actorName": m.full_name,
                "profileSummary": m.short_bio or m.job_title or "",
                "matchScore": round(score * 100),
                "matchTier": _tier(score),
                "aiExplanation": ", ".join(factors) if factors else "General ecosystem fit",
                "availabilityLabel": m.current_availability_status or "Available",
                "isAvailable": (m.current_availability_status or "Available") == "Available",
                "tags": [t for t in [m.preferred_industry, m.preferred_company_stage, m.country] if t],
            })

        companies_out = []
        for c in db.scalars(select(Company)).all():
            score = 0.0
            factors: list[str] = []
            if _industry_match(c.industry, ti):
                score += 0.40
                factors.append(f"Industry: {ti}")
            if _stage_match(c.business_stage, ts):
                score += 0.40
                factors.append(f"Stage: {ts}")
            if _country_match(c.country, tc):
                score += 0.20
                factors.append(f"Country: {tc}")
            companies_out.append({
                "id": f"company-{c.company_id}",
                "actorId": str(c.company_id),
                "actorType": "company",
                "actorName": c.company_name,
                "profileSummary": c.company_description or "",
                "matchScore": round(score * 100),
                "matchTier": _tier(score),
                "aiExplanation": ", ".join(factors) if factors else "General ecosystem fit",
                "availabilityLabel": c.availability or "Available",
                "isAvailable": True,
                "tags": [t for t in [c.industry, c.business_stage, c.country] if t],
            })

        partners_out = []
        for p in db.scalars(select(Partner)).all():
            score = 0.0
            factors: list[str] = []
            if _industry_match(p.industries_of_interest, ti):
                score += 0.60
                factors.append(f"Industry: {ti}")
            if _country_match(p.country, tc):
                score += 0.40
                factors.append(f"Country: {tc}")
            partners_out.append({
                "id": f"partner-{p.partner_id}",
                "actorId": str(p.partner_id),
                "actorType": "partner",
                "actorName": p.organisation_name,
                "profileSummary": p.organisation_description or "",
                "matchScore": round(score * 100),
                "matchTier": _tier(score),
                "aiExplanation": ", ".join(factors) if factors else "General ecosystem fit",
                "availabilityLabel": "Available",
                "isAvailable": True,
                "tags": [t for t in [p.industries_of_interest, p.country, p.organisation_type] if t],
            })

        sps_out = []
        for s in db.scalars(select(ServiceProvider)).all():
            score = 0.50
            factors: list[str] = ["Service provider fit"]
            if _industry_match(s.services_offered, ti):
                score = min(1.0, score + 0.30)
                factors.append(f"Services match: {ti}")
            sps_out.append({
                "id": f"sp-{s.sp_id}",
                "actorId": str(s.sp_id),
                "actorType": "service_provider",
                "actorName": s.organisation_name,
                "profileSummary": s.company_description or "",
                "matchScore": round(score * 100),
                "matchTier": _tier(score),
                "aiExplanation": ", ".join(factors),
                "availabilityLabel": "Available",
                "isAvailable": True,
                "tags": [t for t in [s.services_offered] if t],
            })

        mentors_out.sort(key=lambda x: -x["matchScore"])
        companies_out.sort(key=lambda x: -x["matchScore"])
        partners_out.sort(key=lambda x: -x["matchScore"])
        sps_out.sort(key=lambda x: -x["matchScore"])

        return {
            "mentors": mentors_out,
            "companies": companies_out,
            "partners": partners_out,
            "serviceProviders": sps_out,
        }

    def _shortlist_out(item: ProgrammeShortlistItem) -> ShortlistItemOut:
        added_at = item.added_at or utcnow()
        return ShortlistItemOut(
            id=str(item.shortlist_id),
            programme_id=str(item.programme_id),
            match_result_id=item.match_result_id,
            actor_id=item.actor_id,
            actor_type=item.actor_type,
            actor_name=item.actor_name,
            match_score=item.match_score,
            added_at=added_at.isoformat(),
            added_by=item.added_by,
            is_admin_selected=item.is_admin_selected,
        )

    def _require_programme(db: Session, programme_id: int) -> Programme:
        programme = db.get(Programme, programme_id)
        if not programme:
            raise HTTPException(status_code=404, detail="Programme not found")
        return programme

    @app.get("/programmes/{programme_id}/shortlist", response_model=list[ShortlistItemOut])
    def list_programme_shortlist(programme_id: int, db: Db):
        _require_programme(db, programme_id)
        items = db.scalars(
            select(ProgrammeShortlistItem)
            .where(ProgrammeShortlistItem.programme_id == programme_id)
            .order_by(ProgrammeShortlistItem.added_at.desc(), ProgrammeShortlistItem.shortlist_id.desc())
        ).all()
        return [_shortlist_out(item) for item in items]

    @app.post("/programmes/{programme_id}/shortlist", response_model=ShortlistItemOut, status_code=201)
    def add_programme_shortlist_item(programme_id: int, payload: ShortlistItemIn, response: Response, db: Db):
        _require_programme(db, programme_id)
        existing = db.scalar(
            select(ProgrammeShortlistItem).where(
                ProgrammeShortlistItem.programme_id == programme_id,
                ProgrammeShortlistItem.match_result_id == payload.match_result_id,
            )
        )
        if existing:
            response.status_code = 200
            return _shortlist_out(existing)

        item = ProgrammeShortlistItem(
            programme_id=programme_id,
            match_result_id=payload.match_result_id,
            actor_id=payload.actor_id,
            actor_type=payload.actor_type,
            actor_name=payload.actor_name,
            match_score=payload.match_score,
            added_by="Admin",
            is_admin_selected=True,
        )
        db.add(item)
        db.flush()
        return _shortlist_out(item)

    @app.delete("/programmes/{programme_id}/shortlist/{item_id}", status_code=204)
    def remove_programme_shortlist_item(programme_id: int, item_id: str, db: Db):
        _require_programme(db, programme_id)
        try:
            shortlist_id = int(item_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Shortlist item not found") from None
        item = db.get(ProgrammeShortlistItem, shortlist_id)
        if not item or item.programme_id != programme_id:
            raise HTTPException(status_code=404, detail="Shortlist item not found")
        db.delete(item)
        db.flush()
        return None

    @app.get("/relationships/graph", response_model=RelationshipGraphOut)
    def get_relationship_graph(db: Db):
        nodes: list[dict[str, Any]] = []
        edges: list[dict[str, Any]] = []
        seen_nodes: set[str] = set()

        rows = db.execute(
            select(ProgrammeShortlistItem, Programme)
            .join(Programme, ProgrammeShortlistItem.programme_id == Programme.programme_id)
            .order_by(Programme.programme_id, ProgrammeShortlistItem.shortlist_id)
        ).all()

        for item, programme in rows:
            programme_node_id = f"prog-{programme.programme_id}"
            if programme_node_id not in seen_nodes:
                seen_nodes.add(programme_node_id)
                nodes.append({
                    "id": programme_node_id,
                    "label": programme.name,
                    "category": "programme",
                    "type": "institution",
                    "sector": programme.category or "",
                })

            actor_node_id = f"{item.actor_type}-{item.actor_id}"
            if actor_node_id not in seen_nodes:
                seen_nodes.add(actor_node_id)
                nodes.append({
                    "id": actor_node_id,
                    "label": item.actor_name,
                    "category": item.actor_type,
                    "type": "individual" if item.actor_type == "mentor" else "institution",
                    "sector": "",
                })

            score = float(item.match_score or 0)
            if 0 < score <= 1:
                score *= 100

            edges.append({
                "id": f"edge-{programme_node_id}-{actor_node_id}",
                "source": programme_node_id,
                "target": actor_node_id,
                "score": round(score, 2),
                "strength": "strong" if score >= 90 else "weak",
            })

        return {"nodes": nodes, "edges": edges}

    # ── Actors aggregate endpoint ─────────────────────────────

    @app.get("/actors")
    def list_actors(db: Db):
        """Unified list of all ecosystem actors for admin management."""
        actors = []
        for m in db.scalars(select(Mentor).order_by(Mentor.full_name)).all():
            actors.append({"id": m.mentor_id, "name": m.full_name, "type": "mentor",
                           "category": m.preferred_industry or "", "country": m.country or "",
                           "status": "active", "registeredAt": str(m.created_at or "")})
        for c in db.scalars(select(Company).order_by(Company.company_name)).all():
            actors.append({"id": c.company_id, "name": c.company_name, "type": "company",
                           "category": c.industry or "", "country": c.country or "",
                           "status": "active", "registeredAt": str(c.created_at or "")})
        for p in db.scalars(select(Partner).order_by(Partner.organisation_name)).all():
            actors.append({"id": p.partner_id, "name": p.organisation_name, "type": "partner",
                           "category": p.industries_of_interest or "", "country": p.country or "",
                           "status": "active", "registeredAt": str(p.created_at or "")})
        for s in db.scalars(select(ServiceProvider).order_by(ServiceProvider.organisation_name)).all():
            actors.append({"id": s.sp_id, "name": s.organisation_name, "type": "service_provider",
                           "category": s.services_offered or "", "country": getattr(s, 'country_region', '') or '',
                           "status": "active", "registeredAt": str(s.created_at or "")})
        return actors

    @app.post("/matches/recommend", response_model=MatchResponse)
    def recommend_matches(payload: MatchRequest, db: Db):
        company = db.get(Company, payload.company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if not db.get(Event, payload.event_id):
            raise HTTPException(status_code=404, detail="Event not found")

        company_profile = CompanyProfile(
            id=str(company.company_id),
            name=company.company_name,
            industry=company.industry or "",
            stage=company.business_stage or "",
            support_needed=[s.strip() for s in (company.support_needed or "").split(",") if s.strip()],
            languages=[],
        )
        mentors = [
            MentorProfile(
                id=str(mentor.mentor_id),
                name=mentor.full_name,
                industries=[i.strip() for i in (mentor.preferred_industry or "").split(",") if i.strip()],
                support_types=[s.strip() for s in (mentor.type_of_support_offered or "").split(",") if s.strip()],
                stages=[s.strip() for s in (mentor.preferred_company_stage or "").split(",") if s.strip()],
                languages=[],
                capacity_score=0.5,
            )
            for mentor in db.scalars(select(Mentor)).all()
        ]
        recommendations = recommend_mentors(mentors, company_profile, payload.top_k)

        results: list[MatchOut] = []
        for recommendation in recommendations:
            mentor_profile = next((item for item in mentors if item.id == recommendation.entity_id), None)
            if not mentor_profile:
                continue
            rationale = ai_service.generate_match_rationale(mentor_profile, company_profile, recommendation)
            results.append(
                MatchOut(
                    entity_id=int(recommendation.entity_id),
                    entity_name=recommendation.entity_name,
                    score=recommendation.score,
                    fit_factors=recommendation.fit_factors,
                    rationale=rationale,
                )
            )

        return MatchResponse(recommendations=results)

    @app.post("/followups", response_model=FollowUpOut)
    def create_followup(payload: FollowUpIn, db: Db):
        if not db.get(Company, payload.company_id):
            raise HTTPException(status_code=404, detail="Company not found")
        followup = FollowUp(**payload.model_dump())
        db.add(followup)
        db.flush()
        return followup

    @app.get("/analytics/dashboard")
    def analytics_dashboard(db: Db):
        return {
            "mentors": count_rows(db, Mentor),
            "companies": count_rows(db, Company),
            "events": count_rows(db, Event),
            "follow_ups": count_rows(db, FollowUp),
            "selections": count_rows(db, Selection),
        }

    async def _read_media_upload(file: UploadFile, allowed_content_types: set[str]) -> bytes:
        content_type = file.content_type or "application/octet-stream"
        if content_type not in allowed_content_types:
            raise HTTPException(status_code=415, detail="Unsupported media type")
        content = await file.read()
        if len(content) > MAX_MEDIA_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds 2MB limit")
        return content

    def _non_empty(value: Any) -> bool:
        if value is None:
            return False
        if isinstance(value, str):
            return bool(value.strip())
        return True

    def _cleaned_text(profile: dict[str, Any], fallback: str, preferred_field: str) -> str:
        for key in ("cleaned_text", preferred_field, "short_bio", "company_description", "bio"):
            value = profile.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        return fallback.strip()

    def _apply_blank_profile_fields(target: Any, profile: dict[str, Any], fields: list[str]) -> list[str]:
        updated: list[str] = []
        for field in fields:
            value = profile.get(field)
            if not _non_empty(value):
                continue
            if not hasattr(target, field):
                continue
            current = getattr(target, field)
            if _non_empty(current):
                continue
            setattr(target, field, value.strip() if isinstance(value, str) else value)
            updated.append(field)
        return updated

    def _mentor_upload_response(
        mentor: Mentor,
        source: str,
        cleaned_text: str,
        extracted_profile: dict[str, Any],
        updated_fields: list[str],
        extracted_text: str | None = None,
    ) -> dict[str, Any]:
        response = {
            "mentor_id": mentor.mentor_id,
            "source": source,
            "cleaned_text": cleaned_text,
            "extracted_profile": extracted_profile,
            "updated_fields": updated_fields,
        }
        if extracted_text is not None:
            response["extracted_text"] = extracted_text
        return response

    @app.post("/mentors/{mentor_id}/cv")
    async def upload_mentor_cv(mentor_id: int, db: Db, file: UploadFile = File(...)):
        mentor = db.get(Mentor, mentor_id)
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        content = await _read_media_upload(file, PDF_CONTENT_TYPES)
        try:
            extracted_text = mcp_client.document_ai_parse(
                filename=file.filename or "mentor-cv.pdf",
                content=content,
                content_type=file.content_type or "application/pdf",
            )
            extracted_profile = ai_service.extract_mentor_profile(extracted_text)
        except Exception as exc:
            _log.exception("mentor CV processing failed mentor_id=%s", mentor_id)
            raise HTTPException(status_code=502, detail="Media processing failed") from None

        cleaned_text = _cleaned_text(extracted_profile, extracted_text, "short_bio")
        updated_fields = _apply_blank_profile_fields(
            mentor,
            extracted_profile,
            [
                "full_name",
                "email",
                "job_title",
                "organization_name",
                "linkedin_profile_url",
                "preferred_industry",
                "type_of_support_offered",
                "preferred_company_stage",
                "short_bio",
                "current_availability_status",
                "country",
            ],
        )
        mentor.cv = cleaned_text
        db.flush()
        return _mentor_upload_response(
            mentor,
            "cv",
            cleaned_text,
            extracted_profile,
            updated_fields,
            extracted_text=extracted_text,
        )

    @app.post("/mentors/{mentor_id}/video")
    async def upload_mentor_video(mentor_id: int, db: Db, file: UploadFile = File(...)):
        mentor = db.get(Mentor, mentor_id)
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        content = await _read_media_upload(file, VIDEO_CONTENT_TYPES)
        try:
            transcript = mcp_client.chirp_transcribe(
                filename=file.filename or "mentor-video",
                content=content,
            )
            extracted_profile = ai_service.extract_mentor_video_profile(transcript)
        except Exception as exc:
            _log.exception("mentor video processing failed mentor_id=%s", mentor_id)
            raise HTTPException(status_code=502, detail="Media processing failed") from None

        cleaned_text = _cleaned_text(extracted_profile, transcript, "short_bio")
        updated_fields = _apply_blank_profile_fields(
            mentor,
            extracted_profile,
            [
                "full_name",
                "email",
                "job_title",
                "organization_name",
                "linkedin_profile_url",
                "preferred_industry",
                "type_of_support_offered",
                "preferred_company_stage",
                "short_bio",
                "current_availability_status",
                "country",
            ],
        )
        mentor.video = cleaned_text
        db.flush()
        return _mentor_upload_response(mentor, "video", cleaned_text, extracted_profile, updated_fields)

    @app.post("/companies/{company_id}/video")
    async def upload_company_video(company_id: int, db: Db, file: UploadFile = File(...)):
        company = db.get(Company, company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        content = await _read_media_upload(file, VIDEO_CONTENT_TYPES)
        try:
            transcript = mcp_client.chirp_transcribe(
                filename=file.filename or "company-video",
                content=content,
            )
            extracted_profile = ai_service.extract_company_video_profile(transcript)
        except Exception:
            _log.exception("company video processing failed company_id=%s", company_id)
            raise HTTPException(status_code=502, detail="Media processing failed") from None

        cleaned_text = _cleaned_text(extracted_profile, transcript, "company_description")
        updated_fields = _apply_blank_profile_fields(
            company,
            extracted_profile,
            [
                "company_name",
                "company_description",
                "country",
                "industry",
                "business_stage",
                "support_needed",
                "availability",
            ],
        )
        company.video = cleaned_text
        db.flush()
        return {
            "company_id": company.company_id,
            "source": "video",
            "cleaned_text": cleaned_text,
            "extracted_profile": extracted_profile,
            "updated_fields": updated_fields,
        }

    @app.post("/agent/chat")
    def agent_chat(payload: dict[str, Any], db: Db):
        from nexusai.agents.graph import run_agent

        session_id = str(payload.get("session_id") or "demo")
        message = str(payload.get("message") or "")
        if not message:
            return {"session_id": session_id, "reply": "Please provide a message."}

        try:
            final_state = run_agent(
                ai_service=ai_service,
                mcp_client=mcp_client,
                db_session=db,
                message=message,
                session_id=session_id,
            )
            return {
                "session_id": session_id,
                "intent": final_state.get("intent", "general"),
                "reply": final_state.get("response", "No response generated."),
                "candidates": final_state.get("candidates"),
                "selection_id": final_state.get("selection_id"),
            }
        except Exception:
            import traceback, logging
            logging.getLogger("nexusai").error("agent_chat error", exc_info=True)
            return {
                "session_id": session_id,
                "reply": "Something went wrong processing your request. Please try again.",
                "error": "internal_error",
            }

    @app.post("/agent/chat/stream")
    def agent_chat_stream(payload: dict[str, Any], db: Db):
        """SSE streaming endpoint for the agent."""
        import json as json_mod

        from nexusai.agents.graph import compile_agent_graph

        session_id = str(payload.get("session_id") or "demo")
        message = str(payload.get("message") or "")

        def event_stream():
            try:
                compiled = compile_agent_graph(ai_service, mcp_client, db)
                initial_state = {
                    "session_id": session_id,
                    "messages": [{"role": "user", "content": message}],
                }
                for event in compiled.stream(initial_state, stream_mode="updates"):
                    for node_name, state_update in event.items():
                        payload_data = {
                            "node": node_name,
                            "intent": state_update.get("intent"),
                            "response": state_update.get("response"),
                            "candidates": state_update.get("candidates"),
                        }
                        yield f"event: node\ndata: {json_mod.dumps(payload_data)}\n\n"

                yield f"event: done\ndata: {json_mod.dumps({'session_id': session_id})}\n\n"
            except Exception:
                import logging
                logging.getLogger("nexusai").error("agent_chat_stream error", exc_info=True)
                yield f"event: error\ndata: {json_mod.dumps({'error': 'internal_error'})}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    # ── Selection endpoints ──────────────────────────────────

    @app.post("/selections", response_model=SelectionOut)
    def create_selection(payload: SelectionIn, db: Db):
        if payload.event_id and not db.get(Event, payload.event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        selection = Selection(
            event_id=payload.event_id,
            purpose=payload.purpose,
            ai_generated=payload.ai_generated,
            approval_status="DRAFT",
        )
        db.add(selection)
        db.flush()
        for item in payload.items:
            db.add(SelectionItem(
                selection_id=selection.selection_id,
                entity_type=item.entity_type,
                entity_id=item.entity_id,
                entity_name=item.entity_name,
                match_score=item.match_score,
                rationale=item.rationale,
            ))
        db.flush()
        log_audit(db, action="CREATE", entity_type="selection", entity_id=selection.selection_id, detail=payload.purpose)
        return db.get(Selection, selection.selection_id)

    @app.get("/selections", response_model=list[SelectionOut])
    def list_selections(db: Db):
        return db.scalars(select(Selection).order_by(Selection.created_at.desc())).all()

    @app.get("/selections/{selection_id}", response_model=SelectionOut)
    def get_selection(selection_id: int, db: Db):
        selection = db.get(Selection, selection_id)
        if not selection:
            raise HTTPException(status_code=404, detail="Selection not found")
        return selection

    @app.post("/selections/{selection_id}/approve", response_model=SelectionOut)
    def approve_selection(selection_id: int, db: Db):
        selection = db.get(Selection, selection_id)
        if not selection:
            raise HTTPException(status_code=404, detail="Selection not found")
        if selection.approval_status == "APPROVED":
            raise HTTPException(status_code=400, detail="Already approved")
        selection.approval_status = "APPROVED"
        selection.approved_by = "admin"
        selection.approved_at = datetime.now()
        selection.version += 1
        db.flush()
        log_audit(db, action="APPROVE", entity_type="selection", entity_id=selection_id, detail=selection.purpose)

        # Create notifications for matched entities
        for item in selection.items:
            if item.entity_type == "MENTOR":
                mentor = db.get(Mentor, item.entity_id)
                if mentor:
                    db.add(Notification(
                        user_email=mentor.email,
                        kind="MATCH_INVITE",
                        title=f"You've been matched: {selection.purpose or 'New selection'}",
                        body=item.rationale or f"Match score: {item.match_score}",
                    ))

        db.flush()
        return selection

    @app.post("/selections/{selection_id}/reject", response_model=SelectionOut)
    def reject_selection(selection_id: int, db: Db):
        selection = db.get(Selection, selection_id)
        if not selection:
            raise HTTPException(status_code=404, detail="Selection not found")
        selection.approval_status = "REJECTED"
        selection.version += 1
        db.flush()
        return selection

    # ── Notification endpoints ───────────────────────────────

    @app.get("/notifications", response_model=list[NotificationOut])
    def list_notifications(db: Db, email: str | None = None):
        q = select(Notification).order_by(Notification.created_at.desc())
        if email:
            q = q.where(Notification.user_email == email)
        return db.scalars(q.limit(50)).all()

    @app.patch("/notifications/{notification_id}/read")
    def mark_notification_read(notification_id: int, db: Db):
        notif = db.get(Notification, notification_id)
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.read_at = datetime.now()
        db.flush()
        return {"status": "read"}

    # ── Transcript parsing ────────────────────────────────────

    @app.post("/events/{event_id}/followups/from-transcript")
    def followup_from_transcript(event_id: int, payload: dict[str, str], db: Db):
        if not db.get(Event, event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        transcript = payload.get("transcript_text", "")
        if not transcript:
            raise HTTPException(status_code=400, detail="transcript_text is required")

        try:
            from vertexai import init
            from vertexai.generative_models import GenerationConfig, GenerativeModel

            settings = get_settings()
            init(project=settings.google_cloud_project, location=settings.google_cloud_location)
            model = GenerativeModel(settings.vertex_gemini_model)
            prompt = (
                "Parse this meeting transcript and extract structured follow-up data.\n"
                "Return JSON with keys: attendees (comma-separated), discussion, "
                "action_decision, person_recorded, sentiment_score (0.0-1.0), outcome_label "
                "(one of: PROGRESSED, STALLED, DROPPED, CLOSED_WIN, CLOSED_LOSS)\n\n"
                f"Transcript:\n{transcript}"
            )
            response = model.generate_content(
                prompt,
                generation_config=GenerationConfig(response_mime_type="application/json"),
            )
            import json as json_mod
            parsed = json_mod.loads(response.text)
        except Exception:
            parsed = {
                "attendees": "",
                "discussion": transcript[:500],
                "action_decision": "Review required — auto-parse unavailable",
                "person_recorded": "system",
                "sentiment_score": None,
                "outcome_label": None,
            }

        return {"event_id": event_id, "draft_followup": parsed, "source": "transcript"}

    # ── Audit endpoint ────────────────────────────────────────

    @app.get("/audit")
    def get_audit(entity_type: str, entity_id: int, db: Db):
        return get_audit_history(db, entity_type, entity_id)

    # ── Graph subgraph endpoint (P0-6) ────────────────────────

    @app.get("/graph/subgraph")
    def graph_subgraph(entity_type: str, entity_id: int):
        VALID_TYPES = {"Mentor", "Company", "Event", "Partner", "ServiceProvider"}
        if entity_type not in VALID_TYPES:
            raise HTTPException(status_code=400, detail=f"entity_type must be one of {sorted(VALID_TYPES)}")

        from nexusai.services.graph import FakeGraphService, GraphService

        settings = get_settings()
        if settings.spanner_instance_id and settings.spanner_database_id:
            svc = GraphService(settings)
        else:
            svc = FakeGraphService()
        return svc.expand_neighborhood(entity_type, entity_id)

    @app.get("/graph/mentors")
    def graph_mentors(industry: str, min_outcome: float = 0.7):
        from nexusai.services.graph import FakeGraphService, GraphService

        settings = get_settings()
        if settings.spanner_instance_id and settings.spanner_database_id:
            svc = GraphService(settings)
        else:
            svc = FakeGraphService()
        return svc.find_mentors_with_positive_history(industry, min_outcome=min_outcome)

    # ── BigQuery analytics endpoint (P0-10) ───────────────────

    @app.get("/analytics/bq-dashboard")
    def bq_dashboard():
        from nexusai.services.bigquery import (
            BigQueryService,
            FakeBigQueryService,
            dashboard_metrics_from_rows,
            dashboard_metrics_sql,
        )

        settings = get_settings()
        try:
            result = mcp_client.bigquery_query(dashboard_metrics_sql(settings.bigquery_dataset))
            rows = result.get("rows", []) if isinstance(result, dict) else []
            if rows:
                return dashboard_metrics_from_rows(rows)
            if isinstance(result, dict) and ("rows" in result or result.get("status") == "not_configured"):
                return FakeBigQueryService().get_dashboard_metrics()
        except Exception as exc:
            _log.warning("bigquery MCP dashboard query failed: %s", exc)

        try:
            svc = BigQueryService(settings)
            return svc.get_dashboard_metrics()
        except Exception as exc:
            _log.warning("direct BigQuery dashboard fallback failed: %s", exc)
            return FakeBigQueryService().get_dashboard_metrics()

    @app.get("/analytics/outcome-trends")
    def outcome_trends():
        from nexusai.services.bigquery import BigQueryService, FakeBigQueryService, outcome_trends_sql

        settings = get_settings()
        try:
            result = mcp_client.bigquery_query(outcome_trends_sql(settings.bigquery_dataset))
            rows = result.get("rows", []) if isinstance(result, dict) else []
            if rows:
                return rows
            if isinstance(result, dict) and ("rows" in result or result.get("status") == "not_configured"):
                return FakeBigQueryService().get_outcome_trends()
        except Exception as exc:
            _log.warning("bigquery MCP outcome trends query failed: %s", exc)

        try:
            svc = BigQueryService(settings)
            return svc.get_outcome_trends()
        except Exception as exc:
            _log.warning("direct BigQuery outcome trends fallback failed: %s", exc)
            return FakeBigQueryService().get_outcome_trends()

    return app


def count_rows(db: Session, model: type[Base]) -> int:
    return db.scalar(select(func.count()).select_from(model)) or 0
