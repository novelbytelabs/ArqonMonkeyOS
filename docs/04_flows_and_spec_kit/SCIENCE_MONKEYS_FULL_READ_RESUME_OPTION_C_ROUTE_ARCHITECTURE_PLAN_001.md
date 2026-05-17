# Science Monkeys Full Read/Resume + Option C Route Architecture Plan 001

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Document status: PM-authored planning artifact only.  
Target repo path: `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md`  
Project: ArqonMonkeyOS / Science Monkeys / Code Monkeys continuity  
Planning lane: newer route architecture track  
Current approved direction: Option 2 — full read/resume/control surface first, Option C queue planned but not activated.

---

## 1. Purpose

This plan defines the final route/command architecture direction for Science Monkeys and Code Monkeys so the system can resume work deterministically without forcing Mike or any GPT role to remember flow IDs, manually reconstruct context, or guess the next action.

The goal is to promote the existing broker/flow system into a full operating surface:

- read broadly
- write narrowly
- advance only by Human
- execute only by local Executor
- share only by Human
- certify/promote/deploy never by GPT

This document is not an implementation bundle. It does not authorize deployment, promotion, certification, production readiness, or autonomous Science operation.

---

## 2. Source-of-truth boundary

Project state must be grounded in repo-backed artifacts, uploaded bootstrap files, inspected route/source files, test logs, audit reports, and Human decisions.

Raw GPT output is not evidence. A routed artifact is a governed record, not scientific truth. No harness = No truth.

If a fact is not available from the bootstrap or repo-backed evidence, mark it:

```text
UNKNOWN/MISSING_FROM_BOOTSTRAP
```

or:

```text
UNKNOWN/MISSING_FROM_REPO_INSPECTION
```

and request the exact missing artifact or path.

Known bootstrap gaps from current continuity context:

```text
README.md = UNKNOWN/MISSING_FROM_BOOTSTRAP
PACK_MANIFEST.json = UNKNOWN/MISSING_FROM_BOOTSTRAP
package.json = UNKNOWN/MISSING_FROM_BOOTSTRAP
package-lock.json = UNKNOWN/MISSING_FROM_BOOTSTRAP
pnpm-lock.yaml = UNKNOWN/MISSING_FROM_BOOTSTRAP
yarn.lock = UNKNOWN/MISSING_FROM_BOOTSTRAP
tsconfig.json = UNKNOWN/MISSING_FROM_BOOTSTRAP
wrangler.toml = UNKNOWN/MISSING_FROM_BOOTSTRAP
```

Note: missing root build/config files are not automatic blockers for PM planning. They are investigation items for Helper/repo inspection. Do not invent their contents.

---

## 3. Non-negotiable governance boundaries

### 3.1 Required status labels

Every route, artifact, report, and execution packet in this rollout remains bounded by:

```text
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable
```

### 3.2 Forbidden claims

No role may claim:

- certification
- promotion
- deployment approval
- production readiness
- autonomous Science operation
- sealed-test certification
- scientific truth from raw GPT output
- validity from routed artifact existence alone

### 3.3 Forbidden authority expansion

No GPT role may receive:

- `HUMAN` authority
- `SCIENCE_EXECUTOR_AI` authority
- deployment authority
- certification authority
- promotion authority
- official Science share authority

### 3.4 Human-only powers

Human retains:

- flow advancement
- official Science share
- Science → Code handoff approval
- promotion
- certification
- deployment
- exception approval
- quarantine release or override
- final advancement authority

### 3.5 Executor-only powers

Science execution remains non-GPT and local. Science GPTs may read protocols and execution evidence but must not execute experiments or fabricate command logs.

---

## 4. Architecture target

The final operating surface has three layers.

### 4.1 Universal read/resume layer

Every authorized role can read enough state to avoid confusion:

- who am I?
- what can I do?
- what flows exist?
- what flow needs me?
- what artifacts already exist?
- what is the latest artifact?
- what is the next allowed action?
- what are the stop conditions?
- what is forbidden?

This layer is read-only except for existing note/message write routes.

### 4.2 Role-specific work layer

Each role writes only its own artifacts.

Science examples:

- Explorer writes research artifacts.
- Hypothesizer writes hypothesis artifacts.
- Designer writes protocol artifacts.
- local Science Executor writes execution evidence.
- Science Auditor writes audit/finding artifacts.
- Human writes decisions/share/advancement artifacts.

Code examples:

