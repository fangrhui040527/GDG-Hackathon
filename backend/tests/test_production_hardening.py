from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import nexusai.api as api
import nexusai.database as database
from nexusai.api import create_app
from nexusai.config import Settings
from nexusai.database import Base, User, UserSession, create_session_factory, create_sqlite_engine
from nexusai.security.jwt import create_session_jwt
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


TEST_SECRET = "test-secret-with-at-least-32-bytes"


def make_test_app(monkeypatch, **settings_overrides):
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    monkeypatch.setattr(
        api,
        "get_settings",
        lambda: make_settings(session_jwt_secret=TEST_SECRET, **settings_overrides),
    )
    app = create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    return app, engine


def create_user_session(engine, email: str, role: str, secret: str = TEST_SECRET) -> tuple[int, str]:
    session_factory = create_session_factory(engine)
    with session_factory() as db:
        user = User(email=email, name=email.split("@")[0], role=role)
        db.add(user)
        db.flush()
        token, jti, expires_at = create_session_jwt(user.user_id, role, secret)
        db.add(UserSession(user_id=user.user_id, jwt_jti=jti, expires_at=expires_at))
        db.commit()
        return user.user_id, token


def test_update_user_role_requires_authentication(monkeypatch):
    app, engine = make_test_app(monkeypatch)
    target_user_id, _ = create_user_session(engine, "target@example.com", "PENDING")
    client = TestClient(app)

    response = client.patch(f"/users/{target_user_id}/role", json={"role": "MENTOR"})

    assert response.status_code == 401


def test_update_user_role_rejects_non_admin(monkeypatch):
    app, engine = make_test_app(monkeypatch)
    target_user_id, _ = create_user_session(engine, "target@example.com", "PENDING")
    _, token = create_user_session(engine, "mentor@example.com", "MENTOR")
    client = TestClient(app)

    response = client.patch(
        f"/users/{target_user_id}/role",
        json={"role": "COMPANY"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_update_user_role_allows_super_admin(monkeypatch):
    app, engine = make_test_app(monkeypatch)
    target_user_id, _ = create_user_session(engine, "target@example.com", "PENDING")
    _, token = create_user_session(engine, "admin@example.com", "SUPER_ADMIN")
    client = TestClient(app)

    response = client.patch(
        f"/users/{target_user_id}/role",
        json={"role": "COMPANY"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "COMPANY"


def test_update_user_role_validates_role_after_authentication(monkeypatch):
    app, engine = make_test_app(monkeypatch)
    target_user_id, _ = create_user_session(engine, "target@example.com", "PENDING")
    _, token = create_user_session(engine, "admin@example.com", "SUPER_ADMIN")
    client = TestClient(app)

    response = client.patch(
        f"/users/{target_user_id}/role",
        json={"role": "GOD_MODE"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400


def test_demo_login_is_disabled_in_production(monkeypatch):
    app, _ = make_test_app(monkeypatch, app_env="production")
    client = TestClient(app)

    response = client.post("/auth/demo-login", json={"email": "admin@example.com", "role": "admin"})

    assert response.status_code == 403


def test_default_jwt_secret_is_rejected_in_production(monkeypatch):
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    monkeypatch.setattr(api, "get_settings", lambda: make_settings(app_env="production"))

    with pytest.raises(RuntimeError, match="SESSION_JWT_SECRET"):
        create_app(
            session_factory=create_session_factory(engine),
            ai_service=FakeAIService(),
            mcp_client=FakeMCPClient(),
        )


def test_bootstrap_admin_is_single_use(monkeypatch):
    app, engine = make_test_app(monkeypatch, setup_token="setup-token")
    existing_admin_id, _ = create_user_session(engine, "admin@example.com", "SUPER_ADMIN")
    pending_user_id, _ = create_user_session(engine, "pending@example.com", "PENDING")
    assert existing_admin_id != pending_user_id
    client = TestClient(app)

    response = client.post(
        "/auth/bootstrap-admin",
        json={"setup_token": "setup-token", "user_id": pending_user_id},
    )

    assert response.status_code == 403


def test_programme_match_500_response_is_sanitized(monkeypatch):
    class BrokenMatchSession:
        def get(self, model, key):
            return SimpleNamespace(target_industry="", target_company_stage="", target_country="")

        def scalars(self, *args, **kwargs):
            raise RuntimeError("internal database details")

        def commit(self):
            pass

        def rollback(self):
            pass

        def close(self):
            pass

    class BrokenSessionFactory:
        def __call__(self):
            return BrokenMatchSession()

    monkeypatch.setattr(api, "get_settings", lambda: make_settings(session_jwt_secret=TEST_SECRET))
    app = create_app(
        session_factory=BrokenSessionFactory(),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/programmes/1/match")

    assert response.status_code == 500
    assert response.json()["detail"] == "Internal error"
    assert "Traceback" not in response.text


def test_shortlist_routes_are_persistent_and_idempotent(monkeypatch):
    app, engine = make_test_app(monkeypatch)
    client = TestClient(app)
    programme = client.post("/programmes", json={"name": "Fintech Sprint"}).json()
    programme_id = programme["programme_id"]

    empty = client.get(f"/programmes/{programme_id}/shortlist")
    assert empty.status_code == 200
    assert empty.json() == []

    payload = {
        "match_result_id": "mentor-1",
        "actor_id": "1",
        "actor_type": "mentor",
        "actor_name": "Asha Tan",
        "match_score": 91,
    }
    created = client.post(f"/programmes/{programme_id}/shortlist", json=payload)
    duplicate = client.post(f"/programmes/{programme_id}/shortlist", json=payload)

    assert created.status_code == 201
    assert duplicate.status_code == 200
    assert duplicate.json()["id"] == created.json()["id"]

    second_app = create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
    second_client = TestClient(second_app)
    persisted = second_client.get(f"/programmes/{programme_id}/shortlist")
    assert persisted.status_code == 200
    assert persisted.json()[0]["actor_name"] == "Asha Tan"

    removed = second_client.delete(f"/programmes/{programme_id}/shortlist/{created.json()['id']}")
    assert removed.status_code == 204
    assert second_client.get(f"/programmes/{programme_id}/shortlist").json() == []


def test_shortlist_missing_programme_returns_404(monkeypatch):
    app, _ = make_test_app(monkeypatch)
    client = TestClient(app)

    response = client.get("/programmes/99999/shortlist")

    assert response.status_code == 404
