from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models import (
    # Vertex / BigQuery
    VertexSearchRequest,
    VertexSearchResponse,
    VertexEmbeddingsRequest,
    VertexEmbeddingsResponse,
    BigQueryGraphRequest,
    BigQueryGraphResponse,
    # App
    ProgrammeCreate,
    ProgrammeDTO,
    ActorDTO,
    MentorCreate,
    CompanyCreate,
    PartnerCreate,
    ServiceProviderCreate,
    MatchGroup,
    MatchRecommendation,
    DashboardMetrics,
)

# Google Cloud services are optional — server works without them
try:
    from app.config import settings
    from app.services.vertex_search import diagnose_search, search_documents
    from app.services.vertex_embeddings import embed_texts
    from app.services.bigquery_graph import run_graph_query
    _GCP_AVAILABLE = True
except Exception:
    _GCP_AVAILABLE = False
    settings = None  # type: ignore

router = APIRouter()

# ── In-memory stores ──────────────────────────────────────────────────────────

_programmes: dict[int, dict] = {}
_programme_counter = 0

_actors: list[dict] = [
    {"id": 1, "name": "Axiata Digital", "type": "company", "category": "Fintech", "country": "Malaysia", "status": "active", "registeredAt": "2025-01-10"},
    {"id": 2, "name": "Dr. Sarah Lim", "type": "mentor", "category": "Healthcare", "country": "Singapore", "status": "active", "registeredAt": "2025-02-05"},
    {"id": 3, "name": "Khazanah Nasional", "type": "partner", "category": "Investment", "country": "Malaysia", "status": "pending", "registeredAt": "2025-03-15"},
    {"id": 4, "name": "AWS Startup Loft", "type": "service_provider", "category": "Cloud", "country": "Malaysia", "status": "active", "registeredAt": "2025-04-01"},
]
_actor_counter = len(_actors)

_submissions: dict[str, list[dict]] = {"mentors": [], "companies": [], "partners": [], "service_providers": []}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_dto(p: dict) -> ProgrammeDTO:
    return ProgrammeDTO(**p)


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


# ── Programmes ────────────────────────────────────────────────────────────────

@router.get("/programmes", response_model=list[ProgrammeDTO])
def list_programmes(status: Optional[str] = Query(None)):
    items = list(_programmes.values())
    if status:
        items = [p for p in items if p["status"] == status]
    return [_to_dto(p) for p in items]


@router.get("/programmes/{programme_id}", response_model=ProgrammeDTO)
def get_programme(programme_id: int):
    p = _programmes.get(programme_id)
    if not p:
        raise HTTPException(status_code=404, detail="Programme not found")
    return _to_dto(p)


@router.post("/programmes", response_model=ProgrammeDTO, status_code=201)
def create_programme(body: ProgrammeCreate):
    global _programme_counter
    _programme_counter += 1
    now = _now()
    record = {
        "programme_id": _programme_counter,
        "name": body.name,
        "description": body.description,
        "category": body.category,
        "status": "draft",
        "start_date": body.start_date,
        "end_date": body.end_date,
        "cover_image": body.cover_image,
        "target_industry": body.target_industry,
        "target_country": body.target_country,
        "target_company_stage": body.target_company_stage,
        "required_mentors": body.required_mentors,
        "required_companies": body.required_companies,
        "required_partners": body.required_partners,
        "required_service_providers": body.required_service_providers,
        "eligibility_criteria": body.eligibility_criteria,
        "organiser_id": body.organiser_id,
        "organiser_name": body.organiser_name,
        "submitted_at": None,
        "published_at": None,
        "created_at": now,
        "updated_at": now,
    }
    _programmes[_programme_counter] = record
    return _to_dto(record)


@router.delete("/programmes/{programme_id}", status_code=204)
def delete_programme(programme_id: int):
    if programme_id not in _programmes:
        raise HTTPException(status_code=404, detail="Programme not found")
    del _programmes[programme_id]


def _transition(programme_id: int, new_status: str, timestamp_field: Optional[str] = None) -> ProgrammeDTO:
    p = _programmes.get(programme_id)
    if not p:
        raise HTTPException(status_code=404, detail="Programme not found")
    p["status"] = new_status
    p["updated_at"] = _now()
    if timestamp_field:
        p[timestamp_field] = _now()
    return _to_dto(p)


@router.post("/programmes/{programme_id}/submit", response_model=ProgrammeDTO)
def submit_programme(programme_id: int):
    return _transition(programme_id, "submitted", "submitted_at")


@router.post("/programmes/{programme_id}/approve", response_model=ProgrammeDTO)
def approve_programme(programme_id: int):
    return _transition(programme_id, "approved")


@router.post("/programmes/{programme_id}/publish", response_model=ProgrammeDTO)
def publish_programme(programme_id: int):
    return _transition(programme_id, "published", "published_at")


@router.post("/programmes/{programme_id}/reject", response_model=ProgrammeDTO)
def reject_programme(programme_id: int):
    return _transition(programme_id, "rejected")


@router.post("/programmes/{programme_id}/request-changes", response_model=ProgrammeDTO)
def request_changes(programme_id: int):
    return _transition(programme_id, "changes_requested")


# ── AI Matching ───────────────────────────────────────────────────────────────

