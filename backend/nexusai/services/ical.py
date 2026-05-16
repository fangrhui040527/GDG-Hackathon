"""iCal (.ics) file builder."""
from datetime import datetime, timedelta


def build_ics(
    summary: str,
    description: str,
    start: datetime,
    duration_minutes: int = 60,
    location: str = "",
    organizer_email: str = "nexusai@example.com",
) -> bytes:
    """Build a minimal RFC 5545 .ics file as bytes."""
    end = start + timedelta(minutes=duration_minutes)
    now = datetime.utcnow()

    def _fmt(dt: datetime) -> str:
        return dt.strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//NexusAI//Matching//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        f"DTSTART:{_fmt(start)}",
        f"DTEND:{_fmt(end)}",
        f"DTSTAMP:{_fmt(now)}",
        f"ORGANIZER;CN=NexusAI:mailto:{organizer_email}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(lines).encode("utf-8")
