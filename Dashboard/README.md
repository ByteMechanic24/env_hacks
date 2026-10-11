# Project Awaaz

> **"When the water rises, the phone should talk back."**  
> AI two-way Hindi voice triage for flood response on AWS (WeMakeDevs × AWS Environmental Hacks 2026, Track 2: Heat & Water).

---

## Overview

Project Awaaz is an automated information and triage system designed to replace silent one-way SMS emergency alerts. During flood warnings, Awaaz:
1. **Warns residents by voice** in respectful, natural Hindi on basic 2G/feature phones.
2. **Listens and asks about household status** with low-latency barge-in interruption.
3. **Classifies priority with Amazon Bedrock** (Claude 3.5 Sonnet) into P1 Critical, P2 High, and P3 Safe categories.
4. **Records structured status data** into Amazon DynamoDB with Global Secondary Indexes.
5. **Notifies district officials via Amazon SNS** and updates a live household status map.

> **Scope Note**: Awaaz is strictly an information and triage platform. It informs residents, assesses reported household status, and alerts district authorities. Awaaz does **not** dispatch rescue boats, deliver supplies, or operate physical relief missions.

---

## Architecture

Project Awaaz is built as a serverless, 3-layer architecture on AWS:

```
[Officer Console] → [API Gateway (REST)] → [Alert Orchestrator (Lambda)] → [DynamoDB Registry]
                                                         ↓
                                                [SQS Queue (Concurrency 50)]
                                                         ↓
                                                [Call Worker (Lambda)]
                                                         ↓
                                                [Exotel Outbound Call]
                                                         ↓
                                            [WebSocket Bridge (Lambda)]
                                                         ↓
                                         [ElevenLabs Hindi Voice Agent]
                                                         ↓ (Webhook)
                                          [Amazon Bedrock (Claude 3.5)]
                                                         ↓
                                         [DynamoDB Status Ledger] + [Amazon SNS Notify]
                                                         ↓
                                                [Live Status Map]
```

### 1. Alert Trigger & Validation (Layer 1)
- **Officer Console**: Web operational interface for district coordinators to initiate alerts by district and pincodes.
- **Amazon API Gateway (REST)**: Front-door payload validation and rate throttling.
- **Alert Orchestrator Lambda**: Queries registered households by partition (`PK=DISTRICT#<d>`, `SK=PIN#<p>`), enforces a 30-minute deduplication window, and batches calls into SQS.
- **Amazon SQS & DLQ**: Throttles calls to carrier limits with dead-letter queue recovery after 3 retries.

### 2. Telephony & Audio Bridge (Layer 2)
- **Call Worker Lambda**: Reserved concurrency (50) worker consuming queue items and placing outbound phone calls via Exotel API. Credentials securely retrieved from AWS Secrets Manager (`awaaz/exotel`).
- **Exotel Outbound Call**: Cellular telephony platform routing calls across Indian carriers with voice streaming applets.
- **WebSocket Bridge Lambda**: Relays telephony audio between Exotel and ElevenLabs, transcoding sample rates as needed (8 kHz telephony ↔ 16 kHz), and flushes buffered audio on barge-in.
- **ElevenLabs Conversational AI**: Natural Hindi voice synthesis and acoustic turn-taking.

### 3. Bedrock Triage & Incident Persistence (Layer 3)
- **Amazon Bedrock (Claude 3.5 Sonnet)**: Mid-call reasoning webhook extracting structured facts (`priority`, `needs`, `location`) and enforcing prompt guardrails.
- **Amazon DynamoDB Status Ledger**: Append-only status records with GSI query access.
- **Amazon SNS Notify**: Immediate SMS and email notifications to district disaster coordinators for P1 and P2 cases.
- **Live Status Map**: Color-coded situational dashboard visualizing household priorities for officials.

---

## Simulation Scenarios

The showcase includes 4 deterministic scripted scenarios:
1. **Trapped on roof (P1)**: Rooftop stranding with children, water rising fast. Classified as P1 Critical, officials immediately notified.
2. **Elderly, needs medicine (P2)**: Ground floor dwelling, asthma patient requiring medication. Classified as P2 High.
3. **Already safe (P3)**: Evacuated to high embankment bund. Classified as P3 Safe, status logged with zero official escalation.
4. **No answer, retry, DLQ**: Unreachable carrier endpoint. Retried across 3 attempts before Dead-Letter Queue routing and officer review.

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

---

## License

Built for **WeMakeDevs × AWS Environmental Hacks 2026**.
