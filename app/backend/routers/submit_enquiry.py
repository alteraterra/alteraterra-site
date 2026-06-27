import logging
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from services.enquiries import EnquiriesService
from services.email_service import (
    send_notification_to_team,
    send_auto_response,
    get_resend_api_key,
    validate_email,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/enquiry", tags=["enquiry"])


@router.post("/submit")
async def submit_enquiry(request: Request):
    """Submit an enquiry - no auth required (public endpoint).

    Returns success ONLY when BOTH emails are sent successfully.
    Database save is attempted but does not block email delivery.
    """
    # Parse request body
    try:
        body = await request.json()
    except Exception:
        logger.warning("ENQUIRY_REJECTED: Invalid request body (JSON parse failed)")
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Invalid request body"},
        )

    # Extract and sanitize fields
    full_name = (body.get("full_name") or "").strip()
    email_raw = (body.get("email") or "").strip()
    phone = (body.get("phone") or "").strip()
    area_of_interest = (body.get("area_of_interest") or "").strip()
    message = (body.get("message") or "").strip()

    # Validate required fields
    if not full_name or not email_raw or not area_of_interest or not message:
        logger.warning(
            f"ENQUIRY_REJECTED: Missing required fields. "
            f"name={'yes' if full_name else 'no'}, "
            f"email={'yes' if email_raw else 'no'}, "
            f"interest={'yes' if area_of_interest else 'no'}, "
            f"message={'yes' if message else 'no'}"
        )
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Missing required fields"},
        )

    # Validate and sanitize email
    is_valid, email_result = validate_email(email_raw)
    if not is_valid:
        logger.warning(f"ENQUIRY_REJECTED: Invalid email '{email_raw}' - {email_result}")
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": f"Invalid email address: {email_result}"},
        )
    email = email_result  # Sanitized, lowercase, trimmed email

    # Check API key availability early
    api_key = get_resend_api_key()
    if not api_key:
        logger.error("ENQUIRY_BLOCKED: Email service unavailable - API key not configured")
        return JSONResponse(
            status_code=200,
            content={
                "success": False,
                "message": "We were unable to process your enquiry at this time. Please try again or contact us directly at enquire@alteraterra.vip.",
            },
        )

    # Log the enquiry submission
    logger.info(
        f"ENQUIRY_RECEIVED: name='{full_name}', email='{email}', "
        f"interest='{area_of_interest}', phone='{phone or 'none'}'"
    )

    enquiry_data = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "area_of_interest": area_of_interest,
        "message": message,
        "created_at": datetime.now(),
    }

    # 1. Store enquiry in database (non-blocking)
    try:
        from core.database import get_db as get_db_gen
        async for db in get_db_gen():
            try:
                service = EnquiriesService(db)
                await service.create(enquiry_data.copy())
                logger.info(f"ENQUIRY_SAVED: email='{email}' saved to database")
            except Exception as e:
                logger.error(f"ENQUIRY_DB_ERROR: Failed to save for email='{email}': {e}")
            break
    except Exception as e:
        logger.error(f"ENQUIRY_DB_CONNECTION_ERROR: {e}")

    # 2. Send notification email to team
    team_email_sent = False
    team_message_id = None
    try:
        team_result = await send_notification_to_team(enquiry_data)
        team_email_sent = team_result.get("success", False)
        team_message_id = team_result.get("message_id")
        if team_email_sent:
            logger.info(f"ENQUIRY_TEAM_EMAIL_OK: message_id={team_message_id}")
        else:
            logger.error(f"ENQUIRY_TEAM_EMAIL_FAILED: error={team_result.get('error')}, details={team_result.get('details')}")
    except Exception as e:
        logger.error(f"ENQUIRY_TEAM_EMAIL_EXCEPTION: {type(e).__name__}: {e}")

    # 3. Send auto-response to client
    client_email_sent = False
    client_message_id = None
    try:
        client_result = await send_auto_response(email)
        client_email_sent = client_result.get("success", False)
        client_message_id = client_result.get("message_id")
        if client_email_sent:
            logger.info(f"ENQUIRY_CLIENT_EMAIL_OK: to='{email}', message_id={client_message_id}")
        else:
            logger.error(f"ENQUIRY_CLIENT_EMAIL_FAILED: to='{email}', error={client_result.get('error')}, details={client_result.get('details')}")
    except Exception as e:
        logger.error(f"ENQUIRY_CLIENT_EMAIL_EXCEPTION: to='{email}', {type(e).__name__}: {e}")

    # Success requires BOTH emails sent
    if team_email_sent and client_email_sent:
        logger.info(
            f"ENQUIRY_COMPLETE: email='{email}', "
            f"team_msg_id={team_message_id}, client_msg_id={client_message_id}"
        )
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": None},
        )

    # Partial or total failure
    logger.error(
        f"ENQUIRY_PARTIAL_FAILURE: email='{email}', "
        f"team={'sent' if team_email_sent else 'FAILED'}, "
        f"client={'sent' if client_email_sent else 'FAILED'}"
    )
    return JSONResponse(
        status_code=200,
        content={
            "success": False,
            "message": "We encountered an issue sending confirmation emails. Please try again or contact us directly at enquire@alteraterra.vip.",
        },
    )