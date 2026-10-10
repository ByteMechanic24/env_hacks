"""
Project Awaaz — ElevenLabs / Exotel call worker
AWS Lambda runtime: Python 3.12
Region: ap-south-1

Preserves the existing SQS event format, DynamoDB table names, call reservation
strategy, resident key format, and structured logging from the supplied worker.

Secret JSON keys required:
  ELEVENLABS_API_KEY
  AGENT_ID
  AGENT_PHONE_NUMBER_ID

Optional:
  TEST_TO_NUMBER (not used automatically; recipient comes from SQS body.phone)

Important:
- DRY_RUN=true or LIVE_CALLS_ENABLED!=true prevents outbound calls.
- A call reservation is written before the provider request. A retry of the same
  SQS message is suppressed to reduce duplicate-call risk.
- If the provider outcome is uncertain, check ElevenLabs/Exotel before manually
  retrying. No code can guarantee exactly-once behavior across an external API.
"""

import hashlib
import json
import logging
import os
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

import boto3
from botocore.exceptions import BotoCoreError, ClientError


# ---------------------------------------------------------------------------
# 1. Configuration — retain the legacy table names from the uploaded file.
# ---------------------------------------------------------------------------

REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")
TABLE_NAME = os.environ.get("TABLE_NAME", "resident_data")
LOG_TABLE = os.environ.get("LOG_TABLE", "call_logs")
SECRET_NAME = os.environ.get("SECRET_NAME", "secret/exotel/elevenlabs")

LIVE_CALLS_ENABLED = (
    os.environ.get("LIVE_CALLS_ENABLED", "false").strip().lower() == "true"
)
DRY_RUN = os.environ.get("DRY_RUN", "true").strip().lower() == "true"
HTTP_TIMEOUT_SECONDS = int(os.environ.get("HTTP_TIMEOUT_SECONDS", "25"))
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

ELEVENLABS_OUTBOUND_URL = (
    "https://api.elevenlabs.io/v1/convai/exotel/outbound-call"
)

# ---------------------------------------------------------------------------
# 2. Structured logging
# ---------------------------------------------------------------------------

logger = logging.getLogger()
logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))


def log_event(level, event_name, **fields):
    """Emit JSON logs. Never include API keys or secret contents."""
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event_name,
        **fields,
    }
    getattr(logger, level.lower(), logger.info)(
        json.dumps(record, default=str, separators=(",", ":"))
    )


# ---------------------------------------------------------------------------
# 3. AWS clients
# ---------------------------------------------------------------------------

session = boto3.session.Session(region_name=REGION)
dynamodb = session.resource("dynamodb")
secrets_client = session.client("secretsmanager")

residents_table = dynamodb.Table(TABLE_NAME)
call_log_table = dynamodb.Table(LOG_TABLE)

_secret_cache = None


# ---------------------------------------------------------------------------
# 4. Helpers and explicit errors
# ---------------------------------------------------------------------------

class WorkerError(Exception):
    def __init__(self, category, message):
        super().__init__(message)
        self.category = category


def required_text(value, field):
    if value is None or not str(value).strip():
        raise WorkerError("INVALID_MESSAGE", f"Required field missing/empty: {field}")
    return str(value).strip()


def normalize_phone(value):
    phone = required_text(value, "phone")
    if not re.fullmatch(r"\+[1-9]\d{7,14}", phone):
        raise WorkerError(
            "INVALID_PHONE",
            "phone must be international format, e.g. +91XXXXXXXXXX",
        )
    return phone



