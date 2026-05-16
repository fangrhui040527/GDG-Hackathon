from nexusai.config import get_settings
from nexusai.database import Base, Company, Event, Mentor, create_postgres_engine, create_session_factory


def main() -> None:
    settings = get_settings()
    engine = create_postgres_engine(settings.database_url)
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    session = session_factory()
    try:
        mentor = Mentor(
            full_name="Asha Tan",
            email="asha@example.com",
            industries=["fintech", "payments"],
            support_types=["fundraising", "gtm"],
            stages=["seed", "series_a"],
            languages=["en", "ms"],
            capacity_score=0.9,
            bio="Former payments operator and seed-stage mentor.",
        )
        company = Company(
            company_name="PayBridge",
            industry="fintech",
            stage="seed",
            support_needed=["fundraising", "market_access"],
            languages=["en"],
            description="Cross-border payment workflow startup.",
        )
        event = Event(
            event_name="Q3 Fintech Matching",
            event_type="matchmaking",
            programme_name="KL Fintech",
        )
        session.add_all([mentor, company, event])
        session.commit()
        print("Seeded demo mentor, company, and event.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
