# SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the exact proposed implementation packet for Phase 3.1 Option C read-only queue visibility.

This packet is an implementation packet proposal only.

It is ready for audit and Human review.

It does not authorize Helper execution.

It does not authorize Worker changes, OpenAPI changes, test changes, live route calls, GPT Action import, queue mutation, certification, promotion, deployment approval, production-readiness claims, or autonomous Science operation.

Helper must not apply this packet until Human separately approves execution of this exact packet after audit.

## Stage position

Current stage:

Stage 3 — Option C read-only queue implementation packet authoring

Prior accepted packets:

- SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_PLANNING_001
- SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_IMPLEMENTATION_PLAN_001
- SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_AUTHORIZATION_PLAN_001

Prior accepted verdicts:

- Option C queue core planning: PASS_WITH_WARNINGS
- Option C queue core implementation planning: PASS_WITH_WARNINGS
- read-only queue implementation authorization plan: PASS_WITH_WARNINGS

This packet proposes the exact future implementation scope for Phase 3.1 read-only queue visibility.

This packet still requires audit and a separate Human execution approval before Helper may apply any implementation.

## Non-negotiable execution boundary

The future execution of this packet, if separately approved, must be limited to read-only queue visibility.

No queue mutation may be implemented.

No Human decision routes may be implemented.

No Science Executor routes may be implemented.

No GPT Action import may occur.

No live route smoke may occur until offline implementation audit passes and Human separately approves import/smoke.

## Exact implementation objective

Implement a read-only Science queue visibility surface that lets authenticated roles inspect queue-like Science workflow state without mutating repo state.

The implementation should expose safe metadata only.

The implementation should support role-scoped queue visibility.

The implementation must keep queue records as governance coordination records, not evidence and not scientific truth.

## Exact route scope

The maximum route scope for this implementation packet is:

| Route | Method | Purpose | Mutation allowed |
|---|---:|---|---:|
| `/v1/science/queue` | GET | List role-visible queue items | NO |
| `/v1/science/queue/{queue_item_id}` | GET | Read one queue item | NO |
| `/v1/science/queue/by-flow/{flow_ref}` | GET | List queue items for a flow | NO |
| `/v1/science/queue/next` | GET | Recommend next queue item/action for authenticated role | NO |
| `/v1/science/queue/blocked` | GET | List blocked queue items visible to authenticated role | NO |
| `/v1/science/queue/quarantined` | GET | List quarantined queue items visible to authenticated role | NO |
| `/v1/science/queue/handoffs` | GET | List handoffs visible to authenticated role | NO |
| `/v1/science/queue/history/{queue_item_id}` | GET | Read queue item history | NO |

A future implementation may implement fewer routes if required by code constraints, but it must not implement any route outside this list.

## Explicitly forbidden route scope

The following routes must not be implemented, exposed, or added to GPT Actions in this packet:

- `/v1/science/queue/{queue_item_id}/claim`
- `/v1/science/queue/{queue_item_id}/complete`
- `/v1/science/queue/{queue_item_id}/block`
- `/v1/science/queue/{queue_item_id}/quarantine`
- `/v1/science/queue/{queue_item_id}/handoff`
- `/v1/science/queue/{queue_item_id}/human-approve`
- `/v1/science/queue/{queue_item_id}/human-reject`
- `/v1/science/queue/{queue_item_id}/human-defer`
- `/v1/science/queue/{queue_item_id}/human-release`
- `/v1/science/queue/{queue_item_id}/human-close`
- `/v1/science/queue/{queue_item_id}/executor-claim`
- `/v1/science/queue/{queue_item_id}/executor-complete`
- `/v1/science/queue/{queue_item_id}/executor-block`
- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- Human authority routes for GPTs
- Science Executor authority routes for GPTs
- deployment routes
- certification routes
- promotion routes

## Exact proposed file changes

This section defines the maximum allowed future execution changes.

No file change is authorized until Human separately approves execution after audit.

### Worker files proposed for future modification

Allowed future Worker file changes:

- `worker/src/index.ts`
- `worker/src/science_queue_read.ts`

`worker/src/index.ts` may be modified only to register the approved read-only queue GET routes.

`worker/src/science_queue_read.ts` may be created to implement read-only queue helpers and handlers.

