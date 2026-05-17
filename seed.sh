#!/usr/bin/env bash
# seed.sh — Populate YokoYoko AI backend with demo data via API calls
# Usage: bash seed.sh

API="http://localhost:8000"

echo "=== Seeding Programmes ==="

curl -s -X POST "$API/programmes" -H "Content-Type: application/json" -d '{
  "name": "Global FinTech Accelerator 2026",
  "description": "A 12-week intensive programme connecting high-growth fintech startups with industry mentors, corporate partners, and investors across ASEAN. Focused on payments, digital banking, and embedded finance.",
  "category": "Fintech",
  "start_date": "2026-06-01",
  "end_date": "2026-08-22",
  "target_industry": "Financial Technology",
  "target_country": "Malaysia",
  "target_company_stage": "Growth",
  "required_mentors": 5,
  "required_companies": 10,
  "required_partners": 4,
  "required_service_providers": 3,
  "eligibility_criteria": "Fintech startups with at least MVP stage product and $100K+ ARR. Must be registered in ASEAN.",
  "organiser_name": "Sarah Chen"
}' && echo ""

curl -s -X POST "$API/programmes" -H "Content-Type: application/json" -d '{
  "name": "HealthTech Innovation Lab",
  "description": "Bridging the gap between healthcare providers and technology innovators. This programme pairs digital health startups with hospital networks, pharma companies, and regulatory experts across Southeast Asia.",
  "category": "Healthcare",
  "start_date": "2026-07-15",
  "end_date": "2026-10-15",
  "target_industry": "Healthcare & Life Sciences",
  "target_country": "Singapore",
  "target_company_stage": "Seed",
  "required_mentors": 6,
  "required_companies": 8,
  "required_partners": 4,
  "required_service_providers": 3,
  "eligibility_criteria": "HealthTech startups focused on telemedicine, diagnostics, or patient data management. Must have pilot deployments.",
  "organiser_name": "Sarah Chen"
}' && echo ""

curl -s -X POST "$API/programmes" -H "Content-Type: application/json" -d '{
  "name": "GreenTech Sustainability Challenge",
  "description": "Connecting cleantech and sustainability-focused startups with ESG-committed corporates, green finance partners, and carbon credit experts to accelerate climate solutions in the region.",
  "category": "Sustainability",
  "start_date": "2026-08-01",
  "end_date": "2026-11-30",
  "target_industry": "Clean Energy & Sustainability",
  "target_country": "Indonesia",
  "target_company_stage": "Early",
  "required_mentors": 4,
  "required_companies": 12,
  "required_partners": 5,
  "required_service_providers": 3,
  "eligibility_criteria": "Startups working on renewable energy, carbon reduction, circular economy, or sustainable agriculture. ASEAN-based or willing to relocate.",
  "organiser_name": "Sarah Chen"
}' && echo ""

curl -s -X POST "$API/programmes" -H "Content-Type: application/json" -d '{
  "name": "EdTech Mentorship Network",
  "description": "A mentor-matching programme connecting education technology founders with experienced educators, curriculum designers, and ed-investors to scale learning platforms across developing markets.",
  "category": "Education",
  "start_date": "2026-09-01",
  "end_date": "2026-12-15",
  "target_industry": "Education Technology",
  "target_country": "Philippines",
  "target_company_stage": "Pre-seed",
  "required_mentors": 8,
  "required_companies": 6,
  "required_partners": 3,
  "required_service_providers": 2,
  "eligibility_criteria": "EdTech startups targeting K-12 or workforce upskilling in underserved communities.",
  "organiser_name": "Sarah Chen"
}' && echo ""

curl -s -X POST "$API/programmes" -H "Content-Type: application/json" -d '{
  "name": "Smart City IoT Partnership",
  "description": "Facilitating partnerships between IoT/smart city startups and municipal governments, telcos, and infrastructure companies to deploy urban technology solutions at scale.",
  "category": "Smart City",
  "start_date": "2026-06-15",
  "end_date": "2026-09-15",
  "target_industry": "IoT & Smart Infrastructure",
  "target_country": "Thailand",
  "target_company_stage": "Series A",
  "required_mentors": 4,
  "required_companies": 8,
  "required_partners": 6,
  "required_service_providers": 4,
  "eligibility_criteria": "IoT startups with proven deployments in urban mobility, waste management, or energy grid optimization.",
  "organiser_name": "Sarah Chen"
}' && echo ""

