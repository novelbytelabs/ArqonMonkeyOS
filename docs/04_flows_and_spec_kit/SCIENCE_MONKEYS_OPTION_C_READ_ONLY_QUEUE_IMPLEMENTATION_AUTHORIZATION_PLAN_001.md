# SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_AUTHORIZATION_PLAN_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Prepare the Human authorization decision packet for a possible future Phase 3.1 read-only Option C queue visibility implementation.

This packet is planning/authorization only.

It does not implement routes, change Worker code, change OpenAPI, change tests, call live routes, run smoke, import GPT Actions, activate queue mutation, certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Stage position

Current stage:

Stage 3 — Option C read-only queue implementation authorization planning

Prior accepted packets:

- SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_PLANNING_001
- SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_IMPLEMENTATION_PLAN_001

Prior accepted verdicts:

- Option C queue core planning: PASS_WITH_WARNINGS
- Option C queue core implementation planning: PASS_WITH_WARNINGS

This packet asks whether Human should authorize a future implementation packet for Phase 3.1 read-only queue visibility only.

This packet itself does not authorize implementation.

## Human decision under consideration

The only decision this packet prepares is:

Should PM AI be allowed to author the next bounded implementation packet for Phase 3.1 read-only queue visibility?

The possible future packet would be:

SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001

That future packet would still require separate Human approval before Helper applies anything.

## Allowed future implementation target

The future implementation target, if separately approved, must be limited to Phase 3.1 read-only queue visibility.

Allowed future implementation family:

- read-only queue listing
- read-only queue item inspection
- read-only queue-by-flow inspection
- read-only next queue recommendation
- read-only blocked queue view
- read-only quarantined queue view
- read-only handoff view
- read-only queue history view

The future implementation must not include mutation routes.

## Candidate read-only route set

The maximum candidate read-only route set for a future implementation packet is:

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

A future implementation packet may implement fewer routes than this list.

A future implementation packet must not implement more routes than this list unless Human separately approves scope expansion.

## Explicitly forbidden in Phase 3.1

The following are forbidden in Phase 3.1 read-only queue visibility:

- queue mutation activation
- claim route
- complete route
- block route
- quarantine route
- handoff creation route
- Human decision routes
- Executor routes
- /v1/science/share exposure
- /v1/science/execute-experiment exposure
- Code Monkey route exposure
- Human authority for GPTs
- Science Executor authority for GPTs
- Science artifact creation by queue routes
- raw GPT output treated as evidence
- ContextBus notes/messages treated as evidence
- queue records treated as scientific truth
- certification
- promotion
- deployment approval
- production-readiness claim
- autonomous Science operation

## Forbidden routes for Phase 3.1

These routes must not be implemented or exposed in Phase 3.1:

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
- deployment routes
- certification routes
- promotion routes

## Phase 3.1 role visibility model

A future implementation packet must define role-scoped queue visibility.

Candidate role visibility:

| Role | Read-only queue visibility | Mutation | Human decisions | Executor actions |
|---|---:|---:|---:|---:|
| EXPLORER_AI | YES, role-scoped | NO | NO | NO |
| HYPOTHESIZER_AI | YES, role-scoped | NO | NO | NO |
| DESIGNER_AI | YES, role-scoped | NO | NO | NO |
| SCIENCE_AUDITOR_AI | YES, role-scoped | NO | NO | NO |
| HUMAN | YES, broad | NO in Phase 3.1 unless separately scoped | NO in Phase 3.1 | NO |
| SCIENCE_EXECUTOR_AI | YES, executor-scoped if needed | NO in Phase 3.1 | NO | NO in Phase 3.1 |
| Code roles | NO through Science GPT schema | NO | NO | NO |

Phase 3.1 must not give GPT roles Human authority.

Phase 3.1 must not give GPT roles Science Executor authority.

## Queue record truth boundary

Read-only queue records are governance coordination records.

They are not scientific truth.

They are not Science evidence.

They are not findings.

They are not certification.

They are not promotion.

They are not deployment approval.

They are not production readiness.

They are not autonomous Science operation approval.

Raw GPT output is not evidence.

ContextBus notes/messages are non-official diagnostic transport only.

Routed artifacts are governed records, not scientific truth.

No harness = No truth.

## Minimum future implementation packet requirements

A future Phase 3.1 implementation packet must include:

- exact route list
- exact route handlers/files to modify
- exact OpenAPI changes
- exact read-only response schema
- exact role visibility matrix
- exact forbidden route list
- exact no-mutation proof strategy
- exact negative tests
- exact tripwire harness
- exact command sequence
- exact audit zip contents
- exact schema SHA lock process
- exact GPT Action import-lock process
- exact rollback procedure
- exact Human gate before GPT Action import
- exact Human gate before live smoke

## Required no-mutation proof

The future implementation packet must prove read-only behavior.

Required proof strategy:

- capture write count before read-only route calls
- call each read-only route
- capture write count after read-only route calls
- require zero mutation
- prove no Science artifact was created
- prove no queue item was changed
- prove no ContextBus note/message was created by queue read routes
- prove no Human decision record was created
- prove no Executor record was created
- prove no share/execution route was called

