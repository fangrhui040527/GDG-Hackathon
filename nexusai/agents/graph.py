"""LangGraph orchestrator — builds the multi-agent StateGraph."""

from __future__ import annotations

from typing import Any

from langgraph.graph import END, StateGraph

from nexusai.agents.nodes.analytics_agent import analytics_node
from nexusai.agents.nodes.general_agent import general_node
from nexusai.agents.nodes.matching_agent import matching_node
from nexusai.agents.nodes.outcome_agent import followup_node
from nexusai.agents.nodes.profile_agent import profile_node
from nexusai.agents.nodes.router import get_next_node, route_intent
from nexusai.agents.state import AgentState
from nexusai.services.ai import AIService
from nexusai.services.mcp import MCPClient


def build_agent_graph(
    ai_service: AIService,
    mcp_client: MCPClient,
    db_session: Any,
) -> StateGraph:
    """Construct the NexusAI multi-agent graph.

    Nodes:
      router -> {match, onboard, followup, analytics, general} -> END

    Each specialist node gets access to ai_service, db_session, and mcp_client
    via closure bindings.
    """

    # Bind services into node functions via closures
    def _router(state: AgentState) -> AgentState:
        return route_intent(state, ai_service=ai_service)

    def _matching(state: AgentState) -> AgentState:
        return matching_node(state, ai_service=ai_service, db_session=db_session, mcp_client=mcp_client)

    def _profile(state: AgentState) -> AgentState:
        return profile_node(state, ai_service=ai_service, db_session=db_session, mcp_client=mcp_client)

    def _followup(state: AgentState) -> AgentState:
        return followup_node(state, ai_service=ai_service, db_session=db_session, mcp_client=mcp_client)

    def _analytics(state: AgentState) -> AgentState:
        return analytics_node(state, ai_service=ai_service, db_session=db_session, mcp_client=mcp_client)

    def _general(state: AgentState) -> AgentState:
        return general_node(state, ai_service=ai_service, db_session=db_session)

    # Build graph
    graph = StateGraph(AgentState)

    graph.add_node("router", _router)
    graph.add_node("match", _matching)
    graph.add_node("onboard", _profile)
    graph.add_node("followup", _followup)
    graph.add_node("analytics", _analytics)
    graph.add_node("general", _general)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        get_next_node,
        {
            "match": "match",
            "onboard": "onboard",
            "followup": "followup",
            "analytics": "analytics",
            "general": "general",
        },
    )

    # All specialist nodes go to END
    graph.add_edge("match", END)
    graph.add_edge("onboard", END)
    graph.add_edge("followup", END)
    graph.add_edge("analytics", END)
    graph.add_edge("general", END)

    return graph


def compile_agent_graph(
    ai_service: AIService,
    mcp_client: MCPClient,
    db_session: Any,
) -> Any:
    """Compile and return a runnable graph."""
    graph = build_agent_graph(ai_service, mcp_client, db_session)
    return graph.compile()


def run_agent(
    ai_service: AIService,
    mcp_client: MCPClient,
    db_session: Any,
    message: str,
    session_id: str = "demo",
) -> dict[str, Any]:
    """Run the agent graph synchronously and return the final state."""
    compiled = compile_agent_graph(ai_service, mcp_client, db_session)
    initial_state: AgentState = {
        "session_id": session_id,
        "messages": [{"role": "user", "content": message}],
    }
    final_state = compiled.invoke(initial_state)
    return final_state