echo ""
echo "=== Submitting Programmes 1, 2, 3 ==="
curl -s -X POST "$API/programmes/1/submit" && echo ""
curl -s -X POST "$API/programmes/2/submit" && echo ""
curl -s -X POST "$API/programmes/3/submit" && echo ""

echo ""
echo "=== Approving Programme 1 & 5 ==="
curl -s -X POST "$API/programmes/1/approve" && echo ""
curl -s -X POST "$API/programmes/5/submit" && echo ""
curl -s -X POST "$API/programmes/5/approve" && echo ""

echo ""
echo "=== Publishing Programme 1 ==="
curl -s -X POST "$API/programmes/1/publish" && echo ""

echo ""
echo "=== Seeding Mentors ==="

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Dr. Ahmad Farouk",
  "email": "ahmad.farouk@mentors.my",
  "industries": ["Fintech", "Digital Banking"],
  "support_types": ["Strategic Advisory", "Fundraising"],
  "stages": ["Growth", "Series A"],
  "languages": ["English", "Malay"],
  "bio": "Former CTO of CIMB Digital with 15 years in banking technology. Helped 12 startups raise Series A rounds."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Ms. Priya Nair",
  "email": "priya.nair@venturecap.sg",
  "industries": ["Fintech", "Payments"],
  "support_types": ["Product Strategy", "Market Expansion"],
  "stages": ["Seed", "Growth"],
  "languages": ["English", "Tamil", "Mandarin"],
  "bio": "Partner at GGV Capital, previously VP Product at Stripe Asia. Deep expertise in cross-border payments."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Dr. Sarah Lim",
  "email": "sarah.lim@healthtech.sg",
  "industries": ["Healthcare", "Biotech"],
  "support_types": ["Clinical Validation", "Regulatory Strategy"],
  "stages": ["Seed", "Early"],
  "languages": ["English", "Mandarin"],
  "bio": "Chief Medical Officer at National University Hospital. Led digital health transformation across 3 hospital networks."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Prof. Wijaya Kusuma",
  "email": "wijaya.k@greeninnovation.id",
  "industries": ["Sustainability", "Clean Energy"],
  "support_types": ["Technical Advisory", "Policy Navigation"],
  "stages": ["Early", "Growth"],
  "languages": ["English", "Bahasa Indonesia"],
  "bio": "Professor of Environmental Engineering at ITB. Advisor to Indonesia Ministry of Energy on renewable transition policy."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Mr. Lee Wei Liang",
  "email": "weiliang@smartcity.my",
  "industries": ["Smart City", "IoT"],
  "support_types": ["Business Development", "Government Relations"],
  "stages": ["Series A", "Series B"],
  "languages": ["English", "Mandarin", "Malay"],
  "bio": "Ex-CEO of Smart Selangor. Connected IoT startups with 5 municipal governments across Malaysia."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Prof. Maria Santos",
  "email": "maria.santos@edtech.ph",
  "industries": ["Education", "Social Impact"],
  "support_types": ["Curriculum Design", "Impact Measurement"],
  "stages": ["Pre-seed", "Seed"],
  "languages": ["English", "Filipino"],
  "bio": "Dean of Education at Ateneo de Manila. Designed digital literacy programmes reaching 500K students in rural Philippines."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Tan Sri Azman Mokhtar",
  "email": "azman.m@investment.my",
  "industries": ["Investment", "Fintech", "Infrastructure"],
  "support_types": ["Strategic Advisory", "Board Governance"],
  "stages": ["Growth", "Series B"],
  "languages": ["English", "Malay"],
  "bio": "Former MD of Khazanah Nasional. 25+ years steering sovereign wealth investments across technology sectors."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Dr. Supatra Charoenpong",
  "email": "supatra@iot-thai.co.th",
  "industries": ["IoT", "Smart City", "Logistics"],
  "support_types": ["Technical Architecture", "Pilot Design"],
  "stages": ["Seed", "Series A"],
  "languages": ["English", "Thai"],
  "bio": "Founder of ThaiIoT Consortium. Deployed 200+ sensor networks across Bangkok and Chiang Mai."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Mr. Rajesh Patel",
  "email": "rajesh.patel@fintech.in",
  "industries": ["Fintech", "Embedded Finance"],
  "support_types": ["Fundraising", "Go-to-Market"],
  "stages": ["Growth", "Series A"],
  "languages": ["English", "Hindi"],
  "bio": "Co-founder of Razorpay (exited). Angel investor in 30+ ASEAN fintech startups with combined $2B valuation."
}' && echo ""

