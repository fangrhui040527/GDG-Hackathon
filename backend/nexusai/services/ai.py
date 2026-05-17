from typing import Any

from nexusai.matching import CompanyProfile, MatchRecommendation, MentorProfile


class AIService:
    def generate_match_rationale(
        self,
        mentor: MentorProfile,
        company: CompanyProfile,
        recommendation: MatchRecommendation,
    ) -> str:
        raise NotImplementedError

    def extract_mentor_profile(self, extracted_text: str) -> dict[str, Any]:
        raise NotImplementedError

    def extract_mentor_video_profile(self, transcript: str) -> dict[str, Any]:
        raise NotImplementedError

    def extract_company_video_profile(self, transcript: str) -> dict[str, Any]:
        raise NotImplementedError


class FakeAIService(AIService):
    def __init__(self) -> None:
        self.profile_extraction_calls = 0
        self.mentor_video_extraction_calls = 0
        self.company_video_extraction_calls = 0

    def generate_match_rationale(
        self,
        mentor: MentorProfile,
        company: CompanyProfile,
        recommendation: MatchRecommendation,
    ) -> str:
        factors = ", ".join(recommendation.fit_factors)
        return f"{mentor.name} fits {company.name} because of {factors}."

    def extract_mentor_profile(self, extracted_text: str) -> dict[str, Any]:
        self.profile_extraction_calls += 1
        return {
            "full_name": "Asha Tan",
            "email": "asha@example.com",
            "preferred_industry": "fintech, payments",
            "type_of_support_offered": "fundraising, gtm",
            "preferred_company_stage": "seed, series_a",
            "short_bio": extracted_text[:500],
        }

    def extract_mentor_video_profile(self, transcript: str) -> dict[str, Any]:
        self.mentor_video_extraction_calls += 1
        return {
            "cleaned_text": transcript[:500],
            "short_bio": transcript[:500],
        }

    def extract_company_video_profile(self, transcript: str) -> dict[str, Any]:
        self.company_video_extraction_calls += 1
        return {
            "cleaned_text": transcript[:500],
            "company_description": transcript[:500],
        }


class VertexAIService(AIService):
    def __init__(
        self,
        project: str,
        location: str,
        gemini_model: str,
        reasoning_model: str,
        embedding_model: str,
    ) -> None:
        self.project = project
        self.location = location
        self.gemini_model = gemini_model
        self.reasoning_model = reasoning_model
        self.embedding_model = embedding_model

    def generate_match_rationale(
        self,
        mentor: MentorProfile,
        company: CompanyProfile,
        recommendation: MatchRecommendation,
    ) -> str:
        try:
            from vertexai import init
            from vertexai.generative_models import GenerativeModel
        except ImportError:
            return FakeAIService().generate_match_rationale(mentor, company, recommendation)

        init(project=self.project, location=self.location)
        model = GenerativeModel(self.gemini_model)
        prompt = (
            "Write one concise, grounded match rationale for an innovation ecosystem admin.\n"
            f"Mentor: {mentor}\n"
            f"Company: {company}\n"
            f"Score: {recommendation.score}\n"
            f"Fit factors: {recommendation.fit_factors}\n"
            "Do not invent facts."
        )
        response = model.generate_content(prompt)
        return response.text.strip()

    def extract_mentor_profile(self, extracted_text: str) -> dict[str, Any]:
        try:
            from vertexai import init
            from vertexai.generative_models import GenerativeModel, GenerationConfig
        except ImportError:
            return FakeAIService().extract_mentor_profile(extracted_text)

        init(project=self.project, location=self.location)
        model = GenerativeModel(self.gemini_model)
        prompt = (
            "Extract a mentor profile from this CV text. Return compact JSON with keys: "
            "full_name, email, job_title, organization_name, preferred_industry, "
            "type_of_support_offered, preferred_company_stage, short_bio.\n\n"
            f"{extracted_text}"
        )
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(response_mime_type="application/json"),
        )
        try:
            import json

            return json.loads(response.text)
        except Exception:
            return {"bio": response.text.strip()}

    def _generate_json_profile(self, prompt: str) -> dict[str, Any]:
        try:
            from vertexai import init
            from vertexai.generative_models import GenerativeModel, GenerationConfig
        except ImportError:
            return {}

        init(project=self.project, location=self.location)
        model = GenerativeModel(self.gemini_model)
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig(response_mime_type="application/json"),
        )
        try:
            import json

            return json.loads(response.text)
        except Exception:
            return {"cleaned_text": response.text.strip()}

    def extract_mentor_video_profile(self, transcript: str) -> dict[str, Any]:
        prompt = (
            "Digest this mentor intro video transcript for an ecosystem matching profile. "
            "Return compact JSON with keys: cleaned_text, full_name, email, job_title, "
            "organization_name, preferred_industry, type_of_support_offered, "
            "preferred_company_stage, short_bio. Do not invent missing facts.\n\n"
            f"{transcript}"
        )
        profile = self._generate_json_profile(prompt)
        if profile:
            return profile
        return FakeAIService().extract_mentor_video_profile(transcript)

    def extract_company_video_profile(self, transcript: str) -> dict[str, Any]:
        prompt = (
            "Digest this company intro video transcript for an ecosystem matching profile. "
            "Return compact JSON with keys: cleaned_text, company_name, company_description, "
            "country, industry, business_stage, support_needed, availability. "
            "Do not invent missing facts.\n\n"
            f"{transcript}"
        )
        profile = self._generate_json_profile(prompt)
        if profile:
            return profile
        return FakeAIService().extract_company_video_profile(transcript)
