from types import SimpleNamespace

from fastapi.testclient import TestClient

import nexusai.api as api
import nexusai.database as database
from nexusai.api import create_app
from nexusai.config import Settings
from nexusai.database import Base, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.bigquery import BigQueryService
from nexusai.services.mcp import FakeMCPClient


def make_settings(**overrides) -> Settings:
    values = {
        "database_url": "postgresql+psycopg://user:pass@host:5432/nexus",
        "google_cloud_project": "demo-project",
        "google_cloud_location": "asia-southeast1",
        "vertex_gemini_model": "gemini-2.5-flash",
        "vertex_reasoning_model": "gemini-2.5-pro",
        "vertex_embedding_model": "text-embedding-005",
        "vertex_vector_index_endpoint_id": "index-endpoint",
        "document_ai_processor_id": "processor",
    }
    values.update(overrides)
    return Settings(**values)


def test_default_session_factory_does_not_create_schema_on_startup(monkeypatch):
    engine = create_sqlite_engine()

    def fail_create_all(*args, **kwargs):
        raise AssertionError("schema creation must not run during API startup")

    monkeypatch.setattr(api, "get_settings", lambda: make_settings())
    monkeypatch.setattr(api, "create_database_engine", lambda settings: engine)
    monkeypatch.setattr(api.Base.metadata, "create_all", fail_create_all)

    session_factory = api.create_default_session_factory()

    assert session_factory.kw["bind"] is engine


def test_ready_endpoint_checks_database_successfully():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    app = create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    client = TestClient(app)

    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_ready_endpoint_returns_503_when_database_is_unavailable():
    class BrokenSession:
        def execute(self, *args, **kwargs):
            raise RuntimeError("database unavailable")

        def commit(self):
            pass

        def rollback(self):
            pass

        def close(self):
            pass

    class BrokenSessionFactory:
        def __call__(self):
            return BrokenSession()

    app = create_app(
        session_factory=BrokenSessionFactory(),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json()["detail"] == "database_unavailable"


def test_database_engine_uses_direct_mode_even_when_cloud_sql_name_exists(monkeypatch):
    settings = SimpleNamespace(
        database_connector_mode="direct",
        cloud_sql_connection_name="project:region:instance",
        database_url="postgresql+psycopg://user:pass@host:5432/nexus",
    )

    monkeypatch.setattr(database, "create_postgres_engine", lambda url, settings: ("direct", url))
    monkeypatch.setattr(
        database,
        "create_cloud_sql_connector_engine",
        lambda settings: (_ for _ in ()).throw(AssertionError("connector mode should be explicit")),
    )

    engine = database.create_database_engine(settings)

    assert engine == ("direct", settings.database_url)


def test_bigquery_query_uses_bounded_client_and_result_timeouts(monkeypatch):
    settings = make_settings(google_api_timeout_seconds=3)
    service = BigQueryService(settings)
    captured = {}

    class FakeJob:
        def result(self, timeout=None):
            captured["result_timeout"] = timeout
            return [{"value": 1}]

    class FakeClient:
        def query(self, sql, job_config=None, timeout=None):
            captured["sql"] = sql
            captured["job_config"] = job_config
            captured["query_timeout"] = timeout
            return FakeJob()

    monkeypatch.setattr(service, "_client", lambda: FakeClient())

    rows = service._query("select 1")

    assert rows == [{"value": 1}]
    assert captured["query_timeout"] == 3
    assert captured["result_timeout"] == 3
    assert captured["job_config"].use_query_cache is True


def test_bq_dashboard_uses_bigquery_mcp_boundary_before_fallback(monkeypatch):
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    fake_mcp = FakeMCPClient()

    def fail_direct_bigquery(settings):
        raise AssertionError("request handling must not open a direct BigQuery client")

    monkeypatch.setattr("nexusai.services.bigquery.BigQueryService", fail_direct_bigquery)
    app = create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=fake_mcp,
    )
    client = TestClient(app)

    response = client.get("/analytics/bq-dashboard")

    assert response.status_code == 200
    assert response.json()["source"] == "fallback"
    assert fake_mcp.calls == ["bigquery_query"]
