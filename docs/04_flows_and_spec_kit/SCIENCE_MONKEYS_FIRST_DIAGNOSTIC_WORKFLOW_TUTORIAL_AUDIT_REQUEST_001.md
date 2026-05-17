# Science Monkeys First Diagnostic Workflow Tutorial Audit Request 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Objective

Ask Auditor AI to verify that the first diagnostic workflow tutorial is plain-English, beginner-friendly, end-to-end, and bounded by the active Option A diagnostic operations protocol.

This audit must not certify, promote, deploy, approve production readiness, or approve autonomous Science operation.

## Evidence To Inspect

```text
SCIENCE_MONKEYS_FIRST_DIAGNOSTIC_WORKFLOW_TUTORIAL_001.md
SCIENCE_MONKEYS_FIRST_DIAGNOSTIC_WORKFLOW_QUICKSTART_001.md
SCIENCE_MONKEYS_FIRST_DIAGNOSTIC_WORKFLOW_EXAMPLE_001.md
SCIENCE_MONKEYS_DIAGNOSTIC_OPERATIONS_RUNBOOK_001.md
SCIENCE_MONKEYS_ACTIVE_DIAGNOSTIC_PROTOCOL_INDEX_001.md
```

## Audit Questions

1. Is the tutorial understandable for a beginner?
2. Does it explain the end-to-end workflow in plain English?
3. Does it include paragraphs, not just lists?
4. Does it preserve Option A: Human-Gated Manual Lane?
5. Does it keep Option C future-only and inactive?
6. Does it preserve Human review between major phases?
7. Does it preserve Human-only `/v1/science/share`?
8. Does it preserve Science Executor as non-GPT/local only?
9. Does it preserve role-token isolation?
10. Does it avoid certification, promotion, deployment, production-readiness, and autonomous-operation claims?
11. Does it avoid treating raw GPT output or routed artifacts as evidence/truth?
12. Does it include stop/quarantine guidance?
13. Are there blockers before using this tutorial for the first diagnostic workflow trial?

## Required Return

```text
verdict:
score:
blockers:
warnings:
required remediation:
allowed next step:
forbidden next steps:
```

## Allowed Verdicts

```text
PASS_WITH_WARNINGS
REMEDIATION_REQUIRED
INCONCLUSIVE
FAIL_BLOCKED
```

## Forbidden Verdicts

```text
CERTIFIED
PROMOTED
DEPLOYED
PRODUCTION_READY
AUTONOMOUS_OPERATION_APPROVED
```
