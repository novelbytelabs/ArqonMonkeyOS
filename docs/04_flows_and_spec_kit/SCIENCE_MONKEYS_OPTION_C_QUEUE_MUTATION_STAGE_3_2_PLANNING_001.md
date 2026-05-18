# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_PLANNING_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Plan Stage 3.2 Option C queue mutation routes.

This packet is planning only.

It defines mutation boundaries, role authority, Human/Executor separation, transition gates, tests, tripwires, evidence requirements, rollback requirements, and the audit lane for a possible future queue mutation implementation packet.

This packet does not implement queue mutation.

This packet does not authorize Worker changes, OpenAPI changes, test changes, live routes, GPT Action import, certification, promotion, deployment approval, production-readiness claims, or autonomous Science operation.

## Stage position

Current stage:

Stage 3.2 — Option C queue mutation planning

Prior closed stage:

Stage 3.1 — read-only queue visibility

Prior closeout verdict:

PASS_WITH_WARNINGS

Prior evidence boundary:

- Explorer was directly live-tested.
- Hypothesizer, Designer, and Science Auditor were not live-tested.
- Other Science GPTs were accepted only by static validation plus Human inference.
- Phase 3.1 did not authorize queue mutation.

This Stage 3.2 packet prepares the next decision: whether Human should authorize a future queue mutation implementation packet.

This packet itself does not authorize implementation.

## Mutation route families under consideration

Stage 3.2 concerns only these possible future mutation families:

| Mutation family | Purpose | Current status |
|---|---|---|
| claim | role claims a queue item for work | planning only |
| complete | role marks its queue work complete | planning only |
| block | role reports a blocker | planning only |
| quarantine | role flags unsafe/invalid item | planning only |
| handoff | role requests transfer to another role | planning only |

No mutation route is active or authorized by this planning packet.

## Candidate future mutation route set

A future implementation packet may propose some or all of these routes, subject to separate Human approval:

| Route | Method | Purpose | Human approval needed before implementation |
|---|---:|---|---:|
| `/v1/science/queue/{queue_item_id}/claim` | POST | Claim a queue item for authenticated role | YES |
| `/v1/science/queue/{queue_item_id}/complete` | POST | Mark queue item step complete | YES |
| `/v1/science/queue/{queue_item_id}/block` | POST | Mark queue item blocked with reason | YES |
| `/v1/science/queue/{queue_item_id}/quarantine` | POST | Quarantine unsafe or invalid queue item | YES |
| `/v1/science/queue/{queue_item_id}/handoff` | POST | Request handoff to allowed next role | YES |

A future implementation packet may implement fewer routes.

A future implementation packet must not implement any mutation route outside this table unless Human separately approves scope expansion.

## Explicitly out of scope for Stage 3.2

Stage 3.2 planning does not authorize:

- Human decision routes
- Science Executor execution routes
- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- deployment routes
- certification routes
- promotion routes
- production readiness
- autonomous Science operation

The following remain forbidden:

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

## Queue mutation truth boundary

Queue mutation records are governance coordination records.

They are not scientific truth.

They are not Science evidence by themselves.

They are not findings.

They are not certification.

They are not promotion.

They are not deployment approval.

They are not production readiness.

They are not autonomous Science operation approval.

Raw GPT output is not evidence.

ContextBus notes/messages are non-official diagnostic transport only.

Routed Science artifacts are governed records, not scientific truth.

No harness = No truth.

## Authority matrix

Stage 3.2 must preserve role separation.

Candidate future authority matrix:

| Role | claim | complete | block | quarantine | handoff | Human decision | Executor action |
|---|---:|---:|---:|---:|---:|---:|---:|
| EXPLORER_AI | own visible items only | own claimed items only | own visible/claimed items only | propose quarantine only or restricted quarantine | allowed to allowed next role only | NO | NO |
| HYPOTHESIZER_AI | own visible items only | own claimed items only | own visible/claimed items only | propose quarantine only or restricted quarantine | allowed to allowed next role only | NO | NO |
| DESIGNER_AI | own visible items only | own claimed items only | own visible/claimed items only | propose quarantine only or restricted quarantine | allowed to allowed next role only | NO | NO |
| SCIENCE_AUDITOR_AI | audit-visible items only | audit-visible claimed items only | audit-visible items only | allowed to quarantine evidence/claim issues if separately approved | allowed to Human review only if separately approved | NO | NO |
| HUMAN | future Stage 4 only | future Stage 4 only | future Stage 4 only | future Stage 4 only | future Stage 4 only | future Stage 4 only | NO |
| SCIENCE_EXECUTOR_AI | NO in Stage 3.2 | NO in Stage 3.2 | NO in Stage 3.2 | NO in Stage 3.2 | NO in Stage 3.2 | NO | future executor stage only |
| Code roles | NO | NO | NO | NO | NO | NO | NO |

A future implementation packet must use bearer-token authenticated role as authoritative.

Query/body role spoofing must not change authority.

GPT roles must not gain HUMAN authority.

GPT roles must not gain SCIENCE_EXECUTOR_AI authority.

## Human/Executor separation

Stage 3.2 queue mutation must not collapse Human and Executor authority into GPT roles.

Human decisions remain a later Stage 4 concern.

Science Executor actions remain non-GPT/local-only unless separately planned and audited.

Stage 3.2 mutation routes may coordinate role workflow state but must not:

- approve advancement
- approve evidence
- close a stage
- release quarantine
- execute experiments
- approve sharing
- certify results
- authorize deployment
- authorize autonomous operation

## Candidate queue item state model

A future implementation packet may use this candidate state model:

| State | Meaning | Mutation source |
|---|---|---|
| READY | available to role | system/read model |
| CLAIMED | claimed by authenticated role | claim |
| IN_PROGRESS | work started or active | claim or complete pre-state |
| COMPLETED_STEP | role step completed | complete |
| BLOCKED | blocked pending correction | block |
| QUARANTINED | unsafe/invalid, requires review | quarantine |
| HANDOFF_REQUESTED | handoff requested | handoff |
| WAITING_FOR_HUMAN | requires Human decision, not Stage 3.2 mutation authority | derived/read-only unless Stage 4 |
| WAITING_FOR_EXECUTOR | requires Executor action, not Stage 3.2 mutation authority | derived/read-only unless later executor stage |

A future implementation must define exact transitions and reject invalid transitions.

## Candidate transition rules

A future implementation packet must define exact transition rules, at minimum:

| Mutation | Allowed from | Allowed to | Required guard |
|---|---|---|---|
| claim | READY / BLOCKED if unblocked by policy | CLAIMED or IN_PROGRESS | authenticated role has visibility and claim authority |
| complete | CLAIMED / IN_PROGRESS | COMPLETED_STEP | same role claimed or allowed owner |
| block | READY / CLAIMED / IN_PROGRESS | BLOCKED | reason required |
| quarantine | any non-final state | QUARANTINED | reason required; policy-safe scope |
| handoff | COMPLETED_STEP / BLOCKED / READY if policy allows | HANDOFF_REQUESTED | target role allowed; reason required |

Invalid transitions must fail closed.

Unknown queue item IDs must fail closed.

Unsafe queue references must fail closed.

## Minimum mutation request schemas

A future implementation packet must define request schemas.

Candidate schemas:

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

A future implementation packet must require idempotency or an equivalent replay-safe duplicate-protection mechanism.

## Mutation evidence requirements

A future implementation packet must prove every mutation creates bounded governance evidence.

Required mutation record fields:

- mutation_id
- queue_item_id
- flow_ref
- authenticated_role
- mutation_type
- prior_state
- new_state
- reason/summary
- timestamp
- idempotency_key
- source route
- actor authority check result
- truth boundary
- required status labels

