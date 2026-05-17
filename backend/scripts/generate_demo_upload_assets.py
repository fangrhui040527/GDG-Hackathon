from __future__ import annotations

from pathlib import Path
from textwrap import wrap


DESKTOP = Path.home() / "Desktop"


CVS = {
    "NexusAI_Demo_Set_1_Mentor_CV_Nadia_Rahman.pdf": {
        "name": "Dr. Nadia Rahman",
        "headline": "Partner, Climate Venture Studio",
        "contact": "nadia.rahman.demo@example.com | Malaysia | https://linkedin.com/in/nadia-rahman-demo",
        "summary": (
            "Climate technology investor and former energy executive who mentors founders on pilot design, "
            "fundraising, investor readiness, and enterprise sales. Nadia focuses on Personal Business-stage "
            "startups building sustainability, clean energy, and climate intelligence solutions across ASEAN."
        ),
        "experience": [
            (
                "Climate Venture Studio - Partner",
                "Leads venture-building programmes for climate and energy startups. Advises founders on commercial pilots, "
                "fundraising narratives, and enterprise partnership strategy.",
            ),
            (
                "Tenaga Innovation Lab - Head of Energy Ventures",
                "Built pilot pathways for solar, grid analytics, and battery optimization startups with commercial building operators.",
            ),
            (
                "ASEAN Green Fund - Venture Advisor",
                "Reviewed more than 120 early-stage climate deals and mentored founders on impact metrics and investor diligence.",
            ),
        ],
        "skills": [
            "Fundraising and investor relations",
            "Pilot design for sustainability startups",
            "Enterprise sales and partnership strategy",
            "Climate impact metrics and ESG reporting",
            "Mentoring capacity: 8 hours/month, up to 3 companies",
        ],
        "education": [
            "PhD, Energy Systems and Policy - University of Malaya",
            "MBA, Sustainable Finance - National University of Singapore",
        ],
        "matching": [
            "Preferred industry: Sustainability",
            "Preferred company stage: Personal Business",
            "Support offered: Fundraising & Investor Relations",
            "Availability: Available - actively accepting mentees",
        ],
    },
    "NexusAI_Demo_Set_2_Mentor_CV_Daniel_Koh.pdf": {
        "name": "Mr. Daniel Koh",
        "headline": "Regional Fintech Advisor, ASEAN Payments Council",
        "contact": "daniel.koh.demo@example.com | Singapore | https://linkedin.com/in/daniel-koh-demo",
        "summary": (
            "Regional fintech advisor who helps payment and embedded-finance companies prepare for licensing, bank partnerships, "
            "cross-border expansion, and enterprise sales. Daniel focuses on International Business-stage companies expanding "
            "across ASEAN markets."
        ),
        "experience": [
            (
                "ASEAN Payments Council - Regional Fintech Advisor",
                "Advises fintech companies on licensing readiness, bank partnership models, payment flows, and regional market access.",
            ),
            (
                "Straits Digital Bank - Director of Partnerships",
                "Built partnership programmes with payment orchestration startups, SME lending platforms, and compliance providers.",
            ),
            (
                "Monetary Innovation Sandbox - Mentor",
                "Supported fintech founders through regulatory sandbox preparation, risk reviews, and bank stakeholder presentations.",
            ),
        ],
        "skills": [
            "Business strategy for fintech scaleups",
            "Regional expansion and go-to-market",
            "Bank partnership development",
            "Licensing and compliance readiness",
            "Mentoring capacity: 6 hours/month, up to 2 companies",
        ],
        "education": [
            "MSc, Financial Technology - Singapore Management University",
            "BBA, Finance - National University of Singapore",
        ],
        "matching": [
            "Preferred industry: Fintech",
            "Preferred company stage: International Business",
            "Support offered: Business Strategy",
            "Availability: Limited - accepting 1-2 more",
        ],
    },
}