- PM writes PM intake/spec/plan/tasking/handoff artifacts.
- Coder writes work plans/tasks/implementation bundles.
- Helper writes execution reports only from exact packets.
- Auditor writes execution reviews.
- Human writes advancement decisions.

### 4.3 Governed queue layer / Option C

Option C is the Diagnostic Queue Lane.

Option C means queue-organized work with policy gates. It does not mean autonomous operation.

Flows move through explicit queue items with:

- phase
- assigned role
- required route
- required artifact
- required inputs
- stop conditions
- blockers
- next allowed actions
- Human gate requirements

---

## 5. Stage rollout

### Stage 1 — Read/resume surface

Build/read-design first:

```text
/whoami
/capabilities
/show
/resume
/load-flow
/flow-status
/flow-history
/list-artifacts
/open-artifact
/latest
/next
/stop-conditions
```

Intent: solve daily context restore and role-specific continuation.

Stage 1 must not grant new write powers beyond existing role-scoped write routes.

### Stage 2 — Science command aliases and role UX

Add or formalize role-friendly command aliases for:

- Explorer
- Hypothesizer
- Designer
- Science Executor
- Science Auditor
- Human

Intent: make Science Monkeys usable without exposing broad write authority.

### Stage 3 — Option C queue core

Plan and then implement guarded queue routes:

```text
/queue
/claim
/release
/complete
/block
/quarantine
/handoff
/gate
```

Intent: organize work without granting autonomy.

### Stage 4 — Human decision ledger

Make these durable, queryable records:

- approval
- rejection
- deferral
- official share
- handoff approval
- quarantine
- quarantine release
- exception decision

### Stage 5 — Unified Science + Code operating model

Bring Science and Code onto the same operating skeleton:

```text
/show
/resume
/queue
/next
/open-artifact
/latest
/handoff
/audit
/human-decision
```

Science and Code differ in artifact types and execution boundary, but share the same governance logic.

### Stage 6 — Production hardening

Only after the earlier stages:

- policy unit tests
- negative role tests
- spoofed-auth tests
- OpenAPI parity tests
- GPT Action schema checks
- route smoke tests
- live smoke tests where appropriate
- secret-leak checks
- resume smoke
- queue smoke
- handoff smoke
- audit
- Human advancement decision

Even if tests pass, this still does not authorize certification, promotion, deployment, or production-readiness claims.

---

## 6. Universal read/resume route design

### 6.1 `/whoami`

Candidate route:

```text
GET /v1/whoami
```

Returns:

- authenticated role
- project
- team/lane
- status labels
- allowed read routes
- allowed write routes
- forbidden routes
- denied authorities
- whether role can advance
- whether role can share
- whether role can execute
- whether role can certify/promote/deploy

Hard requirement: no GPT role may return `can_act_as_human=true` or `can_act_as_science_executor=true`.

### 6.2 `/capabilities`

Candidate route:

```text
GET /v1/capabilities
GET /v1/capabilities?project=...&role=...
```

Returns role-specific capability map:

- read permissions
- write permissions
- artifact types
- route examples
- forbidden routes
- Human-only gates
- Executor-only gates
- stop conditions

### 6.3 `/show`

Candidate routes:

```text
GET /v1/flows
GET /v1/flows/active
GET /v1/flows/recent
GET /v1/flows/blocked
GET /v1/flows/waiting
```

Plain-English command behavior:

```text
Show my active flows, recent flows, blocked flows, and flows waiting for Human review.
Include name, flow_id, current phase, last updated, latest artifact, next allowed action, and next role.
```

`/show` must be safe for all roles and must not advance state.

### 6.4 `/resume`

Candidate routes:

```text
GET /v1/resume
GET /v1/flows/resume
GET /v1/flows/{flow_ref}/resume
```

Plain-English command behavior:

```text
Resume the most relevant flow that needs my role's attention.
Show current phase, latest artifacts, last Human decision, next allowed role, next allowed command, forbidden actions, and stop conditions.
```

Resume must recommend actions, not execute them.

### 6.5 `/load-flow`

Candidate route:

```text
GET /v1/flows/{flow_ref}
```

`flow_ref` may be a canonical flow ID or friendly flow name if the repo implementation supports resolution.

### 6.6 `/flow-status`

Candidate route:

```text
GET /v1/flows/{flow_ref}/status
```

Returns compact state without the full manifest.

### 6.7 `/flow-history`

Candidate route:

```text
GET /v1/flows/{flow_ref}/history
```

Returns:

- phase transitions
- artifact events
- Human decisions
- audit events
- handoff events
- queue events
- quarantine events

