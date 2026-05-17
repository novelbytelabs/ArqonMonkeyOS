# Science Monkeys Read/Resume GPT Action Live Smoke Packet 001

Status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

## Objective

Provide a bounded live-smoke packet for validating refreshed GPT Action schemas after the read/resume action schema integration.

This packet is diagnostic only. It does not certify, promote, deploy, or approve production readiness.

## Prerequisites

- GPT Action schema imported/refreshed from `openapi/science_monkeys_actions.openapi.yaml`.
- Each GPT has only its own bearer token.
- Local Helper env files may be checked only as SET/UNSET:
  - `~/secrets/arqonmonkeyos_code_keys.env`
  - `~/secrets/arqonmonkeyos_science_keys.env`

Secret values must never be printed.

## Role Smoke Matrix

For each Science GPT role token:

| Role token | Required calls |
|---|---|
| `EXPLORER_AI` | `GET /v1/whoami`, `GET /v1/capabilities` |
| `HYPOTHESIZER_AI` | `GET /v1/whoami`, `GET /v1/capabilities` |
| `DESIGNER_AI` | `GET /v1/whoami`, `GET /v1/capabilities` |
| `SCIENCE_AUDITOR_AI` | `GET /v1/whoami`, `GET /v1/capabilities` |

Expected checks:

- role reported by `/whoami` matches token role
- required status labels are present
- allowed write routes match role policy
- `/v1/science/share` is absent/forbidden for GPT roles
- `/v1/science/execute-experiment` is absent/forbidden for GPT roles
- queue mutation routes are absent
- Human authority is not granted
- Science Executor authority is not granted

## Forbidden Live-Smoke Claims

A passing live smoke does not certify, promote, approve deployment, prove production readiness, or authorize autonomous Science operation.

## Evidence Capture

Helper must capture request/response summaries only. Do not include bearer keys or secrets.

Required evidence fields:

- commit SHA
- action schema SHA256
- role tested
- route called
- HTTP status
- response role summary
- capability summary
- denied authority summary
- failures or deviations
