# Science Monkeys Read/Resume Surface 001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## 1. Purpose

This PM implementation packet defines the first bounded implementation slice for the Science Monkeys full read/resume route surface.

This slice exists to solve the daily continuity problem: every authorized role must be able to understand current flow state, discover allowed capabilities, list relevant flows, resume work, inspect artifacts, see next allowed actions, and see stop conditions without receiving broader write authority.

This packet does not authorize queue mutation, production deployment, certification, promotion, autonomous Science operation, or any expansion of Human or Science Executor authority.

## 2. Slice Name

SCIENCE_MONKEYS_READ_RESUME_SURFACE_001

## 3. Approved Prior Context

Preceding PM planning artifact:

- docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md

Preceding audit result:

- PASS_WITH_WARNINGS

Carry-forward warnings:

1. New artifact names mentioned in the architecture plan are planning recommendations only. Do not implement or treat them as valid backend artifact types in this slice.
2. Future Human routes for promotion, certification, and deployment are authority-scope concepts only. Do not implement them in this slice.
3. Option C queue mutation routes must remain deferred and separately planned, implemented, tested, audited, and Human-approved.

## 4. Implementation Scope

Implement read/resume routes only.

Allowed route targets for this slice:

- GET /v1/whoami
- GET /v1/capabilities
- GET /v1/show
- GET /v1/resume
- GET /v1/flows/{flow_ref}/resume
- GET /v1/flows/{flow_ref}/history
- GET /v1/flows/{flow_ref}/artifacts
- GET /v1/flows/{flow_ref}/latest
- GET /v1/flows/{flow_ref}/next
- GET /v1/flows/{flow_ref}/stop-conditions
- GET /v1/artifacts/{artifact_id}

Existing route aliases may be used if the current codebase already provides equivalent read-only behavior. If an existing route covers a target, document the mapping instead of duplicating behavior.

## 5. Explicit Non-Scope

Do not implement:

- Option C queue mutation routes
- /queue claim, complete, block, quarantine, or handoff mutation behavior
- new Science artifact types
- new production deployment routes
- certification routes
- promotion routes
- autonomous Science operation
- Science Executor authority for GPT roles
- Human authority for GPT roles
- Code Monkeys acting on Science outputs without separate Human approval
- any change that weakens /v1/science/share Human-only authority
- any broad write route for every role

## 6. Required Governance Rules

The implementation must preserve these rules:

- Read broadly.
- Write narrowly.
- Advance only by Human.
- Execute only by local Science Executor.
- Share only by Human.
- Certify, promote, and deploy never by GPT.
- Raw GPT output is not evidence.
- Routed artifacts are governed records, not scientific truth.
- No harness = No truth.

## 7. Role Model Requirements

All authenticated roles may use read/resume routes only to the extent allowed by policy.

Read/resume routes must never grant write authority.

No GPT role may receive:

- HUMAN authority
- SCIENCE_EXECUTOR_AI authority
- deployment authority
- certification authority
- promotion authority

Science Executor must remain local/non-GPT.

Human must retain:

- /v1/science/share authority
- flow advancement authority
- Human approval authority
- promotion/certification/deployment decision authority
- Science-to-Code handoff approval authority

## 8. Route Behavior Requirements

### GET /v1/whoami

Return authenticated identity and authority summary.

Required response fields:

- ok
- project
- role
- role_class or role_type if currently modeled
- status_labels
- allowed_read_routes
- allowed_write_routes
- forbidden_authorities
- human_authority: false unless authenticated role is Human
- science_executor_authority: false unless authenticated role is Science Executor
- can_share_science: true only for Human
- can_advance_flow: true only for Human or currently authorized Human-equivalent backend policy
- warnings

Required warning language:

- Raw GPT output is not evidence.
- Routed artifacts are governed records, not scientific truth.
- No harness = No truth.

### GET /v1/capabilities

Return role-specific capabilities.

Required response fields:

