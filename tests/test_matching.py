from nexusai.matching import CompanyProfile, MentorProfile, recommend_mentors


def test_recommend_mentors_scores_skill_stage_language_and_capacity_fit():
    mentors = [
        MentorProfile(
            id="mentor-1",
            name="Asha Tan",
            industries=["fintech", "payments"],
            support_types=["fundraising", "gtm"],
            stages=["seed", "series_a"],
            languages=["en", "ms"],
            capacity_score=0.9,
        ),
        MentorProfile(
            id="mentor-2",
            name="Ben Lee",
            industries=["healthtech"],
            support_types=["legal"],
            stages=["idea"],
            languages=["zh"],
            capacity_score=0.2,
        ),
    ]
    company = CompanyProfile(
        id="company-1",
        name="PayBridge",
        industry="fintech",
        stage="seed",
        support_needed=["fundraising", "market_access"],
        languages=["en"],
    )

    recommendations = recommend_mentors(mentors, company, top_k=2)

    assert [item.entity_id for item in recommendations] == ["mentor-1", "mentor-2"]
    assert recommendations[0].score > recommendations[1].score
    assert "industry: fintech" in recommendations[0].fit_factors
    assert "stage: seed" in recommendations[0].fit_factors
    assert "language: en" in recommendations[0].fit_factors


def test_recommend_mentors_limits_top_k():
    mentors = [
        MentorProfile(
            id=f"mentor-{idx}",
            name=f"Mentor {idx}",
            industries=["fintech"],
            support_types=["gtm"],
            stages=["seed"],
            languages=["en"],
            capacity_score=1.0,
        )
        for idx in range(4)
    ]
    company = CompanyProfile(
        id="company-1",
        name="PayBridge",
        industry="fintech",
        stage="seed",
        support_needed=["gtm"],
        languages=["en"],
    )

    recommendations = recommend_mentors(mentors, company, top_k=2)

    assert len(recommendations) == 2
