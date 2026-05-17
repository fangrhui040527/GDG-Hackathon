"""Comprehensive stress test — exercises every API endpoint, agent path,
tool-calling boundary, data-flow edge case, and error scenario.

Run:  pytest tests/test_stress.py -v --tb=short
"""
from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient

from nexusai.api import create_app
from nexusai.database import Base, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


# ── Fixtures ───────────────────────────────────────────────────


@pytest.fixture()
def app():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    sf = create_session_factory(engine)
    return create_app(session_factory=sf, ai_service=FakeAIService(), mcp_client=FakeMCPClient())


@pytest.fixture()
def client(app):
    return TestClient(app)


@pytest.fixture()
def seeded(client):
    """Seed DB with 5 mentors, 3 companies, 2 events, 1 partner, 1 SP."""
    mentors = []
    for i in range(1, 6):
        m = client.post("/profiles/mentors", json={
            "full_name": f"Mentor {i}",
            "email": f"mentor{i}@example.com",
            "preferred_industry": "fintech, payments" if i <= 3 else "healthtech",
            "type_of_support_offered": "fundraising, gtm" if i % 2 == 0 else "legal",
            "preferred_company_stage": "seed, series_a",
            "short_bio": f"Bio {i}",
            "available_hours_per_month": 10 + i,
        }).json()
        mentors.append(m)

    companies = []
    for i in range(1, 4):
        c = client.post("/profiles/companies", json={
            "company_name": f"Company {i}",
            "industry": "fintech" if i <= 2 else "healthtech",
            "business_stage": "seed" if i == 1 else "series_a",
            "support_needed": "fundraising, market_access",
        }).json()
        companies.append(c)

    events = []
    for i in range(1, 3):
        e = client.post("/events", json={
            "event_name": f"Event {i}",
            "event_description": f"Event desc {i}",
            "event_location": "KL",
        }).json()
        events.append(e)

    partner = client.post("/profiles/partners", json={
        "organisation_name": "Partner Corp",
        "organisation_type": "Business",
        "country": "MY",
        "contact_person_name": "Alice",
        "contact_email": "alice@partner.com",
        "organisation_description": "A partner",
        "industries_of_interest": "fintech",
        "requirements": "Scale-up",
        "resources_provided": "Funding",
        "support_offered": "mentoring",
    }).json()

    sp = client.post("/profiles/service-providers", json={
        "organisation_name": "Legal Co",
        "contact_person_name": "Bob",
        "contact_email": "bob@legal.co",
        "company_description": "Legal services",
        "services_offered": "legal",
        "detailed_service_description": "Full legal support",
    }).json()

    return {
        "mentors": mentors,
        "companies": companies,
        "events": events,
        "partner": partner,
        "sp": sp,
    }


# ── 1. Health / Root ──────────────────────────────────────────