def get_elevenlabs_config():
    """Load and validate ElevenLabs configuration from AWS Secrets Manager."""
    global _secret_cache

    if _secret_cache is None:
        try:
            response = secrets_client.get_secret_value(
                SecretId=SECRET_NAME
            )

            secret_string = response.get("SecretString")
            if not secret_string:
                raise WorkerError(
                    "SECRET_INVALID",
                    "Secret has no SecretString value."
                )

            _secret_cache = json.loads(secret_string)

            if not isinstance(_secret_cache, dict):
                raise WorkerError(
                    "SECRET_INVALID",
                    "SecretString must contain a JSON object."
                )

        except WorkerError:
            raise

        except ClientError as exc:
            code = exc.response.get("Error", {}).get(
                "Code", "Unknown"
            )

            log_event(
                "error",
                "secret_read_failed",
                secret_name=SECRET_NAME,
                aws_error_code=code,
            )

            raise WorkerError(
                "SECRET_READ_FAILED",
                f"Secrets Manager error: {code}"
            ) from exc

        except (json.JSONDecodeError, BotoCoreError) as exc:
            log_event(
                "error",
                "secret_load_failed",
                error_type=type(exc).__name__,
                detail=str(exc)[:500],
            )

            raise WorkerError(
                "SECRET_INVALID",
                f"Unable to parse/load secret ({type(exc).__name__})."
            ) from exc

    required = (
        "ELEVENLABS_API_KEY",
        "AGENT_ID",
        "AGENT_PHONE_NUMBER_ID",
    )

    missing = [
        key for key in required
        if not isinstance(_secret_cache.get(key), str)
        or not _secret_cache[key].strip()
    ]

    if missing:
        raise WorkerError(
            "SECRET_INVALID",
            "Missing or empty secret keys: " + ", ".join(missing)
        )

    # Validate the agent ID format.
    if not _secret_cache["AGENT_ID"].startswith("agent_"):
        raise WorkerError(
            "SECRET_INVALID",
            "AGENT_ID must be a valid ElevenLabs agent ID."
        )

    # TEST_TO_NUMBER is optional for normal resident calls.
    # It is required only when you intend to use the test-call path.
    test_number = _secret_cache.get("TEST_TO_NUMBER")

    if test_number is not None:
        try:
            normalize_phone(test_number)
        except WorkerError as exc:
            raise WorkerError(
                "SECRET_INVALID",
                "TEST_TO_NUMBER must use international E.164 format, "
                "for example +91XXXXXXXXXX."
            ) from exc

    return _secret_cache


def build_call_id(message_id, body):
    # SQS message IDs remain stable on retry; this suppresses duplicate delivery.
    identity = str(message_id) if message_id else json.dumps(
        body, sort_keys=True, separators=(",", ":")
    )
    digest = hashlib.sha256(identity.encode("utf-8")).hexdigest()[:40]
    return f"call-{digest}"


def safe_provider_summary(result):
    return {
        "success": result.get("success"),
        "conversation_id": result.get("conversation_id"),
        "callSid": result.get("callSid"),
    }


# ---------------------------------------------------------------------------
# 5. DynamoDB idempotency and call log
# ---------------------------------------------------------------------------

def reserve_call(call_id, resident_id, message_id, body):
    """
    Uses the existing call_logs composite key:
      call_id (partition key), resident_id (sort key).
    """
    now = int(time.time())
    item = {
        "call_id": call_id,
        "resident_id": resident_id,
        "status": "RESERVED",
        "phone": body["phone"],
        "alert_type": body["alert_type"],
        "district": body["district"],
        "message_id": str(message_id or ""),
        "dispatched_at": int(body.get("dispatched_at", now)),
        "logged_at": now,
        "updated_at": now,
    }

    try:
        call_log_table.put_item(
            Item=item,
            ConditionExpression=(
                "attribute_not_exists(call_id) AND "
                "attribute_not_exists(resident_id)"
            ),
        )
        return True
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        if code == "ConditionalCheckFailedException":
            log_event(
                "warning",
                "duplicate_suppressed",
                call_id=call_id,
                resident_id=resident_id,
                message_id=message_id,
            )
            return False

        log_event(
            "error",
            "call_reservation_failed",
            call_id=call_id,
            resident_id=resident_id,
            aws_error_code=code,
            detail=str(exc)[:1000],
        )
        raise WorkerError(
            "DYNAMODB_RESERVATION_FAILED", f"DynamoDB PutItem failed: {code}"
        ) from exc


def update_call_log(call_id, resident_id, status, **fields):
    """Update the existing composite-key call-log record with visible AWS errors."""
    fields["status"] = status
    fields["updated_at"] = int(time.time())

    names = {}
    values = {}
    assignments = []
    for index, (key, value) in enumerate(fields.items()):
        name_key = f"#n{index}"
        value_key = f":v{index}"
        names[name_key] = key
        values[value_key] = value
        assignments.append(f"{name_key} = {value_key}")

    try:
        call_log_table.update_item(
            Key={"call_id": call_id, "resident_id": resident_id},
            UpdateExpression="SET " + ", ".join(assignments),
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
        )
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        message = exc.response.get("Error", {}).get("Message", str(exc))
        log_event(
            "error",
            "call_log_update_failed",
            call_id=call_id,
            resident_id=resident_id,
            aws_error_code=code,
            aws_error_message=message[:1000],
            detail=str(exc)[:1500],
        )
        raise WorkerError(
            "CALL_LOG_UPDATE_FAILED",
            f"DynamoDB UpdateItem failed: {code}: {message[:500]}",
        ) from exc
    except Exception as exc:
        log_event(
            "error",
            "call_log_update_failed",
            call_id=call_id,
            resident_id=resident_id,
            error_type=type(exc).__name__,
            detail=str(exc)[:1000],
        )
        raise WorkerError(
            "CALL_LOG_UPDATE_FAILED",
            f"Unexpected call-log update error: {type(exc).__name__}",
        ) from exc


