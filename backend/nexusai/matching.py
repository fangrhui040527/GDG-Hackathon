from dataclasses import dataclass


def normalize(value: str) -> str:
    return value.strip().lower().replace("-", "_").replace(" ", "_")


@dataclass(frozen=True)
class MentorProfile:
    id: str
    name: str
    industries: list[str]
    support_types: list[str]
    stages: list[str]
    languages: list[str]
    capacity_score: float


@dataclass(frozen=True)
class CompanyProfile:
    id: str
    name: str
    industry: str
    stage: str
    support_needed: list[str]
    languages: list[str]


@dataclass(frozen=True)
class MatchRecommendation:
    entity_id: str
    entity_name: str
    score: float
    fit_factors: list[str]
    rationale: str = ""


SUPPORT_SYNONYMS = {
    "market_access": {"gtm", "sales", "partnerships", "market_access"},
    "gtm": {"gtm", "sales", "market_access"},
}


def support_matches(mentor_support: str, company_need: str) -> bool:
    mentor_value = normalize(mentor_support)
    need_value = normalize(company_need)
    if mentor_value == need_value:
        return True
    return mentor_value in SUPPORT_SYNONYMS.get(need_value, set())


def score_mentor_for_company(mentor: MentorProfile, company: CompanyProfile) -> MatchRecommendation:
    score = 0.0
    fit_factors: list[str] = []

    mentor_industries = {normalize(value) for value in mentor.industries}
    company_industry = normalize(company.industry)
    if company_industry and company_industry in mentor_industries:
        score += 0.35
        fit_factors.append(f"industry: {company.industry}")

    mentor_stages = {normalize(value) for value in mentor.stages}
    company_stage = normalize(company.stage)
    if company_stage and company_stage in mentor_stages:
        score += 0.20
        fit_factors.append(f"stage: {company.stage}")

    mentor_languages = {normalize(value) for value in mentor.languages}
    for language in company.languages:
        if normalize(language) in mentor_languages:
            score += 0.10
            fit_factors.append(f"language: {language}")
            break

    support_hit = None
    for need in company.support_needed:
        for support in mentor.support_types:
            if support_matches(support, need):
                support_hit = need
                break
        if support_hit:
            break
    if support_hit:
        score += 0.25
        fit_factors.append(f"support: {support_hit}")

    capacity_score = max(0.0, min(1.0, mentor.capacity_score))
    score += capacity_score * 0.10
    fit_factors.append(f"capacity: {capacity_score:.0%}")

    return MatchRecommendation(
        entity_id=mentor.id,
        entity_name=mentor.name,
        score=round(score, 4),
        fit_factors=fit_factors,
    )


def recommend_mentors(
    mentors: list[MentorProfile],
    company: CompanyProfile,
    top_k: int,
) -> list[MatchRecommendation]:
    recommendations = [score_mentor_for_company(mentor, company) for mentor in mentors]
    recommendations.sort(key=lambda item: (-item.score, item.entity_name))
    return recommendations[:top_k]
