"""Matching agent — orchestrates vector search + heuristic scoring + rationale generation."""

from __future__ import annotations

import json
from typing import Any

from nexusai.agents.state import AgentState


def matching_node(state: AgentState, *, ai_service: Any, db_session: Any, mcp_client: Any) -> AgentState:
    """Find the best mentor/partner/SP matches for a company."""
    from sqlalchemy import select

    from nexusai.database import Company, Mentor
    from nexusai.matching import CompanyProfile, MentorProfile, recommend_mentors

    messages = state.get("messages", [])
    last_message = messages[-1].get("content", "") if messages else ""

    # Extract company_id from state or from the message via Gemini
    company_id = state.get("company_id")
    event_id = state.get("event_id")

    if not company_id:
        ids = _extract_ids_from_message(last_message, ai_service)
        company_id = ids.get("company_id")
        event_id = ids.get("event_id") or event_id

    if not company_id:
        return {**state, "response": "Which company would you like to find matches for? Please provide the company name or ID."}

    # Load company
    company = db_session.get(Company, company_id)
    if not company:
        return {**state, "response": f"Company with ID {company_id} not found."}

    # Build company profile
    company_profile = CompanyProfile(
        id=str(company.company_id),
        name=company.company_name,
        industry=company.industry or "",
        stage=company.business_stage or "",
        support_needed=[s.strip() for s in (company.support_needed or "").split(",") if s.strip()],
        languages=[],
    )

    # Keep agent matching bounded; deeper retrieval should come from Vector Search/MCP signals.
    mentor_query = select(Mentor).order_by(Mentor.full_name).limit(100)
    mentors = [
        MentorProfile(
            id=str(m.mentor_id),
            name=m.full_name,
            industries=[i.strip() for i in (m.preferred_industry or "").split(",") if i.strip()],
            support_types=[s.strip() for s in (m.type_of_support_offered or "").split(",") if s.strip()],
            stages=[s.strip() for s in (m.preferred_company_stage or "").split(",") if s.strip()],
            languages=[],
            capacity_score=0.5,
        )
        for m in db_session.scalars(mentor_query).all()
    ]

    # Score and rank
    top_k = 5
    recommendations = recommend_mentors(mentors, company_profile, top_k)

    # Generate rationales
    candidates = []
    for rec in recommendations:
        mentor_profile = next(m for m in mentors if m.id == rec.entity_id)
        rationale = ai_service.generate_match_rationale(mentor_profile, company_profile, rec)
        candidates.append({
            "entity_id": int(rec.entity_id),
            "entity_name": rec.entity_name,
            "score": rec.score,
            "fit_factors": rec.fit_factors,
            "rationale": rationale,
        })

    # Auto-persist as DRAFT selection
    selection_id = None
    if candidates:
        try:
            from nexusai.database import Selection, SelectionItem

            selection = Selection(
                event_id=event_id,
                purpose=f"AI match for {company.company_name}",
                approval_status="DRAFT",
                ai_generated=True,
            )
            db_session.add(selection)
            db_session.flush()
            selection_id = selection.selection_id

            for c in candidates:
                db_session.add(SelectionItem(
                    selection_id=selection_id,
                    entity_type="MENTOR",
                    entity_id=c["entity_id"],
                    entity_name=c["entity_name"],
                    match_score=c["score"],
                    rationale=c["rationale"],
                ))
            db_session.flush()
        except Exception:
            import logging
            logging.getLogger("nexusai").warning("Failed to persist DRAFT selection", exc_info=True)
            selection_id = None

    # Build response summary
    lines = [f"Found {len(candidates)} mentor matches for **{company.company_name}**:\n"]
    for i, c in enumerate(candidates, 1):
        lines.append(f"{i}. **{c['entity_name']}** (score: {c['score']:.0%}) — {c['rationale']}")
    if selection_id:
        lines.append(f"\nSaved as **Selection #{selection_id}** (DRAFT). An admin can approve it at `POST /selections/{selection_id}/approve`.")

    return {
        **state,
        "company_id": company_id,
        "event_id": event_id,
        "selection_id": selection_id,
        "candidates": candidates,
        "response": "\n".join(lines),
    }


def _extract_ids_from_message(message: str, ai_service: Any) -> dict[str, int | None]:
    """Use Gemini to extract company_id / event_id from natural language."""
    try:
        from vertexai import init
        from vertexai.generative_models import GenerationConfig, GenerativeModel

        init(project=ai_service.project, location=ai_service.location)
        model = GenerativeModel(ai_service.gemini_model)
        prompt = (
            "Extract company_id and event_id from this user message about ecosystem matching. "
            "Look for explicit numeric IDs (e.g., 'company 5', 'company_id 3', '#7'). "
            "If no IDs are mentioned, return null for both.\n"
            'Return JSON: {"company_id": <int or null>, "event_id": <int or null>}\n\n'
            f'Message: "{message}"'
        )
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(response_mime_type="application/json", temperature=0.0),
        )
        return json.loads(response.text)
    except Exception:
        # Try simple number extraction
        import re

        nums = re.findall(r"\b(\d+)\b", message)
        return {"company_id": int(nums[0]) if nums else None, "event_id": int(nums[1]) if len(nums) > 1 else None}
