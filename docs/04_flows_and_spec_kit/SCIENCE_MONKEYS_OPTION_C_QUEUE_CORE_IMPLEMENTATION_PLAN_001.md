# SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_IMPLEMENTATION_PLAN_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the exact future implementation requirements for the Stage 3 Option C Diagnostic Queue Lane.

This packet is implementation planning only.

It does not implement routes, change Worker code, change OpenAPI, change tests, import GPT Actions, activate queue mutation, certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Stage position

Current stage:

Stage 3 — Option C queue core implementation planning

Prior accepted planning packet:

SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_PLANNING_001

Prior accepted verdict:

PASS_WITH_WARNINGS

This packet refines the prior planning/design packet into an exact implementation plan for a possible future implementation packet.

The future implementation packet is not authorized by this document.

## Core implementation boundary

The future implementation must preserve these boundaries:

- read broadly
- write narrowly
- Human advances
- local Science Executor executes
- Human shares
- GPTs do not receive Human authority
- GPTs do not receive Science Executor authority
- queue records are governance coordination records, not scientific truth
- raw GPT output is not evidence
- ContextBus notes/messages are non-official diagnostic transport only
- routed artifacts are governed records, not scientific truth
- No harness = No truth

## Implementation phases

Future implementation should be split into bounded implementation phases.

### Phase 3.1 — Read-only queue visibility

Purpose:

Expose read-only queue state so Science roles and Human can inspect work without mutation.

Allowed future implementation scope:

- safe queue listing
- safe queue item read
- queue-by-flow lookup
- next queue item recommendation
- blocked/quarantined queue views
- queue history read

Not allowed in Phase 3.1:

- queue mutation
- claim
- complete
- block
- quarantine
- handoff
- Human decisions
- Executor actions
- share
- experiment execution
- Science artifact creation by queue route

### Phase 3.2 — Bounded role mutation

Purpose:

Allow only specifically authorized role-scoped queue mutations after Phase 3.1 passes audit.

Candidate operations:

- claim
- complete bounded role step
- block
- quarantine
- handoff

Not allowed in Phase 3.2 unless separately scoped:

- Human approval
- Human release
- Human share
- Science Executor execution
- certification
- promotion
- deployment approval
- production-readiness decisions

### Phase 3.3 — Human decision ledger integration

Purpose:

Connect queue state to Human-only decisions.

Candidate operations:

- Human approve
- Human reject
- Human defer
- Human release
- Human close

Not allowed:

- GPT Human authority
- GPT approval
- GPT release
- GPT share approval
- Human-equivalent backend role for GPTs

### Phase 3.4 — Executor boundary integration

Purpose:

Represent local Science Executor work in queue state without giving GPTs Executor authority.

Candidate operations:

- executor claim
- executor complete
- executor block

Not allowed:

- GPT calls to executor routes
- GPT executor authority
- Action schema exposure of executor routes to Science GPTs

## Exact proposed route list

This section defines candidate routes for a future implementation packet.

No route is authorized by this planning packet.

### Read-only routes for Phase 3.1

| Route | Method | Purpose | Mutation allowed |
|---|---:|---|---:|
| `/v1/science/queue` | GET | List role-visible queue items | NO |
| `/v1/science/queue/{queue_item_id}` | GET | Read one queue item | NO |
| `/v1/science/queue/by-flow/{flow_ref}` | GET | List queue items for a flow | NO |
| `/v1/science/queue/next` | GET | Recommend next queue item/action for role | NO |
| `/v1/science/queue/blocked` | GET | List blocked queue items | NO |
| `/v1/science/queue/quarantined` | GET | List quarantined queue items | NO |
| `/v1/science/queue/handoffs` | GET | List handoffs visible to role | NO |
| `/v1/science/queue/history/{queue_item_id}` | GET | Read queue item history | NO |

### Role mutation routes for Phase 3.2

| Route | Method | Purpose | Implementation status |
|---|---:|---|---|
| `/v1/science/queue/{queue_item_id}/claim` | POST | Role claims allowed item | candidate only |
| `/v1/science/queue/{queue_item_id}/complete` | POST | Role completes bounded step | candidate only |
| `/v1/science/queue/{queue_item_id}/block` | POST | Role marks item blocked | candidate only |
| `/v1/science/queue/{queue_item_id}/quarantine` | POST | Role quarantines item | candidate only |
| `/v1/science/queue/{queue_item_id}/handoff` | POST | Role creates bounded handoff | candidate only |

