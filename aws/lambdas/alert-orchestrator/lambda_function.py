
import json
import os
import time
import uuid
import logging

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError, BotoCoreError


# ---------------------------------------------------------
# Configuration — preserve existing environment variables
# ---------------------------------------------------------
REGION = os.environ.get("AWS_REGION_NAME", "ap-south-1")

TABLE_NAME = os.environ["TABLE_NAME"]
QUEUE_URL = os.environ["QUEUE_URL"]
VALIDATION_LAMBDA = os.environ["VALIDATION_LAMBDA"]

dynamodb = boto3.resource("dynamodb", region_name=REGION)
sqs = boto3.client("sqs", region_name=REGION)
lambda_client = boto3.client("lambda", region_name=REGION)

logger = logging.getLogger()
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO").upper())


def log_event(event_name, **fields):
    """Structured logs; avoid logging phone numbers or secrets."""
    logger.info(json.dumps({
        "event": event_name,
        "timestamp": int(time.time()),
        **fields,
    }, default=str))


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }


def parse_request(event):
    """Support API Gateway, direct dict and Lambda test events."""
    if not isinstance(event, dict):
        raise ValueError("Event must be a JSON object.")

    body = event.get("body", event)

    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid JSON body string.") from exc

    if not isinstance(body, dict):
        raise ValueError("Request body must be a JSON object.")

    return body


def query_residents(table, district, pincode):
    """Read every query page, preserving the existing resident key format."""
    items = []
    kwargs = {
        "KeyConditionExpression": (
            Key("PK").eq(f"DISTRICT#{district}")
            & Key("SK").begins_with(f"PIN#{pincode}#RES#")
        )
    }

    while True:
        result = table.query(**kwargs)
        items.extend(result.get("Items", []))

        last_key = result.get("LastEvaluatedKey")
        if not last_key:
            break

        kwargs["ExclusiveStartKey"] = last_key

    return items