curl -s -X POST "$API/profiles/mentors" -H "Content-Type: application/json" -d '{
  "full_name": "Dr. Nguyen Thanh",
  "email": "thanh.nguyen@vn-health.vn",
  "industries": ["Healthcare", "Telemedicine"],
  "support_types": ["Market Entry", "Clinical Trials"],
  "stages": ["Seed", "Early"],
  "languages": ["English", "Vietnamese"],
  "bio": "CEO of VinMec Digital Health. Scaled telemedicine platform to 2M patients across Vietnam."
}' && echo ""

echo ""
echo "=== Seeding Companies ==="

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "Axiata Digital",
  "industry": "Fintech",
  "stage": "Growth",
  "support_needed": ["Mentorship", "Market Expansion", "Partnership"],
  "languages": ["English", "Malay"],
  "description": "Leading digital financial services provider in Malaysia. Operating Boost eWallet with 10M+ users."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "Grab Financial Group",
  "industry": "Fintech",
  "stage": "Growth",
  "support_needed": ["Regulatory Guidance", "Partnership"],
  "languages": ["English", "Mandarin", "Malay"],
  "description": "Southeast Asias largest fintech platform. Operates digital banking, payments, and insurance across 8 markets."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "Biofourmis",
  "industry": "Healthcare",
  "stage": "Series B",
  "support_needed": ["Clinical Validation", "Hospital Partnerships"],
  "languages": ["English"],
  "description": "AI-powered remote patient monitoring platform. FDA-cleared digital therapeutics for chronic disease management."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "Naluri Hidup",
  "industry": "Healthcare",
  "stage": "Seed",
  "support_needed": ["Mentorship", "Fundraising", "Clinical Pilots"],
  "languages": ["English", "Malay"],
  "description": "Digital mental health platform combining AI coaching with licensed therapists. Partnered with 50+ corporates in Malaysia."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "SolarAI Labs",
  "industry": "Clean Energy",
  "stage": "Early",
  "support_needed": ["Technical Mentorship", "Government Relations", "Fundraising"],
  "languages": ["English", "Bahasa Indonesia"],
  "description": "Using AI to optimize solar farm placement and output prediction. Deployed across 15 sites in Java and Sumatra."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "SmartTraffic.io",
  "industry": "Smart City",
  "stage": "Series A",
  "support_needed": ["Government Partnerships", "Scale Engineering"],
  "languages": ["English", "Thai"],
  "description": "AI-powered traffic management system reducing congestion by 35% in Bangkok pilot. Real-time optimization across 500+ intersections."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "Ruangguru",
  "industry": "Education",
  "stage": "Series C",
  "support_needed": ["Market Expansion", "Content Partnership"],
  "languages": ["English", "Bahasa Indonesia"],
  "description": "Indonesias largest edtech platform with 22M+ users. Provides K-12 tutoring, test prep, and skill courses."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "EcoCharge Systems",
  "industry": "Sustainability",
  "stage": "Seed",
  "support_needed": ["Technical Mentorship", "Pilot Partners", "Fundraising"],
  "languages": ["English", "Thai"],
  "description": "EV charging infrastructure with integrated solar storage. Operating 80 stations across Bangkok with 99.5% uptime."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "TouchNGo eWallet",
  "industry": "Fintech",
  "stage": "Growth",
  "support_needed": ["Partnership", "Market Expansion"],
  "languages": ["English", "Malay"],
  "description": "Malaysias leading e-wallet with 20M+ users. Expanding into cross-border payments and micro-lending."
}' && echo ""

curl -s -X POST "$API/profiles/companies" -H "Content-Type: application/json" -d '{
  "company_name": "GoTo Financial",
  "industry": "Fintech",
  "stage": "Growth",
  "support_needed": ["Regulatory Guidance", "Partnership"],
  "languages": ["English", "Bahasa Indonesia"],
  "description": "Indonesias integrated financial services arm of GoTo Group. Serves 55M+ annual transacting users."
}' && echo ""

