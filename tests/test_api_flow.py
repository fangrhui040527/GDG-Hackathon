from fastapi.testclient import TestClient

from nexusai.api import create_app
from nexusai.database import Base, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


def test_api_demo_flow_creates_profiles_matches_selection_followup_and_metrics():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    app = create_app(
        session_factory=session_factory,
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    client = TestClient(app)

    mentor = client.post(
        "/profiles/mentors",
        json={
            "full_name": "Asha Tan",
            "email": "asha@example.com",
            "industries": ["fintech", "payments"],
            "support_types": ["fundraising", "gtm"],
            "stages": ["seed", "series_a"],
            "languages": ["en", "ms"],
            "capacity_score": 0.9,
        },
    ).json()
    company = client.post(
        "/profiles/companies",
        json={
            "company_name": "PayBridge",
            "industry": "fintech",
            "stage": "seed",
            "support_needed": ["fundraising", "market_access"],
            "languages": ["en"],
        },
    ).json()
    event = client.post(
        "/events",
        json={
            "event_name": "Q3 Fintech Matching",
            "event_type": "matchmaking",
            "programme_name": "KL Fintech",
        },
    ).json()

    matches = client.post(
        "/matches/recommend",
        json={
            "event_id": event["id"],
            "company_id": company["id"],
            "top_k": 5,
        },
    ).json()

    assert matches["recommendations"][0]["entity_id"] == mentor["id"]
    assert matches["recommendations"][0]["rationale"].startswith("Asha Tan fits")

    selection = client.post(
        "/selections",
        json={
            "event_id": event["id"],
            "purpose": "Draft mentor matching",
            "company_id": company["id"],
            "mentor_ids": [mentor["id"]],
            "match_scores": {mentor["id"]: matches["recommendations"][0]["score"]},
        },
    ).json()
    approved = client.post(f"/selections/{selection['id']}/approve").json()

    assert approved["approval_status"] == "approved"

    followup = client.post(
        "/followups",
        json={
            "event_id": event["id"],
            "selection_id": selection["id"],
            "notes": "Mentor intro accepted. Pilot discussion scheduled.",
            "outcome_score": 0.8,
        },
    ).json()

    assert followup["outcome_score"] == 0.8

    metrics = client.get("/analytics/dashboard").json()

    assert metrics == {
        "mentors": 1,
        "companies": 1,
        "events": 1,
        "approved_selections": 1,
        "followups": 1,
        "average_outcome_score": 0.8,
    }


def test_mentor_cv_upload_uses_document_ai_mcp_and_vertex_cleanup():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    fake_ai = FakeAIService()
    fake_mcp = FakeMCPClient()
    app = create_app(
        session_factory=session_factory,
        ai_service=fake_ai,
        mcp_client=fake_mcp,
    )
    client = TestClient(app)

    mentor = client.post(
        "/profiles/mentors",
        json={
            "full_name": "Draft Mentor",
            "email": "draft@example.com",
            "industries": [],
            "support_types": [],
            "stages": [],
            "languages": [],
            "capacity_score": 0.5,
        },
    ).json()

    response = client.post(
        f"/mentors/{mentor['id']}/cv",
        files={"file": ("cv.pdf", b"%PDF-1.4 fake cv", "application/pdf")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mentor_id"] == mentor["id"]
    assert body["extracted_profile"]["full_name"] == "Asha Tan"
    assert fake_mcp.calls == ["document_ai_parse"]
    assert fake_ai.profile_extraction_calls == 1
