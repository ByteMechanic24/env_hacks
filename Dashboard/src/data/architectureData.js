// Comprehensive architecture specifications for the /technical page

export const ARCHITECTURE_LAYERS = [
  {
    id: "layer_trigger",
    name: "Layer 1: Alert Trigger & Validation",
    description: "Accepts authority triggers, queries household registry, and applies validation guards before enqueuing.",
    color: "#2DD4BF",
  },
  {
    id: "layer_voice",
    name: "Layer 2: Telephony & Audio Bridge",
    description: "Places outbound calls via Exotel, relays telephony audio in real-time, and bridges to ElevenLabs conversational agent.",
    color: "#38BDF8",
  },
  {
    id: "layer_intel",
    name: "Layer 3: Bedrock Triage & Incident Persistence",
    description: "Evaluates situation via Claude 3.5 Sonnet, persists structured status state, and notifies officials via SNS.",
    color: "#FFB020",
  },
];

export const ARCHITECTURE_NODES = [
  {
    id: "officer_console",
    name: "Officer Console",
    service: "S3 + CloudFront",
    layer: "layer_trigger",
    status: "built",
    coords: { x: 40, y: 80 },
    role: "Emergency portal for district magistrates and disaster coordinators to initiate alerts by district and pincode.",
    config: "Hosted on AWS S3 Static Web Hosting with CloudFront CDN distribution and TLS 1.3.",
    why: "Provides instantaneous zero-latency operational UI for emergency teams with strict role controls.",
    iamNote: "Authenticated via pre-signed session tokens; restricted to POST /alert endpoint.",
    snippet: `POST /alert
{
  "district": "Khagaria",
  "pincodes": ["841301", "841302"],
  "hazard_type": "FLOOD"
}`,
  },
  {
    id: "api_gateway_rest",
    name: "API Gateway (REST)",
    service: "Amazon API Gateway",
    layer: "layer_trigger",
    status: "built",
    coords: { x: 220, y: 80 },
    role: "Front-door ingestion for district alert triggers with request validation and rate limiting.",
    config: "REST API, regional endpoint, Throttling: 100 req/sec, burst 200 req/sec, payload validation enabled.",
    why: "Shields downstream Lambda orchestrators against sudden surges and enforces schema conformance.",
    iamNote: "arn:aws:execute-api:*:*:*/*/*/alert -> invokes AlertOrchestratorLambda",
    snippet: `{
  "type": "object",
  "properties": {
    "district": { "type": "string" },
    "pincodes": { "type": "array" }
  },
  "required": ["district", "pincodes"]
}`,
  },
  {
    id: "orchestrator_lambda",
    name: "Alert Orchestrator",
    service: "AWS Lambda (Python 3.12)",
    layer: "layer_trigger",
    status: "built",
    coords: { x: 400, y: 80 },
    role: "Queries registered households by partition, validates 30-min recency, and fans out into SQS.",
    config: "Memory: 512 MB, Timeout: 30s, Ephemeral storage: 512 MB, Active X-Ray tracing enabled.",
    why: "Stateless asynchronous pipeline entry point capable of fanning out thousands of records into SQS in milliseconds.",
    iamNote: "dynamodb:Query on sentinel_residents, sqs:SendMessageBatch on sentinel-call-queue.",
    snippet: `def handler(event, context):
    residents = query_residents(district, pincodes)
    for r in residents:
        if not is_recently_alerted(r['resident_id'], 30):
            sqs.send_message(QueueUrl=QUEUE_URL, MessageBody=json.dumps(r))`,
  },
  {
    id: "dynamodb_residents",
    name: "Residents Registry",
    service: "Amazon DynamoDB",
    layer: "layer_trigger",
    status: "built",
    coords: { x: 580, y: 80 },
    role: "High-performance registry storing registered riverside households, phone numbers, dialects, and metadata.",
    config: "Billing: Pay-per-request, PITR enabled, SSE-KMS encryption with AWS KMS.",
    why: "Single-digit millisecond queries across composite keys (PK=DISTRICT#<d>, SK begins_with PIN#<p>).",
    iamNote: "Read-only access granted strictly to AlertOrchestratorLambda.",
    snippet: `PK: DISTRICT#Khagaria
SK: PIN#841301#RES#101
{
  "name": "Ramesh Kumar",
  "phone": "+919835012345",
  "dwelling": "Pucca-Roof",
  "members": 5
}`,
  },
  {
    id: "sqs_queue",
    name: "SQS Queue & DLQ",
    service: "Amazon SQS",
    layer: "layer_trigger",
    status: "built",
    coords: { x: 760, y: 80 },
    role: "Buffers outbound calls to throttle against carrier limits and guarantees delivery with DLQ redrive.",
    config: "VisibilityTimeout: 240s, Retention: 14400s (4h), RedrivePolicy: maxReceiveCount=3 to sentinel-dlq.",
    why: "Prevents overwhelming carrier trunking limits and automatically catches persistent call failures.",
    iamNote: "sqs:ReceiveMessage, sqs:DeleteMessage, sqs:ChangeMessageVisibility by CallWorkerLambda.",
    snippet: `{
  "deadLetterTargetArn": "arn:aws:sqs:...:sentinel-dlq",
  "maxReceiveCount": 3
}`,
  },
  {
    id: "call_worker_lambda",
    name: "Call Worker",
    service: "AWS Lambda (Node 20)",
    layer: "layer_voice",
    status: "built",
    coords: { x: 760, y: 245 },
    role: "SQS event consumer that triggers outbound phone calls via Exotel API with reserved concurrency 50.",
    config: "Reserved Concurrency: 50, BatchSize: 1, Timeout: 60s, Exotel API credentials in Secrets Manager.",
    why: "Decouples worker execution from carrier connection latency and enforces concurrency controls.",
    iamNote: "secretsmanager:GetSecretValue for sentinel/exotel, dynamodb:PutItem on sentinel_call_log.",
    snippet: `export const handler = async (event) => {
  const creds = await getSecret('sentinel/exotel');
  await exotelClient.calls.create({ to, from: creds.EXOPHONE, flow: creds.FLOW_ID });
};`,
  },
  {
    id: "exotel_voice",
    name: "Exotel",
    service: "Exotel Telephony",
    layer: "layer_voice",
    status: "built",
    coords: { x: 580, y: 245 },
    role: "Cellular voice platform handling outbound calls to Indian telecom subscribers.",
    config: "Exotel call flow with a voice-streaming applet bridging telephony audio.",
    why: "High cellular delivery rate and reliable media streaming in rural Bihar/UP telecom circles.",
    iamNote: "Secured using API token authentication and webhook validation.",
    snippet: `POST /v1/Accounts/{AccountSid}/Calls/connect
{
  "From": "ExoPhone",
  "To": "+919835012341",
  "App": "VoiceStreamingApplet"
}`,
  },
  {
    id: "ws_audio_bridge",
    name: "WebSocket Bridge",
    service: "AWS Lambda / API GW WS",
    layer: "layer_voice",
    status: "built",
    coords: { x: 400, y: 245 },
    role: "The bridge relays telephony audio between Exotel and ElevenLabs, transcoding sample rates as needed (8 kHz telephony ↔ 16 kHz), and flushes buffered audio on barge-in.",
    config: "Stream frame interval: sample-rate conversion, barge-in buffer clearance, bi-directional stream.",
    why: "ElevenLabs conversational model expects 16 kHz audio; telephony provides 8 kHz.",
    iamNote: "execute-api:ManageConnections on @connections WebSocket API.",
    snippet: `// TODO(team): confirm Exotel stream format before publishing codec details
function processInboundChunk(telephonyAudio) {
  const pcm16k = transcodeTo16k(telephonyAudio);
  elevenlabsWs.send(pcm16k);
}`,
  },
  {
    id: "elevenlabs_agent",
    name: "ElevenLabs Agent",
    service: "ElevenLabs Voice AI",
    layer: "layer_voice",
    status: "built",
    coords: { x: 220, y: 245 },
    role: "Acoustic conversational voice interface with respectful Hindi synthesis, ASR, and VAD barge-in.",
    config: "Voice: Custom respectful Hindi tone, Latency: <450ms, Webhook: evaluate_situation.",
    why: "State-of-the-art natural Hindi pronunciation and low-latency interruption handling.",
    iamNote: "Invokes AWS API Gateway Webhook protected by shared HMAC token.",
    snippet: `Tool: evaluate_situation(
  resident_id,
  statement,
  people_count,
  is_on_roof
)`,
  },
  {
    id: "bedrock_triage",
    name: "Amazon Bedrock",
    service: "Claude 3.5 Sonnet",
    layer: "layer_intel",
    status: "built",
    coords: { x: 220, y: 415 },
    role: "Reasoning engine that parses Hindi dialogue, extracts facts, classifies P1/P2/P3, and enforces guardrails.",
    config: "anthropic.claude-3-5-sonnet-20241022-v2:0, Guardrails: Stops agent from promising help or arrival times.",
    why: "Zero hallucination risk on arrival times, exact JSON adherence, and dialect comprehension.",
    iamNote: "bedrock:InvokeModel with condition StringEquals bedrock:GuardrailIdentifier.",
    snippet: `GUARDRAILS: Stop agent from promising help or arrival times.
Return JSON: {
  "priority": "P1_CRITICAL",
  "needs": ["trapped_on_roof", "drinking_water"],
  "voice_instruction": "..."
}`,
  },
  {
    id: "dynamodb_triage",
    name: "Triage Ledger",
    service: "Amazon DynamoDB",
    layer: "layer_intel",
    status: "built",
    coords: { x: 400, y: 415 },
    role: "Immutable append-only ledger of evaluated incidents with Global Secondary Indexes for official status queries.",
    config: "Billing: On-Demand, GSI: TriageLevel-Timestamp-Index (PK: priority, SK: timestamp).",
    why: "Instantaneous sub-second filtering of all P1 Critical cases for emergency officials.",
    iamNote: "dynamodb:PutItem, dynamodb:Query.",
    snippet: `Index: TriageLevel-Timestamp-Index
KeyCondition: priority = 'P1_CRITICAL' AND timestamp > :cutoff`,
  },
  {
    id: "sns_notify",
    name: "Amazon SNS Notify",
    service: "Amazon SNS",
    layer: "layer_intel",
    status: "built",
    coords: { x: 580, y: 415 },
    role: "Fans out instantaneous SMS and email notifications to district officials on priority status updates.",
    config: "Topic: sentinel-p1-critical-alerts.fifo, Delivery retry: exponential backoff.",
    why: "Reliable out-of-band mobile notifications to district coordinators without requiring them to stare at dashboard.",
    iamNote: "sns:Publish restricted to TriageEvaluationLambda.",
    snippet: `await sns.publish({
  TopicArn: SNS_P1_TOPIC_ARN,
  Subject: 'PRIORITY [P1]: 5 on Roof in Sonbarsa'
});`,
  },
  {
    id: "status_map",
    name: "Status Map",
    service: "S3 + CloudFront",
    layer: "layer_intel",
    status: "built",
    coords: { x: 760, y: 415 },
    role: "Live situational status map for officials with color-coded priority pins and structured triage JSON.",
    config: "S3 Static Hosting + CloudFront CDN + WebSocket live update feed.",
    why: "Zero server maintenance and instantaneous status renders for disaster control rooms.",
    iamNote: "s3:GetObject via CloudFront Origin Access Control (OAC).",
    snippet: `GET /status/active
Returns list of P1, P2, P3 records with GPS coordinates`,
  },
  {
    id: "eventbridge_cwc",
    name: "CWC EventBridge",
    service: "Amazon EventBridge",
    layer: "layer_trigger",
    status: "roadmap",
    coords: { x: 40, y: 135 },
    role: "Automated event bus receiving webhook alerts from Central Water Commission (CWC) telemetry gauges.",
    config: "Pattern: source='in.gov.cwc.flood', detail-type='GaugeSpikeWarning'.",
    why: "Enables autonomous zero-touch alert trigger when river water crosses danger mark.",
    iamNote: "Roadmap: EventBridge rule invoking AlertOrchestratorLambda.",
    snippet: `{ "source": "in.gov.cwc.flood", "level": "ABOVE_DANGER" }`,
  },
  {
    id: "cognito_auth",
    name: "Cognito Auth",
    service: "Amazon Cognito",
    layer: "layer_intel",
    status: "roadmap",
    coords: { x: 40, y: 415 },
    role: "Role-based identity pool and multi-factor authentication for district government personnel.",
    config: "User Pool with TOTP MFA, RBAC groups: DistrictMagistrate, DisasterOfficer.",
    why: "Ensures no unauthorized operator can trigger emergency mass calls.",
    iamNote: "Roadmap: JWT token authorizer on API Gateway.",
    snippet: `Group: DisasterOfficer
Policies: [AllowAlertInitiation]`,
  },
];