- ok
- project
- role
- read_capabilities
- write_capabilities
- forbidden_routes
- forbidden_authorities
- allowed_artifact_types_for_write if currently known
- read_only_route_note
- human_gate_note
- executor_boundary_note

### GET /v1/show

Return a read-only overview of flows visible to the authenticated role.

Required behavior:

- list active flows
- list recent flows
- list blocked flows if detectable
- list flows waiting for Human review if detectable
- include friendly name when available
- include flow_id when available
- include current phase/status when available
- include last updated when available
- include latest artifact reference if available
- include next allowed action summary if available

If one or more fields cannot be derived from current manifests, return UNKNOWN rather than inventing values.

### GET /v1/resume

Return the most relevant flow needing attention for the authenticated role, or a safe no-action response.

Required behavior:

- resolve by current queue/status/phase if available
- otherwise use recent active flow heuristic only if deterministic and documented
- never advance state
- never claim work
- never write artifacts
- return role-specific next allowed action recommendation
- return forbidden actions
- return stop conditions
- return latest relevant artifacts
- return missing evidence if applicable

If no deterministic resume target exists, return:

- ok: true
- resume_available: false
- reason
- suggested_show_command

### GET /v1/flows/{flow_ref}/resume

Return a role-specific resume packet for the named flow or flow ID.

Required response fields:

- ok
- flow_ref
- flow_id
- flow_name
- current_phase_or_status
- latest_artifacts
- last_human_decision if available
- next_allowed_role if available
- next_allowed_command if available
- current_role_allowed_actions
- forbidden_actions
- stop_conditions
- missing_evidence
- status_labels

### GET /v1/flows/{flow_ref}/history

Return read-only flow history.

Required behavior:

- include phase transitions if available
- include Human decisions if available
- include artifact write events if available
- include audit events if available
- include handoff events if available
- return UNKNOWN for unavailable history categories

### GET /v1/flows/{flow_ref}/artifacts

Return read-only artifact index for a flow.

Required behavior:

- list artifact IDs/refs
- list artifact type if available
- list author role if available
- list created/updated timestamps if available
- list source path if safe to expose
- do not return secret values
- do not treat artifacts as truth

### GET /v1/flows/{flow_ref}/latest

Return latest artifact references by type and/or role if available.

Required behavior:

- support latest artifacts for the flow
- support filtering by artifact type if already practical
- support filtering by role if already practical
- return provenance and warning labels
- return UNKNOWN when latest cannot be determined

### GET /v1/flows/{flow_ref}/next

Return next allowed action recommendation only.

Required behavior:

- do not advance
- do not claim
- do not write
- show next allowed role if derivable
- show next allowed command if derivable
- show current role allowed/forbidden actions
- show Human gate requirement if applicable
- show missing prerequisites

### GET /v1/flows/{flow_ref}/stop-conditions

Return role-specific and flow-specific stop conditions.

Required baseline stop conditions:

- missing required artifact
- missing evidence manifest
- missing audit report when required
- Human gate required
- unauthorized role attempting write
- Executor boundary risk
- /v1/science/share authority risk
- raw GPT output being treated as evidence
- routed artifact being treated as scientific truth
- secret leakage risk
- route overreach risk
- Option C queue mutation attempted before approval

### GET /v1/artifacts/{artifact_id}

Return one artifact body or metadata if safe and authorized.

Required behavior:

- read-only
- no mutation
- no secret values
- include artifact metadata
- include warning that artifact is a governed record, not scientific truth
- fail closed if artifact path is unsafe, missing, ambiguous, or outside allowed repository paths

## 9. OpenAPI / GPT Action Requirements

If implementation changes routes, OpenAPI must be updated in the same implementation slice.

OpenAPI must include:

- route paths
- methods
- auth expectation
- role boundary notes where practical
- response schema summaries
- status labels where practical

GPT Action affordances must not expose write authority through read routes.

## 10. Required Tests