### 6.8 `/list-artifacts`

Candidate route:

```text
GET /v1/flows/{flow_ref}/artifacts
```

Returns artifact index for the flow.

### 6.9 `/open-artifact`

Candidate route:

```text
GET /v1/artifacts/{artifact_id}
```

Reads one artifact body or metadata. This is read-only and must not imply artifact truth.

### 6.10 `/latest`

Candidate route:

```text
GET /v1/flows/{flow_ref}/latest
GET /v1/flows/{flow_ref}/latest?artifact_type=...
GET /v1/flows/{flow_ref}/latest?role=...
```

Returns latest matching artifact with provenance, timestamp, path/ref, and status labels.

### 6.11 `/next`

Candidate route:

```text
GET /v1/flows/{flow_ref}/next
```

Returns next allowed action for the authenticated role.

Hard requirement: `/next` suggests. It must not create artifacts or advance gates.

### 6.12 `/stop-conditions`

Candidate route:

```text
GET /v1/flows/{flow_ref}/stop-conditions
```

Returns current stop/quarantine triggers:

- missing evidence
- missing Human gate
- unsupported claim
- conflicting authority
- Executor boundary violation
- share boundary violation
- unreviewed audit warning
- sealed boundary risk
- secret exposure risk

---

## 7. Science command surface

### 7.1 Explorer AI

Explorer owns research only.

Candidate commands/artifacts:

| Command | Route | Artifact |
|---|---|---|
| `/research` | `POST /v1/science/research` | `research_dossier` |
| `/source-map` | `POST /v1/science/research` | `source_map` |
| `/contradictions` | `POST /v1/science/research` | `contradiction_map` |
| `/open-questions` | `POST /v1/science/research` | `open_questions` |
| `/research-refresh` | `POST /v1/science/research` | `research_dossier` |
| `/evidence-gap-map` | `POST /v1/science/research` | `evidence_gap_map` |

New artifact recommendation: `evidence_gap_map`.

Explorer may read hypotheses/protocols/audits/findings for context but must not write them.

### 7.2 Hypothesizer AI

Hypothesizer owns claims, assumptions, falsification, predictions, interpretation drafts, and iteration proposals.

Candidate commands/artifacts:

| Command | Route | Artifact |
|---|---|---|
| `/hypothesize` | `POST /v1/science/hypothesize` | `hypothesis_card` |
| `/null-hypothesis` | `POST /v1/science/hypothesize` | `null_hypothesis` |
| `/prediction-record` | `POST /v1/science/hypothesize` | `prediction_record` |
| `/alternatives` | `POST /v1/science/interpret` | `alternative_explanation_review` |
| `/interpret` | `POST /v1/science/interpret` | `interpretation_draft` |
| `/iterate-hypothesis` | `POST /v1/science/iterate` | `revised_hypothesis_card` |
| `/iteration-proposal` | `POST /v1/science/iterate` | `iteration_proposal` |

New artifact recommendations:

```text
claim_map
disconfirmation_plan
assumption_register
prediction_ledger
```

### 7.3 Designer AI

Designer owns protocol, metrics, controls, sealed boundaries, execution packets, reproducibility, and risk design.

Candidate commands/artifacts:

| Command | Route | Artifact |
|---|---|---|
| `/design-experiment` | `POST /v1/science/design-experiment` | `experiment_protocol` |
| `/metric-plan` | `POST /v1/science/design-experiment` | `metric_plan` |
| `/control-plan` | `POST /v1/science/design-experiment` | `control_plan` |
| `/sealed-boundary` | `POST /v1/science/design-experiment` | `sealed_boundary_plan` |
| `/execution-packet` | `POST /v1/science/design-experiment` | `execution_packet` |
| `/repro-plan` | `POST /v1/science/design-experiment` | `reproducibility_plan` |
| `/risk-plan` | `POST /v1/science/design-experiment` | `experiment_risk_plan` |
| `/revise-protocol` | `POST /v1/science/iterate` | `revised_experiment_protocol` |

New artifact recommendations:

```text
reproducibility_plan
experiment_risk_plan
data_fixture_plan
evaluation_window_plan
sealed_holdout_plan
```

### 7.4 Science Executor

Science Executor is not a GPT. It is a local execution worker.

Candidate commands/artifacts:

