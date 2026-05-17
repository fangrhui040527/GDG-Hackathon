from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


API_URL = os.environ.get("NEXUSAI_API_URL", "http://127.0.0.1:8001").rstrip("/")


PROGRAMMES = [
    {
        "name": "Global FinTech Accelerator 2026",
        "description": "A 12-week intensive programme connecting high-growth fintech startups with industry mentors, corporate partners, and investors across ASEAN. Focused on payments, digital banking, and embedded finance.",
        "category": "Fintech",
        "start_date": "2026-06-01",
        "end_date": "2026-08-22",
        "target_industry": "Financial Technology",
        "target_country": "Malaysia",
        "target_company_stage": "Listed Company",
        "required_mentors": 5,
        "required_companies": 10,
        "required_partners": 4,
        "required_service_providers": 3,
        "eligibility_criteria": "Fintech startups with at least MVP stage product and $100K+ ARR. Must be registered in ASEAN.",
        "organiser_name": "Sarah Chen",
        "_status": "published",
    },
    {
        "name": "HealthTech Innovation Lab",
        "description": "Bridging the gap between healthcare providers and technology innovators. This programme pairs digital health startups with hospital networks, pharma companies, and regulatory experts across Southeast Asia.",
        "category": "Healthcare",
        "start_date": "2026-07-15",
        "end_date": "2026-10-15",
        "target_industry": "Healthcare & Life Sciences",
        "target_country": "Singapore",
        "target_company_stage": "Personal Business",
        "required_mentors": 6,
        "required_companies": 8,
        "required_partners": 4,
        "required_service_providers": 3,
        "eligibility_criteria": "HealthTech startups focused on telemedicine, diagnostics, or patient data management. Must have pilot deployments.",
        "organiser_name": "Sarah Chen",
        "_status": "submitted",
    },
    {
        "name": "GreenTech Sustainability Challenge",
        "description": "Connecting cleantech and sustainability-focused startups with ESG-committed corporates, green finance partners, and carbon credit experts to accelerate climate solutions in the region.",
        "category": "Sustainability",
        "start_date": "2026-08-01",
        "end_date": "2026-11-30",
        "target_industry": "Clean Energy & Sustainability",
        "target_country": "Indonesia",
        "target_company_stage": "Personal Business",
        "required_mentors": 4,
        "required_companies": 12,
        "required_partners": 5,
        "required_service_providers": 3,
        "eligibility_criteria": "Startups working on renewable energy, carbon reduction, circular economy, or sustainable agriculture. ASEAN-based or willing to relocate.",
        "organiser_name": "Sarah Chen",
        "_status": "submitted",
    },
    {
        "name": "EdTech Mentorship Network",
        "description": "A mentor-matching programme connecting education technology founders with experienced educators, curriculum designers, and ed-investors to scale learning platforms across developing markets.",
        "category": "Education",
        "start_date": "2026-09-01",
        "end_date": "2026-12-15",
        "target_industry": "Education Technology",
        "target_country": "Philippines",
        "target_company_stage": "Personal Business",
        "required_mentors": 8,
        "required_companies": 6,
        "required_partners": 3,
        "required_service_providers": 2,
        "eligibility_criteria": "EdTech startups targeting K-12 or workforce upskilling in underserved communities.",
        "organiser_name": "Sarah Chen",
        "_status": "draft",
    },
    {
        "name": "Smart City IoT Partnership",
        "description": "Facilitating partnerships between IoT/smart city startups and municipal governments, telcos, and infrastructure companies to deploy urban technology solutions at scale.",
        "category": "Smart City",
        "start_date": "2026-06-15",
        "end_date": "2026-09-15",
        "target_industry": "IoT & Smart Infrastructure",
        "target_country": "Thailand",
        "target_company_stage": "International Business",
        "required_mentors": 4,
        "required_companies": 8,
        "required_partners": 6,
        "required_service_providers": 4,
        "eligibility_criteria": "IoT startups with proven deployments in urban mobility, waste management, or energy grid optimization.",
        "organiser_name": "Sarah Chen",
        "_status": "approved",
    },
]