Mutation records must not include secrets.

Mutation records must not be treated as scientific truth.

Mutation records must not override Human authority.

Mutation records must not override Science Executor authority.

## No-mutation-to-mutation transition gate

Before any mutation implementation, a future packet must include a transition gate proving:

1. Phase 3.1 read-only closeout exists.
2. Human accepted Phase 3.1 as PASS_WITH_WARNINGS.
3. Stage 3.2 planning exists and passed audit.
4. Human approved exact Stage 3.2 implementation packet.
5. Mutation route list is exact and bounded.
6. Negative tests and tripwires are present before execution.
7. Rollback plan is present before execution.
8. No live route call occurs before offline audit.
9. GPT Action import is not performed before Human import approval.
10. Live smoke is not performed before Human live-smoke approval.

## Required tests for future implementation

A future implementation packet must require tests for:

- successful claim by authorized role
- duplicate claim idempotency behavior
- claim denied for unauthorized role
- complete allowed for claimed/owned item
- complete denied for unclaimed item
- block requires reason
- quarantine requires reason
- handoff requires allowed target role
- handoff denied for invalid target role
- invalid transition denied
- unknown queue item denied
- unsafe queue item denied
- role spoofing denied
- `role=HUMAN` spoofing denied
- `role=SCIENCE_EXECUTOR_AI` spoofing denied
- Human decision routes absent
- Executor routes absent
- `/v1/science/share` absent
- `/v1/science/execute-experiment` absent
- Code Monkey routes absent
- no certification/promotion/deployment/production/autonomy claim
- mutation record truth boundary present
- mutation record not evidence by itself
- required status labels present
- no secret exposure
- rollback works or is documented as manual revert

## Required tripwire harness for future implementation

A future implementation packet must include a tripwire that fails if:

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
- mutation record treats queue record as scientific truth
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- required status labels are missing
- certification/promotion/deployment/production/autonomy claim appears

## Required audit lane for future implementation

A future implementation must use one macro-slice audit lane:

1. PM-authored implementation packet
2. Human approval of exact implementation packet
3. Helper execution of exact packet
4. Offline tests/tripwires/no-authority-leak checks
5. Auditor review of implementation audit pack
6. Human decision whether to authorize GPT Action import planning
7. Import-lock packet
8. Auditor review of import-lock evidence
9. Human decision whether to authorize live smoke
10. Live smoke packet
11. Auditor review of live smoke
12. Human closeout decision

Do not audit every small manifest/evidence/zip repair separately unless it affects safety, authority, mutation, secrets, route exposure, or truth claims.

## Required future audit zip contents

A future Stage 3.2 implementation audit zip must include:

- AUDIT_MANIFEST.json
- AUDIT_MANIFEST.sha256
- implementation packet
- implementation evidence file
- Worker files/diffs
- OpenAPI files/diffs
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

## Rollback requirements for future implementation

A future implementation packet must define rollback:

- revert Worker mutation route changes
- revert OpenAPI mutation route changes
- remove candidate GPT Action schema if imported later
- preserve failed evidence without laundering
- mark mutation implementation as REMEDIATION_REQUIRED or FAIL_BLOCKED if a gate fails
- quarantine any evidence if mutation occurs outside approved route set
- never delete failed audit evidence

## Human decision options

Human may choose one after this planning packet is audited:

1. Approve PM to author the Stage 3.2 queue mutation implementation packet.
2. Require revisions to this planning packet.
3. Require additional state-machine specificity before implementation planning.
4. Require idempotency design hardening before implementation planning.
5. Hold Stage 3.2 planning open.

## Recommended next step

Recommended next step after audit:

Approve PM to author:

SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_IMPLEMENTATION_PACKET_001

That future packet would still not authorize Helper execution until Human separately approves it after audit.

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize queue mutation implementation, or authorize autonomous Science operation.