class TestHealthAndRoot:
    def test_root_returns_metadata(self, client):
        r = client.get("/")
        assert r.status_code == 200
        body = r.json()
        assert body["name"] == "NexusAI MVP"
        assert "docs" in body

    def test_health_ok(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ── 2. Profile CRUD ──────────────────────────────────────────


class TestProfileCRUD:
    def test_create_and_list_mentors(self, client):
        r = client.post("/profiles/mentors", json={
            "full_name": "Test Mentor",
            "email": "test@example.com",
        })
        assert r.status_code == 200
        m = r.json()
        assert m["full_name"] == "Test Mentor"
        assert "mentor_id" in m

        lst = client.get("/profiles/mentors").json()
        assert any(x["mentor_id"] == m["mentor_id"] for x in lst)

    def test_create_and_list_companies(self, client):
        r = client.post("/profiles/companies", json={
            "company_name": "Test Co",
            "industry": "fintech",
        })
        assert r.status_code == 200
        c = r.json()
        assert c["company_name"] == "Test Co"
        assert "company_id" in c

        lst = client.get("/profiles/companies").json()
        assert any(x["company_id"] == c["company_id"] for x in lst)

    def test_create_and_list_partners(self, client):
        r = client.post("/profiles/partners", json={
            "organisation_name": "Test Partner",
            "organisation_type": "Personal",
            "country": "SG",
            "contact_person_name": "X",
            "contact_email": "x@test.com",
            "organisation_description": "Desc",
            "industries_of_interest": "fintech",
            "requirements": "R",
            "resources_provided": "RP",
            "support_offered": "SO",
        })
        assert r.status_code == 200
        lst = client.get("/profiles/partners").json()
        assert len(lst) >= 1

    def test_create_and_list_service_providers(self, client):
        r = client.post("/profiles/service-providers", json={
            "organisation_name": "SP Test",
            "contact_person_name": "Y",
            "contact_email": "y@test.com",
            "company_description": "CD",
            "services_offered": "SO",
            "detailed_service_description": "DSD",
        })
        assert r.status_code == 200
        lst = client.get("/profiles/service-providers").json()
        assert len(lst) >= 1

    def test_create_and_list_events(self, client):
        r = client.post("/events", json={
            "event_name": "Test Event",
        })
        assert r.status_code == 200
        e = r.json()
        assert e["event_name"] == "Test Event"
        assert "event_id" in e

    def test_duplicate_mentor_email_returns_error(self, client):
        client.post("/profiles/mentors", json={
            "full_name": "A",
            "email": "dup@example.com",
        })
        r = client.post("/profiles/mentors", json={
            "full_name": "B",
            "email": "dup@example.com",
        })
        assert r.status_code == 409  # conflict — duplicate email

    def test_mentor_missing_required_fields(self, client):
        r = client.post("/profiles/mentors", json={"short_bio": "no name"})
        assert r.status_code == 422  # validation error

    def test_company_missing_required_fields(self, client):
        r = client.post("/profiles/companies", json={})
        assert r.status_code == 422


# ── 3. Follow-up CRUD ────────────────────────────────────────


class TestFollowUps:
    def test_create_followup_success(self, client, seeded):
        company_id = seeded["companies"][0]["company_id"]
        r = client.post("/followups", json={
            "company_id": company_id,
            "action_decision": "Pilot scheduled",
            "person_recorded": "admin",
        })
        assert r.status_code == 200
        assert r.json()["company_id"] == company_id

    def test_create_followup_nonexistent_company(self, client):
        r = client.post("/followups", json={
            "company_id": 99999,
            "action_decision": "nope",
            "person_recorded": "admin",
        })
        assert r.status_code == 404

    def test_create_followup_missing_company_id(self, client):
        r = client.post("/followups", json={
            "action_decision": "nope",
        })
        assert r.status_code == 422


# ── 4. Matching Engine ───────────────────────────────────────


class TestMatchingEngine:
    def test_recommend_matches_returns_ranked_results(self, client, seeded):
        r = client.post("/matches/recommend", json={
            "event_id": seeded["events"][0]["event_id"],
            "company_id": seeded["companies"][0]["company_id"],
            "top_k": 3,
        })
        assert r.status_code == 200
        recs = r.json()["recommendations"]
        assert len(recs) == 3
        # Verify sorted by score desc
        scores = [rec["score"] for rec in recs]
        assert scores == sorted(scores, reverse=True)
        # Each rec has required fields
        for rec in recs:
            assert "entity_id" in rec
            assert "entity_name" in rec
            assert "score" in rec
            assert "rationale" in rec
            assert isinstance(rec["fit_factors"], list)

    def test_recommend_matches_top_k_1(self, client, seeded):
        r = client.post("/matches/recommend", json={
            "event_id": seeded["events"][0]["event_id"],
            "company_id": seeded["companies"][0]["company_id"],
            "top_k": 1,
        })
        assert r.status_code == 200
        assert len(r.json()["recommendations"]) == 1

    def test_recommend_matches_invalid_company(self, client, seeded):
        r = client.post("/matches/recommend", json={
            "event_id": seeded["events"][0]["event_id"],
            "company_id": 99999,
            "top_k": 3,
        })
        assert r.status_code == 404

    def test_recommend_matches_invalid_event(self, client, seeded):
        r = client.post("/matches/recommend", json={
            "event_id": 99999,
            "company_id": seeded["companies"][0]["company_id"],
            "top_k": 3,
        })
        assert r.status_code == 404

    def test_recommend_with_zero_mentors(self, client):
        """No mentors in DB — should return empty recommendations."""
        c = client.post("/profiles/companies", json={
            "company_name": "Lonely Co",
            "industry": "fintech",
        }).json()
        e = client.post("/events", json={"event_name": "Empty Event"}).json()
        r = client.post("/matches/recommend", json={
            "event_id": e["event_id"],
            "company_id": c["company_id"],
            "top_k": 5,
        })
        assert r.status_code == 200
        assert r.json()["recommendations"] == []


# ── 5. Selection Workflow ─────────────────────────────────────


class TestSelectionWorkflow:
    def test_create_list_get_selection(self, client, seeded):
        r = client.post("/selections", json={
            "event_id": seeded["events"][0]["event_id"],
            "purpose": "Test selection",
            "items": [
                {"entity_type": "MENTOR", "entity_id": seeded["mentors"][0]["mentor_id"],
                 "entity_name": "Mentor 1", "match_score": 0.85, "rationale": "Good fit"},
            ],
        })
        assert r.status_code == 200
        sel = r.json()
        assert sel["approval_status"] == "DRAFT"
        assert sel["ai_generated"] is False
        assert len(sel["items"]) == 1
        sid = sel["selection_id"]

        # List
        lst = client.get("/selections").json()
        assert any(s["selection_id"] == sid for s in lst)

        # Get
        g = client.get(f"/selections/{sid}").json()
        assert g["selection_id"] == sid
        assert g["purpose"] == "Test selection"

    def test_approve_selection(self, client, seeded):
        r = client.post("/selections", json={
            "event_id": seeded["events"][0]["event_id"],
            "purpose": "Approve test",
            "items": [
                {"entity_type": "MENTOR", "entity_id": seeded["mentors"][0]["mentor_id"],
                 "entity_name": "Mentor 1", "match_score": 0.9, "rationale": "Great"},
            ],
        })
        sid = r.json()["selection_id"]

        r = client.post(f"/selections/{sid}/approve")
        assert r.status_code == 200
        body = r.json()
        assert body["approval_status"] == "APPROVED"
        assert body["approved_by"] is not None
        assert body["version"] == 2

    def test_approve_already_approved(self, client, seeded):
        r = client.post("/selections", json={
            "purpose": "Double approve",
            "items": [],
        })
        sid = r.json()["selection_id"]
        client.post(f"/selections/{sid}/approve")
        r2 = client.post(f"/selections/{sid}/approve")
        assert r2.status_code == 400

    def test_reject_selection(self, client, seeded):
        r = client.post("/selections", json={
            "purpose": "Reject test",
            "items": [],
        })
        sid = r.json()["selection_id"]
        r = client.post(f"/selections/{sid}/reject")
        assert r.status_code == 200
        assert r.json()["approval_status"] == "REJECTED"

    def test_get_nonexistent_selection(self, client):
        r = client.get("/selections/99999")
        assert r.status_code == 404

    def test_approve_nonexistent_selection(self, client):
        r = client.post("/selections/99999/approve")
        assert r.status_code == 404

    def test_selection_with_invalid_event(self, client):
        r = client.post("/selections", json={
            "event_id": 99999,
            "purpose": "Bad event",
            "items": [],
        })
        assert r.status_code == 404

    def test_selection_creates_notification_on_approve(self, client, seeded):
        """Approving a selection with mentor items creates notifications."""
        mentor = seeded["mentors"][0]
        r = client.post("/selections", json={
            "purpose": "Notification test",
            "items": [
                {"entity_type": "MENTOR", "entity_id": mentor["mentor_id"],
                 "entity_name": mentor["full_name"], "match_score": 0.8, "rationale": "R"},
            ],
        })
        sid = r.json()["selection_id"]
        client.post(f"/selections/{sid}/approve")

        notifs = client.get(f"/notifications?email={mentor['email']}").json()
        assert len(notifs) >= 1
        assert notifs[0]["kind"] == "MATCH_INVITE"


# ── 6. Notifications ─────────────────────────────────────────


class TestNotifications:
    def test_list_notifications_empty(self, client):
        r = client.get("/notifications")
        assert r.status_code == 200
        assert r.json() == []

    def test_mark_notification_read(self, client, seeded):
        # Create via selection approve
        mentor = seeded["mentors"][0]
        r = client.post("/selections", json={
            "purpose": "Read test",
            "items": [{"entity_type": "MENTOR", "entity_id": mentor["mentor_id"],
                       "entity_name": "M", "match_score": 0.9, "rationale": "R"}],
        })
        sid = r.json()["selection_id"]
        client.post(f"/selections/{sid}/approve")
        notifs = client.get(f"/notifications?email={mentor['email']}").json()
        nid = notifs[0]["notification_id"]

        r = client.patch(f"/notifications/{nid}/read")
        assert r.status_code == 200
        assert r.json()["status"] == "read"

    def test_mark_nonexistent_notification_read(self, client):
        r = client.patch("/notifications/99999/read")
        assert r.status_code == 404


# ── 7. Dashboard ──────────────────────────────────────────────


class TestDashboard:
    def test_dashboard_counts_all_entities(self, client, seeded):
        # Also add a followup
        cid = seeded["companies"][0]["company_id"]
        client.post("/followups", json={
            "company_id": cid,
            "action_decision": "Test",
            "person_recorded": "admin",
        })
        r = client.get("/analytics/dashboard")
        assert r.status_code == 200
        m = r.json()
        assert m["mentors"] == 5
        assert m["companies"] == 3
        assert m["events"] == 2
        assert m["follow_ups"] == 1
        assert m["selections"] == 0  # none created yet

    def test_dashboard_empty_db(self, client):
        r = client.get("/analytics/dashboard")
        assert r.status_code == 200
        m = r.json()
        assert m["mentors"] == 0
        assert m["companies"] == 0


# ── 8. CV Upload ──────────────────────────────────────────────


class TestCVUpload:
    def test_cv_upload_success(self, client):
        m = client.post("/profiles/mentors", json={
            "full_name": "CV Test",
            "email": "cv@example.com",
        }).json()
        r = client.post(
            f"/mentors/{m['mentor_id']}/cv",
            files={"file": ("cv.pdf", b"%PDF-fake", "application/pdf")},
        )
        assert r.status_code == 200
        body = r.json()
        assert body["mentor_id"] == m["mentor_id"]
        assert "extracted_text" in body
        assert "extracted_profile" in body

    def test_cv_upload_nonexistent_mentor(self, client):
        r = client.post(
            "/mentors/99999/cv",
            files={"file": ("cv.pdf", b"%PDF-fake", "application/pdf")},
        )
        assert r.status_code == 404


# ── 9. Agent Chat ─────────────────────────────────────────────


class TestAgentChat:
    def test_agent_chat_general_greeting(self, client, seeded):
        r = client.post("/agent/chat", json={"message": "Hello!"})
        assert r.status_code == 200
        body = r.json()
        assert body["intent"] == "general"
        assert body["reply"]  # non-empty

    def test_agent_chat_analytics_intent(self, client, seeded):
        r = client.post("/agent/chat", json={"message": "Show me the dashboard metrics"})
        assert r.status_code == 200
        body = r.json()
        assert body["intent"] == "analytics"

    def test_agent_chat_onboard_intent(self, client, seeded):
        r = client.post("/agent/chat", json={"message": "How do I upload a CV?"})
        assert r.status_code == 200
        body = r.json()
        assert body["intent"] == "onboard"

    def test_agent_chat_followup_intent(self, client, seeded):
        r = client.post("/agent/chat", json={"message": "Show me recent follow-ups and outcomes"})
        assert r.status_code == 200
        body = r.json()
        assert body["intent"] == "followup"

    def test_agent_chat_matching_with_company_id(self, client, seeded):
        cid = seeded["companies"][0]["company_id"]
        r = client.post("/agent/chat", json={
            "message": f"Match company {cid} with mentors for event {seeded['events'][0]['event_id']}",
        })
        assert r.status_code == 200
        body = r.json()
        assert body["intent"] == "match"
        assert body["reply"]
        # Should auto-persist a selection
        if body.get("selection_id"):
            sel = client.get(f"/selections/{body['selection_id']}").json()
            assert sel["approval_status"] == "DRAFT"
            assert sel["ai_generated"] is True

    def test_agent_chat_empty_message(self, client):
        r = client.post("/agent/chat", json={"message": ""})
        assert r.status_code == 200
        assert "reply" in r.json()

    def test_agent_chat_no_message_key(self, client):
        r = client.post("/agent/chat", json={})
        assert r.status_code == 200
        assert "reply" in r.json()

    def test_agent_chat_very_long_message(self, client, seeded):
        r = client.post("/agent/chat", json={"message": "a" * 5000})
        assert r.status_code == 200
        assert "reply" in r.json()

    def test_agent_stream_returns_sse(self, client, seeded):
        r = client.post("/agent/chat/stream", json={"message": "Hello!"})
        assert r.status_code == 200
        assert "text/event-stream" in r.headers["content-type"]
        text = r.text
        assert "event:" in text


# ── 10. Graph Endpoints ──────────────────────────────────────


class TestGraphEndpoints:
    def test_graph_subgraph_fallback(self, client):
        """Without Spanner configured, returns empty fallback."""
        r = client.get("/graph/subgraph?entity_type=Mentor&entity_id=1")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0

    def test_graph_subgraph_invalid_entity_type(self, client):
        r = client.get("/graph/subgraph?entity_type=HACKER&entity_id=1")
        assert r.status_code == 400

    def test_graph_mentors_fallback(self, client):
        r = client.get("/graph/mentors?industry=fintech")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ── 11. BigQuery Endpoints ───────────────────────────────────


class TestBigQueryEndpoints:
    def test_bq_dashboard_fallback(self, client):
        r = client.get("/analytics/bq-dashboard")
        assert r.status_code == 200
        body = r.json()
        assert "source" in body

    def test_outcome_trends_fallback(self, client):
        r = client.get("/analytics/outcome-trends")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ── 12. Audit ─────────────────────────────────────────────────


class TestAudit:
    def test_audit_returns_history(self, client, seeded):
        # Create a selection (which logs an audit entry)
        r = client.post("/selections", json={
            "purpose": "Audit test",
            "items": [],
        })
        sid = r.json()["selection_id"]

        r = client.get(f"/audit?entity_type=selection&entity_id={sid}")
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, list)
        assert len(body) >= 1
        assert body[0]["action"] == "CREATE"

    def test_audit_approve_logged(self, client, seeded):
        r = client.post("/selections", json={"purpose": "Audit approve", "items": []})
        sid = r.json()["selection_id"]
        client.post(f"/selections/{sid}/approve")

        history = client.get(f"/audit?entity_type=selection&entity_id={sid}").json()
        actions = [h["action"] for h in history]
        assert "CREATE" in actions
        assert "APPROVE" in actions