MENTORS = [
    {
        "full_name": "Dr. Ahmad Farouk",
        "email": "ahmad.farouk@mentors.my",
        "short_bio": "Former CTO of CIMB Digital with 15 years in banking technology. Helped 12 startups raise Series A rounds.",
        "job_title": "Former CTO",
        "organization_name": "CIMB Digital",
        "preferred_industry": "Fintech, Digital Banking",
        "type_of_support_offered": "Strategic Advisory, Fundraising",
        "preferred_company_stage": "Listed Company, International Business",
        "country": "Malaysia",
    },
    {
        "full_name": "Ms. Priya Nair",
        "email": "priya.nair@venturecap.sg",
        "short_bio": "Partner at GGV Capital, previously VP Product at Stripe Asia. Deep expertise in cross-border payments.",
        "job_title": "Partner",
        "organization_name": "GGV Capital",
        "preferred_industry": "Fintech, Payments",
        "type_of_support_offered": "Product Strategy, Market Expansion",
        "preferred_company_stage": "Personal Business, Listed Company",
        "country": "Singapore",
    },
    {
        "full_name": "Dr. Sarah Lim",
        "email": "sarah.lim@healthtech.sg",
        "short_bio": "Chief Medical Officer at National University Hospital. Led digital health transformation across 3 hospital networks.",
        "job_title": "Chief Medical Officer",
        "organization_name": "National University Hospital",
        "preferred_industry": "Healthcare, Biotech",
        "type_of_support_offered": "Clinical Validation, Regulatory Strategy",
        "preferred_company_stage": "Personal Business",
        "country": "Singapore",
    },
    {
        "full_name": "Prof. Wijaya Kusuma",
        "email": "wijaya.k@greeninnovation.id",
        "short_bio": "Professor of Environmental Engineering at ITB. Advisor to Indonesia Ministry of Energy on renewable transition policy.",
        "job_title": "Professor",
        "organization_name": "Institut Teknologi Bandung",
        "preferred_industry": "Sustainability, Clean Energy",
        "type_of_support_offered": "Technical Advisory, Policy Navigation",
        "preferred_company_stage": "Personal Business, Listed Company",
        "country": "Indonesia",
    },
    {
        "full_name": "Mr. Lee Wei Liang",
        "email": "weiliang@smartcity.my",
        "short_bio": "Ex-CEO of Smart Selangor. Connected IoT startups with 5 municipal governments across Malaysia.",
        "job_title": "Former CEO",
        "organization_name": "Smart Selangor",
        "preferred_industry": "Smart City, IoT",
        "type_of_support_offered": "Business Development, Government Relations",
        "preferred_company_stage": "International Business",
        "country": "Malaysia",
    },
    {
        "full_name": "Prof. Maria Santos",
        "email": "maria.santos@edtech.ph",
        "short_bio": "Dean of Education at Ateneo de Manila. Designed digital literacy programmes reaching 500K students in rural Philippines.",
        "job_title": "Dean of Education",
        "organization_name": "Ateneo de Manila",
        "preferred_industry": "Education, Social Impact",
        "type_of_support_offered": "Curriculum Design, Impact Measurement",
        "preferred_company_stage": "Personal Business",
        "country": "Philippines",
    },
    {
        "full_name": "Tan Sri Azman Mokhtar",
        "email": "azman.m@investment.my",
        "short_bio": "Former MD of Khazanah Nasional. 25+ years steering sovereign wealth investments across technology sectors.",
        "job_title": "Former Managing Director",
        "organization_name": "Khazanah Nasional",
        "preferred_industry": "Investment, Fintech, Infrastructure",
        "type_of_support_offered": "Strategic Advisory, Board Governance",
        "preferred_company_stage": "Listed Company, International Business",
        "country": "Malaysia",
    },
    {
        "full_name": "Dr. Supatra Charoenpong",
        "email": "supatra@iot-thai.co.th",
        "short_bio": "Founder of ThaiIoT Consortium. Deployed 200+ sensor networks across Bangkok and Chiang Mai.",
        "job_title": "Founder",
        "organization_name": "ThaiIoT Consortium",
        "preferred_industry": "IoT, Smart City, Logistics",
        "type_of_support_offered": "Technical Architecture, Pilot Design",
        "preferred_company_stage": "Personal Business, International Business",
        "country": "Thailand",
    },
    {
        "full_name": "Mr. Rajesh Patel",
        "email": "rajesh.patel@fintech.in",
        "short_bio": "Co-founder of Razorpay (exited). Angel investor in 30+ ASEAN fintech startups with combined $2B valuation.",
        "job_title": "Co-founder and Angel Investor",
        "organization_name": "Razorpay",
        "preferred_industry": "Fintech, Embedded Finance",
        "type_of_support_offered": "Fundraising, Go-to-Market",
        "preferred_company_stage": "Listed Company, International Business",
        "country": "India",
    },
    {
        "full_name": "Dr. Nguyen Thanh",
        "email": "thanh.nguyen@vn-health.vn",
        "short_bio": "CEO of VinMec Digital Health. Scaled telemedicine platform to 2M patients across Vietnam.",
        "job_title": "CEO",
        "organization_name": "VinMec Digital Health",
        "preferred_industry": "Healthcare, Telemedicine",
        "type_of_support_offered": "Market Entry, Clinical Trials",
        "preferred_company_stage": "Personal Business",
        "country": "Vietnam",
    },
]


