from fastapi.testclient import TestClient

from nexusai.api import create_app
from nexusai.database import Base, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


def test_api_demo_flow_creates_profiles_matches_followup_and_metrics():
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
            "preferred_industry": "fintech, payments",
            "type_of_support_offered": "fundraising, gtm",
            "preferred_company_stage": "seed, series_a",
            "available_hours_per_month": 10,
            "short_bio": "Former payments operator.",
        },
    ).json()
    company = client.post(
        "/profiles/companies",
        json={
            "company_name": "PayBridge",
            "industry": "fintech",
            "business_stage": "seed",
            "support_needed": "fundraising, market_access",
        },
    ).json()
    event = client.post(
        "/events",
        json={
            "event_name": "Q3 Fintech Matching",
            "event_description": "Quarterly fintech matchmaking",
            "event_location": "KL",
        },
    ).json()

    matches = client.post(
        "/matches/recommend",
        json={
            "event_id": event["event_id"],
            "company_id": company["company_id"],
            "top_k": 5,
        },
    ).json()

    assert matches["recommendations"][0]["entity_id"] == mentor["mentor_id"]
    assert matches["recommendations"][0]["rationale"].startswith("Asha Tan fits")

    followup = client.post(
        "/followups",
        json={
            "company_id": company["company_id"],
            "action_decision": "Mentor intro accepted. Pilot discussion scheduled.",
            "person_recorded": "admin",
        },
    ).json()

    assert followup["company_id"] == company["company_id"]

    metrics = client.get("/analytics/dashboard").json()

    assert metrics == {
        "mentors": 1,
        "companies": 1,
        "events": 1,
        "follow_ups": 1,
        "selections": 0,
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
            "short_bio": "",
        },
    ).json()

    response = client.post(
        f"/mentors/{mentor['mentor_id']}/cv",
        files={"file": ("cv.pdf", b"%PDF-1.4 fake cv", "application/pdf")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mentor_id"] == mentor["mentor_id"]
    assert body["extracted_profile"]["full_name"] == "Asha Tan"
    assert fake_mcp.calls == ["document_ai_parse"]
    assert fake_ai.profile_extraction_calls == 1