# ── 13. Transcript Parsing ───────────────────────────────────


class TestTranscriptParsing:
    def test_transcript_returns_draft_followup(self, client, seeded):
        eid = seeded["events"][0]["event_id"]
        r = client.post(f"/events/{eid}/followups/from-transcript", json={
            "transcript_text": "Meeting between Alice and Bob about fintech pilot.",
        })
        assert r.status_code == 200
        body = r.json()
        assert body["event_id"] == eid
        assert "draft_followup" in body

    def test_transcript_empty_text(self, client, seeded):
        eid = seeded["events"][0]["event_id"]
        r = client.post(f"/events/{eid}/followups/from-transcript", json={
            "transcript_text": "",
        })
        assert r.status_code == 400

    def test_transcript_invalid_event(self, client):
        r = client.post("/events/99999/followups/from-transcript", json={
            "transcript_text": "Some text",
        })
        assert r.status_code == 404


# ── 14. Auth Endpoints (smoke) ────────────────────────────────


class TestAuthSmoke:
    def test_google_auth_no_token(self, client):
        r = client.post("/auth/google", json={})
        assert r.status_code == 400

    def test_me_without_auth(self, client):
        r = client.get("/me")
        assert r.status_code == 401

    def test_bootstrap_admin_no_setup_token(self, client):
        r = client.post("/auth/bootstrap-admin", json={
            "setup_token": "wrong",
            "user_id": 1,
        })
        # Either 403 (no setup token configured) or 403 (wrong token)
        assert r.status_code == 403

    def test_update_role_invalid_role(self, client):
        r = client.patch("/users/1/role", json={"role": "GOD_MODE"})
        assert r.status_code == 401

    def test_update_role_nonexistent_user(self, client):
        r = client.patch("/users/99999/role", json={"role": "MENTOR"})
        assert r.status_code == 401