COMPANIES = [
    {
        "company_name": "Axiata Digital",
        "industry": "Fintech",
        "business_stage": "Listed Company",
        "support_needed": "Mentorship, Market Expansion, Partnership",
        "availability": "Flexible",
        "country": "Malaysia",
        "company_description": "Leading digital financial services provider in Malaysia. Operating Boost eWallet with 10M+ users.",
    },
    {
        "company_name": "Grab Financial Group",
        "industry": "Fintech",
        "business_stage": "International Business",
        "support_needed": "Regulatory Guidance, Partnership",
        "availability": "Flexible",
        "country": "Singapore",
        "company_description": "Southeast Asia's largest fintech platform. Operates digital banking, payments, and insurance across 8 markets.",
    },
    {
        "company_name": "Biofourmis",
        "industry": "Healthcare",
        "business_stage": "International Business",
        "support_needed": "Clinical Validation, Hospital Partnerships",
        "availability": "Flexible",
        "country": "Singapore",
        "company_description": "AI-powered remote patient monitoring platform. FDA-cleared digital therapeutics for chronic disease management.",
    },
    {
        "company_name": "Naluri Hidup",
        "industry": "Healthcare",
        "business_stage": "Personal Business",
        "support_needed": "Mentorship, Fundraising, Clinical Pilots",
        "availability": "Flexible",
        "country": "Malaysia",
        "company_description": "Digital mental health platform combining AI coaching with licensed therapists. Partnered with 50+ corporates in Malaysia.",
    },
    {
        "company_name": "SolarAI Labs",
        "industry": "Clean Energy",
        "business_stage": "Personal Business",
        "support_needed": "Technical Mentorship, Government Relations, Fundraising",
        "availability": "Flexible",
        "country": "Indonesia",
        "company_description": "Using AI to optimize solar farm placement and output prediction. Deployed across 15 sites in Java and Sumatra.",
    },
    {
        "company_name": "SmartTraffic.io",
        "industry": "Smart City",
        "business_stage": "International Business",
        "support_needed": "Government Partnerships, Scale Engineering",
        "availability": "Flexible",
        "country": "Thailand",
        "company_description": "AI-powered traffic management system reducing congestion by 35% in Bangkok pilot. Real-time optimization across 500+ intersections.",
    },
    {
        "company_name": "Ruangguru",
        "industry": "Education",
        "business_stage": "International Business",
        "support_needed": "Market Expansion, Content Partnership",
        "availability": "Flexible",
        "country": "Indonesia",
        "company_description": "Indonesia's largest edtech platform with 22M+ users. Provides K-12 tutoring, test prep, and skill courses.",
    },
    {
        "company_name": "EcoCharge Systems",
        "industry": "Sustainability",
        "business_stage": "Personal Business",
        "support_needed": "Technical Mentorship, Pilot Partners, Fundraising",
        "availability": "Flexible",
        "country": "Thailand",
        "company_description": "EV charging infrastructure with integrated solar storage. Operating 80 stations across Bangkok with 99.5% uptime.",
    },
    {
        "company_name": "TouchNGo eWallet",
        "industry": "Fintech",
        "business_stage": "Listed Company",
        "support_needed": "Partnership, Market Expansion",
        "availability": "Flexible",
        "country": "Malaysia",
        "company_description": "Malaysia's leading e-wallet with 20M+ users. Expanding into cross-border payments and micro-lending.",
    },
    {
        "company_name": "GoTo Financial",
        "industry": "Fintech",
        "business_stage": "Listed Company",
        "support_needed": "Regulatory Guidance, Partnership",
        "availability": "Flexible",
        "country": "Indonesia",
        "company_description": "Indonesia's integrated financial services arm of GoTo Group. Serves 55M+ annual transacting users.",
    },
]


