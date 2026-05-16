# Science Monkeys Diagnostic Operational Acceptance Criteria 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Define the exact criteria for a future Human decision on bounded diagnostic operational acceptance.

This document does not authorize acceptance by itself.

## Minimum Acceptance Criteria

Science Monkeys may be considered for bounded diagnostic operational acceptance only if all criteria below are satisfied.

| Criterion | Required Result |
|---|---|
| Four separated Science GPTs exist | YES |
| One combined Science Monkeys GPT avoided | YES |
| Role-scoped Actions configured | YES |
| `HUMAN` token assigned to GPTs | NO |
| `SCIENCE_EXECUTOR_AI` token assigned to GPTs | NO |
| Startup/refusal checks passed | YES |
| Bounded live smoke allowed-route chain passed | YES |
| ArqonZero artifact hardening passed | YES |
| Required labels present in evidence | YES |
| Secrets exposed | NO |
| Unsupported claims found | NO |
| Designer canonical artifact boundary | PASS |
| Human-only `/v1/science/share` preserved | YES |
| Science Executor non-GPT/local only | YES |

## Evidence Required For Decision

The decision packet must include:

```text
Smoke flow: FLOW-2026-0052
ArqonZero storage target
ArqonZero commit inspected
all four artifact IDs
all four artifact types
all four role mappings
all source paths
all source SHAs
status-label verification
secret scan result
unsupported-claim scan result
Designer canonical artifact verdict
post-smoke audit verdict
evidence-hardening audit verdict
```

## Allowed Acceptance Result

If Human accepts, the only allowed status is:

```text
BOUNDED_DIAGNOSTIC_OPERATIONAL_ACCEPTANCE
```

Meaning:

```text
Science Monkeys may be used for bounded, Human-reviewed, diagnostic Science workflow trials only.
```

## Forbidden Acceptance Results

Human acceptance must not use or imply:

```text
CERTIFIED
PROMOTED
DEPLOYED
PRODUCTION_READY
AUTONOMOUS_OPERATION_APPROVED
SEALED_TEST_CERTIFIED
SCIENTIFIC_TRUTH_PROVEN
```

## Required Acceptance Conditions

Any future acceptance statement must include:

```text
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable
```

It must also state:

```text
Raw GPT output is not evidence.
No harness = No truth.
Artifact creation is not scientific truth.
Human retains /v1/science/share authority.
Science Executor remains non-GPT/local only.
```

## Rejection / Deferral Conditions

Human should reject or defer acceptance if:

```text
any required evidence is missing
artifact hardening is not accepted by Auditor
secret exposure occurs
unsupported claims appear
role separation is ambiguous
Action-token assignment is ambiguous
Human-only share authority is ambiguous
Science Executor boundary is ambiguous
Designer canonical artifact boundary is ambiguous
```
