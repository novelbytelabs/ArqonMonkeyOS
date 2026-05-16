# Science Monkeys Diagnostic Operational Acceptance Decision 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Decision

APPROVED: Science Monkeys receives bounded diagnostic operational acceptance for Human-reviewed diagnostic Science workflow trials only.

This acceptance is limited to the four separated Arqon Zero Science GPTs:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

## Evidence Basis

This acceptance is based on:

- Bounded Live Smoke 001: PASS_WITH_WARNINGS
- ArqonZero Evidence Hardening Audit 001: PASS_WITH_WARNINGS
- Diagnostic Operational Acceptance Plan 001: PASS_WITH_WARNINGS
- FLOW-2026-0052 ArqonZero artifact verification

## Required Status

Required status remains:

```text
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable
```

## Scope Granted

This decision allows bounded, Human-reviewed, diagnostic Science workflow trials using the four separated Arqon Zero Science GPTs through their role-scoped routes.

Allowed diagnostic role scope:

| GPT | Diagnostic Role |
|---|---|
| Arqon Zero Explorer AI | Research dossiers, source maps, contradiction maps, open questions |
| Arqon Zero Hypothesizer AI | Hypothesis cards, null hypotheses, prediction records, bounded interpretations, iteration proposals |
| Arqon Zero Designer AI | Experiment protocols, metric plans, control plans, execution packets, sealed boundary plans |
| Arqon Zero Science Auditor AI | Protocol/evidence/claim audits, finding boundary records, quarantine recommendations, share recommendations |

## Explicit Non-Authorization

This does not authorize:

```text
certification
promotion
deployment
production-readiness claims
autonomous Science operation
assigning HUMAN authority to GPTs
assigning SCIENCE_EXECUTOR_AI authority to GPTs
bypassing Human-only /v1/science/share authority
treating bounded smoke/artifact existence as scientific truth
treating raw GPT output as evidence
treating artifact creation as evidence of scientific validity
```

## Permanent Boundaries

Raw GPT output is not evidence.

No harness = No truth.

Human retains all official share, advancement, promotion, certification, and deployment authority.

Science Executor remains non-GPT/local only.

Science GPTs must not receive `HUMAN` or `SCIENCE_EXECUTOR_AI` tokens.

## Decision Record

```text
decision: BOUNDED_DIAGNOSTIC_OPERATIONAL_ACCEPTANCE
decision_authority: HUMAN
project: ArqonZero / ArqonMonkeyOS Science Monkeys
flow_evidence: FLOW-2026-0052
ArqonMonkeyOS acceptance plan commit: afa24f8fd4f3d43e1e37594d376c657e12f64c1b
ArqonZero evidence commit: 369e1332f26c547a0e597d3b278cd34e6469ee97
posture: diagnostic only
certification: not certified
promotion: not promotable
deployment: not approved
production_readiness: not approved
autonomous_operation: not approved
```

## Stop Conditions

Diagnostic use must stop and be quarantined if:

```text
any secret is exposed
any GPT uses another role's route
any GPT gains or requests HUMAN authority
any GPT gains or requests SCIENCE_EXECUTOR_AI authority
any GPT creates an official /v1/science/share packet
any GPT executes an experiment
any artifact claims certification
any artifact claims promotion
any artifact claims deployment approval
any artifact claims production readiness
any artifact claims autonomous operation
any raw GPT output is treated as evidence
any Designer artifact creates non-canonical Executor artifact_type names
any route/schema/token/source change occurs without approval
```

## Next Allowed Planning Stage

The next allowed PM planning stage is:

```text
Science Monkeys Diagnostic Operations Runbook 001
```

That runbook must preserve all status labels, Human-review boundaries, role-token isolation, Science Executor boundary, and non-certification limits.
