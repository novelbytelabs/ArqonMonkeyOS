# SCIENCE_MONKEYS_READ_ONLY_QUEUE_SCHEMA_IMPORT_LOCK_PLANNING_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Prepare the bounded schema/import-lock planning packet for the Phase 3.1 read-only Science queue visibility schema.

This packet is planning only.

It defines the schema import-lock requirements for a future GPT Action import step.

It does not import GPT Actions, run live routes, run live smoke, activate queue mutation, certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Stage position

Current stage:

Stage 3 — Phase 3.1 read-only queue schema/import-lock planning

Prior accepted packets:

- SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001
- SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_EXECUTION_001
- SCIENCE_MONKEYS_READ_ONLY_QUEUE_CONTEXTOS_OPENAPI_YAML_REPAIR_001

Prior accepted verdicts:

- read-only queue implementation packet proposal: PASS_WITH_WARNINGS
- read-only queue implementation execution: PASS_WITH_WARNINGS
- ContextOS OpenAPI YAML repair: PASS_WITH_WARNINGS

This packet prepares the next decision: whether Human should authorize a bounded GPT Action schema import-lock execution step.

This packet itself does not authorize GPT Action import.

## Candidate schema target

Candidate Science GPT Action schema file:

openapi/science_monkeys_actions.openapi.yaml

Expected candidate schema SHA from prior implementation evidence:

43cf80777891693c5ab7b4075a626a54c874d379fc4ac62da66b54a24b584dd3

The exact schema SHA must be recomputed before any import step.

If the recomputed SHA differs, the import-lock process must stop and record the mismatch.

No evidence may be mixed across schema SHAs.

## Schema import target

Future import-lock, if separately approved, may apply only to the four Science GPTs:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

No Code Monkey GPT may receive this Science GPT Action schema.

No Human authority route may be exposed to Science GPTs.

No Science Executor authority route may be exposed to Science GPTs.

## Approved route surface for import candidate

The Science GPT Action schema candidate may expose the previously approved read/resume, ContextBus, Science role-write, and read-only queue surfaces already present in the audited schema.

For the read-only queue addition, the approved route surface is limited to these GET routes:

- GET /v1/science/queue
- GET /v1/science/queue/{queue_item_id}
- GET /v1/science/queue/by-flow/{flow_ref}
- GET /v1/science/queue/next
- GET /v1/science/queue/blocked
- GET /v1/science/queue/quarantined
- GET /v1/science/queue/handoffs
- GET /v1/science/queue/history/{queue_item_id}

These routes are read-only queue visibility routes.

They are governance coordination routes.

They are not evidence routes.

They are not scientific truth routes.

They are not queue mutation routes.

## Forbidden surfaces for import candidate

The following surfaces must remain absent from the Science GPT Action import candidate:

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
- Helper routes
- Human authority routes
- Science Executor authority routes
- deployment routes
- certification routes
- promotion routes

## Required pre-import checks

A future import-lock execution packet must verify:

1. Repo branch is expected branch.
2. Git status is clean before import-lock evidence is prepared.
3. Candidate schema file exists.
4. Candidate schema parses as YAML.
5. Candidate schema SHA is computed.
6. Candidate schema SHA matches the Human-approved schema SHA.
7. Approved read-only queue GET routes are present.
8. Queue mutation routes are absent.
9. Human decision routes are absent.
10. Executor routes are absent.
11. /v1/science/share is absent.
12. /v1/science/execute-experiment is absent.
13. Code Monkey routes are absent.
14. Human authority routes are absent.
15. Science Executor authority routes are absent.
16. Required status labels are present.
17. Truth-boundary language is present.
18. ContextBus notes/messages remain non-evidence.
19. Queue records remain non-evidence and not scientific truth.
20. GPT Action import has not yet occurred before Human approval.

## Required per-GPT import evidence

For each Science GPT, future import-lock evidence must record:

- GPT name
- expected backend role
- imported schema version
- imported schema SHA
- import timestamp
- operator name or initials
- whether manual UI edits occurred
- whether field-length edits occurred
- whether any schema text was changed during import
- recomputed edited schema SHA if manual edits occurred
- required read-only queue routes present: YES/NO
- forbidden queue mutation routes absent: YES/NO
- forbidden Human routes absent: YES/NO
- forbidden Executor routes absent: YES/NO
- /v1/science/share absent: YES/NO
- /v1/science/execute-experiment absent: YES/NO
- Code Monkey routes absent: YES/NO
- Human authority assignment: NO
- Science Executor authority assignment: NO
- import result: COMPLETE / INCOMPLETE / BLOCKED

## Field-length and manual-edit handling

