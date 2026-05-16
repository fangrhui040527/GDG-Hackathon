"""Router node — classifies user intent using Gemini 2.5 Flash."""

from __future__ import annotations

import json
from typing import Any

from nexusai.agents.state import AgentState


def route_intent(state: AgentState, *, ai_service: Any) -> AgentState:
    """Use Gemini to classify user message into an intent."""
    messages = state.get("messages", [])
    if not messages:
        return {**state, "intent": "general", "response": "No message provided."}

    last_message = messages[-1].get("content", "")

    try:
        from vertexai import init
        from vertexai.generative_models import GenerationConfig, GenerativeModel

        init(project=ai_service.project, location=ai_service.location)
        model = GenerativeModel(ai_service.gemini_model)
        prompt = (
            "You are the NexusAI router. Classify the user's request into exactly one intent.\n"
            "Intents:\n"
            '- "match": user wants to match/recommend/pair/assign companies with mentors, partners, or service providers; wants selection recommendations\n'
            '- "onboard": user wants to add, edit, upload, or view profiles (mentors, companies, partners, SPs); CV parsing\n'
            '- "followup": user wants to create/view follow-ups, outcomes, track engagements, parse transcripts, or check decisions\n'
            '- "analytics": user wants dashboards, metrics, reports, data insights, counts, statistics, or trends\n'
            '- "general": greetings, help requests, questions about NexusAI itself, or anything that does not fit above\n\n'
            "RULES:\n"
            "- If the message is ambiguous, pick the MOST LIKELY intent.\n"
            '- If the user mentions "selection" or "approve", classify as "match".\n'
            '- If the user asks "how many" or "show me numbers", classify as "analytics".\n'
            '- Greetings like "hello" or "hi" are ALWAYS "general".\n\n'
            f'User message: "{last_message}"\n\n'
            'Return JSON: {"intent": "<one of the intents above>"}'
        )
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0,
            ),
        )
        result = json.loads(response.text)
        intent = result.get("intent", "general")
        if intent not in ("match", "onboard", "followup", "analytics", "general"):
            intent = "general"
    except Exception:
        intent = _fallback_classify(last_message)

    return {**state, "intent": intent}


def _fallback_classify(text: str) -> str:
    """Simple keyword fallback when Gemini is unavailable."""
    t = text.lower()
    if any(w in t for w in ("match", "recommend", "pair", "assign", "find mentor", "find partner", "find a mentor", "find a partner", "selection", "approve", "reject")):
        return "match"
    if any(w in t for w in ("onboard", "upload", "cv", "profile", "add mentor", "add company", "add partner", "register")):
        return "onboard"
    if any(w in t for w in ("follow", "outcome", "track", "decision", "transcript", "meeting note")):
        return "followup"
    if any(w in t for w in ("dashboard", "metric", "analytic", "report", "count", "how many", "statistic", "trend")):
        return "analytics"
    return "general"


def get_next_node(state: AgentState) -> str:
    """Conditional edge: route to the right agent node."""
    return state.get("intent", "general")
