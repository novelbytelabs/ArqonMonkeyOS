# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_IMPLEMENTATION_PACKET_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the exact future implementation packet for Stage 3.2 Option C queue mutation.

This packet is a PM-authored implementation packet only.

It is ready for audit and Human review.

It does not authorize Helper execution.

It does not authorize Worker changes, OpenAPI changes, test changes, live routes, GPT Action import, queue mutation activation, certification, promotion, deployment approval, production-readiness claims, or autonomous Science operation.

Helper must not execute this implementation packet until Human separately approves execution of this exact packet after audit.

## Stage position

Current stage:

Stage 3.2 — Option C queue mutation implementation packet authoring

Prior accepted stage:

Stage 3.2 queue mutation planning

Prior accepted verdict:

PASS_WITH_WARNINGS

This packet proposes the exact future implementation scope for bounded queue mutation routes.

This packet still requires audit and a separate Human execution approval before Helper may apply any implementation.

## Non-negotiable execution boundary

A future execution of this packet, if separately approved, must be limited to bounded queue mutation coordination.

It must not implement Human decision authority.

It must not implement Science Executor authority.

It must not expose `/v1/science/share`.

It must not expose `/v1/science/execute-experiment`.

It must not expose Code Monkey routes through Science GPT Action schemas.

It must not import GPT Actions.

It must not run live routes.

It must not claim certification, promotion, deployment approval, production readiness, or autonomous Science operation.

## Exact implementation objective

Implement bounded Stage 3.2 queue mutation routes for Science workflow coordination:

- claim
- complete
- block
- quarantine
- handoff

The implementation must write bounded governance coordination records only.

Queue mutation records are not scientific truth.

Queue mutation records are not Science evidence by themselves.

Queue mutation records are not findings.

Queue mutation records are not certification.

Queue mutation records are not promotion.

Queue mutation records are not deployment approval.

Queue mutation records are not production readiness.

Queue mutation records are not autonomous Science operation approval.

Raw GPT output is not evidence.

ContextBus notes/messages are non-official diagnostic transport only.

No harness = No truth.

## Exact future route scope

A future Helper execution may implement only these routes:

| Route | Method | Purpose |
|---|---:|---|
| `/v1/science/queue/{queue_item_id}/claim` | POST | Claim a queue item for authenticated role |
| `/v1/science/queue/{queue_item_id}/complete` | POST | Complete a claimed/owned queue step |
| `/v1/science/queue/{queue_item_id}/block` | POST | Mark queue item blocked with reason |
| `/v1/science/queue/{queue_item_id}/quarantine` | POST | Quarantine unsafe or invalid queue item |
| `/v1/science/queue/{queue_item_id}/handoff` | POST | Request handoff to an allowed next role |

No other mutation route may be implemented.

A future implementation may implement fewer routes if necessary, but it must not implement any mutation route outside this table.

## Explicitly forbidden route scope

The following must not be implemented, exposed, activated, or added to GPT Actions in this packet:

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

## Exact proposed file changes for future execution

This section defines the maximum allowed future execution changes.

No file change is authorized until Human separately approves execution after audit.

### Worker files proposed for future modification

Allowed future Worker file changes:

- `worker/src/index.ts`
- `worker/src/science_queue_read.ts`
- `worker/src/science_queue_mutation.ts`

`worker/src/index.ts` may be modified only to register approved queue mutation POST routes.

`worker/src/science_queue_read.ts` may be modified only if necessary to share queue item resolution/read-model helpers.

`worker/src/science_queue_mutation.ts` may be created to implement bounded mutation helpers and handlers.

No other Worker source file may be changed unless future execution stops and reports the missing required file.

### OpenAPI files proposed for future modification

Allowed future OpenAPI file changes:

- `openapi/arqon_contextos.openapi.yaml`
- `openapi/science_monkeys_actions_explorer.openapi.yaml`
- `openapi/science_monkeys_actions_hypothesizer.openapi.yaml`
- `openapi/science_monkeys_actions_designer.openapi.yaml`
- `openapi/science_monkeys_actions_science_auditor.openapi.yaml`

OpenAPI changes must be limited to documenting approved Stage 3.2 queue mutation POST routes.

OpenAPI must not expose Human decision routes.

OpenAPI must not expose Science Executor routes.

OpenAPI must not expose `/v1/science/share`.

OpenAPI must not expose `/v1/science/execute-experiment`.

OpenAPI must not expose Code Monkey routes through Science GPT Action schemas.

