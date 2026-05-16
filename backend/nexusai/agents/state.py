from __future__ import annotations

from typing import Any, Literal, TypedDict


class AgentState(TypedDict, total=False):
    """Shared state passed through every LangGraph node."""

    # Session
    session_id: str
    tenant_id: str
    actor_uid: str
    role: str

    # User input
    messages: list[dict[str, str]]  # [{"role":"user","content":"..."},...]
    intent: Literal["match", "onboard", "followup", "analytics", "general"]

    # Working data
    company_id: int | None
    event_id: int | None
    candidates: list[dict[str, Any]]       # mentor/partner/SP candidates
    rationales: list[dict[str, Any]]       # match rationales
    selection_id: int | None

    # Tool calls
    tool_calls: list[dict[str, Any]]
    tool_results: list[dict[str, Any]]

    # Streaming tokens
    tokens: list[str]

    # Final response
    response: str
    error: str | None
