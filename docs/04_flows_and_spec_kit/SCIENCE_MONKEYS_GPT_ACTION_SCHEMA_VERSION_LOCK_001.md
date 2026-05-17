# Science Monkeys GPT Action Schema Version Lock 001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Prevent drift between the repository schema, the schema imported into GPT Actions, and live-smoke evidence.

## Canonical rule

`openapi/science_monkeys_actions.openapi.yaml` is not considered live-canonical merely because it exists in the repository.

A Science GPT Action schema becomes live-canonical for evidence only after all of the following are true:

1. The schema gates pass.
2. The schema is committed and pushed.
3. The exact committed file SHA256 is computed.
4. That exact schema file is imported into the intended GPT Action configuration.
5. The import evidence records:
   - schema path
   - schema SHA256
   - commit SHA
   - GPT name
   - operator
   - timestamp
   - required status labels

## Evidence rule

Live-smoke evidence is valid only for the exact imported schema SHA256 recorded in the evidence file.

If a later repo schema differs from the imported GPT Action schema, mark the later schema:

`REPO_CANDIDATE_NOT_IMPORTED_NOT_LIVE_VALIDATED`

and do not mix evidence between schema versions.

## ContextBus command integration rule

For `SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001`, the target schema may expose only shared ContextBus commands and already-approved Science read/resume and role-scoped write routes.

It must not expose:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Option C queue mutation routes
- Code Monkey routes
- Human authority routes
- Science Executor authority routes
- deployment routes
- certification routes
- promotion routes

## Notes/messages boundary

ContextBus notes and messages are non-official role coordination records.

They are:

- not Science artifacts
- not evidence
- not findings
- not certification
- not promotion
- not deployment approval
- not production readiness
- not Human approval
- not authority grants