VIDEO_PROMPTS = """NexusAI Demo Video Generation Prompts
======================================

Video constraints for upload demo:
- Keep each video under 2MB.
- Recommended length: 15-20 seconds.
- Recommended resolution: 720p or lower.
- Format: MP4, WebM, or MOV.
- Avoid background music if file size is a concern.
- Use clear speech and simple visuals so Chirp/STT can transcribe cleanly.


DEMO SET 1 - Mentor Video Prompt
--------------------------------
Create a 15-second professional talking-head video of Dr. Nadia Rahman, a Malaysian climate technology investor and mentor. She is seated in a clean modern office with subtle sustainability visuals in the background, such as solar panels and energy dashboards on a screen. Natural lighting, realistic camera, stable framing, clear voice, no music.

Spoken script:
"Hi, I am Dr. Nadia Rahman from Climate Venture Studio. I mentor sustainability founders on pilot design, fundraising, and enterprise sales. I work best with Personal Business-stage startups that have a working MVP and clear climate impact."


DEMO SET 1 - Company Video Prompt
---------------------------------
Create a 15-second startup intro video for HelioGrid Analytics. Show a small commercial building, solar panels, a simple energy dashboard, and a founder presenting in a bright workspace. Professional but startup-friendly style, realistic footage, clear narration, no music.

Spoken script:
"HelioGrid Analytics helps small commercial buildings reduce energy costs using AI forecasts for solar generation, battery usage, and peak demand charges. We are looking for fundraising support and pilot partners in Malaysia."


DEMO SET 2 - Mentor Video Prompt
--------------------------------
Create a 15-second professional talking-head video of Mr. Daniel Koh, a Singapore-based regional fintech advisor. He is in a modern meeting room with a payments dashboard and ASEAN map on a screen behind him. Realistic business style, stable camera, clear voice, no music.

Spoken script:
"Hi, I am Daniel Koh from the ASEAN Payments Council. I advise fintech companies on licensing, bank partnerships, regional expansion, and enterprise sales. I support International Business-stage companies expanding across ASEAN."


DEMO SET 2 - Company Video Prompt
---------------------------------
Create a 15-second fintech company intro video for PayLink Nexus. Show a simple cross-border payments dashboard, SME business owners, and ASEAN transaction flow visuals. Clean startup presentation style, realistic footage, clear narration, no music.

Spoken script:
"PayLink Nexus provides cross-border payment orchestration for SMEs expanding across ASEAN. Our platform supports compliance routing, FX monitoring, and settlement analytics. We are seeking market access and distribution partners."
"""


def escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_pdf(path: Path, cv: dict[str, object]) -> None:
    sections: list[tuple[str, list[str]]] = [
        ("PROFILE", [cv["summary"]]),  # type: ignore[list-item]
        ("EXPERIENCE", [f"{title}: {body}" for title, body in cv["experience"]]),  # type: ignore[index]
        ("CORE SUPPORT AREAS", cv["skills"]),  # type: ignore[arg-type]
        ("EDUCATION", cv["education"]),  # type: ignore[arg-type]
        ("NEXUSAI MATCHING FIELDS", cv["matching"]),  # type: ignore[arg-type]
    ]

    lines = [
        ("title", str(cv["name"])),
        ("subtitle", str(cv["headline"])),
        ("body", str(cv["contact"])),
        ("space", ""),
    ]
    for heading, values in sections:
        lines.append(("heading", heading))
        for value in values:
            wrapped = wrap(str(value), width=92)
            for index, line in enumerate(wrapped):
                prefix = "- " if index == 0 and heading not in {"PROFILE"} else "  " if index else ""
                lines.append(("body", f"{prefix}{line}"))
        lines.append(("space", ""))

    pages: list[list[tuple[str, str]]] = []
    current: list[tuple[str, str]] = []
    used = 0
    for kind, text in lines:
        height = 2 if kind == "space" else 1
        if used + height > 43:
            pages.append(current)
            current = []
            used = 0
        current.append((kind, text))
        used += height
    if current:
        pages.append(current)

    objects: list[bytes] = []
    page_ids: list[int] = []
    content_ids: list[int] = []

    def add_object(data: bytes) -> int:
        objects.append(data)
        return len(objects)

    pages_id = add_object(b"")
    font_id = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    bold_font_id = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    for page in pages:
        content_lines = ["BT", "72 742 Td"]
        first = True
        for kind, text in page:
            if kind == "space":
                content_lines.append("0 -18 Td")
                first = False
                continue
            font = f"/F{bold_font_id} 18 Tf" if kind == "title" else f"/F{bold_font_id} 11 Tf" if kind in {"subtitle", "heading"} else f"/F{font_id} 9 Tf"
            leading = 22 if kind == "title" else 16 if kind == "subtitle" else 15 if kind == "heading" else 12
            if first:
                content_lines.append(font)
                first = False
            else:
                content_lines.append(f"0 -{leading} Td")
                content_lines.append(font)
            content_lines.append(f"({escape_pdf_text(text)}) Tj")
        content_lines.append("ET")
        stream = "\n".join(content_lines).encode("latin-1", "replace")
        content_id = add_object(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream")
        page_id = add_object(
            (
                f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 612 792] "
                f"/Resources << /Font << /F{font_id} {font_id} 0 R /F{bold_font_id} {bold_font_id} 0 R >> >> "
                f"/Contents {content_id} 0 R >>"
            ).encode()
        )
        content_ids.append(content_id)
        page_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode()
    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode())

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode())
        output.extend(obj)
        output.extend(b"\nendobj\n")
    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode())
    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode()
    )
    path.write_bytes(output)


def main() -> None:
    DESKTOP.mkdir(parents=True, exist_ok=True)
    for filename, cv in CVS.items():
        path = DESKTOP / filename
        build_pdf(path, cv)
        print(path)

    prompts_path = DESKTOP / "NexusAI_Demo_Video_Prompts_Two_Sets.txt"
    prompts_path.write_text(VIDEO_PROMPTS, encoding="utf-8")
    print(prompts_path)


if __name__ == "__main__":
    main()
