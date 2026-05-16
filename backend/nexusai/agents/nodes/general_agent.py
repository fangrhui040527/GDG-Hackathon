"""General agent — handles greetings, help, and unclassified queries using Gemini."""

from __future__ import annotations

from typing import Any

from nexusai.agents.state import AgentState


def general_node(state: AgentState, *, ai_service: Any, db_session: Any) -> AgentState:
    """Handle general conversation with Gemini as the backbone."""
    messages = state.get("messages", [])
    last_message = messages[-1].get("content", "") if messages else ""

    try:
        from vertexai import init
        from vertexai.generative_models import GenerativeModel

        init(project=ai_service.project, location=ai_service.location)
        model = GenerativeModel(
            ai_service.gemini_model,
            system_instruction=(
                "You are NexusAI, an intelligent innovation ecosystem management copilot built on Google Cloud.\n\n"
                "YOUR CAPABILITIES:\n"
                "1. **Matching**: Match companies with mentors, partners, and service providers using AI-driven scoring (industry fit, stage fit, support type, capacity). Results are saved as DRAFT selections.\n"
                "2. **Onboarding**: Add new mentor/company/partner/SP profiles. Parse mentor CVs using Document AI.\n"
                "3. **Follow-ups**: Create and track engagement follow-ups. Parse meeting transcripts with Gemini to auto-extract outcomes.\n"
                "4. **Analytics**: View ecosystem dashboards — mentor counts, company counts, industry breakdowns, outcome trends.\n"
                "5. **Selections**: Manage match selections through DRAFT → APPROVED/REJECTED workflow.\n\n"
                "BEHAVIOR RULES:\n"
                "- Be concise, factual, and professional.\n"
                "- Never fabricate data. Only reference real entities from the database.\n"
                "- When uncertain, ask a clarifying question rather than guessing.\n"
                "- Format responses with markdown for readability.\n"
                "- If a user greets you, respond warmly and list what you can help with.\n"
                "- Suggest next steps after completing a task.\n"
            ),
        )
        response = model.generate_content(last_message)
        reply = response.text.strip()
    except Exception:
        reply = (
            "Welcome to **NexusAI** — your ecosystem intelligence copilot.\n\n"
            "I can help you:\n"
            "- **Match** companies with mentors and partners\n"
            "- **Onboard** new profiles (mentors, companies, partners, SPs)\n"
            "- **Track** follow-ups and engagement outcomes\n"
            "- **View** analytics and dashboard metrics\n\n"
            "What would you like to do?"
        )

    return {**state, "response": reply}