At minimum, this slice must include tests or smoke checks for:

1. /whoami returns authenticated role and does not grant Human/Executor authority to GPT roles.
2. /capabilities returns read/write separation.
3. /show returns flow list or safe empty/UNKNOWN response without mutation.
4. /resume returns a role-specific resume packet or safe no-action response without mutation.
5. /flows/{flow_ref}/resume resolves by friendly name and/or flow ID where current flow resolution supports it.
6. /flows/{flow_ref}/history is read-only.
7. /flows/{flow_ref}/artifacts is read-only.
8. /flows/{flow_ref}/latest is read-only.
9. /flows/{flow_ref}/next recommends only and does not advance.
10. /flows/{flow_ref}/stop-conditions returns baseline stop conditions.
11. /artifacts/{artifact_id} refuses unsafe or missing artifacts.
12. Non-Human roles cannot use or gain /v1/science/share authority.
13. GPT roles cannot gain SCIENCE_EXECUTOR_AI authority.
14. Read routes do not write files or create artifacts.
15. Unknown/missing data is returned as UNKNOWN, not invented.
16. Secret values are not returned.
17. Option C queue mutation routes are not implemented in this slice.
18. Existing Science write routes still preserve role-scoped behavior.
19. Existing Human-only flow advancement remains Human-only.
20. OpenAPI route definitions match implemented route surface if OpenAPI is modified.

## 11. Files Likely To Inspect

Implementation worker files likely relevant:

- worker/src/index.ts
- worker/src/auth.ts
- worker/src/flows.ts
- worker/src/flow_policy.ts
- worker/src/science.ts
- worker/src/science_share.ts
- worker/src/projects.ts
- worker/src/types.ts

OpenAPI likely relevant if routes are implemented:

- openapi/arqon_contextos.openapi.yaml

Test-support files likely relevant:

- worker/test_support/*read*resume*
- worker/test_support/*science*
- worker/test_support/*flow*
- worker/test_support/*role*

If exact current file names differ, inspect the repository and use the nearest existing test-support pattern. Do not invent test pass results.

## 12. Local Environment Handling

Local Helper env files:

- ~/secrets/arqonmonkeyos_code_keys.env
- ~/secrets/arqonmonkeyos_science_keys.env

Only report:

- SET
- UNSET

Never print secret values.

## 13. Execution / Verification Requirements

Helper or implementation executor must report:

- pwd
- branch
- git status before
- env file SET/UNSET only
- changed files
- commands run
- exit codes
- test results
- git diff summary
- commit hash if committed
- push status if pushed
- confirmation whether Worker/OpenAPI/test files were modified
- any missing files
- any UNKNOWNs

## 14. Stop Conditions

Stop immediately and report if:

- a route grants Human authority to a GPT
- a route grants Science Executor authority to a GPT
- /v1/science/share becomes non-Human
- flow advancement becomes non-Human without explicit existing backend policy proving otherwise
- queue mutation routes are implemented
- new Science artifact types are implemented
- secret values are printed
- read routes mutate repository state
- implementation requires inventing missing route behavior
- tests fail
- OpenAPI diverges from implementation
- any production/certification/promotion/deployment claim appears

## 15. Expected Outcome

The expected outcome is a bounded read/resume route surface that improves continuity without expanding authority.

Accepted result types:

- PASS: implemented, tested, no blockers
- PASS_WITH_WARNINGS: implemented and tested, with bounded warnings
- FAIL_BLOCKED: blocker discovered; do not advance

No result may claim:

- certification
- promotion
- deployment approval
- production readiness
- autonomous Science operation
- scientific truth

## 16. Next Step After This Packet

After this PM implementation packet is committed, the next expected step is implementation by the appropriate code-authoring role or exact execution worker process, followed by evidence collection, Auditor review, and Human advancement decision.

Do not proceed to Option C queue mutation until the read/resume surface is implemented, tested, audited, and Human-approved.
