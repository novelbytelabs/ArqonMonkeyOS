# SCIENCE_MONKEYS_EXPLORER_ONLY_READ_ONLY_QUEUE_LIVE_SMOKE_AUTHORIZATION_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Prepare the bounded Human authorization decision packet for an Explorer-only read-only queue live smoke.

This packet is planning/authorization only.

It does not run live routes, run smoke, import GPT Actions, change Worker code, change OpenAPI, change tests, activate queue mutation, certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Stage position

Current stage:

Stage 3 — Phase 3.1 Explorer-only read-only queue live-smoke authorization planning

Prior accepted evidence:

- SCIENCE_MONKEYS_EXPLORER_ONLY_ROLE_SCOPED_SCHEMA_IMPORT_LOCK_EVIDENCE_001

Prior accepted verdict:

- PASS_WITH_WARNINGS

Prior evidence boundary:

- Arqon Zero Explorer AI was directly tested for schema/import/read-only queue checks.
- Arqon Zero Hypothesizer AI was statically validated only, not live-tested.
- Arqon Zero Designer AI was statically validated only, not live-tested.
- Arqon Zero Science Auditor AI was statically validated only, not live-tested.

This packet prepares the next Human decision: whether to authorize a bounded Explorer-only read-only queue live smoke.

This packet itself does not authorize the live smoke.

## Human decision under consideration

The only decision this packet prepares is:

Should Human authorize an Explorer-only live smoke of the already-imported Explorer role-scoped schema?

The possible future live-smoke packet would be:

SCIENCE_MONKEYS_EXPLORER_ONLY_READ_ONLY_QUEUE_LIVE_SMOKE_001

That future live smoke must remain limited to Explorer-only, read-only queue and safe identity/context routes.

## Explorer schema lock

Explorer schema path:

openapi/science_monkeys_actions_explorer.openapi.yaml

Explorer schema SHA:

6e00bbcabf2b9a517d8d5d019739fe60347423e1dd1feb1d730f8735f1e1ed8b

Explorer operation count:

27

Before any future live smoke, the operator must confirm the Explorer GPT is still using the schema matching this SHA, or record any edited/imported schema SHA if UI edits occurred.

If the imported schema SHA differs and the difference is not already audited, the live smoke must stop.

## Authorized future live-smoke target

Only this GPT may be live-tested in the future packet:

- Arqon Zero Explorer AI

Expected backend role:

- EXPLORER_AI

The future live smoke must not test:

- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI
- Code Monkey GPTs
- Human authority routes
- Science Executor routes

## Allowed future live-smoke route set

The future Explorer-only live smoke may test only these safe routes:

### Identity and status routes

- GET /v1/whoami
- GET /v1/capabilities

### Safe context/read routes

- GET /v1/context
- GET /v1/constitution

### Read-only queue routes

- GET /v1/science/queue
- GET /v1/science/queue/next
- GET /v1/science/queue/blocked
- GET /v1/science/queue/quarantined
- GET /v1/science/queue/handoffs

### Optional bounded queue detail routes

These may be tested only if a safe queue_item_id or flow_ref is returned by a prior read-only route:

- GET /v1/science/queue/{queue_item_id}
- GET /v1/science/queue/by-flow/{flow_ref}
- GET /v1/science/queue/history/{queue_item_id}

If no safe queue_item_id or flow_ref is returned, these optional routes must be marked NOT_RUN_NO_SAFE_ID.

## Explicitly forbidden in future live smoke

The future live smoke must not call:

- POST /v1/science/queue/{queue_item_id}/claim
- POST /v1/science/queue/{queue_item_id}/complete
- POST /v1/science/queue/{queue_item_id}/block
- POST /v1/science/queue/{queue_item_id}/quarantine
- POST /v1/science/queue/{queue_item_id}/handoff
- POST /v1/science/queue/{queue_item_id}/human-approve
- POST /v1/science/queue/{queue_item_id}/human-reject
- POST /v1/science/queue/{queue_item_id}/human-defer
- POST /v1/science/queue/{queue_item_id}/human-release
- POST /v1/science/queue/{queue_item_id}/human-close
- POST /v1/science/queue/{queue_item_id}/executor-claim
- POST /v1/science/queue/{queue_item_id}/executor-complete
- POST /v1/science/queue/{queue_item_id}/executor-block
- /v1/science/share
- /v1/science/execute-experiment
- Code Monkey routes
- Human authority routes
- Science Executor authority routes
- deployment routes
- certification routes
- promotion routes

