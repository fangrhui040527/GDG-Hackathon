from nexusai.config import get_settings
from nexusai.database import Base, create_database_engine


def main() -> None:
    settings = get_settings()
    engine = create_database_engine(settings)
    Base.metadata.create_all(engine)
    print("NexusAI PostgreSQL tables are ready.")


if __name__ == "__main__":
    main()