No other Worker source file may be changed unless the future execution packet stops and reports the missing required file.

### OpenAPI files proposed for future modification

Allowed future OpenAPI file changes:

- `openapi/arqon_contextos.openapi.yaml`
- `openapi/science_monkeys_actions.openapi.yaml`

OpenAPI changes must be limited to documenting approved read-only queue GET routes.

OpenAPI must not add mutation routes.

OpenAPI must not expose `/v1/science/share`.

OpenAPI must not expose `/v1/science/execute-experiment`.

OpenAPI must not expose Code Monkey routes through Science GPT Action schema.

OpenAPI must not expose Human-only or Science Executor-only queue routes to GPTs.

### Test/support files proposed for future addition

Allowed future test/support files:

- `worker/test_support/science_monkeys_read_only_queue_policy_unit.py`
- `worker/test_support/science_monkeys_read_only_queue_tripwire.py`
- `worker/test_support/science_monkeys_read_only_queue_offline_smoke.ts`
- `worker/test_support/build_read_only_queue_audit_bundle.py`

No additional test/support files may be created unless the future execution packet stops and reports the missing required file.

### Documentation/evidence files proposed for future addition

Allowed future documentation/evidence files:

- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001.md`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001_EVIDENCE.md`
- `temps/science_monkeys_read_only_queue_implementation_001_helper_report.md`

## Read-only queue source model

The implementation should derive queue visibility from existing governed Science flow records and manifests.

The implementation should not require new queue mutation records for Phase 3.1.

The implementation may synthesize read-only queue items from existing flow metadata, artifact summaries, current flow state, and existing next-action/stop-condition logic.

The implementation must not create queue records during read-only calls.

The implementation must not write queue state.

The implementation must not create Science artifacts.

The implementation must not create ContextBus notes/messages.

The implementation must not create Human decision records.

The implementation must not create Science Executor records.

## Proposed queue item read model

A read-only queue item may include:

```json
{
  "queue_item_id": "string",
  "project": "ArqonZero",
  "flow_id": "string",
  "flow_ref": "string",
  "queue_lane": "diagnostic",
  "current_state": "READY | WAITING_FOR_ROLE | WAITING_FOR_EXECUTOR | WAITING_FOR_HUMAN | BLOCKED | QUARANTINED | COMPLETED_STEP | UNKNOWN",
  "current_role_owner": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN | SCIENCE_EXECUTOR_AI | UNKNOWN",
  "allowed_next_role": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN | SCIENCE_EXECUTOR_AI | NONE | UNKNOWN",
  "allowed_next_action": "string",
  "blocked_reason": "string | null",
  "stop_condition": "string | null",
  "related_artifacts": [],
  "evidence_requirements": [],
  "audit_status": "UNKNOWN | PASS_WITH_WARNINGS | REMEDIATION_REQUIRED | FAIL_BLOCKED",
  "human_decision_status": "NONE | WAITING | APPROVED | REJECTED | DEFERRED | CLOSED | UNKNOWN",
  "truth_boundary": {
    "queue_record_is_truth": false,
    "queue_record_is_evidence": false,
    "raw_gpt_output_is_evidence": false,
    "contextbus_notes_messages_are_evidence": false,
    "requires_harness": true
  }
}
```

This schema is proposed for implementation.

It must remain read-only.

## Response requirements

Every read-only queue route response must include:

- `ok`
- `project`
- `authenticated_role` or equivalent role field
- `required_status_labels`
- `truth_boundary`
- queue item or queue item list
- no-mutation indicator if available
- warning that queue records are governance coordination records, not evidence or scientific truth

Required status labels:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Required truth-boundary fields:

```json
{
  "queue_record_is_truth": false,
  "queue_record_is_evidence": false,
  "raw_gpt_output_is_evidence": false,
  "contextbus_notes_messages_are_evidence": false,
  "requires_harness": true
}
```

## Role visibility requirements

Phase 3.1 must implement conservative role-scoped visibility.

Minimum role behavior:

| Role | Visibility |
|---|---|
| EXPLORER_AI | read queue items relevant to Explorer work and safe flow metadata |
| HYPOTHESIZER_AI | read queue items relevant to hypothesis/interpretation work and safe flow metadata |
| DESIGNER_AI | read queue items relevant to design work and safe flow metadata |
| SCIENCE_AUDITOR_AI | read queue items relevant to audit/record/review work and safe flow metadata |
| HUMAN | broad read visibility if existing backend Human auth supports it |
| SCIENCE_EXECUTOR_AI | no GPT Action exposure; local/non-GPT only |
| Code roles | not exposed through Science GPT Action schema |

If role-specific filtering cannot be fully proven, implementation must default to conservative safe metadata and mark uncertain fields as UNKNOWN.

## Exact no-mutation proof requirement

The future execution must prove no mutation.

Required proof:

1. Capture write count before read-only route calls.
2. Call each implemented read-only queue route in offline smoke.
3. Capture write count after read-only route calls.
4. Assert write count delta is zero.
5. Assert no Science artifact was created.
6. Assert no ContextBus note/message was created.
7. Assert no Human decision record was created.
8. Assert no Science Executor record was created.
9. Assert no queue mutation record was created.
10. Assert no route response includes mutation success.

If the existing repo-store abstraction does not expose write count, implement a test-only counting wrapper in the offline smoke harness, not in production route behavior.

## Exact negative tests required

The future implementation must include tests proving:

- GET `/v1/science/queue` succeeds or safely returns empty list without mutation.
- GET `/v1/science/queue/{queue_item_id}` succeeds for known safe item or fails closed for unknown item.
- GET `/v1/science/queue/by-flow/{flow_ref}` succeeds for known safe flow or fails closed.
- GET `/v1/science/queue/next` recommends only and does not mutate.
- GET `/v1/science/queue/blocked` reads only.
- GET `/v1/science/queue/quarantined` reads only.
- GET `/v1/science/queue/handoffs` reads only.
- GET `/v1/science/queue/history/{queue_item_id}` reads only.
- POST to every read-only route fails closed.
- PUT to every read-only route fails closed.
- DELETE to every read-only route fails closed.
- mutation route `/claim` is absent.
- mutation route `/complete` is absent.
- mutation route `/block` is absent.
- mutation route `/quarantine` is absent.
- mutation route `/handoff` is absent.
- Human decision routes are absent.
- Executor routes are absent.
- `/v1/science/share` remains absent from Science GPT Action schema.
- `/v1/science/execute-experiment` remains absent from Science GPT Action schema.
- Code Monkey routes remain absent from Science GPT Action schema.
- `role=HUMAN` spoofing does not override bearer-token role.
- `role=SCIENCE_EXECUTOR_AI` spoofing does not override bearer-token role.
- queue response does not treat queue record as evidence.
- queue response does not treat raw GPT output as evidence.
- queue response does not treat ContextBus notes/messages as evidence.
- secret-like content is not exposed.
- required status labels are present.

## Exact tripwire harness requirements

The tripwire must fail if:

- any mutation route is exposed
- any Human queue route is exposed to GPT Action schema
- any Executor queue route is exposed to GPT Action schema
- `/v1/science/share` is exposed
- `/v1/science/execute-experiment` is exposed
- Code Monkey routes are exposed through Science GPT Action schema
- any read-only route mutates state
- any Science artifact is created by read-only queue route
- any ContextBus note/message is created by read-only queue route
- any queue record claims to be scientific truth
- any raw GPT output is treated as evidence
- any ContextBus note/message is treated as evidence
- required status labels are missing
- No harness = No truth is missing from docs/evidence
- certification, promotion, deployment, production readiness, or autonomous operation is claimed

## Exact OpenAPI requirements

If future execution is approved, OpenAPI changes must:

- add only approved read-only queue GET routes
- use operation IDs that clearly indicate read-only behavior
- document that responses are governance coordination records
- document that queue records are not evidence
- document no mutation behavior
- omit all mutation routes
- omit Human queue decision routes
- omit Science Executor queue routes
- omit `/v1/science/share`
- omit `/v1/science/execute-experiment`
- omit Code Monkey routes from Science GPT Action schema

Suggested operation IDs:

- `listScienceQueue`
- `getScienceQueueItem`
- `listScienceQueueByFlow`
- `getScienceQueueNext`
- `listScienceQueueBlocked`
- `listScienceQueueQuarantined`
- `listScienceQueueHandoffs`
- `getScienceQueueHistory`

