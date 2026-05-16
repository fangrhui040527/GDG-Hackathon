from nexusai.config import get_settings
from nexusai.database import Base, create_postgres_engine


def main() -> None:
    settings = get_settings()
    engine = create_postgres_engine(settings.database_url)
    Base.metadata.create_all(engine)
    print("NexusAI PostgreSQL tables are ready.")


if __name__ == "__main__":
    main()