### Test/support files proposed for future addition

Allowed future test/support files:

- `worker/test_support/science_monkeys_queue_mutation_policy_unit.py`
- `worker/test_support/science_monkeys_queue_mutation_tripwire.py`
- `worker/test_support/science_monkeys_queue_mutation_offline_smoke.ts`
- `worker/test_support/build_queue_mutation_audit_bundle.py`

No additional test/support files may be created unless future execution stops and reports the missing required file.

### Documentation/evidence files proposed for future addition

Allowed future documentation/evidence files:

- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_IMPLEMENTATION_PACKET_001.md`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_IMPLEMENTATION_PACKET_001_EVIDENCE.md`
- `artifacts/science_monkeys_option_c_queue_mutation_stage_3_2_implementation_execution_001_helper_report.md`

## Role authority matrix

A future implementation must enforce bearer-token authenticated role authority.

Query or body role fields must not override bearer-token role.

Candidate authority matrix:

| Role | claim | complete | block | quarantine | handoff | Human decision | Executor action |
|---|---:|---:|---:|---:|---:|---:|---:|
| EXPLORER_AI | own visible items only | own claimed items only | own visible/claimed items only | restricted/propose only unless policy allows direct quarantine | allowed target role only | NO | NO |
| HYPOTHESIZER_AI | own visible items only | own claimed items only | own visible/claimed items only | restricted/propose only unless policy allows direct quarantine | allowed target role only | NO | NO |
| DESIGNER_AI | own visible items only | own claimed items only | own visible/claimed items only | restricted/propose only unless policy allows direct quarantine | allowed target role only | NO | NO |
| SCIENCE_AUDITOR_AI | audit-visible items only | audit-visible claimed items only | audit-visible items only | allowed for audit-integrity issues if policy permits | allowed target role only | NO | NO |
| HUMAN | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | future Stage 4 only | NO |
| SCIENCE_EXECUTOR_AI | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO in Stage 3.2 GPT schema | NO | future Executor stage only |
| Code roles | NO | NO | NO | NO | NO | NO | NO |

Implementation must fail closed if authority is uncertain.

Implementation must never grant HUMAN authority to a GPT role.

Implementation must never grant SCIENCE_EXECUTOR_AI authority to a GPT role.

## State model

Future implementation must preserve or implement this state model:

| State | Meaning |
|---|---|
| READY | queue item is available to role |
| CLAIMED | queue item has been claimed by authenticated role |
| IN_PROGRESS | role work is active |
| COMPLETED_STEP | role step completed |
| BLOCKED | queue item is blocked pending correction |
| QUARANTINED | queue item is unsafe/invalid and requires review |
| HANDOFF_REQUESTED | handoff requested to an allowed next role |
| WAITING_FOR_HUMAN | requires Human decision; Stage 3.2 must not mutate Human decision |
| WAITING_FOR_EXECUTOR | requires Executor action; Stage 3.2 must not mutate Executor action |
| UNKNOWN | state cannot be proven safely |

## Exact transition rules

Future implementation must reject invalid transitions.

Minimum transition rules:

| Mutation | Allowed from | Allowed to | Required guard |
|---|---|---|---|
| claim | READY / BLOCKED if policy allows | CLAIMED or IN_PROGRESS | role has visibility and claim authority |
| complete | CLAIMED / IN_PROGRESS | COMPLETED_STEP | same role claimed item or allowed owner |
| block | READY / CLAIMED / IN_PROGRESS | BLOCKED | reason required |
| quarantine | READY / CLAIMED / IN_PROGRESS / BLOCKED / HANDOFF_REQUESTED | QUARANTINED | reason required; policy-safe scope |
| handoff | COMPLETED_STEP / BLOCKED / READY if policy allows | HANDOFF_REQUESTED | target role allowed; reason required |

Unknown queue item IDs must fail closed.

Unsafe queue item IDs must fail closed.

Invalid transitions must fail closed.

Missing required request fields must fail closed.

## Request schemas

Future implementation must define and validate request schemas.

### Claim request

```json
{
  "project": "ArqonZero",
  "reason": "string optional",
  "idempotency_key": "string required"
}
```

### Complete request

```json
{
  "project": "ArqonZero",
  "completion_summary": "string required",
  "evidence_refs": ["string optional"],
  "idempotency_key": "string required"
}
```

### Block request

```json
{
  "project": "ArqonZero",
  "blocked_reason": "string required",
  "severity": "LOW | MEDIUM | HIGH",
  "idempotency_key": "string required"
}
```

