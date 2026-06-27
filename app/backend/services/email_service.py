import json
import os
import re
import logging
from pathlib import Path
import httpx

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
SENDER_EMAIL = "Altera Terra <enquire@alteraterra.vip>"
REPLY_TO_EMAIL = "enquire@alteraterra.vip"
TEAM_EMAIL = "enquire@alteraterra.vip"


def get_resend_api_key() -> str | None:
    """Get RESEND_API_KEY from environment variable first, then fall back to secrets.json."""
    # Try environment variable first
    api_key = os.environ.get("RESEND_API_KEY")
    if api_key:
        return api_key

    # Fall back to secrets.json file - try multiple possible locations
    possible_paths = [
        Path(__file__).parent.parent / "secrets.json",
        Path("/var/task/backend/secrets.json"),
        Path("/var/task/secrets.json"),
        Path(os.getcwd()) / "secrets.json",
    ]

    for secrets_path in possible_paths:
        if secrets_path.exists():
            try:
                with open(secrets_path, "r") as f:
                    secrets = json.load(f)
                api_key = secrets.get("RESEND_API_KEY")
                if api_key:
                    return api_key
            except Exception as e:
                logger.error(f"Failed to read secrets file: {e}")

    return None


def validate_email(email: str) -> tuple[bool, str]:
    """Validate and sanitize an email address.

    Returns:
        tuple: (is_valid, sanitized_email_or_error_message)
    """
    if not email:
        return False, "Email address is required"

    # Trim whitespace
    email = email.strip()

    # Convert to lowercase
    email = email.lower()

    # Basic regex validation for email format
    email_pattern = re.compile(
        r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
    )

    if not email_pattern.match(email):
        return False, "Invalid email format"

    # Check for common invalid patterns
    if ".." in email:
        return False, "Invalid email format"

    # Must have at least one dot after @
    domain_part = email.split("@")[1] if "@" in email else ""
    if "." not in domain_part:
        return False, "Invalid email domain"

    # Reject obviously fake/test domains
    blocked_domains = ["example.com", "test.com", "fake.com", "mailinator.com"]
    if domain_part in blocked_domains:
        return False, "Email domain not accepted"

    return True, email


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    from_email: str = SENDER_EMAIL,
    reply_to: str = REPLY_TO_EMAIL,
    bcc: list[str] | None = None,
    headers: dict | None = None,
) -> dict:
    """Send an email via Resend API with full deliverability headers.

    Returns dict with success status and message_id if successful.
    """
    api_key = get_resend_api_key()

    if not api_key:
        logger.error("EMAIL_SEND_FAILED: API key not configured")
        return {"success": False, "error": "API key not configured"}

    request_headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "from": from_email,
        "to": [to] if isinstance(to, str) else to,
        "subject": subject,
        "html": html_body,
        "reply_to": reply_to,
    }

    # Add BCC if specified
    if bcc:
        payload["bcc"] = bcc

    # Add custom headers for deliverability
    email_headers = {
        "X-Entity-Ref-ID": None,  # Prevents threading in Gmail
    }
    if headers:
        email_headers.update(headers)

    # Only add non-None headers
    filtered_headers = {k: v for k, v in email_headers.items() if v is not None}
    if filtered_headers:
        payload["headers"] = filtered_headers

    # Production logging: log the payload (without API key)
    logger.info(
        f"EMAIL_SENDING: to={payload['to']}, subject='{subject}', "
        f"from={from_email}, reply_to={reply_to}, "
        f"bcc={bcc or 'none'}"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RESEND_API_URL,
                json=payload,
                headers=request_headers,
                timeout=30.0,
            )

            response_data = None
            try:
                response_data = response.json()
            except Exception:
                response_data = {"raw": response.text}

            if response.status_code in (200, 201):
                message_id = response_data.get("id", "unknown")
                logger.info(
                    f"EMAIL_SENT_SUCCESS: to={payload['to']}, "
                    f"message_id={message_id}, "
                    f"status_code={response.status_code}"
                )
                return {"success": True, "message_id": message_id}
            else:
                logger.error(
                    f"EMAIL_SEND_FAILED: to={payload['to']}, "
                    f"status_code={response.status_code}, "
                    f"response={json.dumps(response_data)}"
                )
                return {
                    "success": False,
                    "error": f"API returned {response.status_code}",
                    "details": response_data,
                }

    except httpx.TimeoutException:
        logger.error(f"EMAIL_TIMEOUT: to={payload['to']}, timeout=30s")
        return {"success": False, "error": "Request timed out"}
    except httpx.ConnectError:
        logger.error(f"EMAIL_CONNECTION_ERROR: Cannot reach Resend API")
        return {"success": False, "error": "Connection error"}
    except Exception as e:
        logger.error(f"EMAIL_EXCEPTION: to={payload['to']}, error={type(e).__name__}: {e}")
        return {"success": False, "error": f"Unexpected error: {type(e).__name__}"}


