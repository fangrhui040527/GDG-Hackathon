from collections.abc import Callable, Iterator
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from nexusai.config import get_settings
from nexusai.database import (
    AgentCheckpoint,
    AuditLog,
    Base,
    Company,
    Event,
    FollowUp,
    Mentor,
    Partner,
    Selection,
    SelectionItem,
    ServiceProvider,
    UploadedDocument,
    create_postgres_engine,
    create_session_factory,
)
from nexusai.matching import CompanyProfile, MentorProfile, recommend_mentors
from nexusai.mcp.registry import build_mcp_registry
from nexusai.services.ai import AIService, VertexAIService
from nexusai.services.mcp import MCPClient


class MentorIn(BaseModel):
    full_name: str
    email: str
    industries: list[str] = Field(default_factory=list)
    support_types: list[str] = Field(default_factory=list)
    stages: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    capacity_score: float = 0.5
    bio: str = ""


class MentorOut(MentorIn):
    model_config = ConfigDict(from_attributes=True)

    id: str


class CompanyIn(BaseModel):
    company_name: str
    industry: str = ""
    stage: str = ""
    support_needed: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    description: str = ""


class CompanyOut(CompanyIn):
    model_config = ConfigDict(from_attributes=True)

    id: str


class PartnerIn(BaseModel):
    organisation_name: str
    partner_type: str = "corp"
    industries_of_interest: list[str] = Field(default_factory=list)
    resources_offered: str = ""


class ServiceProviderIn(BaseModel):
    organisation_name: str
    sp_type: str = "consulting"
    services_offered: list[str] = Field(default_factory=list)
    current_capacity: str = "available"


class EventIn(BaseModel):
    event_name: str
    event_type: str = "matchmaking"
    programme_name: str = ""


class EventOut(EventIn):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str


class MatchRequest(BaseModel):
    event_id: str
    company_id: str
    top_k: int = 10


class MatchOut(BaseModel):
    entity_id: str
    entity_name: str
    score: float
    fit_factors: list[str]
    rationale: str


class MatchResponse(BaseModel):
    recommendations: list[MatchOut]


class SelectionIn(BaseModel):
    event_id: str
    purpose: str = ""
    company_id: str
    mentor_ids: list[str]
    match_scores: dict[str, float] = Field(default_factory=dict)


class SelectionOut(BaseModel):
    id: str
    event_id: str
    purpose: str
    company_id: str
    approval_status: str
    mentor_ids: list[str]
    match_scores: dict[str, float]


class FollowUpIn(BaseModel):
    event_id: str
    selection_id: str
    notes: str
    outcome_score: float = 0.0


class FollowUpOut(FollowUpIn):
    model_config = ConfigDict(from_attributes=True)

    id: str


class DashboardMetrics(BaseModel):
    mentors: int
    companies: int
    events: int
    approved_selections: int
    followups: int
    average_outcome_score: float