### Quarantine request

```json
{
  "project": "ArqonZero",
  "quarantine_reason": "string required",
  "risk_type": "scope | evidence | safety | authority | secret | other",
  "idempotency_key": "string required"
}
```

### Handoff request

```json
{
  "project": "ArqonZero",
  "target_role": "EXPLORER_AI | HYPOTHESIZER_AI | DESIGNER_AI | SCIENCE_AUDITOR_AI | HUMAN",
  "handoff_reason": "string required",
  "idempotency_key": "string required"
}
```

## Response schemas

Future mutation responses must include:

- `ok`
- `project`
- `authenticated_role`
- `queue_item_id`
- `flow_ref` if available
- `mutation_type`
- `prior_state`
- `new_state`
- `mutation_id`
- `idempotency_key`
- `required_status_labels`
- `truth_boundary`
- `mutation_record_path` if created
- `mutation_record_sha` if created

Required truth boundary:

```json
{
  "queue_record_is_truth": false,
  "queue_record_is_evidence": false,
  "mutation_record_is_truth": false,
  "mutation_record_is_evidence_by_itself": false,
  "raw_gpt_output_is_evidence": false,
  "contextbus_notes_messages_are_evidence": false,
  "requires_harness": true
}
```

## Mutation record requirements

Future implementation must write bounded mutation records.

Required mutation record fields:

- `mutation_id`
- `queue_item_id`
- `project`
- `flow_ref`
- `authenticated_role`
- `mutation_type`
- `prior_state`
- `new_state`
- `reason`
- `timestamp`
- `idempotency_key`
- `source_route`
- `actor_authority_check`
- `truth_boundary`
- `required_status_labels`

Mutation record must not include secrets.

Mutation record must not be treated as scientific truth.

Mutation record must not be treated as evidence by itself.

Mutation record must not authorize Human decisions.

Mutation record must not authorize Executor action.

## Idempotency requirements

Every mutation request must require `idempotency_key` or an equivalent replay-safe duplicate-protection mechanism.

Future implementation must prove:

- first use of idempotency key creates one mutation record
- duplicate request with same idempotency key does not create a second mutation record
- duplicate request returns same or safely idempotent result
- idempotency key is scoped to queue item, mutation type, and authenticated role
- missing idempotency key fails closed
- conflicting duplicate payload fails closed or returns deterministic conflict

## Mutation storage requirements

Future implementation may store mutation records under a governance path such as:

`governance/queues/mutations/YYYY/MM/<MUTATION_ID>.json`

or an equivalent governed queue mutation path.

Storage path must be recorded in evidence.

Unsafe paths must be rejected.

Secrets must not be stored.

Failed mutation attempts must not be laundered as successful mutation records.

## Required future tests

Future implementation must include tests for:

### Successful mutations

- claim by authorized role
- complete by owner/claimed role
- block with reason
- quarantine with reason
- handoff to allowed target role

### Idempotency

- duplicate claim idempotency
- duplicate complete idempotency
- duplicate block idempotency
- duplicate quarantine idempotency
- duplicate handoff idempotency
- missing idempotency key denied
- conflicting duplicate payload denied or deterministic conflict

### Authority denial

- claim denied for unauthorized role
- complete denied for unclaimed item
- complete denied for different role
- block denied for invisible item
- quarantine denied for role without policy authority
- handoff denied for invalid target role
- `role=HUMAN` spoofing denied
- `role=SCIENCE_EXECUTOR_AI` spoofing denied
- body role spoofing denied

### State machine

- invalid transition denied
- unknown queue item denied
- unsafe queue item denied
- final/closed item mutation denied
- quarantined item cannot be completed unless policy explicitly allows
- handoff target validation enforced

### Forbidden surface

- Human decision routes absent
- Executor routes absent
- `/v1/science/share` absent
- `/v1/science/execute-experiment` absent
- Code Monkey routes absent
- no deployment/certification/promotion route exposure

### Truth and evidence boundary

- mutation record truth boundary present
- mutation record not scientific truth
- mutation record not evidence by itself
- raw GPT output not evidence
- ContextBus notes/messages not evidence
- required status labels present
- no certification/promotion/deployment/production/autonomy claim

### Audit/evidence

- mutation record path recorded
- mutation record SHA recorded
- command logs captured
- rollback path documented
- failed gates stop execution

## Required tripwire harness

Future tripwire must fail if:

- route list exceeds approved mutation route set
- Human decision route appears
- Executor route appears
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears in Science GPT Action schema
- GPT role gets HUMAN authority
- GPT role gets SCIENCE_EXECUTOR_AI authority
- mutation can occur without idempotency key or equivalent
- mutation record lacks prior_state/new_state
- mutation record lacks authenticated_role
- mutation record lacks truth boundary
- mutation record claims to be scientific truth
- mutation record claims to be evidence by itself
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- required status labels are missing
- certification/promotion/deployment/production/autonomy claim appears
- live route call occurs during offline implementation
- GPT Action import occurs during implementation

## Required execution gates if Human later approves Helper execution

Future Helper execution must run at minimum:

- TypeScript compile/check gate
- queue mutation policy unit
- queue mutation offline smoke
- queue mutation forbidden-route tripwire
- role-spoof denial tests
- idempotency tests
- state-transition tests
- mutation record schema tests
- truth-boundary tests
- forbidden claim tests
- source diff/file-list verification
- audit bundle builder
- audit zip hash verification
- audit zip content verification

## Required implementation evidence file

Future execution must create:

`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_IMPLEMENTATION_PACKET_001_EVIDENCE.md`

It must include:

- required status labels
- implementation scope
- changed files
- route list
- mutation state model
- authority matrix
- request/response schemas
- mutation record schema
- idempotency proof
- role-spoof proof
- forbidden route proof
- Human/Executor separation proof
- no share/execute-experiment proof
- truth-boundary proof
- command logs
- test results
- tripwire results
- rollback plan
- schema SHA before/after if OpenAPI changes
- final evidence verdict:
  PASS_WITH_WARNINGS / REMEDIATION_REQUIRED / FAIL_BLOCKED

## Required future audit zip contents

Future implementation audit zip must include:

- `AUDIT_MANIFEST.json`
- `AUDIT_MANIFEST.sha256`
- implementation packet
- implementation evidence file
- Worker source files or diffs
- OpenAPI files or diffs
- test files
- tripwire harness
- command logs
- mutation record schema
- transition table
- authority matrix
- idempotency proof
- role-spoof proof
- forbidden route absence proof
- no Human/Executor authority proof
- no share/execute-experiment proof
- rollback proof
- helper report
- commit SHA
- audit zip SHA

## Schema/import boundary

This implementation packet does not authorize GPT Action import.

If future implementation changes OpenAPI/schema files, those schemas remain candidates only.

A separate schema/import-lock packet is required after implementation audit and Human approval.

No live smoke may occur before schema/import-lock evidence is audited and Human-approved.

## Rollback requirements

A future implementation packet must support rollback:

- revert Worker mutation route changes
- revert OpenAPI mutation route changes
- remove candidate GPT Action schema if imported later
- preserve failed evidence without laundering
- mark mutation implementation as REMEDIATION_REQUIRED or FAIL_BLOCKED if a gate fails
- quarantine any evidence if mutation occurs outside approved route set
- never delete failed audit evidence

## Stop conditions for future execution

Future Helper execution must stop if:

- unauthorized file would need to change
- route outside approved mutation route set appears
- Human decision route appears
- Executor route appears
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears
- HUMAN authority assigned to GPT role
- SCIENCE_EXECUTOR_AI authority assigned to GPT role
- idempotency proof cannot be produced
- role-spoof denial cannot be produced
- state-transition tests cannot be produced
- mutation record lacks truth boundary
- mutation record claims to be truth
- mutation record claims to be evidence by itself
- required status labels are missing
- secret-like content appears
- live route call would be required
- GPT Action import would be required
- certification/promotion/deployment/production/autonomy claim appears

## Human decision options

Human may choose one after this implementation packet is audited:

1. Approve Helper execution of this exact implementation packet.
2. Request revisions to this implementation packet.
3. Require stronger idempotency design before Helper execution.
4. Require stricter state-machine specification before Helper execution.
5. Hold Stage 3.2 implementation.

## Recommended next step

Recommended after audit, if no blockers:

Approve Helper execution of this exact implementation packet only.

That future approval would authorize only:

- scoped Worker mutation route implementation
- scoped OpenAPI mutation route documentation
- scoped tests/tripwires
- offline smoke only
- audit zip generation

That future approval would still not authorize:

- GPT Action import
- live smoke
- Human decision routes
- Executor routes
- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- certification
- promotion
- deployment approval
- production readiness
- autonomous Science operation

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize queue mutation implementation, or authorize autonomous Science operation.
