# SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_PLANNING_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the Stage 3 Option C Diagnostic Queue Lane planning/design architecture for Science Monkeys.

This is a planning/design packet only.

It does not implement queue routes, activate queue mutation, certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Stage position

Current stage:

Stage 3 — Option C queue core planning/design

Prior stage closure:

Stage 2 — Science command surface closed as PASS_WITH_WARNINGS.

Stage 2 closure covered:

- Stage 1 read/resume surface
- Stage 2A schema/import/doc normalization
- Stage 2B Science ContextBus role smoke
- Stage 2C command surface closeout

Stage 3 begins only as planning/design.

## Core principle

Option C is a diagnostic queue lane.

It is not autonomous Science operation.

It is not evidence by itself.

It is not Human approval.

It is not Science Executor authority.

It is not permission for GPTs to execute experiments.

It is not permission for GPTs to share Science findings.

It is not permission for GPTs to mutate queue state unless a future implementation packet explicitly authorizes a bounded route and passes audit.

## Queue purpose

The Option C queue exists to make Science workflow state visible, resumable, inspectable, and governable.

The queue should help operators answer:

- What work exists?
- Which role is allowed to act next?
- What is blocked?
- What is waiting for Human review?
- What is waiting for local Science Executor action?
- What must be quarantined?
- What evidence exists?
- What evidence is missing?
- What action is recommended but not executed?
- What stop condition applies?

The queue must not bypass governance.

## Queue concepts

### Queue item

A queue item is a governed work-intent record.

It may reference:

- project
- flow_id
- flow_ref
- queue_item_id
- current_state
- current_role_owner
- allowed_next_role
- allowed_next_action
- blocked_reason
- stop_condition
- related_artifacts
- evidence_requirements
- created_by_role
- updated_by_role
- timestamps
- audit_status
- Human decision status

A queue item is not scientific truth.

A queue item is not evidence.

A queue item is not a finding.

A queue item is not certification, promotion, deployment approval, production readiness, or autonomous Science operation approval.

### Diagnostic queue lane

The diagnostic queue lane is the read-visible governance lane for Science workflow coordination.

It may show next recommended actions, but it must not execute them automatically.

### Claim

Claim means a role takes bounded responsibility to work on a queue item.

Claim does not mean Human approval.

Claim does not mean Science Executor authority.

Claim does not mean the item is scientifically true.

### Complete

Complete means the role finished a bounded assigned step and attached or referenced the expected governed record.

Complete does not mean the finding is accepted.

Complete does not mean Human approval.

Complete does not mean share/release/promotion.

### Block

Block means work cannot proceed because a required input, role action, evidence item, or Human decision is missing.

### Quarantine

Quarantine means the item must not advance until the blocking concern is resolved.

Quarantine should be used for:

- suspected evidence gap
- unsupported claim
- malformed artifact
- authority boundary concern
- missing required role
- missing Human decision
- forbidden route exposure
- suspected secret exposure
- role spoofing concern
- contradiction or unresolved safety concern

### Handoff

Handoff means one role may pass context to another role without transferring forbidden authority.

A handoff is not Human approval.

A handoff is not Science Executor authority.

A handoff is not share approval.

## Candidate route families

This packet only defines candidate route families.

No route implementation is authorized.

### Read-only queue routes

Candidate read-only routes:

- GET /v1/science/queue
- GET /v1/science/queue/{queue_item_id}
- GET /v1/science/queue/by-flow/{flow_ref}
- GET /v1/science/queue/next
- GET /v1/science/queue/blocked
- GET /v1/science/queue/quarantined
- GET /v1/science/queue/handoffs
- GET /v1/science/queue/history/{queue_item_id}

Read-only routes may be broadly available by role if they expose only safe metadata and role-scoped content.

Read-only routes must not mutate state.

Read-only routes must not create Science artifacts.

Read-only routes must not create evidence.

Read-only routes must not perform share, execution, certification, promotion, deployment, or production-readiness actions.

### Queue mutation routes

Candidate mutation routes:

- POST /v1/science/queue/{queue_item_id}/claim
- POST /v1/science/queue/{queue_item_id}/complete
- POST /v1/science/queue/{queue_item_id}/block
- POST /v1/science/queue/{queue_item_id}/quarantine
- POST /v1/science/queue/{queue_item_id}/handoff

