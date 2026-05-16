# Science Monkeys Diagnostic Operations Runbook 001 Seed

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Define the next planning target after bounded diagnostic operational acceptance.

This is a seed document only. It does not implement the runbook and does not authorize expanded operations.

## Runbook Must Cover

The future runbook must define:

```text
how to start a diagnostic Science flow
which GPT acts at each phase
which route each GPT may use
which artifacts each GPT may create
how Human reviews transitions
how Science Executor receives execution packets
how Science Auditor reviews evidence
how findings are recorded
how Human-only share remains protected
how Code Monkeys exploitation remains gated
how stop conditions trigger quarantine
how evidence is archived
```

## Required Boundaries

The runbook must not authorize:

```text
certification
promotion
deployment
production readiness
autonomous Science operation
Human authority on GPTs
Science Executor authority on GPTs
Human-only /v1/science/share bypass
raw GPT output as evidence
artifact creation as scientific truth
```

## Required Status Labels

Every runbook section must preserve:

```text
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable
```