def lambda_handler(event, context):
    request_id = getattr(context, "aws_request_id", str(uuid.uuid4()))

    try:
        body = parse_request(event)
    except ValueError as exc:
        return response(400, {"success": False, "error": str(exc)})

    district = body.get("district")
    pincodes = body.get("pincodes", [])
    alert_type = str(body.get("alert_type", "FLOOD")).strip().upper()
    officer_id = body.get("officer_id", "UNKNOWN")

    # Explicit opt-in for a controlled, single-recipient worker test.
    # Do not use this flag for actual emergency alerts.
    test_call = body.get("test_call", False) is True

    if not isinstance(district, str) or not district.strip():
        return response(400, {
            "success": False,
            "error": "district is required",
        })

    if not isinstance(pincodes, list) or not pincodes:
        return response(400, {
            "success": False,
            "error": "pincodes must be a non-empty list",
        })

    if test_call:
        if len(pincodes) != 1:
            return response(400, {
                "success": False,
                "error": "Test mode requires exactly one pincode",
            })
        alert_type = "TEST_CALL"

    district = district.strip()
    table = dynamodb.Table(TABLE_NAME)

    queued = 0
    skipped = 0
    failed = 0
    breakdown = {
        "RECENTLY_ALERTED": 0,
        "CALL_IN_FLIGHT": 0,
        "BAD_RECORD": 0,
    }
    dispatch_results = []

    log_event(
        "orchestrator_started",
        request_id=request_id,
        district=district,
        alert_type=alert_type,
        pincode_count=len(pincodes),
        test_call=test_call,
    )

    for pincode in pincodes:
        pincode = str(pincode).strip()

        if not pincode:
            skipped += 1
            breakdown["BAD_RECORD"] += 1
            continue

        try:
            residents = query_residents(table, district, pincode)
            log_event(
                "residents_loaded",
                request_id=request_id,
                pincode=pincode,
                resident_count=len(residents),
            )
        except (ClientError, BotoCoreError) as exc:
            log_event(
                "resident_query_failed",
                request_id=request_id,
                pincode=pincode,
                error_type=type(exc).__name__,
                detail=str(exc)[:500],
            )
            return response(500, {
                "success": False,
                "error": "DynamoDB resident query failed",
                "pincode": pincode,
                "request_id": request_id,
            })

        # Test mode must never fan out to all residents.
        # It still uses the same query/validation/queue path.
        for resident in residents:
            if test_call and queued >= 1:
                break

            resident_id = resident.get("SK")
            phone = resident.get("phone", "")

            if not resident_id or not phone:
                skipped += 1
                breakdown["BAD_RECORD"] += 1
                continue

            validation_payload = {
                "resident_id": resident_id,
                "phone": phone,
                "district": resident.get("district", district),
                "pincode": pincode,
                "last_called_at": int(
                    resident.get("last_called_at", 0)
                ),
                "call_status": resident.get("call_status", "NONE"),
            }

            try:
                val_response = lambda_client.invoke(
                    FunctionName=VALIDATION_LAMBDA,
                    InvocationType="RequestResponse",
                    Payload=json.dumps(validation_payload).encode("utf-8"),
                )

                if val_response.get("FunctionError"):
                    raise RuntimeError(
                        "Validation Lambda returned FunctionError"
                    )

                payload_stream = val_response["Payload"].read()
                val_result = json.loads(payload_stream or b"{}")

                if not isinstance(val_result, dict):
                    raise ValueError(
                        "Validation response must be a JSON object"
                    )

            except Exception as exc:
                log_event(
                    "validation_failed",
                    request_id=request_id,
                    resident_id=resident_id,
                    error_type=type(exc).__name__,
                    detail=str(exc)[:300],
                )
                breakdown["BAD_RECORD"] += 1
                skipped += 1
                continue

            if not val_result.get("valid"):
                reason = val_result.get("reason", "BAD_RECORD")
                breakdown[reason] = breakdown.get(reason, 0) + 1
                skipped += 1
                continue

            # TEST_CALL uses the worker's TEST_TO_NUMBER secret.
            # The worker must have the test-call routing change deployed.
            message = {
                "resident_id": resident_id,
                "phone": phone,
                "name": resident.get("name", ""),
                "village": resident.get("village", ""),
                "district": resident.get("district", district),
                "alert_type": alert_type,
                "officer_id": officer_id,
                "dwelling_type": resident.get("dwelling_type", ""),
                "lat": str(resident.get("lat", "")),
                "lng": str(resident.get("lng", "")),
                "dispatched_at": int(time.time()),
                "orchestrator_request_id": request_id,
                "test_call": test_call,
            }

            try:
                sqs_result = sqs.send_message(
                    QueueUrl=QUEUE_URL,
                    MessageBody=json.dumps(message),
                )

                queued += 1
                dispatch_results.append({
                    "resident_id": resident_id,
                    "status": "QUEUED",
                    "sqs_message_id": sqs_result.get("MessageId"),
                })

                log_event(
                    "resident_queued",
                    request_id=request_id,
                    resident_id=resident_id,
                    alert_type=alert_type,
                    sqs_message_id=sqs_result.get("MessageId"),
                )

            except (ClientError, BotoCoreError) as exc:
                failed += 1
                log_event(
                    "sqs_send_failed",
                    request_id=request_id,
                    resident_id=resident_id,
                    error_type=type(exc).__name__,
                    detail=str(exc)[:500],
                )

        if test_call and queued >= 1:
            break

    log_event(
        "orchestrator_finished",
        request_id=request_id,
        queued=queued,
        skipped=skipped,
        failed=failed,
        test_call=test_call,
    )

    return response(
        200 if failed == 0 else 207,
        {
            "success": failed == 0,
            "request_id": request_id,
            "test_call": test_call,
            "queued": queued,
            "skipped": skipped,
            "failed": failed,
            "breakdown": breakdown,
            "dispatch_results": dispatch_results,
            "note": (
                "QUEUED means SQS accepted the message; it does not prove "
                "that ElevenLabs/Exotel placed or completed a call."
            ),
        },
    )