### Human-only routes for Phase 3.3

| Route | Method | Authority | Implementation status |
|---|---:|---|---|
| `/v1/science/queue/{queue_item_id}/human-approve` | POST | HUMAN only | candidate only |
| `/v1/science/queue/{queue_item_id}/human-reject` | POST | HUMAN only | candidate only |
| `/v1/science/queue/{queue_item_id}/human-defer` | POST | HUMAN only | candidate only |
| `/v1/science/queue/{queue_item_id}/human-release` | POST | HUMAN only | candidate only |
| `/v1/science/queue/{queue_item_id}/human-close` | POST | HUMAN only | candidate only |

### Science Executor-only routes for Phase 3.4

| Route | Method | Authority | Implementation status |
|---|---:|---|---|
| `/v1/science/queue/{queue_item_id}/executor-claim` | POST | SCIENCE_EXECUTOR_AI local/non-GPT only | candidate only |
| `/v1/science/queue/{queue_item_id}/executor-complete` | POST | SCIENCE_EXECUTOR_AI local/non-GPT only | candidate only |
| `/v1/science/queue/{queue_item_id}/executor-block` | POST | SCIENCE_EXECUTOR_AI local/non-GPT only | candidate only |

## Exact proposed auth matrix

This matrix is candidate planning only.

| Role | Queue read | claim | complete | block | quarantine | handoff | Human decisions | Executor actions |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| EXPLORER_AI | YES role-scoped | future scoped | future scoped | future scoped | future scoped | future scoped | NO | NO |
| HYPOTHESIZER_AI | YES role-scoped | future scoped | future scoped | future scoped | future scoped | future scoped | NO | NO |
| DESIGNER_AI | YES role-scoped | future scoped | future scoped | future scoped | future scoped | future scoped | NO | NO |
| SCIENCE_AUDITOR_AI | YES role-scoped | future scoped | future scoped | future scoped | future scoped | future scoped | NO | NO |
| HUMAN | YES broad | YES if needed | YES if needed | YES | YES | YES | YES | NO unless separately authorized |
| SCIENCE_EXECUTOR_AI | YES executor-scoped | executor-only | executor-only | executor-only | NO unless scoped | NO unless scoped | NO | YES |
| CODE roles | NO through Science GPT schema | NO | NO | NO | NO | NO | NO | NO |

## Exact proposed state transition table

Candidate state values:

- NEW
- READY
- CLAIMED
- IN_PROGRESS
- WAITING_FOR_ROLE
- WAITING_FOR_EXECUTOR
- WAITING_FOR_HUMAN
- BLOCKED
- QUARANTINED
- COMPLETED_STEP
- CLOSED_BY_HUMAN
- CANCELLED_BY_HUMAN

Candidate transitions:

| From | To | Allowed actor | Required condition |
|---|---|---|---|
| NEW | READY | backend policy or authorized role | minimal metadata valid |
| READY | CLAIMED | authorized role | role matches allowed_next_role |
| CLAIMED | IN_PROGRESS | claiming role | actor owns claim |
| IN_PROGRESS | COMPLETED_STEP | claiming role | required bounded output reference present |
| any active | BLOCKED | authorized role | missing input, evidence, role action, or Human decision |
| any active | QUARANTINED | authorized role or Auditor | safety/evidence/authority concern |
| any active | WAITING_FOR_ROLE | backend policy or authorized role | next role action required |
| any active | WAITING_FOR_EXECUTOR | authorized role or Human | local executor action required |
| any active | WAITING_FOR_HUMAN | authorized role or backend policy | Human decision required |
| WAITING_FOR_HUMAN | CLOSED_BY_HUMAN | HUMAN only | Human close decision recorded |
| WAITING_FOR_HUMAN | CANCELLED_BY_HUMAN | HUMAN only | Human cancel decision recorded |
| WAITING_FOR_EXECUTOR | COMPLETED_STEP | SCIENCE_EXECUTOR_AI only | executor evidence reference present |

Invalid transitions must fail closed.

## Proposed queue item schema

Draft planning schema only.