| Command | Route | Artifact |
|---|---|---|
| `/execution-intake` | `POST /v1/science/execution-intake` | `execution_intake` |
| `/execute-experiment` | `POST /v1/science/execute-experiment` | `execution_report` |
| `/command-log` | `POST /v1/science/execute-experiment` | `command_log` |
| `/evidence-manifest` | `POST /v1/science/execute-experiment` | `evidence_manifest` |
| `/raw-result-index` | `POST /v1/science/execute-experiment` | `raw_result_index` |
| `/deviation-report` | `POST /v1/science/execute-experiment` | `deviation_report` |
| `/execution-closeout` | `POST /v1/science/execution-closeout` | `execution_closeout` |

New artifact recommendations:

```text
execution_intake
execution_closeout
environment_snapshot
input_manifest
output_manifest
replay_instructions
```

Hard requirement: no GPT receives Science Executor authority.

### 7.5 Science Auditor AI

Science Auditor owns evidence review, claim review, protocol review, role-boundary review, quarantine recommendations, and finding records.

Candidate commands/artifacts:

| Command | Route | Artifact |
|---|---|---|
| `/audit-experiment` | `POST /v1/science/audit-experiment` | `audit_report` |
| `/protocol-audit` | `POST /v1/science/audit-experiment` | `protocol_audit` |
| `/evidence-audit` | `POST /v1/science/audit-experiment` | `evidence_audit` |
| `/claim-scope-review` | `POST /v1/science/audit-experiment` | `claim_scope_audit` |
| `/quarantine-review` | `POST /v1/science/audit-experiment` | `quarantine_recommendation` |
| `/record-finding` | `POST /v1/science/record-finding` | finding artifacts |
| `/share-recommendation` | `POST /v1/science/record-finding` | `share_recommendation` |
| `/audit-trail-review` | `POST /v1/science/audit-trail-review` | `audit_trail_review` |

New artifact recommendations:

```text
audit_trail_review
evidence_laundering_review
role_boundary_review
reproducibility_audit
sealed_boundary_audit
```

### 7.6 Human

Human routes should be explicit and first-class.

Candidate commands/routes:

| Command | Route | Purpose |
|---|---|---|
| `/adv-flow` | `POST /v1/flows/{flow_ref}/advance` | advance gate/status |
| `/human-decision` | `POST /v1/human/decision` or existing Human decision route | record decision |
| `/share` | `POST /v1/science/share` | official Science share |
| `/approve-handoff` | `POST /v1/human/handoff-approval` | Science → Code handoff |
| `/quarantine` | `POST /v1/human/quarantine-decision` | Human quarantine decision |
| `/resume-decision` | `POST /v1/human/resume-decision` | Human resumes blocked flow |

Human is the only role that may advance gates or authorize official Science share.

---

## 8. Code Monkeys command surface

Code Monkeys should share the same read/resume layer but keep separate write routes.

### 8.1 PM AI

Candidate routes:

| Command | Route | Purpose |
|---|---|---|
| `/pm-intake` | `POST /v1/pm/intake` | intake request |
| `/pm-specify` | `POST /v1/pm/specify` | write spec |
| `/pm-plan` | `POST /v1/pm/plan` | PM plan |
| `/pm-tasking` | `POST /v1/pm/tasking` | PM tasking |
| `/pm-handoff` | `POST /v1/pm/handoff` | handoff boundary |

Note: PM AI authors plans. Helper AI does not plan.

### 8.2 Coder AI

Candidate routes:

| Command | Route | Purpose |
|---|---|---|
| `/coder-work-plan` | `POST /v1/coder/work-plan` | implementation work plan |
| `/coder-tasks` | `POST /v1/coder/tasks` | Coder task breakdown |
| `/implementation-bundle` | `POST /v1/coder/implementation-bundle` | implementation proposal bundle |
| `/coder-handoff` | `POST /v1/coder/handoff` | handoff to Helper |

### 8.3 Helper AI

Candidate routes:

| Command | Route | Purpose |
|---|---|---|
| `/execution-intake` | `POST /v1/helper/execution-intake` | receive exact execution packet |
| `/execution-report` | `POST /v1/helper/execution-report` | report execution results |

Helper is execution-only. Helper may commit/run/verify exact PM/Coder-authored artifacts and packets, but must not design the plan.

### 8.4 Auditor AI

Candidate route:

| Command | Route | Purpose |
|---|---|---|
| `/helper-execution-review` | `POST /v1/auditor/helper-execution-review` | audit Helper execution |

### 8.5 Human

Candidate route:

| Command | Route | Purpose |
|---|---|---|
| `/advancement-decision` | `POST /v1/human/advancement-decision` | Human advancement decision |

---

