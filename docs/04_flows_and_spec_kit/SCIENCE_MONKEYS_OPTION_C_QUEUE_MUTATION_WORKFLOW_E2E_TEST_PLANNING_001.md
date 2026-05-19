# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_TEST_PLANNING_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Plan a workflow-oriented end-to-end test for Option C queue mutation.

Option C is workflow-oriented. It should be tested as a coordinated workflow, not only as isolated routes or schemas.

This packet is planning only.

This packet does not authorize live routes, GPT Action import, GPT configuration changes, certification, promotion, deployment approval, production-readiness claims, or autonomous Science operation.

## Prior stage

Prior stage:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_CLOSEOUT_001`

Prior stage result:

`PASS_WITH_WARNINGS`

Stage 3.3 closed schema and GPT instruction/config import-lock preparation as development-diagnostic only.

## Test objective

Define a representative Option C end-to-end workflow test that verifies:

- queue visibility works
- queue mutation routes coordinate state safely
- role boundaries are preserved
- queue history is observable
- mutation records remain governance coordination records only
- raw GPT output is not evidence
- ContextBus notes/messages are not evidence
- queue mutation records are not scientific truth
- no unauthorized authority expansion occurs

## Workflow under test

Representative workflow path:

1. Read queue.
2. Select safe queue item.
3. Claim queue item.
4. Observe claimed state.
5. Handoff queue item.
6. Observe handoff state/history.
7. Block or quarantine a separate safe queue item.
8. Observe blocked/quarantined state/history.
9. Complete an eligible claimed queue item.
10. Observe completion state/history.
11. Verify forbidden actions fail or remain unavailable.

This workflow should prove the coordinated behavior of queue read, mutation, and history surfaces.

## Roles in scope

Roles in scope:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

Representative testing may use Explorer-only first if Human chooses a representative-smoke strategy.

All-role testing requires separate Human authorization.

No Code Monkey GPT is in scope.

No Human GPT authority is in scope.

No Science Executor GPT authority is in scope.

## Route families in scope for future test

Read-only queue visibility:

- queue list
- queue by flow
- queue history

Queue mutation operations:

- claim
- complete
- block
- quarantine
- handoff

Exact route names must be taken from the current accepted role-scoped schemas before future execution.

## Forbidden route families

The future E2E test must not call or expose:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- Human decision routes
- Science Executor routes
- deployment routes
- certification routes
- promotion routes

## Representative test lanes

### Lane A — Explorer representative happy path

Purpose:

Verify representative workflow path using Explorer role only.

Checks:

- Explorer can read visible queue.
- Explorer can select safe queue item.
- Explorer can claim eligible item.
- Explorer can observe updated state.
- Explorer can handoff eligible item to allowed target if policy allows.
- Explorer can observe queue history.
- Explorer cannot use forbidden routes or authority.

Boundary:

Explorer-only success may support Human inference for the role-scoped schema family, but it is not direct live evidence for every role unless Human explicitly accepts that inference.

### Lane B — Negative authority lane

Purpose:

Verify unauthorized authority does not appear.

Checks:

- HUMAN authority is not available to GPT roles.
- SCIENCE_EXECUTOR_AI authority is not available to GPT roles.
- Code Monkey routes are not exposed.
- `/v1/science/share` is not exposed.
- `/v1/science/execute-experiment` is not exposed.
- raw GPT output is not treated as evidence.
- ContextBus notes/messages are not treated as evidence.
- queue mutation records are not treated as scientific truth.

### Lane C — Mutation boundary lane

Purpose:

Verify mutation semantics.

Checks:

- missing idempotency key fails or is blocked if route requires idempotency.
- duplicate idempotency key replay is deterministic.
- invalid transition fails.
- unsafe queue item ID fails.
- unknown queue item ID fails.
- completed/final item cannot be mutated unless policy explicitly allows.
- quarantined item cannot be completed unless policy explicitly allows.
- mutation record includes prior state, new state, authenticated role, truth boundary, and required status labels.

### Lane D — Optional all-role static/live split

Purpose:

Define a scalable strategy for all-role confidence.

Default:

- Explorer may be live-tested first as representative.
- Hypothesizer, Designer, and Science Auditor may remain static-validation-only unless Human separately authorizes all-role live testing.

If Human authorizes all-role live testing:

- each role must run only its role-scoped route surface
- no role may claim Human authority
- no role may claim Science Executor authority
- no role may use Code Monkey routes
- no role may use `/v1/science/share`
- no role may use `/v1/science/execute-experiment`

## Evidence requirements for future execution

A future E2E execution package must include:

- test plan
- exact role(s) tested
- exact schema SHA(s)
- exact instruction/config SHA(s)
- operation counts
- route list used
- queue item IDs used
- flow refs used
- mutation operations attempted
- mutation responses
- queue history observations
- idempotency proof
- forbidden route absence proof
- role authority proof
- truth boundary proof
- no-live-routes boundary if not live
- live-route authorization if live routes are used
- no GPT Action import proof unless import is separately authorized
- no certification/promotion/deployment/production/autonomy claim
- operator/timestamp
- command logs or GPT Action transcript excerpts, as appropriate
- audit handoff bundle generated locally and not committed

## Required truth boundaries

Future E2E evidence must preserve:

- queue records are not scientific truth
- mutation records are not scientific truth
- queue/mutation records are not evidence by themselves
- raw GPT output is not evidence
- ContextBus notes/messages are non-official diagnostic transport only
- no harness = no truth
- Human controls advancement decisions
- Auditor verifies independently

## Required stop conditions

Future E2E execution must stop if:

- GPT Action import would be required but not authorized
- live routes would be required but not authorized
- forbidden route appears
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears
- Human decision route appears
- Science Executor route appears
- HUMAN authority is granted to GPT role
- SCIENCE_EXECUTOR_AI authority is granted to GPT role
- queue mutation record claims to be scientific truth
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- certification/promotion/deployment/production/autonomy claim appears
- secrets would be printed
- route behavior differs from accepted schema/import-lock surface
- schema SHA mismatch occurs without explanation
- instruction/config SHA mismatch occurs without explanation

## Future execution options

After this planning packet is audited, Human may choose one:

1. Approve Explorer-only representative E2E live-smoke planning.
2. Approve Explorer-only representative E2E execution.
3. Approve all-role E2E planning.
4. Require import-lock correction before E2E testing.
5. Hold Option C workflow E2E testing.

## Recommended next step

Recommended after audit, if no blockers:

Authorize one macro-slice:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_EXECUTION_PACKET_001`

That future packet should include exact route calls, exact prompts/actions, exact stop conditions, and exact evidence requirements.

It should not authorize live routes unless Human explicitly approves live execution.

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize GPT configuration changes, authorize live routes, or authorize autonomous Science operation.