```json
{
  "queue_item_id": "string",
  "project": "ArqonZero",
  "flow_id": "string",
  "flow_ref": "string",
  "queue_lane": "diagnostic",
  "current_state": "NEW | READY | CLAIMED | IN_PROGRESS | WAITING_FOR_ROLE | WAITING_FOR_EXECUTOR | WAITING_FOR_HUMAN | BLOCKED | QUARANTINED | COMPLETED_STEP | CLOSED_BY_HUMAN | CANCELLED_BY_HUMAN",
  "current_role_owner": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN | SCIENCE_EXECUTOR_AI | UNKNOWN",
  "allowed_next_role": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN | SCIENCE_EXECUTOR_AI | NONE",
  "allowed_next_action": "string",
  "blocked_reason": "string | null",
  "stop_condition": "string | null",
  "related_artifacts": [],
  "evidence_requirements": [],
  "created_by_role": "string",
  "updated_by_role": "string",
  "created_at": "string",
  "updated_at": "string",
  "audit_status": "UNKNOWN | PASS_WITH_WARNINGS | REMEDIATION_REQUIRED | FAIL_BLOCKED",
  "human_decision_status": "NONE | WAITING | APPROVED | REJECTED | DEFERRED | CLOSED"
}
```

## Proposed request schemas

Draft planning schemas only.

### Claim request

```json
{
  "project": "ArqonZero",
  "queue_item_id": "string",
  "claim_note": "string"
}
```

### Complete request

```json
{
  "project": "ArqonZero",
  "queue_item_id": "string",
  "completion_note": "string",
  "output_refs": [
    {
      "ref_type": "artifact | evidence | commit | manifest | audit_zip",
      "ref_id": "string",
      "sha256": "string"
    }
  ]
}
```

### Block request

```json
{
  "project": "ArqonZero",
  "queue_item_id": "string",
  "blocked_reason": "string",
  "required_resolution": "string"
}
```

### Quarantine request

```json
{
  "project": "ArqonZero",
  "queue_item_id": "string",
  "quarantine_reason": "string",
  "authority_or_evidence_concern": "string"
}
```

### Handoff request

```json
{
  "project": "ArqonZero",
  "queue_item_id": "string",
  "to_role": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN | SCIENCE_EXECUTOR_AI",
  "handoff_note": "string",
  "context_refs": []
}
```

## Proposed response schema

Draft planning schema only.

```json
{
  "ok": true,
  "project": "ArqonZero",
  "queue_item": {},
  "mutation": {
    "changed": true,
    "from_state": "string",
    "to_state": "string",
    "actor_role": "string",
    "timestamp": "string",
    "mutation_id": "string"
  },
  "required_status_labels": [
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable"
  ],
  "truth_boundary": {
    "queue_record_is_truth": false,
    "raw_gpt_output_is_evidence": false,
    "contextbus_notes_messages_are_evidence": false,
    "requires_harness": true
  }
}
```

## Exact forbidden route list

Forbidden for Science GPT Action exposure unless separately approved:

- /v1/science/share
- /v1/science/execute-experiment
- /v1/science/queue/{queue_item_id}/human-approve
- /v1/science/queue/{queue_item_id}/human-reject
- /v1/science/queue/{queue_item_id}/human-defer
- /v1/science/queue/{queue_item_id}/human-release
- /v1/science/queue/{queue_item_id}/human-close
- /v1/science/queue/{queue_item_id}/executor-claim
- /v1/science/queue/{queue_item_id}/executor-complete
- /v1/science/queue/{queue_item_id}/executor-block
- Code Monkey routes
- deployment routes
- certification routes
- promotion routes

## Negative test requirements

Future implementation packet must include negative tests for:

- GPT cannot call /v1/science/share
- GPT cannot call /v1/science/execute-experiment
- GPT cannot call Human-only queue routes
- GPT cannot call Executor-only queue routes
- GPT cannot spoof role=HUMAN
- GPT cannot spoof role=SCIENCE_EXECUTOR_AI
- Code Monkey routes are not exposed through Science GPT schema
- invalid state transition fails closed
- mutation without authorized role fails closed
- complete without required output_refs fails closed
- block without blocked_reason fails closed
- quarantine without quarantine_reason fails closed
- handoff to forbidden role fails closed
- unknown queue_item_id fails closed
- queue mutation route unavailable in read-only phase
- read-only route does not mutate state
- raw GPT output cannot satisfy evidence requirement
- ContextBus note/message cannot satisfy evidence requirement
- secret-like content is refused or redacted
- missing status labels fail test
- certification/promotion/deployment/production/autonomy claims fail test