_SAMPLE_NAMES = ["Axiata Digital", "Grab Ventures", "Khazanah Nasional", "MDEC", "Cradle Fund",
                 "Dr. Ahmad Farouk", "Ms. Priya Nair", "Mr. Lee Wei Liang", "AWS Startup Loft", "KPMG Advisory"]
_SAMPLE_FACTORS = ["Industry alignment", "Stage fit", "Geographic match", "Expertise match", "Capacity available"]

@router.get("/programmes/{programme_id}/match", response_model=MatchGroup)
def get_programme_matches(programme_id: int):
    if programme_id not in _programmes:
        raise HTTPException(status_code=404, detail="Programme not found")

    def _recs(n: int) -> list[MatchRecommendation]:
        names = random.sample(_SAMPLE_NAMES, min(n, len(_SAMPLE_NAMES)))
        return [
            MatchRecommendation(
                entity_id=str(i + 1),
                entity_name=name,
                score=round(random.uniform(0.70, 0.99), 2),
                fit_factors=random.sample(_SAMPLE_FACTORS, k=random.randint(2, 4)),
                rationale=f"{name} aligns well with the programme's target criteria.",
            )
            for i, name in enumerate(names)
        ]

    return MatchGroup(mentors=_recs(3), companies=_recs(3), partners=_recs(2), service_providers=_recs(2))


# ── Actors ────────────────────────────────────────────────────────────────────

@router.get("/actors", response_model=list[ActorDTO])
def list_actors():
    return [ActorDTO(**a) for a in _actors]


# ── Profile registrations ─────────────────────────────────────────────────────

@router.post("/profiles/mentors", status_code=201)
def register_mentor(body: MentorCreate):
    global _actor_counter
    _actor_counter += 1
    entry = {"id": _actor_counter, "name": body.full_name, "type": "mentor",
             "category": body.industries[0] if body.industries else "General",
             "country": "Malaysia", "status": "pending", "registeredAt": _now()[:10]}
    _actors.append(entry)
    _submissions["mentors"].append(body.model_dump())
    return {"id": _actor_counter, "message": "Mentor registered successfully"}


@router.post("/profiles/companies", status_code=201)
def register_company(body: CompanyCreate):
    global _actor_counter
    _actor_counter += 1
    entry = {"id": _actor_counter, "name": body.company_name, "type": "company",
             "category": body.industry, "country": "Malaysia", "status": "pending",
             "registeredAt": _now()[:10]}
    _actors.append(entry)
    _submissions["companies"].append(body.model_dump())
    return {"id": _actor_counter, "message": "Company registered successfully"}


@router.post("/profiles/partners", status_code=201)
def register_partner(body: PartnerCreate):
    global _actor_counter
    _actor_counter += 1
    entry = {"id": _actor_counter, "name": body.organisation_name, "type": "partner",
             "category": body.partnership_type or "General", "country": body.country or "Malaysia",
             "status": "pending", "registeredAt": _now()[:10]}
    _actors.append(entry)
    _submissions["partners"].append(body.model_dump())
    return {"id": _actor_counter, "message": "Partner registered successfully"}


@router.post("/profiles/service-providers", status_code=201)
def register_service_provider(body: ServiceProviderCreate):
    global _actor_counter
    _actor_counter += 1
    entry = {"id": _actor_counter, "name": body.company_name, "type": "service_provider",
             "category": body.service_type or "General", "country": body.country or "Malaysia",
             "status": "pending", "registeredAt": _now()[:10]}
    _actors.append(entry)
    _submissions["service_providers"].append(body.model_dump())
    return {"id": _actor_counter, "message": "Service provider registered successfully"}


# ── Analytics / Dashboard ─────────────────────────────────────────────────────

@router.get("/analytics/dashboard", response_model=DashboardMetrics)
def get_dashboard():
    mentors = sum(1 for a in _actors if a["type"] == "mentor")
    companies = sum(1 for a in _actors if a["type"] == "company")
    return DashboardMetrics(
        mentors=mentors,
        companies=companies,
        events=len(_programmes),
        followups=random.randint(5, 20),
        selections=random.randint(10, 50),
        approved_selections=random.randint(5, 30),
        average_outcome_score=round(random.uniform(0.70, 0.95), 2),
    )


# ── Vertex AI routes ──────────────────────────────────────────────────────────

@router.post("/vertex/search", response_model=VertexSearchResponse)
def vertex_search(payload: VertexSearchRequest) -> VertexSearchResponse:
    if not _GCP_AVAILABLE:
        raise HTTPException(status_code=503, detail="GCP services not configured")
    try:
        return search_documents(settings, payload)
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/vertex/search/diagnose")
def vertex_search_diagnose() -> dict:
    if not _GCP_AVAILABLE:
        raise HTTPException(status_code=503, detail="GCP services not configured")
    try:
        return diagnose_search(settings)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/vertex/embeddings", response_model=VertexEmbeddingsResponse)
def vertex_embeddings(payload: VertexEmbeddingsRequest) -> VertexEmbeddingsResponse:
    if not _GCP_AVAILABLE:
        raise HTTPException(status_code=503, detail="GCP services not configured")
    try:
        return embed_texts(settings, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/bigquery/graph", response_model=BigQueryGraphResponse)
def bigquery_graph(payload: BigQueryGraphRequest) -> BigQueryGraphResponse:
    if not _GCP_AVAILABLE:
        raise HTTPException(status_code=503, detail="GCP services not configured")
    return run_graph_query(settings, payload)