export const TRIGGER_LAYER_STEPS = [
  {
    step: 1,
    title: "Authority Submits Alert Scope",
    service: "Officer Console",
    description: "The district officer selects the affected district (e.g., Bihar–Khagaria) and pincodes (841301, 841302), then clicks Initiate Alert.",
  },
  {
    step: 2,
    title: "Payload Validation & Rate Throttling",
    service: "API Gateway (REST)",
    description: "API Gateway validates the POST /alert request against the JSON schema and checks the caller's authorized API key.",
  },
  {
    step: 3,
    title: "Registry Query by Partition",
    service: "Alert Orchestrator Lambda",
    description: "Orchestrator executes a partition query on DynamoDB (PK=DISTRICT#Khagaria, SK begins_with PIN#) to fetch all riverside households.",
  },
  {
    step: 4,
    title: "Validation Guard & 30-Min Dedup Window",
    service: "Validation Guard",
    description: "Checks each resident against a 30-minute dedup window, checks if a call is currently in-flight, and filters invalid phone formats.",
  },
  {
    step: 5,
    title: "Batch Enqueue to SQS",
    service: "Amazon SQS",
    description: "Orchestrator enqueues valid records into `sentinel-call-queue` with a 240s visibility timeout. Dead-letter queue attached.",
  },
  {
    step: 6,
    title: "Throttled Concurrency Consumption",
    service: "Call Worker Lambda",
    description: "Call Worker Lambda (concurrency locked at 50) consumes the queue and initiates outbound voice calls via Exotel.",
  },
  {
    step: 7,
    title: "Dialing State Write & Call Tracking",
    service: "DynamoDB Call Log",
    description: "Call SID and initial DIALING status written to `sentinel_call_log` with TTL set to 24 hours.",
  },
];

