import uvicorn

from nexusai.config import get_settings
from nexusai.database import Base, create_database_engine, create_session_factory


def run_api() -> None:
    uvicorn.run("nexusai.main:app", host="0.0.0.0", port=8000, reload=True)


def init_db() -> None:
    settings = get_settings()
    engine = create_database_engine(settings)
    Base.metadata.create_all(engine)
    print("NexusAI PostgreSQL tables are ready.")