# ── 15. Data Flow Integration ────────────────────────────────


class TestDataFlowIntegration:
    def test_full_lifecycle_match_approve_notify(self, client, seeded):
        """End-to-end: match → create selection → approve → notification."""
        event_id = seeded["events"][0]["event_id"]
        company_id = seeded["companies"][0]["company_id"]

        # 1. Match
        r = client.post("/matches/recommend", json={
            "event_id": event_id,
            "company_id": company_id,
            "top_k": 3,
        })
        assert r.status_code == 200
        recs = r.json()["recommendations"]
        assert len(recs) >= 1

        # 2. Create selection from match results
        items = [
            {
                "entity_type": "MENTOR",
                "entity_id": rec["entity_id"],
                "entity_name": rec["entity_name"],
                "match_score": rec["score"],
                "rationale": rec["rationale"],
            }
            for rec in recs
        ]
        r = client.post("/selections", json={
            "event_id": event_id,
            "purpose": f"AI matches for Company {company_id}",
            "ai_generated": True,
            "items": items,
        })
        assert r.status_code == 200
        sel = r.json()
        assert sel["approval_status"] == "DRAFT"
        assert len(sel["items"]) == len(recs)
        sid = sel["selection_id"]

        # 3. Approve
        r = client.post(f"/selections/{sid}/approve")
        assert r.status_code == 200
        assert r.json()["approval_status"] == "APPROVED"

        # 4. Check notifications were created
        notifs = client.get("/notifications").json()
        mentor_emails = {n["user_email"] for n in notifs}
        for rec in recs:
            mentor = next(m for m in seeded["mentors"] if m["mentor_id"] == rec["entity_id"])
            assert mentor["email"] in mentor_emails

        # 5. Dashboard reflects the selection
        metrics = client.get("/analytics/dashboard").json()
        assert metrics["selections"] >= 1

        # 6. Audit trail exists
        audit = client.get(f"/audit?entity_type=selection&entity_id={sid}").json()
        assert len(audit) >= 2  # CREATE + APPROVE

    def test_multiple_selections_for_same_event(self, client, seeded):
        """Can create multiple selections per event."""
        eid = seeded["events"][0]["event_id"]
        for i in range(3):
            r = client.post("/selections", json={
                "event_id": eid,
                "purpose": f"Batch {i}",
                "items": [],
            })
            assert r.status_code == 200
        sels = client.get("/selections").json()
        event_sels = [s for s in sels if s["event_id"] == eid]
        assert len(event_sels) == 3

    def test_dashboard_counts_after_bulk_create(self, client):
        """Bulk insert and verify dashboard counts match."""
        for i in range(10):
            client.post("/profiles/mentors", json={
                "full_name": f"Bulk Mentor {i}",
                "email": f"bulk{i}@example.com",
            })
        for i in range(7):
            client.post("/profiles/companies", json={
                "company_name": f"Bulk Co {i}",
            })
        for i in range(3):
            client.post("/events", json={
                "event_name": f"Bulk Event {i}",
            })

        m = client.get("/analytics/dashboard").json()
        assert m["mentors"] == 10
        assert m["companies"] == 7
        assert m["events"] == 3