These are not authorized for implementation by this packet.

Any future implementation must be separately scoped, separately approved, separately tested, and separately audited.

### Human-only queue decision routes

Candidate Human-only decision routes:

- POST /v1/science/queue/{queue_item_id}/human-approve
- POST /v1/science/queue/{queue_item_id}/human-reject
- POST /v1/science/queue/{queue_item_id}/human-defer
- POST /v1/science/queue/{queue_item_id}/human-release
- POST /v1/science/queue/{queue_item_id}/human-close

These routes must remain Human-only if implemented.

GPT roles must not receive Human authority.

### Science Executor-only queue routes

Candidate local Science Executor routes:

- POST /v1/science/queue/{queue_item_id}/executor-claim
- POST /v1/science/queue/{queue_item_id}/executor-complete
- POST /v1/science/queue/{queue_item_id}/executor-block

These routes must remain non-GPT/local executor only if implemented.

GPT roles must not receive SCIENCE_EXECUTOR_AI authority.

## Role boundaries

### Explorer AI

Allowed planning relationship to queue:

- may read relevant queue context
- may see research-related next action recommendations
- may request or propose research-context completion in a future bounded route
- may not approve findings
- may not execute experiments
- may not share Science outputs
- may not claim Human authority
- may not claim Science Executor authority

### Hypothesizer AI

Allowed planning relationship to queue:

- may read relevant queue context
- may see hypothesis/interpretation next action recommendations
- may request or propose hypothesis/interpretation completion in a future bounded route
- may not approve findings
- may not execute experiments
- may not share Science outputs
- may not claim Human authority
- may not claim Science Executor authority

### Designer AI

Allowed planning relationship to queue:

- may read relevant queue context
- may see experiment-design next action recommendations
- may request or propose design completion in a future bounded route
- may not execute experiments
- may not approve findings
- may not share Science outputs
- may not claim Human authority
- may not claim Science Executor authority

### Science Auditor AI

Allowed planning relationship to queue:

- may read relevant queue context
- may see audit/review next action recommendations
- may propose audit records or quarantine recommendations in a future bounded route
- may not approve final Human decisions
- may not execute experiments
- may not share Science outputs
- may not claim Human authority
- may not claim Science Executor authority

### Human

Human is the only authority for:

- final advancement decisions
- share approval
- release approval
- promotion approval
- deployment approval
- production-readiness decisions
- certification decisions
- overriding or closing governance blocks

### Science Executor AI

Science Executor AI is local/non-GPT execution authority only.

Science Executor authority must not be assigned to GPT roles.

Science Executor routes must not be exposed through Science GPT Action schemas.

## Proposed state machine

Candidate queue states:

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

### State transition principles

NEW may move to READY only if minimal metadata exists.

READY may move to CLAIMED only by an authorized role for the item.

CLAIMED may move to IN_PROGRESS only by the claiming role or permitted backend policy.

IN_PROGRESS may move to COMPLETED_STEP only when the required bounded output reference is present.

Any active state may move to BLOCKED when evidence, input, role, or Human decision is missing.

Any active state may move to QUARANTINED when safety, authority, evidence, contradiction, or claim-integrity concerns arise.

WAITING_FOR_EXECUTOR must not be completed by GPT roles.

WAITING_FOR_HUMAN must not be completed by GPT roles.

CLOSED_BY_HUMAN must require Human authority.

CANCELLED_BY_HUMAN must require Human authority.

## Evidence requirements

Queue records must distinguish:

- queue metadata
- GPT suggestions
- governed artifacts
- execution evidence
- audit evidence
- Human decisions

Raw GPT output is not evidence.

ContextBus notes/messages are non-official diagnostic transport only.

Queue records are not scientific truth.

Routed artifacts are governed records, not scientific truth.

No harness = No truth.

Evidence requirements should include:

- artifact IDs
- artifact types
- artifact source SHA
- manifest SHA
- commit SHA where applicable
- schema SHA where applicable
- route used
- authenticated role
- timestamp
- PASS/WARN/FAIL result
- authority boundary check
- stop-condition check
- audit outcome when available

## Stop conditions

Future Option C implementation or smoke must stop immediately if any of these occur:

- GPT receives HUMAN authority
- GPT receives SCIENCE_EXECUTOR_AI authority
- /v1/science/share is exposed to GPTs
- /v1/science/execute-experiment is exposed to GPTs
- queue mutation route is exposed before implementation approval
- queue mutation occurs during read-only testing
- Code Monkey routes are exposed through Science GPT Actions
- Human-only route is callable by GPTs
- Science Executor-only route is callable by GPTs
- Science artifact is created by unauthorized route
- queue item claims scientific truth without evidence
- raw GPT output is treated as evidence
- ContextBus message/note is treated as evidence
- secret value is exposed
- certification is claimed
- promotion is claimed
- deployment approval is claimed
- production readiness is claimed
- autonomous Science operation is claimed

## Audit lane

Stage 3 should use this audit lane before any implementation:

### 1. Planning audit

Auditor verifies the Option C queue plan:

- preserves Human authority
- preserves Science Executor boundary
- does not authorize implementation
- does not authorize queue mutation
- does not expose forbidden routes
- keeps queue records non-evidence by default
- records stop conditions

### 2. Schema audit

Before any GPT Action import:

- confirm only approved read or mutation routes are present
- confirm forbidden routes remain absent
- confirm Human-only routes are not exposed to GPTs
- confirm Executor-only routes are not exposed to GPTs
- confirm schema SHA is locked
- confirm imported GPT Action schema matches repo schema SHA

### 3. Role-auth audit

For each role token:

- confirm authenticated role
- confirm allowed queue capabilities
- confirm forbidden authority remains denied
- confirm role spoofing does not override bearer role

### 4. Mutation audit

For any future mutation route:

- prove mutation occurs only on authorized item
- prove mutation is recorded with actor role and timestamp
- prove forbidden roles are denied
- prove invalid state transitions fail closed
- prove Human-only transitions cannot be performed by GPTs
- prove Executor-only transitions cannot be performed by GPTs

### 5. Evidence integrity audit

Auditor verifies:

- queue record is not treated as scientific truth
- raw GPT output is not treated as evidence
- ContextBus notes/messages are not treated as evidence
- required artifact/evidence references are present
- missing evidence yields BLOCKED or WAITING state, not PASS

### 6. Human gate audit

Before Stage 3 implementation:

- Human must approve the exact implementation packet
- Auditor must confirm the packet does not overreach
- Helper must only execute exact PM-authored contents
- no implementation may begin from this planning packet alone

## Required future implementation packet boundaries

Any future Option C implementation packet must include:

- exact route list
- exact auth matrix
- exact state transition table
- exact request/response schema
- exact forbidden route list
- exact negative tests
- exact tripwire harness
- exact audit zip requirements
- exact schema SHA lock procedure
- exact GPT Action import-lock procedure
- exact Human approval boundary
- exact rollback/remediation procedure

## Out of scope for this packet

This packet does not authorize:

- queue route implementation
- queue mutation activation
- live queue smoke
- GPT Action schema changes
- Worker code changes
- OpenAPI changes
- test code changes
- Code Monkey route exposure
- Human authority for GPTs
- Science Executor authority for GPTs
- /v1/science/share exposure
- /v1/science/execute-experiment exposure
- certification
- promotion
- deployment approval
- production-readiness claim
- autonomous Science operation

## Remediation candidates carried forward

Future hardening candidates:

- backend unknown-field rejection for POST /v1/notes
- backend unknown-field rejection for POST /v1/messages
- stronger raw transcript preservation for future evidence locks
- structured request/response summaries for future smoke evidence
- clearer per-route forbidden surface matrix
- Stage 4.5 Code Monkeys Spec-Kit Fidelity Alignment after Human decision ledger and before unified Science + Code model

## Human decision options

Human may choose one:

1. Approve this Option C planning packet for audit.
2. Request revisions to the Option C planning packet.
3. Hold Stage 3 and require additional evidence enrichment before queue planning.
4. Require backend unknown-field rejection hardening before Option C implementation planning.
5. Require raw transcript packaging standards before Option C implementation planning.

## Recommended next step

Recommended next step:

Audit this planning packet.

If audit passes, Human may choose whether to authorize the next bounded PM slice:

SCIENCE_MONKEYS_OPTION_C_QUEUE_CORE_IMPLEMENTATION_PLAN_001

That future slice would still be implementation planning only unless Human explicitly authorizes implementation.

## Final status

Recommended packet status:

PASS_WITH_WARNINGS

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.
