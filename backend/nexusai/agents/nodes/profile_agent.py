"""Profile agent — handles onboarding queries (CV parsing, profile creation)."""

from __future__ import annotations

from typing import Any

from nexusai.agents.state import AgentState


def profile_node(state: AgentState, *, ai_service: Any, db_session: Any, mcp_client: Any) -> AgentState:
    """Handle onboarding-related requests."""
    from sqlalchemy import func, select

    from nexusai.database import Company, Mentor, Partner, ServiceProvider

    messages = state.get("messages", [])
    last_message = messages[-1].get("content", "") if messages else ""
    t = last_message.lower()

    # Count entities
    mentor_count = db_session.scalar(select(func.count()).select_from(Mentor)) or 0
    company_count = db_session.scalar(select(func.count()).select_from(Company)) or 0
    partner_count = db_session.scalar(select(func.count()).select_from(Partner)) or 0
    sp_count = db_session.scalar(select(func.count()).select_from(ServiceProvider)) or 0

    if "upload" in t or "cv" in t or "parse" in t:
        response = (
            "To upload a mentor CV, use the **Upload CV** button on the mentor's profile page, "
            "or call `POST /mentors/{mentor_id}/cv` with the PDF file. "
            "Document AI will parse it and Gemini will extract the structured profile."
        )
    elif "add" in t and "mentor" in t:
        response = (
            "To add a new mentor, go to **Profiles → Mentors → Add New** or call:\n"
            "```\nPOST /profiles/mentors\n{\n  \"full_name\": \"...\",\n  \"email\": \"...\",\n"
            "  \"preferred_industry\": \"fintech, payments\",\n  \"type_of_support_offered\": \"fundraising, gtm\"\n}\n```"
        )
    elif "add" in t and "company" in t:
        response = (
            "To add a new company, go to **Profiles → Companies → Add New** or call:\n"
            "```\nPOST /profiles/companies\n{\n  \"company_name\": \"...\",\n  \"industry\": \"...\",\n"
            "  \"business_stage\": \"seed\",\n  \"support_needed\": \"fundraising, market_access\"\n}\n```"
        )
    else:
        response = (
            f"**Ecosystem Overview:**\n"
            f"- {mentor_count} mentors registered\n"
            f"- {company_count} companies onboarded\n"
            f"- {partner_count} partners\n"
            f"- {sp_count} service providers\n\n"
            "I can help you:\n"
            "- **Upload a CV** for a mentor (Document AI + Gemini extraction)\n"
            "- **Add a new profile** (mentor, company, partner, or service provider)\n"
            "- **View existing profiles**\n\n"
            "What would you like to do?"
        )

    return {**state, "response": response}