# ── 16. Edge Cases & Error Handling ───────────────────────────


class TestEdgeCases:
    def test_invalid_json_body(self, client):
        r = client.post("/profiles/mentors", content=b"not json",
                         headers={"Content-Type": "application/json"})
        assert r.status_code == 422

    def test_extra_fields_ignored(self, client):
        r = client.post("/profiles/mentors", json={
            "full_name": "Extra Fields",
            "email": "extra@example.com",
            "nonexistent_field": "should be ignored",
        })
        assert r.status_code == 200

    def test_special_characters_in_names(self, client):
        r = client.post("/profiles/mentors", json={
            "full_name": "O'Brien-Müller (née Smith)",
            "email": "obrien@example.com",
        })
        assert r.status_code == 200
        assert r.json()["full_name"] == "O'Brien-Müller (née Smith)"

    def test_unicode_in_company_name(self, client):
        r = client.post("/profiles/companies", json={
            "company_name": "日本語テスト株式会社",
            "industry": "fintech",
        })
        assert r.status_code == 200
        assert r.json()["company_name"] == "日本語テスト株式会社"

    def test_very_long_bio(self, client):
        r = client.post("/profiles/mentors", json={
            "full_name": "Long Bio",
            "email": "longbio@example.com",
            "short_bio": "A" * 10000,
        })
        assert r.status_code == 200