PARTNERS = [
    ("Khazanah Nasional", "ecosystem@khazanah.com.my", "Investment", "Malaysia"),
    ("Temasek Holdings", "ventures@temasek.com.sg", "Investment", "Singapore"),
    ("MDEC", "startups@mdec.my", "Government", "Malaysia"),
    ("Cradle Fund", "applications@cradle.com.my", "Venture Capital", "Malaysia"),
    ("Bank Negara Malaysia", "fintech.sandbox@bnm.gov.my", "Regulatory", "Malaysia"),
    ("GreenFinance Asia", "impact@greenfinance.asia", "ESG Finance", "Singapore"),
    ("Bangkok Metropolitan Authority", "smartcity@bma.go.th", "Government", "Thailand"),
]


SERVICE_PROVIDERS = [
    ("AWS Startup Loft", "startups-apac@aws.amazon.com", "Cloud Infrastructure", "Singapore"),
    ("KPMG Advisory", "startup.advisory@kpmg.com.my", "Audit & Compliance", "Malaysia"),
    ("Baker McKenzie", "startups@bakermckenzie.sg", "Legal", "Singapore"),
    ("Google Cloud for Startups", "cloud-startups@google.com", "Cloud Infrastructure", "Singapore"),
    ("PwC Digital", "digital.advisory@pwc.com.my", "Consulting", "Malaysia"),
    ("Stripe Atlas", "atlas-apac@stripe.com", "Payments Infrastructure", "Singapore"),
]


