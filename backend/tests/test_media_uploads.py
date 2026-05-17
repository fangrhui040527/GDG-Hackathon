from fastapi.testclient import TestClient

from nexusai.api import create_app
from nexusai.database import Base, Company, Mentor, create_session_factory, create_sqlite_engine
from nexusai.services.ai import FakeAIService
from nexusai.services.mcp import FakeMCPClient


class MediaAIService(FakeAIService):
    def __init__(self) -> None:
        super().__init__()
        self.mentor_video_calls = 0
        self.company_video_calls = 0

    def extract_mentor_profile(self, extracted_text: str) -> dict:
        self.profile_extraction_calls += 1
        return {
            "full_name": "Do Not Overwrite",
            "email": "new@example.com",
            "job_title": "Mentor Lead",
            "organization_name": "Fintech Labs",
            "preferred_industry": "fintech",
            "type_of_support_offered": "fundraising",
            "preferred_company_stage": "seed",
            "short_bio": "Clean mentor CV summary",
        }

    def extract_mentor_video_profile(self, transcript: str) -> dict:
        self.mentor_video_calls += 1
        return {
            "cleaned_text": "Clean mentor video summary",
            "short_bio": "Video bio",
            "preferred_industry": "payments",
            "type_of_support_offered": "go-to-market",
        }

    def extract_company_video_profile(self, transcript: str) -> dict:
        self.company_video_calls += 1
        return {
            "cleaned_text": "Clean company video summary",
            "company_name": "Do Not Overwrite",
            "company_description": "Clean company overview",
            "industry": "fintech",
            "business_stage": "seed",
            "support_needed": "market access",
        }


def make_client():
    engine = create_sqlite_engine()
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    ai = MediaAIService()
    mcp = FakeMCPClient()
    app = create_app(session_factory=session_factory, ai_service=ai, mcp_client=mcp)
    return TestClient(app), session_factory, ai, mcp


def test_mentor_cv_pdf_upload_stores_clean_text_and_fills_blank_fields_only():
    client, session_factory, ai, mcp = make_client()
    mentor = client.post(
        "/profiles/mentors",
        json={"full_name": "Original Mentor", "email": "mentor@example.com"},
    ).json()

    response = client.post(
        f"/mentors/{mentor['mentor_id']}/cv",
        files={"file": ("mentor.pdf", b"%PDF mentor cv", "application/pdf")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mentor_id"] == mentor["mentor_id"]
    assert body["source"] == "cv"
    assert body["cleaned_text"] == "Clean mentor CV summary"
    assert body["updated_fields"] == [
        "job_title",
        "organization_name",
        "preferred_industry",
        "type_of_support_offered",
        "preferred_company_stage",
        "short_bio",
    ]
    assert mcp.calls == ["document_ai_parse"]
    assert ai.profile_extraction_calls == 1

    with session_factory() as db:
        stored = db.get(Mentor, mentor["mentor_id"])
        assert stored.cv == "Clean mentor CV summary"
        assert stored.full_name == "Original Mentor"
        assert stored.email == "mentor@example.com"
        assert stored.job_title == "Mentor Lead"


def test_mentor_video_upload_transcribes_cleans_and_stores_text():
    client, session_factory, ai, mcp = make_client()
    mentor = client.post(
        "/profiles/mentors",
        json={"full_name": "Video Mentor", "email": "video-mentor@example.com"},
    ).json()

    response = client.post(
        f"/mentors/{mentor['mentor_id']}/video",
        files={"file": ("intro.mp4", b"video bytes", "video/mp4")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mentor_id"] == mentor["mentor_id"]
    assert body["source"] == "video"
    assert body["cleaned_text"] == "Clean mentor video summary"
    assert "short_bio" in body["updated_fields"]
    assert mcp.calls == ["chirp_transcribe"]
    assert ai.mentor_video_calls == 1

    with session_factory() as db:
        stored = db.get(Mentor, mentor["mentor_id"])
        assert stored.video == "Clean mentor video summary"
        assert stored.short_bio == "Video bio"


def test_company_video_upload_transcribes_cleans_and_stores_text():
    client, session_factory, ai, mcp = make_client()
    company = client.post(
        "/profiles/companies",
        json={"company_name": "Original Company"},
    ).json()

    response = client.post(
        f"/companies/{company['company_id']}/video",
        files={"file": ("pitch.webm", b"video bytes", "video/webm")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["company_id"] == company["company_id"]
    assert body["source"] == "video"
    assert body["cleaned_text"] == "Clean company video summary"
    assert body["updated_fields"] == [
        "company_description",
        "industry",
        "business_stage",
        "support_needed",
    ]
    assert mcp.calls == ["chirp_transcribe"]
    assert ai.company_video_calls == 1

    with session_factory() as db:
        stored = db.get(Company, company["company_id"])
        assert stored.video == "Clean company video summary"
        assert stored.company_name == "Original Company"
        assert stored.company_description == "Clean company overview"


def test_media_upload_rejects_oversized_files():
    client, _, _, _ = make_client()
    mentor = client.post(
        "/profiles/mentors",
        json={"full_name": "Large File Mentor", "email": "large@example.com"},
    ).json()
    oversized = b"x" * (2 * 1024 * 1024 + 1)

    response = client.post(
        f"/mentors/{mentor['mentor_id']}/video",
        files={"file": ("large.mp4", oversized, "video/mp4")},
    )

    assert response.status_code == 413


def test_media_upload_rejects_invalid_content_types():
    client, _, _, _ = make_client()
    mentor = client.post(
        "/profiles/mentors",
        json={"full_name": "Type Mentor", "email": "type@example.com"},
    ).json()

    cv_response = client.post(
        f"/mentors/{mentor['mentor_id']}/cv",
        files={"file": ("cv.txt", b"text", "text/plain")},
    )
    video_response = client.post(
        f"/mentors/{mentor['mentor_id']}/video",
        files={"file": ("video.gif", b"gif", "image/gif")},
    )

    assert cv_response.status_code == 415
    assert video_response.status_code == 415


def test_company_video_upload_missing_company_returns_404():
    client, _, _, _ = make_client()

    response = client.post(
        "/companies/99999/video",
        files={"file": ("pitch.mp4", b"video bytes", "video/mp4")},
    )

    assert response.status_code == 404
