// Source of truth config for Project Awaaz
export const CONFIG = {
  NAME: "Project Awaaz",
  PHONETIC: "अवाज़",
  TAGLINE: "When the water rises, the phone should talk back.",
  SUBHEAD: "Two-way Hindi AI voice triage for flood response on AWS.",
  HACKATHON: "WeMakeDevs × AWS Environmental Hacks 2026",
  TRACK: "Track 2: Heat & Water",
  DEMO_GEOGRAPHY: "Bihar Kosi/Gandak Plains (Khagaria District)",
  SIMULATION_BADGE: "Simulated playback — scripted from our real call flow",
  BEDROCK_MODEL: "Claude 3.5 Sonnet on Amazon Bedrock",
  DEVPOST_URL: "https://devpost.com/software/project-awaaz",
  GITHUB_URL: "https://github.com/project-awaaz/awaaz-flood-triage",
};

// NON-NEGOTIABLE HONESTY RULES:
// Only show verified facts, configured architectural limits, or design targets.
// Absolutely zero unverified metrics.
export const VERIFIED_METRICS = [
  {
    id: "seeded_residents",
    value: "10",
    unit: "residents",
    label: "Seeded in Bihar demo",
    detail: "10 seeded residents across 2 pincodes (demo: 841301 & 841302)",
    status: "verified",
  },
  {
    id: "call_duration_target",
    value: "<2 min",
    unit: "per call",
    label: "Triage design target",
    detail: "Strict concise conversation design prevents phone battery drain",
    status: "design target",
  },
  {
    id: "sqs_concurrency",
    value: "50",
    unit: "concurrent calls",
    label: "Configured concurrency",
    detail: "Call Worker Lambda max concurrency reserved on SQS queue",
    status: "configured",
  },
  {
    id: "dedup_window",
    value: "30 min",
    unit: "dedup window",
    label: "Validation guard",
    detail: "Prevents accidental duplicate calls to households within 30 minutes",
    status: "configured",
  },
];