GPT Action UI field-length constraints may require schema edits.

If the schema must be edited to satisfy UI limits:

1. Stop before import if the edit changes route surface, auth, methods, operationIds, or schemas.
2. Allow only harmless text shortening for descriptions or summaries.
3. Record every manual edit.
4. Recompute the edited schema SHA.
5. Treat the edited schema SHA as the live imported schema SHA.
6. Do not mix evidence from the repo schema SHA with the edited imported schema SHA.
7. Record both repo schema SHA and edited imported schema SHA.
8. Mark any unrecorded manual edit as a blocker.
9. Re-audit the edited schema if the edit changes anything beyond description/summary text.
10. Do not run live smoke until the imported schema SHA is recorded.

## Import-lock evidence file requirements

A future import-lock execution packet must create an evidence file:

artifacts/SCIENCE_MONKEYS_READ_ONLY_QUEUE_SCHEMA_IMPORT_LOCK_001_EVIDENCE.md

It must include:

- required status labels
- slice name
- repo schema file
- repo schema SHA
- imported schema SHA per GPT
- schema version
- import timestamp per GPT
- operator per GPT
- per-GPT route presence matrix
- per-GPT forbidden route absence matrix
- field-length/manual-edit record
- final import-lock status
- explicit no-live-smoke statement
- explicit no-queue-mutation statement
- explicit no-certification/promotion/deployment/production/autonomy statement

## Required import-lock route matrix

Future import-lock evidence must include this matrix per GPT:

| Check | Explorer | Hypothesizer | Designer | Science Auditor |
|---|---:|---:|---:|---:|
| Imported schema SHA recorded | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/{queue_item_id} present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/by-flow/{flow_ref} present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/next present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/blocked present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/quarantined present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/handoffs present | YES/NO | YES/NO | YES/NO | YES/NO |
| GET /v1/science/queue/history/{queue_item_id} present | YES/NO | YES/NO | YES/NO | YES/NO |
| Queue mutation routes absent | YES/NO | YES/NO | YES/NO | YES/NO |
| Human routes absent | YES/NO | YES/NO | YES/NO | YES/NO |
| Executor routes absent | YES/NO | YES/NO | YES/NO | YES/NO |
| /v1/science/share absent | YES/NO | YES/NO | YES/NO | YES/NO |
| /v1/science/execute-experiment absent | YES/NO | YES/NO | YES/NO | YES/NO |
| Code Monkey routes absent | YES/NO | YES/NO | YES/NO | YES/NO |

## No-live-smoke boundary

No live route calls are authorized by import-lock planning.

No live route calls are authorized by import-lock execution unless separately approved.

Import-lock is schema/UI configuration evidence only.

Live smoke must be a later separate Human-approved packet.

## No queue mutation boundary

No queue mutation is authorized by import-lock planning.

No queue mutation is authorized by import-lock execution.

No future live smoke may include queue mutation unless Human separately approves a mutation-specific packet after additional audits.

## Audit lane for future import-lock execution

Future import-lock execution must follow this audit lane:

1. PM-authored import-lock execution packet.
2. Human approval of exact import-lock execution packet.
3. Operator imports exact schema into Science GPTs.
4. Operator records per-GPT import evidence.
5. Helper packages import-lock evidence.
6. Auditor verifies imported schema SHA and route surface.
7. Human decides whether live read-only smoke planning may begin.

## Required future audit zip contents

A future import-lock audit zip must include:

- AUDIT_MANIFEST.json
- AUDIT_MANIFEST.sha256
- import-lock evidence file
- repo schema file
- edited imported schema file if manual edits occurred
- per-GPT import matrix
- forbidden route absence proof
- field-length/manual-edit record
- helper report
- schema SHA proof
- import timestamp records
- operator record
- no-live-smoke statement
- no-queue-mutation statement
- no-certification/promotion/deployment/production/autonomy statement

## Human decision options

Human may choose one after this planning packet is audited:

1. Authorize the bounded import-lock execution packet.
2. Require revisions to this import-lock planning packet.
3. Require additional schema route diff proof before import-lock execution.
4. Require manual UI field-length preflight before import-lock execution.
5. Hold import-lock until additional implementation evidence is collected.

## Recommended next step

Recommended next step after this packet is audited:

Authorize a bounded import-lock execution packet:

SCIENCE_MONKEYS_READ_ONLY_QUEUE_SCHEMA_IMPORT_LOCK_EXECUTION_001

That future packet would authorize import-lock evidence collection only.

It would not authorize live smoke.

It would not authorize queue mutation.

It would not authorize certification, promotion, deployment approval, production readiness, or autonomous Science operation.

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