def update_resident(district, resident_id, status, call_id):
    """
    Preserve the existing resident key format from the supplied Lambda:
      PK = DISTRICT#<district>
      SK = <resident_id>
    """
    try:
        residents_table.update_item(
            Key={"PK": f"DISTRICT#{district}", "SK": resident_id},
            UpdateExpression=(
                "SET last_called_at = :t, call_status = :s, last_call_id = :c"
            ),
            ExpressionAttributeValues={
                ":t": int(time.time()),
                ":s": status,
                ":c": call_id,
            },
        )
        log_event(
            "info",
            "resident_updated",
            resident_id=resident_id,
            status=status,
        )
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "Unknown")
        message = exc.response.get("Error", {}).get("Message", str(exc))
        log_event(
            "error",
            "resident_update_failed",
            resident_id=resident_id,
            aws_error_code=code,
            aws_error_message=message[:1000],
        )
        # Provider may already have accepted the call; do not redial.
    except Exception as exc:
        log_event(
            "error",
            "resident_update_failed",
            resident_id=resident_id,
            error_type=type(exc).__name__,
            detail=str(exc)[:1000],
        )


# ---------------------------------------------------------------------------
# 6. ElevenLabs Exotel outbound-call API
# ---------------------------------------------------------------------------


def initiate_exotel_call(config, body):
    is_test = str(body.get("alert_type", "")).upper() == "TEST_CALL"

    destination = (
        config.get("TEST_TO_NUMBER")
        if is_test
        else body.get("phone")
    )

    destination = normalize_phone(destination)

    payload = {
        "agent_id": config["AGENT_ID"],
        "agent_phone_number_id": config["AGENT_PHONE_NUMBER_ID"],
        "to_number": destination,
        "conversation_initiation_client_data": {
            "dynamic_variables": {
                "name": str(body.get("name", "Resident")),
                "village": str(body.get("village", "")),
                "district": str(body.get("district", "")),
                "alert_type": str(body.get("alert_type", "FLOOD")),
                "resident_id": str(body.get("resident_id", "")),
                "officer_id": str(body.get("officer_id", "UNKNOWN")),
                "flood_eta_hours": str(body.get("flood_eta_hours", "unknown")),
                "flood_severity": str(body.get("flood_severity", "unknown")),
                "rainfall_mm": str(body.get("rainfall_mm", "unknown")),
                "wind_speed_kmh": str(body.get("wind_speed_kmh", "unknown")),
                "official_guidance": str(
                    body.get(
                        "official_guidance",
                        "Follow instructions from local authorities."
                    )
                ),
            }
        },
    }

    request = urllib.request.Request(
        ELEVENLABS_OUTBOUND_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "xi-api-key": config["ELEVENLABS_API_KEY"],
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(
            request, timeout=HTTP_TIMEOUT_SECONDS
        ) as response:
            raw = response.read().decode("utf-8", errors="replace")
            result = json.loads(raw) if raw else {}

            if not isinstance(result, dict):
                raise WorkerError(
                    "INVALID_PROVIDER_RESPONSE",
                    "ElevenLabs returned an unexpected response."
                )

            if result.get("success") is not True:
                raise WorkerError(
                    "PROVIDER_REJECTED_CALL",
                    "ElevenLabs did not return success=true: "
                    + json.dumps(result)[:1000]
                )

            if not (result.get("conversation_id") or result.get("callSid")):
                raise WorkerError(
                    "PROVIDER_ID_MISSING",
                    "No conversation ID or call SID returned."
                )

            log_event(
                "info",
                "elevenlabs_call_accepted",
                test_call=is_test,
                http_status=response.status,
                **safe_provider_summary(result),
            )
            return result

    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        log_event(
            "error",
            "elevenlabs_http_error",
            http_status=exc.code,
            response_body=error_body[:2000],
        )
        raise WorkerError(
            "ELEVENLABS_HTTP_ERROR",
            f"ElevenLabs HTTP {exc.code}: {error_body[:1000]}"
        ) from exc

    except (TimeoutError, urllib.error.URLError) as exc:
        raise WorkerError(
            "PROVIDER_OUTCOME_UNKNOWN",
            "Network failure; check provider call records before retrying."
        ) from exc


# ---------------------------------------------------------------------------
# 7. Process one SQS record
# ---------------------------------------------------------------------------

def process_record(record):
    message_id = record.get("messageId")
    try:
        body = json.loads(record.get("body", ""))
    except (TypeError, json.JSONDecodeError) as exc:
        raise WorkerError("INVALID_MESSAGE", "SQS body is not valid JSON.") from exc

    if not isinstance(body, dict):
        raise WorkerError("INVALID_MESSAGE", "SQS body must be a JSON object.")

    resident_id = required_text(body.get("resident_id"), "resident_id")
    district = required_text(body.get("district"), "district")
    alert_type = required_text(body.get("alert_type"), "alert_type")
    phone = normalize_phone(body.get("phone"))

    body["resident_id"] = resident_id
    body["district"] = district
    body["alert_type"] = alert_type
    body["phone"] = phone
    body["name"] = str(body.get("name") or "Resident")
    body["village"] = str(body.get("village") or "")

    call_id = build_call_id(message_id, body)

    log_event(
        "info",
        "message_received",
        message_id=message_id,
        resident_id=resident_id,
        district=district,
        alert_type=alert_type,
        call_id=call_id,
        dry_run=DRY_RUN,
        live_calls_enabled=LIVE_CALLS_ENABLED,
    )

    if DRY_RUN or not LIVE_CALLS_ENABLED:
        log_event(
            "warning",
            "dry_run_no_call",
            call_id=call_id,
            resident_id=resident_id,
        )
        return {
            "status": "DRY_RUN",
            "resident_id": resident_id,
            "call_id": call_id,
        }

    # Reserve before provider request to reduce duplicate calls.
    reserved = reserve_call(
        call_id=call_id,
        resident_id=resident_id,
        message_id=message_id,
        body=body,
    )
    if not reserved:
        return {
            "status": "DUPLICATE_SUPPRESSED",
            "resident_id": resident_id,
            "call_id": call_id,
        }

    # If this update fails, stop before contacting the provider.
    update_call_log(
        call_id,
        resident_id,
        "REQUESTING_PROVIDER",
        phone=phone,
        district=district,
        alert_type=alert_type,
    )

    try:
        config = get_elevenlabs_config()
        provider_result = initiate_exotel_call(config, body)
    except WorkerError as exc:
        try:
            update_call_log(
                call_id,
                resident_id,
                "NEEDS_REVIEW",
                error_category=exc.category,
                error_message=str(exc)[:1500],
            )
        except WorkerError:
            pass

        log_event(
            "error",
            "call_needs_review",
            call_id=call_id,
            resident_id=resident_id,
            error_category=exc.category,
            error_message=str(exc)[:1500],
        )
        # Do not automatically retry a possibly accepted outbound call.
        return {
            "status": "NEEDS_REVIEW",
            "resident_id": resident_id,
            "call_id": call_id,
            "error_category": exc.category,
            "message": str(exc)[:1000],
        }

    conversation_id = provider_result.get("conversation_id")
    call_sid = provider_result.get("callSid")

    try:
        update_call_log(
            call_id,
            resident_id,
            "DIALING",
            conversation_id=conversation_id or "",
            callSid=call_sid or "",
            provider_success=True,
        )
    except WorkerError:
        # Call was accepted; don't place another call due to a log failure.
        log_event(
            "critical",
            "provider_accepted_but_log_failed",
            call_id=call_id,
            resident_id=resident_id,
            conversation_id=conversation_id,
            callSid=call_sid,
        )

    update_resident(
        district=district,
        resident_id=resident_id,
        status="DIALING",
        call_id=call_id,
    )

    return {
        "status": "CALL_INITIATED",
        "resident_id": resident_id,
        "call_id": call_id,
        "conversation_id": conversation_id,
        "callSid": call_sid,
    }


# ---------------------------------------------------------------------------
# 8. Lambda entry point — supports SQS partial batch failure reporting
# ---------------------------------------------------------------------------

def lambda_handler(event, context):
    request_id = getattr(context, "aws_request_id", "unknown")
    records = event.get("Records", [])

    log_event(
        "info",
        "invocation_started",
        request_id=request_id,
        record_count=len(records),
        function_name=os.environ.get("AWS_LAMBDA_FUNCTION_NAME"),
    )

    if not records:
        raise WorkerError("EMPTY_EVENT", "No SQS Records provided.")

    results = []
    failures = []

    for record in records:
        message_id = record.get("messageId", "unknown")
        try:
            results.append(process_record(record))
        except Exception as exc:
            log_event(
                "error",
                "record_failed",
                request_id=request_id,
                message_id=message_id,
                error_category=getattr(exc, "category", "UNEXPECTED_ERROR"),
                error_type=type(exc).__name__,
                error_message=str(exc)[:1500],
            )
            failures.append({"itemIdentifier": message_id})

    log_event(
        "info" if not failures else "warning",
        "invocation_finished",
        request_id=request_id,
        success_count=len(results),
        failure_count=len(failures),
    )

    return {
        "statusCode": 200 if not failures else 207,
        "request_id": request_id,
        "results": results,
        "batchItemFailures": failures,
    }