If write count cannot be measured, the implementation packet must define an equivalent repo-store or manifest-level no-mutation proof.

## Required negative tests

A future Phase 3.1 implementation packet must include negative tests proving:

- read-only routes reject unsupported methods
- POST to read-only routes fails closed
- mutation routes are absent
- `/claim` is absent
- `/complete` is absent
- `/block` is absent
- `/quarantine` is absent
- `/handoff` creation is absent
- Human decision routes are absent
- Executor routes are absent
- `/v1/science/share` remains absent from Science GPT Action schema
- `/v1/science/execute-experiment` remains absent from Science GPT Action schema
- Code Monkey routes remain absent from Science GPT Action schema
- role spoofing does not override bearer-token role
- `role=HUMAN` spoofing fails
- `role=SCIENCE_EXECUTOR_AI` spoofing fails
- unknown queue item fails closed
- unsafe queue references fail closed
- secret-like content is not exposed
- raw GPT output cannot satisfy evidence requirement
- ContextBus note/message cannot satisfy evidence requirement
- queue record cannot claim scientific truth
- required status labels are present

## Required tripwire harness

A future Phase 3.1 implementation packet must include a tripwire harness that checks:

- route set exactly equals approved Phase 3.1 read-only scope
- forbidden mutation routes are absent
- forbidden Human routes are absent
- forbidden Executor routes are absent
- `/v1/science/share` is absent from GPT Action schema
- `/v1/science/execute-experiment` is absent from GPT Action schema
- Code Monkey routes are absent from Science GPT Action schema
- read-only calls do not mutate store
- no Science artifact is created
- no queue item is changed
- no ContextBus note/message is created by queue reads
- required status labels are present
- queue records are labeled non-evidence
- raw GPT output is not evidence
- No harness = No truth remains present

## Required audit lane

A future Phase 3.1 implementation packet must go through this audit lane:

1. Pre-implementation packet audit
   - Auditor confirms scope is read-only only.
   - Auditor confirms no mutation route is included.
   - Auditor confirms no Human/Executor route exposure.

2. Helper execution
   - Helper applies only exact PM-authored implementation packet.
   - Helper does not plan or design.
   - Helper runs exact gates.

3. Offline route/policy audit
   - Auditor verifies route scope, auth, no-mutation proof, forbidden route absence.

4. Schema/import audit
   - Auditor verifies schema SHA lock.
   - Human separately approves import.
   - Imported GPT Action schema SHA is recorded.

5. Live read-only smoke audit
   - Only after import lock.
   - Live smoke proves read routes work and do not mutate.

6. Human decision
   - Human decides whether Phase 3.1 is closed as PASS_WITH_WARNINGS.
   - Human may decide whether future bounded mutation planning is allowed.

## Required audit zip contents for future implementation

A future Phase 3.1 implementation audit zip must include:

- AUDIT_MANIFEST.json
- AUDIT_MANIFEST.sha256
- implementation packet document
- route matrix
- auth matrix
- response schema
- OpenAPI file or diff
- Worker source files or diff
- test files
- tripwire harness
- command logs
- helper report
- schema SHA before and after
- commit SHA
- audit zip SHA
- no-mutation proof
- forbidden route absence proof
- status-label proof
- Human/Executor authority denial proof
- evidence boundary proof

## Required schema/import-lock procedure

A future Phase 3.1 implementation must not import GPT Actions until:

1. PM implementation packet exists.
2. Human approves implementation packet.
3. Helper applies exact packet.
4. Offline gates pass.
5. Audit zip is generated.
6. Auditor passes implementation evidence.
7. Human approves GPT Action import.
8. Exact repo schema SHA is computed.
9. Exact schema is imported into GPT Actions.
10. Imported schema SHA is recorded per GPT.
11. Live smoke uses exactly imported schema.

If any schema is edited manually for GPT Action UI constraints, the edited schema SHA must be recomputed and recorded.

## Required rollback plan

A future Phase 3.1 implementation packet must define rollback:

- revert Worker route additions
- revert OpenAPI route additions
- remove GPT Action imported schema
- restore prior schema SHA
- invalidate live-smoke evidence tied to removed schema
- archive failed evidence without laundering it
- mark queue read-only implementation as REMEDIATION_REQUIRED or FAIL_BLOCKED

## Human decision options

Human may choose one:

1. Approve PM to author the future Phase 3.1 read-only implementation packet.
2. Require revisions to this authorization plan.
3. Require backend unknown-field rejection hardening first.
4. Require richer raw transcript/request-response evidence standards first.
5. Hold Stage 3 planning open.

## Recommended Human decision

Recommended Human decision:

Approve PM to author the future Phase 3.1 read-only implementation packet:

SCIENCE_MONKEYS_OPTION_C_READ_ONLY_QUEUE_IMPLEMENTATION_PACKET_001

This approval would still not authorize Helper execution unless Human separately approves the exact implementation packet.

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
