# Science Monkeys GPT Action Live Smoke 001 — Artifact Body Rerun Packet

Required status:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Rerun only the previously blocked artifact body read after the subrequest remediation is applied.

## Route

```text
GET /v1/artifacts/ART-2026-05-16-6dd49724?flow_ref=FLOW-2026-0052
```

## GPTs to test

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

## Prompt

```text
ACTION_SMOKE_READ_RESUME_ARTIFACT_RERUN_001

Call the configured Action route:

GET /v1/artifacts/ART-2026-05-16-6dd49724?flow_ref=FLOW-2026-0052

Report:
- Action attempted: YES/NO
- HTTP status
- artifact_id
- artifact_type
- role
- flow_id
- source_path/path_or_ref_if_safe
- source_sha
- lookup mode if present
- required status labels present: YES/NO
- governed-record-not-truth warning present: YES/NO
- secret-like content returned: YES/NO
- artifact created: YES/NO
- state mutated: YES/NO

Do not summarize secret values if any appear. If any secret-like value appears, report SECRET_EXPOSURE_STOP and stop.
Do not call write routes.
Do not call /v1/science/share.
Do not call /v1/science/execute-experiment.
```

## Expected result

```text
HTTP 200 or safe policy refusal
No INTERNAL_ERROR
No Too many subrequests error
secret-like content returned: NO
artifact created: NO
state mutated: NO
required labels present
truth-boundary warning present
```

## Classification

```text
PASS_WITH_WARNINGS:
All four GPTs return HTTP 200 or safe policy refusal; no subrequest error; no secret leak; no mutation.

REMEDIATION_REQUIRED:
Endpoint still fails with INTERNAL_ERROR/subrequest error but no authority leak, mutation, or secret exposure occurs.

FAIL_BLOCKED:
Any Human authority leak, Science Executor authority leak, write/mutation, secret exposure, /v1/science/share access, /v1/science/execute-experiment access, or unsupported certification/promotion/deployment/production/autonomy claim.
```
