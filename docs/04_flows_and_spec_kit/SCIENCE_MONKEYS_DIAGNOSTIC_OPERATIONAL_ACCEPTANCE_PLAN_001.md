# Science Monkeys Diagnostic Operational Acceptance Plan 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Define what bounded diagnostic operational acceptance means for Science Monkeys after the successful bounded live smoke and ArqonZero evidence hardening audit.

This plan is planning only.

It does not authorize certification, promotion, deployment, production-readiness claims, autonomous Science operation, assigning `HUMAN` authority to GPTs, assigning `SCIENCE_EXECUTOR_AI` authority to GPTs, bypassing Human-only `/v1/science/share`, or treating bounded smoke/artifact existence as scientific truth.

## Evidence Basis

Diagnostic operational acceptance planning is based on:

```text
Science Monkeys Bounded Live Smoke 001: PASS_WITH_WARNINGS
ArqonZero Evidence Hardening Audit 001: PASS_WITH_WARNINGS
Score: 93 / 100
Flow: FLOW-2026-0052
Storage target: ArqonZero
```

Verified smoke chain:

| Role | Route | Artifact Type | Artifact ID | Source SHA |
|---|---|---|---|---|
| Explorer | POST /v1/science/research | research_dossier | ART-2026-05-16-6dd49724 | 9cdc3fb0dc081cebbdfd13479af4f0679e5b0565 |
| Hypothesizer | POST /v1/science/hypothesize | hypothesis_card | ART-2026-05-16-3b1fe85b | 0c2381138edf29997719dcb3c5ede9ea01351759 |
| Designer | POST /v1/science/design-experiment | experiment_protocol | ART-2026-05-16-db65129c | 28182960f4bd770928631e4b8e35e099e849e519 |
| Science Auditor | POST /v1/science/audit-experiment | audit_report | ART-2026-05-16-b2e504bf | 94014ef139de62e000248142ff9b1db3c82bc322 |

## Definition: Diagnostic Operational Acceptance

Diagnostic operational acceptance means:

```text
The four Science Monkeys GPTs may be used in bounded, Human-reviewed, diagnostic Science workflow trials through their role-scoped routes, while preserving required status labels, role separation, Human-only share authority, non-GPT/local Science Executor boundary, anti-deception boundaries, and non-certification limits.
```

It does not mean:

```text
certified
promoted
deployed
production-ready
autonomous
scientifically validated
sealed-test certified
approved for unsupervised operation
```

## Accepted Diagnostic Capabilities

If Human later approves diagnostic operational acceptance, the system may be used for:

| Role | Allowed Diagnostic Use |
|---|---|
| Arqon Zero Explorer AI | Create research dossiers, source maps, contradiction maps, and open questions |
| Arqon Zero Hypothesizer AI | Create hypothesis cards, null hypotheses, prediction records, bounded interpretations, and iteration proposals |
| Arqon Zero Designer AI | Create experiment protocols, metric plans, control plans, execution packets, and sealed boundary plans |
| Arqon Zero Science Auditor AI | Create protocol/evidence/claim audits, finding boundary records, quarantine recommendations, and share recommendations |

All outputs remain diagnostic artifacts requiring Human review.

## Operating Rules

Diagnostic use must follow these rules:

1. Every Science workflow remains `REQUIRES_HUMAN_REVIEW`.
2. Every artifact remains `development diagnostic only`.
3. No artifact is `SEALED-TEST CERTIFIED`.
4. No artifact is promotable by GPT authority.
5. Raw GPT output is not evidence.
6. No harness means no truth.
7. Human retains `/v1/science/share` authority.
8. Science Executor remains non-GPT/local only.
9. Science GPTs must not receive `HUMAN` or `SCIENCE_EXECUTOR_AI` tokens.
10. Science GPTs must use only their role-scoped Actions.
11. Designer must preserve canonical Executor artifact names only:
    - `execution_report`
    - `evidence_manifest`
    - `command_log`
    - `raw_result_index`
    - `deviation_report`
12. Auditor may recommend but not officially share, certify, promote, deploy, or approve production use.

## Non-Scope

Diagnostic operational acceptance does not allow:

```text
certification
promotion
deployment
production-readiness claims
autonomous Science operation
Human authority assigned to GPTs
SCIENCE_EXECUTOR_AI authority assigned to GPTs
bypassing /v1/science/share Human authority
treating artifact creation as scientific truth
treating bounded smoke as sealed-test certification
treating GPT-generated drafts as evidence
automatic Code Monkeys exploitation
```

## Stop Conditions

Diagnostic operation must stop and be quarantined if:

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

## Human Decision Required

This plan does not itself accept Science Monkeys as diagnostically operational.

Human must separately approve or reject diagnostic operational acceptance after Auditor review of this plan.
