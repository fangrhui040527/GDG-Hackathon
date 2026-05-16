"""Analytics agent — handles dashboard and reporting queries."""

from __future__ import annotations

from typing import Any

from nexusai.agents.state import AgentState


def analytics_node(state: AgentState, *, ai_service: Any, db_session: Any, mcp_client: Any) -> AgentState:
    """Handle analytics and dashboard requests."""
    from sqlalchemy import func, select

    from nexusai.database import Company, Event, FollowUp, Mentor, Partner, ServiceProvider

    mentor_count = db_session.scalar(select(func.count()).select_from(Mentor)) or 0
    company_count = db_session.scalar(select(func.count()).select_from(Company)) or 0
    event_count = db_session.scalar(select(func.count()).select_from(Event)) or 0
    followup_count = db_session.scalar(select(func.count()).select_from(FollowUp)) or 0
    partner_count = db_session.scalar(select(func.count()).select_from(Partner)) or 0
    sp_count = db_session.scalar(select(func.count()).select_from(ServiceProvider)) or 0

    # Top industries
    industries = db_session.scalars(
        select(Company.industry).where(Company.industry.isnot(None)).limit(20)
    ).all()
    industry_counts: dict[str, int] = {}
    for ind in industries:
        for i in (ind or "").split(","):
            i = i.strip()
            if i:
                industry_counts[i] = industry_counts.get(i, 0) + 1
    top_industries = sorted(industry_counts.items(), key=lambda x: -x[1])[:5]

    response = (
        "**NexusAI Ecosystem Dashboard**\n\n"
        "| Metric | Count |\n|---|---|\n"
        f"| Mentors | {mentor_count} |\n"
        f"| Companies | {company_count} |\n"
        f"| Partners | {partner_count} |\n"
        f"| Service Providers | {sp_count} |\n"
        f"| Events | {event_count} |\n"
        f"| Follow-ups | {followup_count} |\n\n"
    )

    if top_industries:
        response += "**Top Industries:**\n"
        for ind, count in top_industries:
            response += f"- {ind}: {count} companies\n"

    response += "\nFor detailed analytics, visit the **Dashboard** page or query BigQuery directly."

    return {**state, "response": response}