def create_default_session_factory() -> sessionmaker[Session]:
    settings = get_settings()
    engine = create_postgres_engine(settings.database_url)
    Base.metadata.create_all(engine)
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

    app = FastAPI(title="NexusAI MVP", version="0.1.0")

    def get_db() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    Db = Annotated[Session, Depends(get_db)]

    def audit(session: Session, action: str, entity_type: str, entity_id: str, payload: dict[str, Any]) -> None:
        session.add(AuditLog(action=action, entity_type=entity_type, entity_id=entity_id, payload=payload))

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/profiles/mentors", response_model=MentorOut)
    def create_mentor(payload: MentorIn, db: Db):
        mentor = Mentor(**payload.model_dump())
        db.add(mentor)
        db.flush()
        audit(db, "create", "mentor", mentor.id, payload.model_dump())
        return mentor

    @app.get("/profiles/mentors", response_model=list[MentorOut])
    def list_mentors(db: Db):
        return db.scalars(select(Mentor).order_by(Mentor.full_name)).all()

    @app.post("/profiles/companies", response_model=CompanyOut)
    def create_company(payload: CompanyIn, db: Db):
        company = Company(**payload.model_dump())
        db.add(company)
        db.flush()
        audit(db, "create", "company", company.id, payload.model_dump())
        return company

    @app.get("/profiles/companies", response_model=list[CompanyOut])
    def list_companies(db: Db):
        return db.scalars(select(Company).order_by(Company.company_name)).all()

    @app.post("/profiles/partners")
    def create_partner(payload: PartnerIn, db: Db):
        partner = Partner(**payload.model_dump())
        db.add(partner)
        db.flush()
        audit(db, "create", "partner", partner.id, payload.model_dump())
        return {"id": partner.id, **payload.model_dump()}

    @app.get("/profiles/partners")
    def list_partners(db: Db):
        partners = db.scalars(select(Partner).order_by(Partner.organisation_name)).all()
        return [
            {
                "id": item.id,
                "organisation_name": item.organisation_name,
                "partner_type": item.partner_type,
                "industries_of_interest": item.industries_of_interest,
                "resources_offered": item.resources_offered,
            }
            for item in partners
        ]

    @app.post("/profiles/service-providers")
    def create_service_provider(payload: ServiceProviderIn, db: Db):
        provider = ServiceProvider(**payload.model_dump())
        db.add(provider)
        db.flush()
        audit(db, "create", "service_provider", provider.id, payload.model_dump())
        return {"id": provider.id, **payload.model_dump()}

    @app.get("/profiles/service-providers")
    def list_service_providers(db: Db):
        providers = db.scalars(select(ServiceProvider).order_by(ServiceProvider.organisation_name)).all()
        return [
            {
                "id": item.id,
                "organisation_name": item.organisation_name,
                "sp_type": item.sp_type,
                "services_offered": item.services_offered,
                "current_capacity": item.current_capacity,
            }
            for item in providers
        ]

    @app.post("/events", response_model=EventOut)
    def create_event(payload: EventIn, db: Db):
        event = Event(**payload.model_dump())
        db.add(event)
        db.flush()
        audit(db, "create", "event", event.id, payload.model_dump())
        return event

    @app.get("/events", response_model=list[EventOut])
    def list_events(db: Db):
        return db.scalars(select(Event).order_by(Event.created_at.desc())).all()

    @app.post("/matches/recommend", response_model=MatchResponse)
    def recommend_matches(payload: MatchRequest, db: Db):
        company = db.get(Company, payload.company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if not db.get(Event, payload.event_id):
            raise HTTPException(status_code=404, detail="Event not found")

        company_profile = CompanyProfile(
            id=company.id,
            name=company.company_name,
            industry=company.industry,
            stage=company.stage,
            support_needed=company.support_needed,
            languages=company.languages,
        )
        mentors = [
            MentorProfile(
                id=mentor.id,
                name=mentor.full_name,
                industries=mentor.industries,
                support_types=mentor.support_types,
                stages=mentor.stages,
                languages=mentor.languages,
                capacity_score=mentor.capacity_score,
            )
            for mentor in db.scalars(select(Mentor)).all()
        ]
        recommendations = recommend_mentors(mentors, company_profile, payload.top_k)

        results: list[MatchOut] = []
        for recommendation in recommendations:
            mentor_profile = next(item for item in mentors if item.id == recommendation.entity_id)
            rationale = ai_service.generate_match_rationale(mentor_profile, company_profile, recommendation)
            results.append(
                MatchOut(
                    entity_id=recommendation.entity_id,
                    entity_name=recommendation.entity_name,
                    score=recommendation.score,
                    fit_factors=recommendation.fit_factors,
                    rationale=rationale,
                )
            )

        mcp_client.spanner_graph_query("MATCH ecosystem relationship signals", {"company_id": company.id})
        mcp_client.bigquery_query("SELECT historical_outcomes", {"company_id": company.id})
        return MatchResponse(recommendations=results)

    @app.post("/selections", response_model=SelectionOut)
    def create_selection(payload: SelectionIn, db: Db):
        if not db.get(Event, payload.event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        if not db.get(Company, payload.company_id):
            raise HTTPException(status_code=404, detail="Company not found")
        selection = Selection(
            event_id=payload.event_id,
            purpose=payload.purpose,
            company_id=payload.company_id,
            match_scores=payload.match_scores,
        )
        db.add(selection)
        db.flush()
        for mentor_id in payload.mentor_ids:
            db.add(
                SelectionItem(
                    selection_id=selection.id,
                    entity_type="mentor",
                    entity_id=mentor_id,
                    score=payload.match_scores.get(mentor_id, 0.0),
                )
            )
        audit(db, "create", "selection", selection.id, payload.model_dump())
        return selection_to_response(selection, payload.mentor_ids)

    @app.post("/selections/{selection_id}/approve", response_model=SelectionOut)
    def approve_selection(selection_id: str, db: Db):
        selection = db.get(Selection, selection_id)
        if not selection:
            raise HTTPException(status_code=404, detail="Selection not found")
        selection.approval_status = "approved"
        db.flush()
        audit(db, "approve", "selection", selection.id, {"approval_status": "approved"})
        mentor_ids = [
            item.entity_id
            for item in db.scalars(select(SelectionItem).where(SelectionItem.selection_id == selection.id)).all()
        ]
        return selection_to_response(selection, mentor_ids)

    @app.post("/followups", response_model=FollowUpOut)
    def create_followup(payload: FollowUpIn, db: Db):
        if not db.get(Event, payload.event_id):
            raise HTTPException(status_code=404, detail="Event not found")
        if not db.get(Selection, payload.selection_id):
            raise HTTPException(status_code=404, detail="Selection not found")
        followup = FollowUp(**payload.model_dump())
        db.add(followup)
        db.flush()
        audit(db, "create", "followup", followup.id, payload.model_dump())
        return followup

    @app.get("/analytics/dashboard", response_model=DashboardMetrics)
    def analytics_dashboard(db: Db):
        average_outcome = db.scalar(select(func.avg(FollowUp.outcome_score))) or 0.0
        return DashboardMetrics(
            mentors=count_rows(db, Mentor),
            companies=count_rows(db, Company),
            events=count_rows(db, Event),
            approved_selections=db.scalar(
                select(func.count()).select_from(Selection).where(Selection.approval_status == "approved")
            )
            or 0,
            followups=count_rows(db, FollowUp),
            average_outcome_score=round(float(average_outcome), 4),
        )

    @app.post("/mentors/{mentor_id}/cv")
    async def upload_mentor_cv(mentor_id: str, db: Db, file: UploadFile = File(...)):
        mentor = db.get(Mentor, mentor_id)
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        content = await file.read()
        extracted_text = mcp_client.document_ai_parse(
            filename=file.filename or "mentor-cv.pdf",
            content=content,
            content_type=file.content_type or "application/octet-stream",
        )
        extracted_profile = ai_service.extract_mentor_profile(extracted_text)
        mentor.parsed_cv = extracted_profile
        db.add(
            UploadedDocument(
                mentor_id=mentor.id,
                filename=file.filename or "mentor-cv.pdf",
                content_type=file.content_type or "application/octet-stream",
                extracted_text=extracted_text,
                extracted_profile=extracted_profile,
            )
        )
        audit(db, "upload_cv", "mentor", mentor.id, {"filename": file.filename})
        return {
            "mentor_id": mentor.id,
            "extracted_text": extracted_text,
            "extracted_profile": extracted_profile,
        }

    @app.post("/agent/chat")
    def agent_chat(payload: dict[str, Any], db: Db):
        session_id = str(payload.get("session_id") or "demo")
        message = str(payload.get("message") or "")
        checkpoint = AgentCheckpoint(session_id=session_id, state={"last_message": message})
        db.add(checkpoint)
        return {
            "session_id": session_id,
            "final": "NexusAI admin copilot received the request. Matching workflows are available through /matches/recommend.",
        }

    return app


def selection_to_response(selection: Selection, mentor_ids: list[str]) -> SelectionOut:
    return SelectionOut(
        id=selection.id,
        event_id=selection.event_id,
        purpose=selection.purpose,
        company_id=selection.company_id,
        approval_status=selection.approval_status,
        mentor_ids=mentor_ids,
        match_scores=selection.match_scores,
    )


def count_rows(db: Session, model: type[Base]) -> int:
    return db.scalar(select(func.count()).select_from(model)) or 0
