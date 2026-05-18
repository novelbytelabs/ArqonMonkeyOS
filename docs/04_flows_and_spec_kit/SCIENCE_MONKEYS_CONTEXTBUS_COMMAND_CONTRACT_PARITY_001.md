# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Pause broad Stage 2B role smoke and close request-shape parity for the shared ContextBus command surface used by Science GPTs.

This remediation slice is limited to:

- `POST /v1/notes`
- `POST /v1/messages`
- schema parity
- operator packet parity
- GPT instruction stabilization for bounded ContextBus command smoke

## Why this slice exists

Current Explorer Stage 2B smoke evidence showed safe failures on ContextBus write commands even though read commands passed:

- `/sync-context` -> `PASS`
- `/sync-constitution` -> `PASS`
- `/save-context` -> `REMEDIATION_REQUIRED`
- `/send-message` -> `REMEDIATION_REQUIRED`
- `/inbox` -> provisional only
- `/open-message` -> `NOT_RUN`
- `/archive-message` -> `NOT_RUN`

Deep-dive conclusion:

- failures were not primarily GPT-obedience problems
- failures were caused by request-shape drift between backend validation and the Science GPT Action schema/prompt surface

## Confirmed backend contract

`POST /v1/notes` requires:

- `project`
- `title`
- `body`
- `tags`
- `visibility`

Current backend accepts only:

- `visibility=team`

`POST /v1/messages` requires:

- `project`
- `to`
- `subject`
- `body`

## Canonical Stage 2B request shapes

### `/save-context`

```json
{
  "project": "ArqonZero",
  "title": "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ROLE_SMOKE_001_<ROLE_CODE>_NOTE",
  "body": "This is a non-official ContextBus smoke note created by <ROLE_GPT_NAME> to verify note-write access. It is not Science evidence, not a finding, not a Science artifact, not certification, not promotion, not deployment approval, and not production readiness.",
  "tags": ["stage2b", "contextbus-smoke", "<ROLE_CODE>"],
  "visibility": "team"
}
```

### `/send-message`

```json
{
  "project": "ArqonZero",
  "to": "<ROLE_CODE>",
  "subject": "SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ROLE_SMOKE_001_<ROLE_CODE>_MESSAGE",
  "body": "This is a non-official ContextBus smoke message created by <ROLE_GPT_NAME>. It is not Science evidence, not a finding, not a Science artifact, not certification, not promotion, not deployment approval, and not production readiness."
}
```

## Blocking rule

Broad Stage 2B multi-role smoke remains blocked until all of the following are true:

1. schema/runtime parity tests pass
2. offline request-shape verification passes for `/v1/notes` and `/v1/messages`
3. corrected repo-candidate schema is committed
4. exact repo-candidate schema SHA256 is computed
5. that exact schema is re-imported into the Science GPT Actions
6. Explorer is rerun first using the corrected Stage 2B smoke packet

If Explorer does not prove request-shape parity on the corrected import, do not continue to Hypothesizer, Designer, or Science Auditor.

## Non-authorizations

This slice does not authorize:

- broader smoke beyond bounded ContextBus commands
- Science write route use
- `/v1/science/share`
- `/v1/science/execute-experiment`
- Option C queue mutation
- Code Monkey route exposure
- HUMAN authority expansion
- `SCIENCE_EXECUTOR_AI` authority expansion
- certification
- promotion
- deployment approval
- production readiness
- autonomous Science operation
