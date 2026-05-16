from nexusai.config import get_settings
from nexusai.database import Company, Event, Mentor, create_database_engine, create_session_factory


def main() -> None:
    settings = get_settings()
    engine = create_database_engine(settings)
    session_factory = create_session_factory(engine)
    session = session_factory()
    try:
        existing = session.query(Mentor).filter(Mentor.email == "asha@example.com").first()
        if existing:
            print("Demo seed already exists.")
            return
        mentor = Mentor(
            full_name="Asha Tan",
            email="asha@example.com",
            preferred_industry="fintech, payments",
            type_of_support_offered="fundraising, gtm",
            preferred_company_stage="seed, series_a",
            available_hours_per_month=10,
            max_companies_to_mentor=3,
            short_bio="Former payments operator and seed-stage mentor.",
        )
        company = Company(
            company_name="PayBridge",
            industry="fintech",
            business_stage="seed",
            support_needed="fundraising, market_access",
            company_description="Cross-border payment workflow startup.",
        )
        event = Event(
            event_name="Q3 Fintech Matching",
            event_description="Quarterly fintech matchmaking event",
            event_location="KL Fintech Hub",
        )
        session.add_all([mentor, company, event])
        session.commit()
        print("Seeded demo mentor, company, and event.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
