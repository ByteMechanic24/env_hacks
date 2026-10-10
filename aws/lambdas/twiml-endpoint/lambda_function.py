import base64
import json
import re
import urllib.parse
import urllib.request

AGENT_ID = "agent_3101m4jbd8zge1rvnjck1yq6kh1t"
API_KEY = "sk_f30e59a566722998caeee7b706d99e50b658b4bd703a0c5d"


def lambda_handler(event, context):
  print(f"Incoming event: {json.dumps(event)}")

  params = event.get("queryStringParameters") or {}
  name = params.get("name", "Akshit Singh")
  village = params.get("village", "Mansi")
  alert_type = params.get("alert_type", "FLOOD")
  resident_id = params.get("resident_id", "")

  # Parse Twilio POST body
  body_str = event.get("body") or ""
  if event.get("isBase64Encoded"):
    body_str = base64.b64decode(body_str).decode("utf-8")

  parsed_body = urllib.parse.parse_qs(body_str)
  from_number = parsed_body.get("From", ["+17372508034"])[0]
  to_number = parsed_body.get("To", [params.get("phone", "+918650040322")])[0]

  # Clean registration payload without unauthorized overrides
  payload = {
      "agent_id": AGENT_ID,
      "from_number": from_number,
      "to_number": to_number,
      "direction": "outbound",
      "conversation_initiation_client_data": {
          "dynamic_variables": {
              "resident_name": name,
              "village": village,
              "alert_type": alert_type,
              "resident_id": resident_id,
          }
      },
  }

  req = urllib.request.Request(
      "https://api.elevenlabs.io/v1/convai/twilio/register-call",
      data=json.dumps(payload).encode("utf-8"),
      headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
      method="POST",
  )

  try:
    with urllib.request.urlopen(req, timeout=12) as response:
      raw_data = response.read().decode("utf-8")
      print(f"ElevenLabs Registration Response: {raw_data}")

      # Extract the valid <Connect><Stream ...></Connect> block from ElevenLabs
      stream_match = re.search(r"(<Connect>.*?</Connect>)", raw_data, re.DOTALL)
      if stream_match:
        connect_block = stream_match.group(1)
      else:
        # Fallback if raw XML string is returned
        connect_block = raw_data

      # Announces connection, then bridges directly to the authenticated stream
      twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting to emergency flood alert.</Say>
  {connect_block}
</Response>"""

      print(f"Returning TwiML:\n{twiml}")

      return {
          "statusCode": 200,
          "headers": {
              "Content-Type": "text/xml; charset=utf-8",
              "Cache-Control": "no-cache",
          },
          "body": twiml.strip(),
      }

  except Exception as exc:
    print(f"Registration error: {exc}")
    fallback = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Unable to connect alert stream at this time.</Say>
</Response>"""
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "text/xml; charset=utf-8"},
        "body": fallback,
    }