## Tripwire harness requirements

Future implementation packet must include a tripwire harness that proves:

- allowed route set exactly matches scoped implementation
- forbidden route set is absent
- auth matrix is enforced
- invalid state transitions fail closed
- read-only routes do not mutate
- mutation routes mutate only expected queue record
- mutation audit trail records actor role and timestamp
- Human-only transitions require HUMAN
- Executor-only transitions require SCIENCE_EXECUTOR_AI
- GPT roles cannot acquire Human authority
- GPT roles cannot acquire Executor authority
- queue records are not evidence
- ContextBus notes/messages are not evidence
- raw GPT output is not evidence
- No harness = No truth remains present
- required status labels remain present

## Audit zip requirements

Future implementation packet audit zip must include:

- AUDIT_MANIFEST.json
- AUDIT_MANIFEST.sha256
- implementation packet doc
- exact route matrix
- exact auth matrix
- exact state transition table
- exact request/response schema
- Worker source diff or file list
- OpenAPI diff or file list
- test files
- tripwire harness
- command logs
- helper report
- git commit SHA
- schema SHA
- audit zip SHA
- evidence of no forbidden route exposure
- evidence of no Human/Executor authority leak
- evidence of no certification/promotion/deployment/production/autonomy claim

## Schema SHA lock procedure

Future implementation packet must require:

1. Compute repo schema SHA before implementation.
2. Apply scoped schema changes only if authorized.
3. Compute repo schema SHA after implementation.
4. Record schema SHA in audit manifest.
5. Import exact schema into GPT Actions only after audit and Human approval.
6. Record imported schema SHA per GPT.
7. Do not mix evidence between schema versions.
8. If schema and imported GPT Action schema differ, mark evidence invalid or candidate-only.

## GPT Action import-lock procedure

Future GPT Action import-lock must record:

- GPT name
- imported schema version
- imported schema SHA
- imported route set
- forbidden route absence
- operator name
- import timestamp
- whether any manual UI edits occurred
- whether field-length edits occurred
- whether edited schema SHA was recomputed
- whether live smoke used exact imported schema

## Human approval boundary

Human approval is required before:

- implementation packet execution
- schema changes
- Worker changes
- OpenAPI changes
- GPT Action import
- queue mutation route activation
- live queue mutation smoke
- Human decision route implementation
- Executor route implementation
- any move from planning to implementation

Human approval is still not certification, promotion, deployment approval, production readiness, or autonomous operation approval.

## Rollback and remediation procedure

Future implementation packet must define:

- how to disable newly exposed routes
- how to revert schema changes
- how to remove GPT Action exposure
- how to quarantine bad queue records
- how to rollback Worker code
- how to restore prior schema SHA
- how to mark evidence invalid when schema drift is detected
- how to preserve audit trail without laundering failed evidence

## Required future staged implementation order

Recommended order:

1. Read-only queue visibility implementation.
2. Read-only queue smoke.
3. Read-only queue audit.
4. Human decision whether to allow bounded mutation planning.
5. Bounded role mutation implementation planning.
6. Bounded role mutation implementation only after separate Human approval.
7. Role mutation smoke.
8. Role mutation audit.
9. Human decision ledger planning.
10. Executor boundary planning.
11. Code Monkeys Spec-Kit Fidelity checkpoint before Unified Science + Code model.

## Out of scope

This packet does not authorize:

- Worker code changes
- OpenAPI changes
- test changes
- route implementation
- queue mutation activation
- live route calls
- live smoke
- GPT Action import
- Code Monkey route exposure
- /v1/science/share exposure
- /v1/science/execute-experiment exposure
- Human authority for GPTs
- Science Executor authority for GPTs
- certification
- promotion
- deployment approval
- production-readiness claim
- autonomous Science operation

## Final recommendation

Recommended next Human decision:

Accept this implementation planning packet for audit.

If audit passes, the next possible bounded PM slice should still be planning or read-only implementation authorization only, not mutation.

Recommended future slice after audit:

SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001

That future slice would require separate explicit Human approval before any implementation.

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
