import json
import time

def lambda_handler(event, context):
    phone = event.get("phone", "")
    last_called_at = int(event.get("last_called_at", 0))
    call_status = event.get("call_status", "")
    current_epoch = int(time.time())

    # Check 1 — called within last 30 minutes
    if last_called_at > 0 and (current_epoch - last_called_at) < 1800:
        print(f"SKIP {phone} — RECENTLY_ALERTED")
        return {"valid": False, "reason": "RECENTLY_ALERTED"}

    # Check 2 — call already in flight
    if call_status == "DIALING":
        print(f"SKIP {phone} — CALL_IN_FLIGHT")
        return {"valid": False, "reason": "CALL_IN_FLIGHT"}

    # Check 3 — bad phone number
    if not phone or not phone.startswith("+"):
        print(f"SKIP {phone} — BAD_RECORD")
        return {"valid": False, "reason": "BAD_RECORD"}

    print(f"VALID {phone} — cleared for dispatch")
    return {"valid": True, "reason": None}