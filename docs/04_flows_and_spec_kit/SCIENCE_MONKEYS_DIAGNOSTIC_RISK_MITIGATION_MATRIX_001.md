# Science Monkeys Diagnostic Risk Mitigation Matrix 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Define serious risk mitigations for Science Monkeys Diagnostic Operations Runbook 001.

## Risk Matrix

| Risk | Severity | Detection | Mitigation | Stop Condition |
|---|---:|---|---|---|
| Momentum bias | High | Flow advances because artifacts exist | Human gate between phases | Any phase skips Human review |
| Evidence laundering | Critical | GPT summary substitutes for logs/data | Executor evidence required | Raw GPT text treated as evidence |
| Role bleed | High | GPT creates another role artifact | Role-scoped routes/artifacts | Unauthorized route/artifact |
| Share bypass | Critical | GPT creates official share | Human-only share route | Non-Human share attempt |
| Executor boundary leak | Critical | GPT executes or creates command logs | Executor non-GPT/local only | GPT claims execution |
| Finding inflation | High | Weak evidence becomes positive finding | Auditor claim-scope audit | Unsupported success claim |
| Secret exposure | Critical | Token/key visible | Stop, redact, rotate if needed | Any secret appears |
| Noncanonical artifact drift | Medium | Designer invents artifact types | Canonical Executor artifact list | Backend artifact_type drift |
| Code handoff too early | High | Code Monkeys acts on weak science | Separate Human handoff gate | Handoff without Human approval |
| Certification laundering | Critical | Diagnostic pass called certified | Required labels everywhere | Certification/promotion/deployment claim |

## Required Refrains

Every major diagnostic packet should include:

```text
Raw GPT output is not evidence.
No harness = No truth.
A routed artifact is a governed record, not proof.
Human retains official share and advancement authority.
Science Executor remains non-GPT/local only.
```

## Quarantine Handling

Quarantine means:

```text
do not delete evidence
do not rewrite evidence
do not promote claims
preserve failure/deviation records
record why the flow is blocked
define remediation or stop
```

## Risk Review Gate

Before each phase transition, Human should ask:

```text
1. Is the current artifact role-correct?
2. Is the evidence type appropriate for the claim?
3. Are required status labels present?
4. Is any claim too strong?
5. Is any secret exposed?
6. Is Executor evidence required before proceeding?
7. Is Auditor review required before proceeding?
8. Would this transition create momentum bias?
```