## Exact Worker implementation requirements

If future execution is approved, Worker changes must:

- add read-only handlers only
- use bearer-token authenticated role as authoritative
- ignore or reject role query spoofing
- return safe metadata only
- mark unknown values as UNKNOWN
- hide unsafe paths
- never write during read-only calls
- never create artifacts during read-only calls
- never call ContextBus note/message write paths
- never call Human decision paths
- never call Science Executor paths
- never call share or execute-experiment paths

## Exact audit zip requirements

Future implementation audit zip must include:

- `AUDIT_MANIFEST.json`
- `AUDIT_MANIFEST.sha256`
- this implementation packet
- implementation evidence file
- route matrix
- auth matrix
- response schema
- OpenAPI files or diffs
- Worker source files or diffs
- test files
- tripwire harness
- offline smoke logs
- no-mutation proof
- command logs
- helper report
- schema SHA before
- schema SHA after
- commit SHA
- audit zip SHA
- evidence of no forbidden route exposure
- evidence of no Human/Executor authority leak
- evidence of no Science artifact creation
- evidence of no ContextBus note/message creation by queue reads
- evidence of no certification/promotion/deployment/production/autonomy claim

## Exact schema SHA lock procedure

Future implementation execution must:

1. Compute current repo schema SHA before changes.
2. Apply approved OpenAPI changes only.
3. Compute repo schema SHA after changes.
4. Record both schema SHAs in evidence.
5. Do not import GPT Actions.
6. Do not run live smoke.
7. Mark schema as candidate until audited and Human-approved for import.

## Exact GPT Action import-lock procedure

No GPT Action import is authorized by this packet.

Future import requires:

1. Implementation audit pass.
2. Human import approval.
3. Exact schema SHA selected for import.
4. Per-GPT import record.
5. Imported schema SHA recorded.
6. Manual UI edits recorded.
7. Field-length edits recorded.
8. Recomputed edited schema SHA if manual edits occur.
9. Live smoke tied to exact imported schema SHA.

## Exact rollback plan

Future implementation packet must support rollback:

- revert Worker route additions
- revert OpenAPI route additions
- remove candidate schema from GPT Actions if imported later
- restore prior schema SHA
- mark live smoke invalid if schema removed
- preserve failed evidence without laundering
- quarantine any queue read evidence if no-mutation proof fails
- mark implementation as REMEDIATION_REQUIRED or FAIL_BLOCKED if route overreach appears

## Stop conditions for future execution

Future Helper execution must stop if:

- any unauthorized file would need to change
- any mutation route appears
- any Human route appears
- any Executor route appears
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears in Science GPT Action schema
- no-mutation proof cannot be produced
- any read-only route mutates
- any Science artifact is created
- any ContextBus note/message is created by queue read
- role spoofing succeeds
- secret-like content appears
- required status labels are missing
- certification/promotion/deployment/production/autonomy claim appears
- live route call would be required
- GPT Action import would be required

## Required execution gates if Human later approves implementation

Future execution must run, at minimum:

- TypeScript compile/check gate
- offline route/policy unit
- offline smoke with write-count/no-mutation proof
- forbidden-route tripwire
- schema-surface tripwire
- role-spoof negative tests
- source diff/file-list verification
- audit bundle builder
- audit zip hash verification
- audit zip content verification

## Human decision options

Human may choose one after this packet is audited:

1. Approve Helper execution of this exact read-only queue implementation packet.
2. Request revisions to this packet.
3. Hold implementation until backend unknown-field hardening is done.
4. Hold implementation until raw transcript/request-response evidence standards are improved.
5. Cancel Phase 3.1 implementation.

## Recommended Human decision

Recommended after audit, if no blockers:

Approve Helper execution of this exact packet only.

That future approval would authorize only:

- scoped Worker read-only queue route implementation
- scoped OpenAPI read-only route documentation
- scoped tests and tripwires
- offline smoke only
- audit zip generation

That future approval would still not authorize:

- queue mutation
- Human decision routes
- Executor routes
- GPT Action import
- live smoke
- certification
- promotion
- deployment approval
- production-readiness claim
- autonomous Science operation

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