## 9. Option C Diagnostic Queue Lane

### 9.1 Definition

Option C is a governed diagnostic queue lane. It lets the system organize work by role, phase, required artifact, next action, blockers, and Human gates.

Option C is not autonomous operation.

### 9.2 Queue item fields

Each queue item should include:

```text
queue_id
flow_id
flow_name
team
phase
assigned_role
required_route
required_artifact_type
input_artifacts
latest_human_decision
status
blocked_reason
stop_conditions
next_allowed_actions
forbidden_actions
created_at
updated_at
claimed_by
claimed_at
completed_at
handoff_target_role
human_gate_required
quarantine_status
```

### 9.3 Queue routes

Candidate routes:

```text
GET /v1/queue
GET /v1/queue/{queue_id}
POST /v1/queue
POST /v1/queue/{queue_id}/claim
POST /v1/queue/{queue_id}/release
POST /v1/queue/{queue_id}/complete
POST /v1/queue/{queue_id}/block
POST /v1/queue/{queue_id}/quarantine
POST /v1/queue/{queue_id}/handoff
GET /v1/queue/{queue_id}/gate
```

### 9.4 Queue command behavior

`/queue` shows work waiting for the authenticated role.

`/queue all` is Human/PM scoped and shows all queue items if allowed by policy.

`/claim` assigns an item only if the authenticated role matches the allowed role.

`/release` releases claimed work without completing it.

`/complete` marks a step complete only with required artifact refs/evidence.

`/block` records missing evidence, failed preconditions, or unclear instructions.

`/quarantine` preserves unsafe state and stops momentum.

`/handoff` creates a role-to-role handoff record only if policy preconditions are met.

`/gate` shows required Human gate state and missing prerequisites.

### 9.5 Queue stop conditions

A queue item must block or quarantine when:

- required artifact is missing
- required Human decision is missing
- role attempts write outside its lane
- GPT attempts Executor authority
- GPT attempts Human authority
- Science output is handed to Code without Human approval
- secret material appears in an artifact or log
- audit evidence is missing
- route behavior differs from OpenAPI/GPT Action schema
- claims exceed evidence scope

---

## 10. Permission model

### 10.1 Universal read access

Every authorized role should be able to read:

```text
whoami
capabilities
context
constitution
manifest
show/list flows
resume flow
load flow
flow status
flow history
flow artifacts
open artifact
latest artifact
next action
stop conditions
messages/inbox
open message
archive message
```

### 10.2 Role-scoped write access

Every role writes only its own lane.

### 10.3 Human write access

Human may write:

```text
advance
share
decision
promotion
certification
deployment
handoff approval
quarantine release
```

### 10.4 Science Executor write access

Science Executor may write:

```text
execution intake
execute experiment
execution evidence artifacts
execution closeout
```

No GPT may write Science execution evidence as Executor.

---

## 11. Risk and drift controls

### 11.1 Authority expansion risk

Control:

- deny-by-default policy
- server-side role matrix
- explicit Human-only tests
- explicit Executor-only tests
- `/whoami` and `/capabilities` return denied authorities

### 11.2 Read/write blur risk

Control:

- read routes must be `GET`
- write routes must be route-scoped
- no read route may create artifacts, advance gates, or mutate queue state

### 11.3 Evidence laundering risk

Control:

- every read view warns that artifacts are governed records, not truth
- findings require audit/evidence trail
- `/latest` must show provenance and status, not truth labels

### 11.4 Queue momentum risk

Control:

- stop conditions are first-class
- blockers are valid outcomes
- queue completion requires evidence/artifact refs
- Human gates remain blocking

### 11.5 Early Code handoff risk

Control:

- Science → Code handoff requires Human approval
- handoff route must check source finding/audit/share status
- no Code exploitation from unaudited Science output

### 11.6 Secret leakage risk

Control:

- secret values never printed
- local Helper env files may only be reported as SET/UNSET
- audit bundles must exclude secrets
- add secret leak tripwires

Local Helper env files:

```text
~/secrets/arqonmonkeyos_code_keys.env
~/secrets/arqonmonkeyos_science_keys.env
```

Report only:

```text
SET
UNSET
```

---

## 12. First implementation slice recommendation

After this planning artifact is committed and audited, the first implementation slice should be:

```text
SCIENCE_MONKEYS_READ_RESUME_SURFACE_001
```

### 12.1 Proposed scope

Implement the minimum safe read/resume foundation:

```text
GET /v1/whoami
GET /v1/capabilities
GET /v1/flows/{flow_ref}/resume
GET /v1/flows/{flow_ref}/latest
GET /v1/flows/{flow_ref}/next
GET /v1/flows/{flow_ref}/stop-conditions
```

Use existing `/v1/flows`, `/v1/flows/{flow_ref}`, and `/v1/flows/{flow_ref}/status` where already available.

### 12.2 Explicit non-scope

Do not implement queue mutation routes in the first slice.

Do not implement deployment/certification/promotion routes.

Do not weaken Human-only `/v1/science/share`.

Do not expose `/v1/science/execute-experiment` to GPT roles as Executor authority.

Do not turn `/next` or `/resume` into mutation routes.

---

## 13. Required tests before acceptance

Any route expansion must include evidence for:

- policy unit tests
- negative role tests
- spoofed-role tests
- Human-only share denial tests
- Human-only advance denial tests
- Science Executor boundary denial tests
- read route non-mutation tests
- OpenAPI/schema parity tests
- GPT Action schema checks if actions are updated
- live smoke tests where relevant
- resume smoke tests
- latest-artifact lookup tests
- next-action tests
- stop-condition tests
- secret-leak tests
- audit bundle generation if part of existing project practice
- git status before/after
- commit hash
- push status

No tests = no advancement.

---

## 14. Helper AI execution boundary

Helper AI may:

- create the exact PM-authored planning artifact
- run status/verification commands
- commit/push the exact artifact if clean
- report files changed, commit hash, push status, and missing files
- report local env file presence only as SET/UNSET

Helper AI must not:

- plan
- design routes
- alter route architecture
- edit Worker code for this planning-only step
- edit OpenAPI for this planning-only step
- invent missing files or route behavior
- print secret values
- certify, promote, deploy, or claim production readiness

---

## 15. Helper packet for committing this plan

Use the following packet only after Human approval to proceed with this planning artifact.

```text
You are Helper AI for ArqonMonkeyOS.

Required status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

Task:
Commit the exact PM-authored planning artifact provided by PM AI.

Target file:
docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md

Hard boundaries:
- Do not plan.
- Do not design routes.
- Do not modify Worker code.
- Do not modify OpenAPI.
- Do not modify tests.
- Do not invent missing files.
- Do not print secret values.
- Report local env files only as SET/UNSET:
  - ~/secrets/arqonmonkeyos_code_keys.env
  - ~/secrets/arqonmonkeyos_science_keys.env
- Do not claim certification, promotion, deployment approval, production readiness, or autonomous Science operation.

Steps:
1. Confirm repo root and current branch.
2. Run git status --short.
3. Create parent directory if needed:
   docs/04_flows_and_spec_kit
4. Write the exact PM-authored markdown content to:
   docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md
5. Do not edit any other file.
6. Run git diff -- docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md
7. Run git status --short.
8. If and only if the single expected file is changed/added, commit with:
   docs: add Science Monkeys read resume Option C route architecture plan
9. Push to origin main if current branch is main and repo policy allows it.
10. Report:
   - pwd
   - branch
   - git status before
   - env file SET/UNSET only
   - changed files
   - commit hash
   - push status
   - any missing files
   - confirmation that no Worker/OpenAPI/test files were modified

Stop conditions:
- More than the target planning file changes.
- Secret value appears anywhere in output.
- Repo is not on expected branch and no instruction permits commit.
- Required directory/file cannot be written.
- Any instruction would require Helper to plan or design.
```

---

## 16. Auditor checklist after Helper commits

Auditor should inspect:

- target file path exists
- content matches PM-authored planning intent
- required status labels present
- no Worker/OpenAPI/test files changed
- no secret values printed
- no certification/promotion/deployment/production claims
- Human gates preserved
- GPTs do not receive Human or Executor authority
- `/v1/science/share` remains Human-only
- Option C is planning/design only, not active autonomy
- Helper did not plan or design
- git status and commit evidence are present

---

## 17. Human advancement criteria

Human may consider advancement only after:

- Helper commits the exact PM-authored plan
- Auditor reviews the plan and execution evidence
- no blocker remains unresolved
- warnings are understood and carried forward
- the next implementation slice is separately PM-authored

Advancement does not mean certification, promotion, deployment approval, production readiness, or autonomous Science operation.

---

## 18. Final operating principle

```text
Read broadly.
Write narrowly.
Advance only by Human.
Execute only by local Executor.
Share only by Human.
Certify/promote/deploy never by GPT.
```

This is the approved direction for the next route architecture track.
