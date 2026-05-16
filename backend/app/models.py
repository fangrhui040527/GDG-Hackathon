from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Existing Vertex / BigQuery models ────────────────────────────────────────

class VertexSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    page_size: int = Field(10, ge=1, le=100)
    filter: str | None = None
    order_by: str | None = None


class VertexSearchResult(BaseModel):
    id: str | None = None
    title: str | None = None
    snippet: str | None = None
    document: dict | None = None


class VertexSearchResponse(BaseModel):
    results: list[VertexSearchResult]


class VertexEmbeddingsRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1)


class VertexEmbeddingsResponse(BaseModel):
    embeddings: list[list[float]]


class BigQueryGraphRequest(BaseModel):
    sql: str = Field(..., min_length=1)
    max_rows: int = Field(100, ge=1, le=1000)


class BigQueryGraphResponse(BaseModel):
    rows: list[dict]


class VectorSearchRequest(BaseModel):
    query_text: str | None = None
    query_vector: list[float] | None = None
    top_k: int = Field(10, ge=1, le=100)
    distance_type: str = "COSINE"


class VectorSearchMatch(BaseModel):
    doc_id: str | None = None
    content: str | None = None
    metadata: dict | None = None
    distance: float | None = None


class VectorSearchResponse(BaseModel):
    matches: list[VectorSearchMatch]


# ── Programme models ──────────────────────────────────────────────────────────

class ProgrammeCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "Mentorship"
    start_date: str
    end_date: Optional[str] = None
    cover_image: Optional[str] = None
    target_industry: Optional[str] = None
    target_country: Optional[str] = None
    target_company_stage: Optional[str] = None
    required_mentors: int = 0
    required_companies: int = 0
    required_partners: int = 0
    required_service_providers: int = 0
    eligibility_criteria: Optional[str] = None
    organiser_id: Optional[str] = None
    organiser_name: Optional[str] = None


class ProgrammeDTO(BaseModel):
    programme_id: int
    name: str
    description: str
    category: str
    status: str
    start_date: str
    end_date: Optional[str] = None
    cover_image: Optional[str] = None
    target_industry: Optional[str] = None
    target_country: Optional[str] = None
    target_company_stage: Optional[str] = None
    required_mentors: int
    required_companies: int
    required_partners: int
    required_service_providers: int
    eligibility_criteria: Optional[str] = None
    organiser_id: Optional[str] = None
    organiser_name: Optional[str] = None
    submitted_at: Optional[str] = None
    published_at: Optional[str] = None
    created_at: str
    updated_at: str


# ── Actor models ──────────────────────────────────────────────────────────────

class ActorDTO(BaseModel):
    id: int
    name: str
    type: str
    category: str
    country: str
    status: str
    registeredAt: str


# ── Profile registration models ───────────────────────────────────────────────

class MentorCreate(BaseModel):
    full_name: str
    email: str
    industries: list[str] = []
    support_types: list[str] = []
    stages: list[str] = []
    languages: list[str] = []
    bio: Optional[str] = None


class CompanyCreate(BaseModel):
    company_name: str
    industry: str
    stage: str
    support_needed: list[str] = []
    languages: list[str] = []
    description: Optional[str] = None


class PartnerCreate(BaseModel):
    organisation_name: str
    contact_email: str
    partnership_type: str = ""
    country: str = ""


class ServiceProviderCreate(BaseModel):
    company_name: str
    contact_email: str
    service_type: str = ""
    country: str = ""


# ── Match models ──────────────────────────────────────────────────────────────

class MatchRecommendation(BaseModel):
    entity_id: str
    entity_name: str
    score: float
    fit_factors: list[str]
    rationale: str


class MatchGroup(BaseModel):
    mentors: list[MatchRecommendation] = []
    companies: list[MatchRecommendation] = []
    partners: list[MatchRecommendation] = []
    service_providers: list[MatchRecommendation] = []


# ── Dashboard model ───────────────────────────────────────────────────────────

class DashboardMetrics(BaseModel):
    mentors: int
    companies: int
    events: int
    followups: int
    selections: int
    approved_selections: int
    average_outcome_score: float
