"""Email sender — SMTP or Resend."""
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from nexusai.config import Settings


class EmailService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.dry_run = settings.email_outbox_dry_run

    def send(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        attachments: list[tuple[str, bytes]] | None = None,
    ) -> dict:
        if self.dry_run:
            return {"status": "dry_run", "to": to_email, "subject": subject}

        if self.settings.email_provider == "smtp":
            return self._send_smtp(to_email, subject, html_body, attachments)
        return {"status": "unsupported_provider"}

    def _send_smtp(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        attachments: list[tuple[str, bytes]] | None = None,
    ) -> dict:
        msg = MIMEMultipart()
        msg["From"] = f"{self.settings.smtp_from_name} <{self.settings.smtp_from_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        if attachments:
            for filename, data in attachments:
                part = MIMEApplication(data, Name=filename)
                part["Content-Disposition"] = f'attachment; filename="{filename}"'
                msg.attach(part)

        try:
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port) as server:
                server.ehlo()
                server.starttls()
                server.login(self.settings.smtp_user or "", self.settings.smtp_password or "")
                server.sendmail(msg["From"], [to_email], msg.as_string())
            return {"status": "sent", "to": to_email}
        except Exception as e:
            return {"status": "failed", "to": to_email, "error": str(e)}
