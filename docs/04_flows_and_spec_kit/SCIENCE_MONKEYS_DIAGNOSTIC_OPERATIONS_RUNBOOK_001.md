# Science Monkeys Diagnostic Operations Runbook 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Define bounded diagnostic operations for Science Monkeys after Human-granted bounded diagnostic operational acceptance.

This runbook uses **Option A: Human-Gated Manual Lane**.

This runbook records **Option C: Diagnostic Queue Lane** as the intended future direction after additional evidence, audits, and Human approval.

This runbook does not authorize certification, promotion, deployment, production-readiness claims, autonomous Science operation, assigning `HUMAN` authority to GPTs, assigning `SCIENCE_EXECUTOR_AI` authority to GPTs, bypassing Human-only `/v1/science/share`, or treating artifacts as scientific truth.

## Operating Mode

Current operating mode: Option A: Human-Gated Manual Lane.

Current mode:

```text
Option A: Human-Gated Manual Lane
```

Meaning:

```text
Each major phase requires Human review before moving to the next major phase.
Science GPTs may create role-scoped diagnostic artifacts only.
Science Executor remains local/non-GPT.
Science Auditor audits evidence and claims.
Human retains final share, advancement, promotion, certification, and deployment authority.
```

Future target:

```text
Option C: Diagnostic Queue Lane
```

Meaning:

```text
Science flows eventually move through a governed queue where each role processes only its assigned stage, transitions are policy-gated, and Human approval remains required for sensitive boundaries.
```

Option C is **not active** in this runbook.
Option C: Diagnostic Queue Lane is future-only and is not active in Runbook 001.

## Core Principle

```text
A routed artifact is a governed record, not proof that the scientific claim is true.
```

## Required Truth Boundary

```text
Raw GPT output is not evidence.
No harness = No truth.
Artifact creation is not scientific truth.
A passing smoke test is not sealed-test certification.
A finding record is not production approval.
A share recommendation is not Human share authorization.
```

## Roles

| Actor | Authority |
|---|---|
| Human | Final authority for share, advancement, promotion, certification, deployment, and acceptance decisions |
| Arqon Zero Explorer AI | Research artifacts only |
| Arqon Zero Hypothesizer AI | Hypothesis-side artifacts only |
| Arqon Zero Designer AI | Experiment design artifacts only |
| Science Executor | Local/non-GPT execution only |
| Arqon Zero Science Auditor AI | Audit/finding/recommendation artifacts only |
| Code Monkeys | Downstream exploitation only after separate Human gate |

## Phase Flow

```text
Explore
→ Human review
→ Hypothesize
→ Human review
→ Design
→ Human review
→ Execute locally through Science Executor
→ Human review
→ Audit
→ Human review
→ Iterate or Record
→ Human review
→ Optional Human-only Share
→ Optional separately gated Code Monkeys handoff
```

## Phase 1: Explore

Actor:

```text
Arqon Zero Explorer AI
```

Allowed route:

```text
POST /v1/science/research
```

Allowed artifacts:

```text
research_dossier
source_map
contradiction_map
open_questions
```

Explorer may:

```text
gather sources
summarize claims
map contradictions
identify missing evidence
list open questions
prepare research context
```

Explorer must not:

```text
create final hypotheses
design experiments
execute experiments
audit evidence
create findings
create share packets
create Code Monkeys tasks
certify/promote/deploy/claim production readiness
```

Exit condition:

```text
Human confirms research artifact is sufficient to attempt hypothesis drafting.
```

## Phase 2: Hypothesize

Actor:

```text
Arqon Zero Hypothesizer AI
```

Allowed routes:

```text
POST /v1/science/hypothesize
POST /v1/science/interpret
POST /v1/science/iterate only for hypothesizer-owned artifacts
```

Allowed artifacts:

```text
hypothesis_card
null_hypothesis
prediction_record
interpretation_draft
alternative_explanation_review
iteration_proposal
revised_hypothesis_card
```

Every hypothesis must include:

```text
claim under test
null hypothesis
expected observations
disconfirming observations
alternative explanations
evidence needed
non-certification boundary
```

Exit condition:

```text
Human confirms the hypothesis is falsifiable and suitable for experiment design.
```

## Phase 3: Design

Actor:

```text
Arqon Zero Designer AI
```

Allowed routes:

```text
POST /v1/science/design-experiment
POST /v1/science/iterate only for designer-owned artifacts
```

Allowed artifacts:

```text
experiment_protocol
metric_plan
control_plan
execution_packet
sealed_boundary_plan
revised_experiment_protocol
```

Designer must use only canonical Science Executor artifact names:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

Designer must not create or normalize non-canonical Executor artifact types such as:

```text
execution_manifest
flow_version_record
hypothesis_artifact_snapshot
test_input_manifest
control_input_manifest
raw_harness_outputs
metric_results
failure_case_log
environment_record
reproducibility_notes
```

