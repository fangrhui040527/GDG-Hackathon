"""Outcome / follow-up agent — handles follow-up queries and outcome tracking."""

from __future__ import annotations

from typing import Any

from nexusai.agents.state import AgentState


def followup_node(state: AgentState, *, ai_service: Any, db_session: Any, mcp_client: Any) -> AgentState:
    """Handle follow-up and outcome tracking requests."""
    from sqlalchemy import func, select

    from nexusai.database import Company, FollowUp

    messages = state.get("messages", [])
    last_message = messages[-1].get("content", "") if messages else ""
    t = last_message.lower()

    if "transcript" in t or "parse" in t:
        response = (
            "To parse a meeting transcript into a follow-up record, call:\n"
            "```\nPOST /events/{event_id}/followups/from-transcript\n"
            '{ "transcript_text": "paste the full transcript here" }\n```\n\n'
            "Gemini will extract attendees, discussion, action decisions, sentiment, and suggest an outcome label."
        )
    elif "create" in t or "add" in t or "new" in t:
        response = (
            "To create a new follow-up, call:\n"
            "```\nPOST /followups\n{\n  \"company_id\": 1,\n"
            "  \"action_decision\": \"Pilot scheduled for next week\",\n"
            "  \"discussion\": \"Team discussed go-to-market strategy\",\n"
            "  \"person_recorded\": \"admin\"\n}\n```"
        )
    else:
        # Show recent follow-ups
        recent = db_session.scalars(
            select(FollowUp).order_by(FollowUp.created_at.desc()).limit(5)
        ).all()

        if recent:
            lines = ["**Recent Follow-ups:**\n"]
            for fu in recent:
                company = db_session.get(Company, fu.company_id)
                company_name = company.company_name if company else f"Company #{fu.company_id}"
                decision = (fu.action_decision or "No decision recorded")[:80]
                lines.append(f"- **{company_name}** ({fu.follow_up_date or 'no date'}): {decision}")
            lines.append(f"\n**Total follow-ups:** {db_session.scalar(select(func.count()).select_from(FollowUp)) or 0}")
            response = "\n".join(lines)
        else:
            response = "No follow-ups recorded yet. Create one from the Events page or paste a meeting transcript."

    return {**state, "response": response}