The future live smoke must not call Explorer Science write route POST /v1/science/research unless Human separately authorizes a different smoke packet.

This live smoke is read-only queue validation only.

## Expected future live-smoke checks

Each future live route call must report:

- Action attempted: YES/NO
- backend route if visible
- HTTP/tool status
- authenticated backend role if returned
- required status labels present: YES/NO
- queue response returned when applicable: YES/NO
- queue records labeled not evidence / not scientific truth: YES/NO
- recommendation returned when applicable: YES/NO
- recommendation executed automatically: NO
- Science artifact created: NO
- ContextBus note/message created: NO
- queue mutation occurred: NO
- secret exposed: NO
- unsupported claim made: NO
- result: PASS / PASS_WITH_WARNINGS / REMEDIATION_REQUIRED / FAIL_BLOCKED

## Required future evidence boundaries

The future live-smoke evidence must state:

- Explorer was directly live-tested.
- Hypothesizer was not live-tested.
- Designer was not live-tested.
- Science Auditor was not live-tested.
- Other roles remain static-validation-only.
- Explorer live success must not be represented as all-GPT live success.
- Explorer live success must not be represented as certification.
- Explorer live success must not be represented as production readiness.
- Explorer live success must not authorize queue mutation.
- Explorer live success must not authorize deployment.
- Explorer live success must not authorize autonomous Science operation.

## Required future stop conditions

The future live smoke must stop immediately if:

- backend role is not EXPLORER_AI
- HUMAN authority appears
- SCIENCE_EXECUTOR_AI authority appears
- queue mutation route is callable
- queue mutation occurs
- Science artifact is created
- ContextBus note/message is created by queue read
- /v1/science/share appears or is callable
- /v1/science/execute-experiment appears or is callable
- Code Monkey route appears
- Human route appears
- Executor route appears
- secret-like content appears
- required status labels are missing
- queue record is presented as evidence
- queue record is presented as scientific truth
- recommendation executes automatically
- certification is claimed
- promotion is claimed
- deployment approval is claimed
- production readiness is claimed
- autonomous Science operation is claimed

## Required future live-smoke evidence file

A future live-smoke packet must produce:

artifacts/SCIENCE_MONKEYS_EXPLORER_ONLY_READ_ONLY_QUEUE_LIVE_SMOKE_001_EVIDENCE.md

The evidence file must include:

- required status labels
- Explorer schema SHA
- Explorer operation count
- imported schema status
- operator name
- timestamp
- route-by-route results
- forbidden route absence results
- optional route NOT_RUN_NO_SAFE_ID status if applicable
- no-mutation confirmation
- no Science artifact creation confirmation
- no ContextBus note/message creation confirmation
- no Human/Executor authority confirmation
- no secret exposure confirmation
- unsupported claim check
- other-GPT static-only boundary
- final verdict: PASS_WITH_WARNINGS / REMEDIATION_REQUIRED / FAIL_BLOCKED

## Required future audit zip contents

A future live-smoke audit zip must include:

- AUDIT_MANIFEST.json
- AUDIT_MANIFEST.sha256
- live-smoke evidence file
- Explorer role-scoped schema
- Explorer import-lock evidence file
- role-scoped schema generation evidence
- helper report
- route-by-route result table
- forbidden route absence proof
- no-mutation/no-artifact/no-note-message proof
- explicit static-only boundary for other GPTs

## Human decision options

Human may choose one after this authorization packet is audited:

1. Authorize Explorer-only read-only queue live smoke.
2. Request revisions to this authorization packet.
3. Require raw transcript capture format before live smoke.
4. Require a stricter forbidden-route inspection before live smoke.
5. Hold live smoke and remain at import/check evidence only.

## Recommended Human decision

Recommended after audit, if no blockers:

Authorize the bounded Explorer-only read-only queue live smoke packet:

SCIENCE_MONKEYS_EXPLORER_ONLY_READ_ONLY_QUEUE_LIVE_SMOKE_001

That future approval would authorize only:

- Explorer-only live route calls
- safe identity/status/context reads
- read-only queue reads
- no queue mutation
- no broad all-GPT smoke

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