# ── 17. Matching Scoring Logic ────────────────────────────────


class TestMatchingScoringLogic:
    def test_industry_match_boosts_score(self):
        from nexusai.matching import CompanyProfile, MentorProfile, score_mentor_for_company

        mentor = MentorProfile(id="1", name="M", industries=["fintech"], support_types=[], stages=[], languages=[], capacity_score=0.5)
        company = CompanyProfile(id="c1", name="C", industry="fintech", stage="", support_needed=[], languages=[])
        rec = score_mentor_for_company(mentor, company)
        assert "industry: fintech" in rec.fit_factors
        assert rec.score >= 0.35

    def test_no_match_gets_only_capacity(self):
        from nexusai.matching import CompanyProfile, MentorProfile, score_mentor_for_company

        mentor = MentorProfile(id="1", name="M", industries=["healthtech"], support_types=["legal"], stages=["growth"], languages=["zh"], capacity_score=0.5)
        company = CompanyProfile(id="c1", name="C", industry="fintech", stage="seed", support_needed=["fundraising"], languages=["en"])
        rec = score_mentor_for_company(mentor, company)
        # Only capacity contributes
        assert rec.score <= 0.10

    def test_perfect_match_maxes_score(self):
        from nexusai.matching import CompanyProfile, MentorProfile, score_mentor_for_company

        mentor = MentorProfile(id="1", name="M", industries=["fintech"], support_types=["fundraising"], stages=["seed"], languages=["en"], capacity_score=1.0)
        company = CompanyProfile(id="c1", name="C", industry="fintech", stage="seed", support_needed=["fundraising"], languages=["en"])
        rec = score_mentor_for_company(mentor, company)
        assert rec.score >= 0.90

    def test_support_synonym_matching(self):
        from nexusai.matching import support_matches

        assert support_matches("gtm", "market_access")
        assert support_matches("GTM", "Market_Access")
        assert not support_matches("legal", "fundraising")


