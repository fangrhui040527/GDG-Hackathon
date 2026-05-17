from fastapi.testclient import TestClient

from nexusai.api import create_app
from nexusai.database import Base, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


def test_cors_allows_fallback_frontend_dev_port():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    app = create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    client = TestClient(app)

    response = client.options(
        "/profiles/companies",
        headers={
            "Origin": "http://localhost:3001",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3001"


def test_local_dev_app_registers_company_without_external_postgres(tmp_path, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("GOOGLE_CLOUD_PROJECT", raising=False)

    from nexusai.dev import create_local_dev_app

    app = create_local_dev_app(tmp_path / "nexusai-dev.db")
    client = TestClient(app)

    ready = client.get("/ready")
    created = client.post(
        "/profiles/companies",
        json={
            "company_name": "Local Demo Co",
            "company_description": "A company registered from the local dev UI",
            "country": "Malaysia",
            "industry": "Fintech",
            "business_stage": "Seed",
            "support_needed": "Fundraising",
            "availability": "Flexible",
        },
    )

    assert ready.status_code == 200
    assert created.status_code == 200
    assert created.json()["company_id"] == 1
    assert created.json()["company_name"] == "Local Demo Co"