async def send_notification_to_team(enquiry_data: dict) -> dict:
    """Send internal notification email to enquire@alteraterra.vip.

    From: Altera Terra <enquire@alteraterra.vip>
    To: enquire@alteraterra.vip
    Reply-To: enquire@alteraterra.vip
    """
    subject = "New Consultation Request — Altera Terra"
    html_body = f"""
    <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #D4885A; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-size: 14px;">New Consultation Request</h2>
        <hr style="border: none; border-top: 1px solid #D4885A; opacity: 0.3; margin: 20px 0;" />
        <p><strong>Name:</strong> {enquiry_data.get('full_name', '')}</p>
        <p><strong>Email:</strong> {enquiry_data.get('email', '')}</p>
        <p><strong>Phone:</strong> {enquiry_data.get('phone', 'Not provided')}</p>
        <p><strong>Area of Interest:</strong> {enquiry_data.get('area_of_interest', '')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; line-height: 1.8;">{enquiry_data.get('message', '')}</p>
        <hr style="border: none; border-top: 1px solid #D4885A; opacity: 0.3; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">This enquiry was submitted via the Altera Terra website.</p>
    </div>
    """

    logger.info(f"EMAIL_TEAM_NOTIFICATION: Sending to {TEAM_EMAIL}")

    return await send_email(
        to=TEAM_EMAIL,
        subject=subject,
        html_body=html_body,
        from_email=SENDER_EMAIL,
        reply_to=enquiry_data.get("email", REPLY_TO_EMAIL),
    )


async def send_auto_response(to_email: str) -> dict:
    """Send auto-response confirmation to the client.

    From: Altera Terra <enquire@alteraterra.vip>
    To: <client email>
    Reply-To: enquire@alteraterra.vip
    BCC: enquire@alteraterra.vip
    """
    subject = "Your enquiry has been received — Altera Terra"
    html_body = """
    <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 30px;">
        <p style="line-height: 1.9; font-size: 15px;">Dear Visionary,</p>
        <p style="line-height: 1.9; font-size: 15px;">Your message has been received, and with it, the first note of a possible journey.</p>
        <p style="line-height: 1.9; font-size: 15px;">At Altera Terra, we do not see enquiries as transactions, but as the early expression of something more singular: a desire, a perspective, a world waiting to be shaped with nuance and intention.</p>
        <p style="line-height: 1.9; font-size: 15px;">Please allow us a little time to return to you with the consideration your message deserves.</p>
        <p style="line-height: 1.9; font-size: 15px;">We will be in touch shortly.</p>
        <br />
        <p style="line-height: 1.9; font-size: 15px;">Yours faithfully,</p>
        <p style="line-height: 1.9; font-size: 15px; color: #D4885A; letter-spacing: 1px;">Altera Terra</p>
    </div>
    """

    logger.info(f"EMAIL_CLIENT_CONFIRMATION: Sending to {to_email}")

    return await send_email(
        to=to_email,
        subject=subject,
        html_body=html_body,
        from_email=SENDER_EMAIL,
        reply_to=REPLY_TO_EMAIL,
        bcc=[TEAM_EMAIL],
    )