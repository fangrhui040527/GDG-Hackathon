import os
from pathlib import Path

from fastapi import FastAPI

from nexusai.api import create_app
from nexusai.config import get_settings
from nexusai.database import Base, create_session_factory, create_sqlite_file_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


def create_local_dev_app(database_path: str | Path | None = None) -> FastAPI:
    os.environ.setdefault("APP_ENV", "development")
    os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://local:local@localhost:5432/nexusai_local")
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "local-dev")
    os.environ.setdefault("SESSION_JWT_SECRET", "local-dev-secret-change-before-production")
    os.environ.setdefault(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    )
    get_settings.cache_clear()

    db_path = Path(database_path) if database_path else Path(__file__).resolve().parents[1] / "data" / "nexusai-dev.db"
    engine = create_sqlite_file_engine(db_path)
    Base.metadata.create_all(engine)
    return create_app(
        session_factory=create_session_factory(engine),
        ai_service=FakeAIService(),
        mcp_client=FakeMCPClient(),
    )
