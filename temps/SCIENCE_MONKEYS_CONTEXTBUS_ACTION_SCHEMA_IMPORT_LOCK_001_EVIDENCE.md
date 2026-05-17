# SCIENCE_MONKEYS_CONTEXTBUS_ACTION_SCHEMA_IMPORT_LOCK_001_EVIDENCE

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Objective:
Import the exact candidate repo schema into the four Science Monkey GPT Actions and record the imported schema SHA before any live smoke.

Canonical repo schema:
- openapi/science_monkeys_actions.openapi.yaml

Required commit:
- 044dd9bc2cf5f63f6c36f96ed8f938985fda0efe

Observed current repo HEAD:
- 044dd9b0ab7a51fa2d567cdad20f2ad1e1455e00

Required schema SHA256:
- b5dfa37aaf7800d6ce2eb279f8b425444434ed70aa3497e6213f981e2be8c290

Observed schema SHA256:
- b5dfa37aaf7800d6ce2eb279f8b425444434ed70aa3497e6213f981e2be8c290

Schema version target:
- 0.3.0-contextbus-command-action-schema

Operator evidence records (one fresh import confirmation per GPT):

## 1) Arqon Zero Explorer AI
- Import date/time:
- Imported schema version:
- Imported schema SHA256:
- Required routes present (`/v1/context`, `/v1/constitution`, `/v1/notes`, `/v1/messages`, `/v1/messages/inbox`, `/v1/messages/{message_id}` GET+POST): YES/NO
- Forbidden routes absent (`/v1/science/share`, `/v1/science/execute-experiment`, queue mutation, Code Monkey, Human authority routes, Science Executor authority routes, deployment/certification/promotion routes): YES/NO
- Operator initials/name:
- Notes:

## 2) Arqon Zero Hypothesizer AI
- Import date/time:
- Imported schema version:
- Imported schema SHA256:
- Required routes present (`/v1/context`, `/v1/constitution`, `/v1/notes`, `/v1/messages`, `/v1/messages/inbox`, `/v1/messages/{message_id}` GET+POST): YES/NO
- Forbidden routes absent (`/v1/science/share`, `/v1/science/execute-experiment`, queue mutation, Code Monkey, Human authority routes, Science Executor authority routes, deployment/certification/promotion routes): YES/NO
- Operator initials/name:
- Notes:

## 3) Arqon Zero Designer AI
- Import date/time:
- Imported schema version:
- Imported schema SHA256:
- Required routes present (`/v1/context`, `/v1/constitution`, `/v1/notes`, `/v1/messages`, `/v1/messages/inbox`, `/v1/messages/{message_id}` GET+POST): YES/NO
- Forbidden routes absent (`/v1/science/share`, `/v1/science/execute-experiment`, queue mutation, Code Monkey, Human authority routes, Science Executor authority routes, deployment/certification/promotion routes): YES/NO
- Operator initials/name:
- Notes:

## 4) Arqon Zero Science Auditor AI
- Import date/time:
- Imported schema version:
- Imported schema SHA256:
- Required routes present (`/v1/context`, `/v1/constitution`, `/v1/notes`, `/v1/messages`, `/v1/messages/inbox`, `/v1/messages/{message_id}` GET+POST): YES/NO
- Forbidden routes absent (`/v1/science/share`, `/v1/science/execute-experiment`, queue mutation, Code Monkey, Human authority routes, Science Executor authority routes, deployment/certification/promotion routes): YES/NO
- Operator initials/name:
- Notes:

Operator checks before smoke:
- Live smoke run before import lock completion: NO
- Any manual route edits in GPT Actions: NO
- Any schema edits during import: NO

Final import lock status:
- COMPLETE / INCOMPLETE

Forbidden acknowledgements:
- No /v1/science/share exposure.
- No /v1/science/execute-experiment exposure.
- No Code Monkey route exposure.
- No Option C queue mutation exposure.
- No certification/promotion/deployment/production readiness/autonomous operation claims.

---

## Explorer-only Archive Cache-Binding Import/Rerun Evidence

Recorded timestamp (UTC): 2026-05-17T21:33:01Z
Operator: UNKNOWN

Slice:
SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001

GPT:
Arqon Zero Explorer AI

Imported schema version:
0.3.1-contextbus-archive-action-cache-binding

Imported schema SHA256:
b7792f8af7e77e16ad96222100d88458b5f516af13a3f9a77efc8bcbb6060724

Archive route present:
POST /v1/messages/{message_id}/archive = YES

Archive operationId:
archiveRoleMessageByArchivePath = YES

Stale archive route absent:
POST /v1/messages/{message_id} = YES

Stale operationId absent:
archiveRoleMessage = YES

Forbidden routes absent:
YES

Smoke check result:
- GET /v1/messages/MSG-2026-05-17-5b2abff1 = PASS
  - message retrieved
- POST /v1/messages/MSG-2026-05-17-5b2abff1/archive = PASS
  - message archived

Science artifact created:
NO

Science write route called:
NO

Secrets exposed:
NO

Human authority leak:
NO

Science Executor authority leak:
NO

Unsupported claims:
- certification: NO
- promotion: NO
- deployment approval: NO
- production readiness: NO
- autonomous Science operation: NO

Explorer-only archive parity verdict:
PASS_WITH_WARNINGS

Boundary:
This closes only the Explorer-only archive cache-binding rerun. It does not authorize broader smoke, certification, promotion, deployment approval, production readiness, or autonomous Science operation.

---

## SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_SCHEMA_UI_LENGTH_RECONCILIATION_001

Timestamp (UTC): 2026-05-17T21:43:56Z
Operator: UNKNOWN
Explorer archive rerun result: PASS_WITH_WARNINGS
Imported/resized schema used by Explorer: YES
schema_ui_length_reconciled_sha256_before_commit: c73bc8c331a5dda7bdb71ce22b272afa386c4eabf3cbb22ba31ddcf9cf2bc297
Boundary: Explorer-only archive check; no broader smoke.

---

## Remaining Science GPT Import Evidence (Operator-Provided)

Timestamp (UTC): 2026-05-17T21:56:41Z
Schema version: 0.3.1-contextbus-archive-action-cache-binding
Controlling schema SHA256: c73bc8c331a5dda7bdb71ce22b272afa386c4eabf3cbb22ba31ddcf9cf2bc297

Current controlling schema SHA:
c73bc8c331a5dda7bdb71ce22b272afa386c4eabf3cbb22ba31ddcf9cf2bc297

Superseded historical schema SHA:
b7792f8af7e77e16ad96222100d88458b5f516af13a3f9a77efc8bcbb6060724

Current import status:
EXPLORER_IMPORTED_RESIZED_SCHEMA
HYPOTHESIZER_IMPORTED_RESIZED_SCHEMA: NO
DESIGNER_IMPORTED_RESIZED_SCHEMA: NO
SCIENCE_AUDITOR_IMPORTED_RESIZED_SCHEMA: NO

Broader smoke:
NOT_RUN

### Remaining Import Lock Route Assertions (Explicit)
- archive route present: POST /v1/messages/{message_id}/archive
- archive operationId: archiveRoleMessageByArchivePath
- open-message route present: GET /v1/messages/{message_id}
- open-message operationId: openRoleMessage
- stale archive route absent: POST /v1/messages/{message_id}
- stale operationId absent: archiveRoleMessage
- forbidden routes absent: YES
- broader smoke: NOT_RUN
