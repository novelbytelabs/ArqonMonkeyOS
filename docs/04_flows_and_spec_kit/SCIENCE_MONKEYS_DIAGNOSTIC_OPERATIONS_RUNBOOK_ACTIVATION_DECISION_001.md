# Science Monkeys Diagnostic Operations Runbook Activation Decision 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Decision

APPROVED: Science Monkeys Diagnostic Operations Runbook 001 is active as the bounded diagnostic operations protocol under Option A: Human-Gated Manual Lane.

This approval authorizes Human-reviewed diagnostic Science workflow trials only.

## Active Protocol

Active protocol:

```text
Science Monkeys Diagnostic Operations Runbook 001
```

Current operating mode:

```text
Option A: Human-Gated Manual Lane
```

Future-only mode:

```text
Option C: Diagnostic Queue Lane
```

Option C remains future-only and inactive until separately planned, audited, and Human-approved.

## Evidence Basis

This activation is based on:

```text
Science Monkeys Diagnostic Operations Runbook 001 Audit: PASS_WITH_WARNINGS
Score: 94 / 100
Blockers: none
Required remediation: none
```

The audit found the runbook acceptable as the active Option A diagnostic operations protocol and confirmed that Option C remains future-only and inactive.

## Scope Authorized

This activation authorizes only:

```text
Human-reviewed diagnostic Science workflow trials
Option A: Human-Gated Manual Lane
role-scoped Science GPT artifact creation
local/non-GPT Science Executor handoff only when Human approves that phase
Science Auditor diagnostic review
Human review between major phases
```

## Explicit Non-Authorization

This activation does not authorize:

```text
certification
promotion
deployment
production-readiness claims
autonomous Science operation
assigning HUMAN authority to GPTs
assigning SCIENCE_EXECUTOR_AI authority to GPTs
bypassing Human-only /v1/science/share
treating routed artifacts as scientific truth
treating raw GPT output as evidence
Code Monkeys handoff without separate Human approval
activating Option C
```

## Required Status Remains

```text
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable
```

## Required Truth Boundary

```text
Raw GPT output is not evidence.
No harness = No truth.
A routed artifact is a governed record, not proof.
Artifact creation is not scientific truth.
```

## Active Operating Rules

1. Human review is required between major phases.
2. Science GPTs may use only their role-scoped routes.
3. Science GPTs must not receive `HUMAN` tokens.
4. Science GPTs must not receive `SCIENCE_EXECUTOR_AI` tokens.
5. `/v1/science/share` remains Human-only.
6. Science Executor remains local/non-GPT only.
7. Code Monkeys handoff requires separate Human approval.
8. Positive findings remain bounded and non-certifying.
9. Any stop condition triggers quarantine.

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
Option C is activated without separate approval
```

## Next Allowed Operational Use

The next allowed use is:

```text
Start the first Human-reviewed diagnostic Science workflow trial under Option A.
```

That trial must use the active runbook and preserve all status labels and boundaries.