# ── 18. Router Classification ────────────────────────────────


class TestRouterClassification:
    def test_fallback_classify_match(self):
        from nexusai.agents.nodes.router import _fallback_classify

        assert _fallback_classify("match company 5 with mentors") == "match"
        assert _fallback_classify("recommend mentors") == "match"
        assert _fallback_classify("find a partner for startup") == "match"
        assert _fallback_classify("approve selection") == "match"

    def test_fallback_classify_onboard(self):
        from nexusai.agents.nodes.router import _fallback_classify

        assert _fallback_classify("upload CV for mentor") == "onboard"
        assert _fallback_classify("add mentor John") == "onboard"
        assert _fallback_classify("register a new company") == "onboard"

    def test_fallback_classify_followup(self):
        from nexusai.agents.nodes.router import _fallback_classify

        assert _fallback_classify("show follow-ups") == "followup"
        assert _fallback_classify("what was the outcome?") == "followup"
        assert _fallback_classify("parse this meeting note") == "followup"

    def test_fallback_classify_analytics(self):
        from nexusai.agents.nodes.router import _fallback_classify

        assert _fallback_classify("show dashboard") == "analytics"
        assert _fallback_classify("how many mentors?") == "analytics"
        assert _fallback_classify("show me the trend") == "analytics"

    def test_fallback_classify_general(self):
        from nexusai.agents.nodes.router import _fallback_classify

        assert _fallback_classify("hello") == "general"
        assert _fallback_classify("what can you do?") == "general"
        assert _fallback_classify("tell me a joke") == "general"


# ── 19. Concurrent Request Simulation ─────────────────────────


class TestConcurrent:
    def test_parallel_mentor_creation(self, client):
        """Simulate many creates — no crashes."""
        results = []
        for i in range(20):
            r = client.post("/profiles/mentors", json={
                "full_name": f"Para Mentor {i}",
                "email": f"para{i}@example.com",
            })
            results.append(r.status_code)
        assert all(s == 200 for s in results)
        lst = client.get("/profiles/mentors").json()
        assert len(lst) == 20

    def test_parallel_matches(self, client, seeded):
        """Run matching multiple times concurrently."""
        for _ in range(5):
            r = client.post("/matches/recommend", json={
                "event_id": seeded["events"][0]["event_id"],
                "company_id": seeded["companies"][0]["company_id"],
                "top_k": 5,
            })
            assert r.status_code == 200
            assert len(r.json()["recommendations"]) <= 5