def request(method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        f"{API_URL}{path}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        raise RuntimeError(f"{method} {path} failed with {exc.code}: {body}") from exc


def index_by(items: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    return {str(item.get(key, "")).lower(): item for item in items if item.get(key)}


def ensure(path: str, lookup: dict[str, dict[str, Any]], key: str, payload: dict[str, Any]) -> dict[str, Any]:
    existing = lookup.get(str(payload[key]).lower())
    if existing:
        print(f"skip {path}: {payload[key]}")
        return existing
    created = request("POST", path, payload)
    lookup[str(payload[key]).lower()] = created
    print(f"created {path}: {payload[key]}")
    return created


def set_programme_status(programme: dict[str, Any], desired: str) -> dict[str, Any]:
    programme_id = programme["programme_id"]
    current = programme.get("status")
    if desired == "draft" or current == desired:
        return programme
    if desired in {"submitted", "approved", "published"} and current in {"draft", "changes_requested"}:
        try:
            programme = request("POST", f"/programmes/{programme_id}/submit")
        except RuntimeError as exc:
            print(f"status note: {exc}")
    if desired in {"approved", "published"} and programme.get("status") != "approved":
        programme = request("POST", f"/programmes/{programme_id}/approve")
    if desired == "published" and programme.get("status") != "published":
        programme = request("POST", f"/programmes/{programme_id}/publish")
    return programme


def partner_payload(name: str, email: str, partnership_type: str, country: str) -> dict[str, Any]:
    return {
        "organisation_name": name,
        "organisation_type": "Business",
        "country": country,
        "contact_person_name": "Ecosystem Team",
        "contact_email": email,
        "organisation_description": f"{name} supports ecosystem programmes through {partnership_type.lower()} partnership.",
        "industries_of_interest": "Technology, Startups, ASEAN",
        "requirements": f"Looking for startups aligned with {partnership_type.lower()} priorities.",
        "preferred_collaboration_type": partnership_type,
        "resources_provided": partnership_type,
        "support_offered": partnership_type,
    }


def service_provider_payload(name: str, email: str, service_type: str, country: str) -> dict[str, Any]:
    return {
        "organisation_name": name,
        "country_region": "Not Specified",
        "contact_person_name": "Startup Services Team",
        "contact_email": email,
        "company_description": f"{name} provides {service_type.lower()} support for startups.",
        "services_offered": service_type,
        "detailed_service_description": f"{service_type} support for accelerator participants and ecosystem companies.",
        "support_offered": service_type,
        "support_capacity": country,
    }


def main() -> None:
    ready = request("GET", "/ready")
    if ready != {"status": "ready"}:
        raise RuntimeError(f"API is not ready: {ready}")

    programme_lookup = index_by(request("GET", "/programmes"), "name")
    mentor_lookup = index_by(request("GET", "/profiles/mentors"), "email")
    company_lookup = index_by(request("GET", "/profiles/companies"), "company_name")
    partner_lookup = index_by(request("GET", "/profiles/partners"), "organisation_name")
    provider_lookup = index_by(request("GET", "/profiles/service-providers"), "organisation_name")

    programmes: dict[str, dict[str, Any]] = {}
    for item in PROGRAMMES:
        payload = {key: value for key, value in item.items() if not key.startswith("_")}
        programme = ensure("/programmes", programme_lookup, "name", payload)
        programmes[payload["name"]] = set_programme_status(programme, item["_status"])

    mentors = {
        item["full_name"]: ensure("/profiles/mentors", mentor_lookup, "email", item)
        for item in MENTORS
    }
    companies = {
        item["company_name"]: ensure("/profiles/companies", company_lookup, "company_name", item)
        for item in COMPANIES
    }
    partners = {
        name: ensure("/profiles/partners", partner_lookup, "organisation_name", partner_payload(name, email, kind, country))
        for name, email, kind, country in PARTNERS
    }
    providers = {
        name: ensure(
            "/profiles/service-providers",
            provider_lookup,
            "organisation_name",
            service_provider_payload(name, email, kind, country),
        )
        for name, email, kind, country in SERVICE_PROVIDERS
    }

    shortlist_plan = [
        ("Global FinTech Accelerator 2026", "mentor", "Dr. Ahmad Farouk", mentors["Dr. Ahmad Farouk"]["mentor_id"], 94),
        ("Global FinTech Accelerator 2026", "mentor", "Ms. Priya Nair", mentors["Ms. Priya Nair"]["mentor_id"], 91),
        ("Global FinTech Accelerator 2026", "mentor", "Mr. Rajesh Patel", mentors["Mr. Rajesh Patel"]["mentor_id"], 88),
        ("Global FinTech Accelerator 2026", "company", "Axiata Digital", companies["Axiata Digital"]["company_id"], 96),
        ("Global FinTech Accelerator 2026", "company", "Grab Financial Group", companies["Grab Financial Group"]["company_id"], 93),
        ("Global FinTech Accelerator 2026", "partner", "Khazanah Nasional", partners["Khazanah Nasional"]["partner_id"], 97),
        ("Global FinTech Accelerator 2026", "partner", "Bank Negara Malaysia", partners["Bank Negara Malaysia"]["partner_id"], 95),
        ("Global FinTech Accelerator 2026", "service_provider", "AWS Startup Loft", providers["AWS Startup Loft"]["sp_id"], 89),
        ("HealthTech Innovation Lab", "mentor", "Dr. Sarah Lim", mentors["Dr. Sarah Lim"]["mentor_id"], 97),
        ("HealthTech Innovation Lab", "company", "Biofourmis", companies["Biofourmis"]["company_id"], 95),
        ("HealthTech Innovation Lab", "company", "Naluri Hidup", companies["Naluri Hidup"]["company_id"], 92),
    ]

    for index, (programme_name, actor_type, actor_name, actor_id, score) in enumerate(shortlist_plan, start=1):
        programme_id = programmes[programme_name]["programme_id"]
        request(
            "POST",
            f"/programmes/{programme_id}/shortlist",
            {
                "match_result_id": f"seed-{programme_id}-{actor_type}-{actor_id}",
                "actor_id": str(actor_id),
                "actor_type": actor_type,
                "actor_name": actor_name,
                "match_score": score,
            },
        )
        print(f"shortlisted {actor_name} for {programme_name}")

    print("done")


if __name__ == "__main__":
    main()