// TODO(team): confirm Exotel stream format before publishing codec details
export const AUDIO_BRIDGE_SPECS = {
  telecomFormat: "Exotel Outbound Call (8 kHz telephony audio)",
  aiFormat: "ElevenLabs Conversational Engine (16 kHz audio)",
  transcodingLatency: "<8ms per audio frame",
  bufferFlush: "On user speech detection (VAD barge-in), buffered audio is cleared to prevent overlap.",
  bridgeNote: "The bridge relays telephony audio between Exotel and ElevenLabs, transcoding sample rates as needed (8 kHz telephony ↔ 16 kHz), and flushes buffered audio on barge-in.",
};

export const TRIAGE_LOGIC_RULES = [
  {
    tier: "P1_CRITICAL",
    color: "#FF4D4F",
    rules: [
      "Water entered living quarters with rising level",
      "Residents trapped on roof, tree, or isolated structure",
      "Presence of infants, pregnant women, or persons unable to swim in deep water",
      "Kutcha mud-brick dwelling facing structural collapse",
    ],
    routing: "Immediate SMS + High-priority Email to District Emergency Officials. Priority Red pin on Live Status Map with flashing beacon.",
  },
  {
    tier: "P2_HIGH",
    color: "#FFB020",
    rules: [
      "Elderly citizen with chronic medical need (asthma, insulin, kidney dialysis)",
      "Road cutoff preventing routine exit, but dwelling is currently dry",
      "Drinking water or food exhausted within 24 hours",
    ],
    routing: "Forwarded to District Disaster Management Cell official review queue within 1 hour. Priority Amber pin on Status Map.",
  },
  {
    tier: "P3_SAFE",
    color: "#3DDC84",
    rules: [
      "Resident has already evacuated to high embankment bund or permanent shelter",
      "Masonry pucca house well above projected flood crest",
      "Sufficient drinking water and food available",
    ],
    routing: "Logged to DynamoDB Status Ledger only. Displayed as Green pin on Status Map.",
  },
];

export const RESILIENCE_MATRIX = [
  {
    failureMode: "Resident Does Not Answer Call",
    mitigation: "Exotel reports no-answer. SQS message visibility resets with 30s exponential backoff. Retries up to 3 times before DLQ transfer.",
  },
  {
    failureMode: "Cellular Tower Intermittent / Drop Mid-Call",
    mitigation: "Partial transcript saved to DynamoDB. If call dropped after resident reported flood water in house, automatically classified P1 fallback.",
  },
  {
    failureMode: "Amazon Bedrock API Timeout (>5s)",
    mitigation: "Lambda catches timeout exception and executes regex-based rule fallback ('छत'/'पानी'/'बच्चे' -> P1_CRITICAL fallback) to ensure safety.",
  },
  {
    failureMode: "Accidental Rapid Double-Click on Initiate Alert",
    mitigation: "DynamoDB conditional write on alert execution lock with 15-minute lease token. Second click receives HTTP 409 Conflict.",
  },
  {
    failureMode: "AI Hallucination / False Hope",
    mitigation: "Guardrails stop the agent from promising help or arrival times. Agent instructs residents on basic safety guidelines and directs emergencies to 112.",
  },
];
