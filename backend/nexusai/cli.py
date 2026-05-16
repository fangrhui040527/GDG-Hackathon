import uvicorn

from nexusai.config import get_settings
from nexusai.database import Base, Company, Event, Mentor, create_database_engine, create_session_factory


def run_api() -> None:
    uvicorn.run("nexusai.main:app", host="0.0.0.0", port=8000, reload=True)


def init_db() -> None:
    settings = get_settings()
    engine = create_database_engine(settings)
    Base.metadata.create_all(engine)
    print("NexusAI PostgreSQL tables are ready.")


def seed_demo() -> None:
    settings = get_settings()
    engine = create_database_engine(settings)
    session_factory = create_session_factory(engine)
    session = session_factory()
    try:
        existing = session.query(Mentor).filter(Mentor.email == "asha@example.com").first()
        if existing:
            print("Demo seed already exists.")
            return
        session.add_all(
            [
                Mentor(
                    full_name="Asha Tan",
                    email="asha@example.com",
                    preferred_industry="fintech, payments",
                    type_of_support_offered="fundraising, gtm",
                    preferred_company_stage="seed, series_a",
                    available_hours_per_month=10,
                    max_companies_to_mentor=3,
                    short_bio="Former payments operator and seed-stage mentor.",
                ),
                Company(
                    company_name="PayBridge",
                    industry="fintech",
                    business_stage="seed",
                    support_needed="fundraising, market_access",
                    company_description="Cross-border payment workflow startup.",
                ),
                Event(
                    event_name="Q3 Fintech Matching",
                    event_description="Quarterly fintech matchmaking event",
                    event_location="KL Fintech Hub",
                ),
            ]
        )
        session.commit()
        print("Seeded demo mentor, company, and event.")
    finally:
        session.close()