Exit condition:

```text
Human confirms the design is bounded, executable by Science Executor, and auditable.
```

## Phase 4: Execute

Actor:

```text
Science Executor
```

Boundary:

```text
Science Executor is local/non-GPT.
No custom GPT may receive SCIENCE_EXECUTOR_AI authority.
```

Required Executor artifacts:

```text
execution_report
evidence_manifest
command_log
raw_result_index
deviation_report
```

Executor must preserve:

```text
exact commands
inputs
outputs
timestamps
exit codes
environment metadata
checksums or source hashes
deviations
missing files
failures
skips
```

Exit condition:

```text
Human confirms execution packet exists and can be handed to Science Auditor for audit.
```

## Phase 5: Audit

Actor:

```text
Arqon Zero Science Auditor AI
```

Allowed routes:

```text
POST /v1/science/audit-experiment
POST /v1/science/record-finding
```

Allowed artifacts:

```text
science_checklist
protocol_audit
evidence_audit
claim_scope_audit
audit_report
quarantine_recommendation
claim_scope_review
finding_record
negative_finding_record
inconclusive_finding_record
finding_boundary_record
share_recommendation
```

Auditor must audit:

```text
protocol quality
evidence completeness
command logs
result provenance
role boundaries
allowed claims
forbidden claims
missing evidence
evidence laundering risk
```

Auditor must not:

```text
execute experiments
produce raw results
fabricate missing evidence
create evidence for its own audit
create official Human share packets
certify/promote/deploy/claim production readiness
```

Exit condition:

```text
Human reviews audit result and decides iterate, quarantine, record, share, or stop.
```

## Phase 6: Iterate

Allowed when:

```text
Audit finds issues that are repairable without laundering evidence.
```

Iteration must preserve:

```text
original evidence
audit findings
deviation history
claim boundaries
version history
```

Iteration must not:

```text
rewrite failed evidence as success
delete inconvenient results
convert missing evidence into narrative evidence
change claims to make weak evidence look strong
```

## Phase 7: Record Finding

Allowed finding types:

```text
finding_record
negative_finding_record
inconclusive_finding_record
finding_boundary_record
```

A finding record is not:

```text
certification
deployment approval
production readiness
Human share authorization
scientific truth
```

## Phase 8: Human-Only Share

Only Human may authorize:

```text
/v1/science/share
```

Science Auditor may create:

```text
share_recommendation
```

But a share recommendation is not an official share packet.

## Phase 9: Code Monkeys Handoff

Code Monkeys handoff is forbidden unless Human separately approves it.

A Science-to-Code handoff requires:

```text
bounded finding or inconclusive/negative record
claim scope review
evidence manifest
audit report
Human handoff approval
clear non-certification labels
```

Code Monkeys must not treat diagnostic science artifacts as implementation truth.

## Risk Mitigation Policy

Risk mitigation is mandatory.

Every diagnostic flow must check for these risks:

| Risk | Required Mitigation |
|---|---|
| Momentum bias | Human gate between major phases |
| Evidence laundering | GPT summaries cannot replace Executor evidence |
| Role bleed | Each GPT uses only its role route and artifacts |
| Finding inflation | Weak evidence becomes weak/inconclusive finding, not success |
| Share bypass | Science GPTs cannot call Human-only share route |
| Executor ambiguity | Execution artifacts must be canonical and local/non-GPT |
| Secret exposure | Stop immediately and quarantine |
| Noncanonical artifacts | Stop or remediate before proceeding |
| Unsupported claims | Quarantine until claims are corrected |
| Code handoff too early | Separate Human gate required |

## Stop Conditions

Stop and quarantine immediately if:

```text
any secret is exposed
any GPT uses another role's route
any GPT requests or gains HUMAN authority
any GPT requests or gains SCIENCE_EXECUTOR_AI authority
any GPT creates official /v1/science/share
any GPT executes an experiment
any artifact claims certification
any artifact claims promotion
any artifact claims deployment approval
any artifact claims production readiness
any artifact claims autonomous operation
raw GPT output is treated as evidence
Designer creates non-canonical Executor artifact_type names
Science Auditor fabricates missing evidence
Code Monkeys handoff occurs without Human approval
```

## Option C Future Direction

Option C is the intended future operating model:

```text
Diagnostic Queue Lane
```

Option C should only be planned after multiple successful Option A diagnostic flows.

Option C requirements must include:

```text
queue state model
role-scoped queue assignment
Human gate states
automatic stop/quarantine states
artifact completeness checks
Executor evidence readiness checks
Auditor review completeness checks
Code Monkeys handoff gates
anti-momentum controls
audit trail for every transition
```

Option C must not reduce Human authority or weaken the truth boundary.