echo ""
echo "=== Seeding Partners ==="

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "Khazanah Nasional",
  "contact_email": "ecosystem@khazanah.com.my",
  "partnership_type": "Investment",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "Temasek Holdings",
  "contact_email": "ventures@temasek.com.sg",
  "partnership_type": "Investment",
  "country": "Singapore"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "MDEC",
  "contact_email": "startups@mdec.my",
  "partnership_type": "Government",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "Cradle Fund",
  "contact_email": "applications@cradle.com.my",
  "partnership_type": "Venture Capital",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "Bank Negara Malaysia",
  "contact_email": "fintech.sandbox@bnm.gov.my",
  "partnership_type": "Regulatory",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "GreenFinance Asia",
  "contact_email": "impact@greenfinance.asia",
  "partnership_type": "ESG Finance",
  "country": "Singapore"
}' && echo ""

curl -s -X POST "$API/profiles/partners" -H "Content-Type: application/json" -d '{
  "organisation_name": "Bangkok Metropolitan Authority",
  "contact_email": "smartcity@bma.go.th",
  "partnership_type": "Government",
  "country": "Thailand"
}' && echo ""

echo ""
echo "=== Seeding Service Providers ==="

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "AWS Startup Loft",
  "contact_email": "startups-apac@aws.amazon.com",
  "service_type": "Cloud Infrastructure",
  "country": "Singapore"
}' && echo ""

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "KPMG Advisory",
  "contact_email": "startup.advisory@kpmg.com.my",
  "service_type": "Audit & Compliance",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "Baker McKenzie",
  "contact_email": "startups@bakermckenzie.sg",
  "service_type": "Legal",
  "country": "Singapore"
}' && echo ""

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "Google Cloud for Startups",
  "contact_email": "cloud-startups@google.com",
  "service_type": "Cloud Infrastructure",
  "country": "Singapore"
}' && echo ""

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "PwC Digital",
  "contact_email": "digital.advisory@pwc.com.my",
  "service_type": "Consulting",
  "country": "Malaysia"
}' && echo ""

curl -s -X POST "$API/profiles/service-providers" -H "Content-Type: application/json" -d '{
  "company_name": "Stripe Atlas",
  "contact_email": "atlas-apac@stripe.com",
  "service_type": "Payments Infrastructure",
  "country": "Singapore"
}' && echo ""

echo ""
echo "=== Seeding Shortlist for Programme 1 ==="

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-1",
  "actor_id": "1",
  "actor_type": "mentor",
  "actor_name": "Dr. Ahmad Farouk",
  "match_score": 94
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-2",
  "actor_id": "2",
  "actor_type": "mentor",
  "actor_name": "Ms. Priya Nair",
  "match_score": 91
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-3",
  "actor_id": "9",
  "actor_type": "mentor",
  "actor_name": "Mr. Rajesh Patel",
  "match_score": 88
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-4",
  "actor_id": "11",
  "actor_type": "company",
  "actor_name": "Axiata Digital",
  "match_score": 96
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-5",
  "actor_id": "12",
  "actor_type": "company",
  "actor_name": "Grab Financial Group",
  "match_score": 93
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-6",
  "actor_id": "21",
  "actor_type": "partner",
  "actor_name": "Khazanah Nasional",
  "match_score": 97
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-7",
  "actor_id": "25",
  "actor_type": "partner",
  "actor_name": "Bank Negara Malaysia",
  "match_score": 95
}' && echo ""

curl -s -X POST "$API/programmes/1/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-8",
  "actor_id": "28",
  "actor_type": "service_provider",
  "actor_name": "AWS Startup Loft",
  "match_score": 89
}' && echo ""

echo ""
echo "=== Seeding Shortlist for Programme 2 ==="

curl -s -X POST "$API/programmes/2/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-9",
  "actor_id": "3",
  "actor_type": "mentor",
  "actor_name": "Dr. Sarah Lim",
  "match_score": 97
}' && echo ""

curl -s -X POST "$API/programmes/2/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-10",
  "actor_id": "13",
  "actor_type": "company",
  "actor_name": "Biofourmis",
  "match_score": 95
}' && echo ""

curl -s -X POST "$API/programmes/2/shortlist" -H "Content-Type: application/json" -d '{
  "match_result_id": "match-11",
  "actor_id": "14",
  "actor_type": "company",
  "actor_name": "Naluri Hidup",
  "match_score": 92
}' && echo ""

echo ""
echo "=== Done! All data seeded successfully ==="
echo "Programmes: 5 (1 published, 1 approved, 2 submitted, 1 draft)"
echo "Mentors: 10"
echo "Companies: 10"
echo "Partners: 7"
echo "Service Providers: 6"
echo "Shortlist items: 11 (8 for Programme 1, 3 for Programme 2)"
