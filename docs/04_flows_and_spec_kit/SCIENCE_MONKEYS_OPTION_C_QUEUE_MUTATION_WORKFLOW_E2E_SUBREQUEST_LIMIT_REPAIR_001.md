# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SUBREQUEST_LIMIT_REPAIR_001

## Required Status Labels
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Slice
- SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SUBREQUEST_LIMIT_REPAIR_001

## Previous Typecheck Failure and Type-Normalization Repair
- Previous failure:
  - `src/science_queue_mutation.ts(239,9): error TS2719`
  - Type mismatch between mutation-local `MutationStateRecord.current_state: QueueState` and read-side `readQueueMutationState(...).current_state: string`
- Repair applied:
  - Added `asQueueState(...)` normalization helper.
  - Added `normalizeExistingMutationState(...)` to coerce read-side state into local `QueueState` union safely.
  - Updated state initialization in mutation resolve path to use normalized mutation state when present.

## Observed Live Failure
- History read failure: `GET /v1/science/queue/history/Q-FLOW-2026-0054` returned Cloudflare 1101.
- Idempotency replay failure: `POST /v1/science/queue/Q-FLOW-2026-0054/claim` replay returned `SCIENCE_QUEUE_MUTATION_INTERNAL_ERROR: Too many subrequests by single Worker invocation`.

## Root Cause
- `buildQueueItems(...)` read mutation state for every queue item, creating extra GitHub fetches per visible item and exceeding Cloudflare subrequest limits.

## Repair Summary
- `buildQueueItems(...)` no longer reads mutation state per item.
- Item/history routes overlay mutation state only for the matched item.
- Mutation resolve path uses direct single-item state read.
- Mutation state `current_state` is normalized to the local `QueueState` union.

## Changed Files
- `worker/src/science_queue_read.ts`
- `worker/src/science_queue_mutation.ts`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SUBREQUEST_LIMIT_REPAIR_001.md`

## Typecheck Result
- PASS (`npm run typecheck` in `worker/`)

## Execution Constraints Confirmation
- No live routes were run.
- No queue mutation was performed.
- No GPT Action import was performed.
- No GPT configuration change was performed.
- No certification/promotion/deployment/production-readiness/autonomy claim was made.

## Pre-existing Workspace Dirt Note
- `openapi/science_monkeys_actions_explorer.openapi.yaml` was pre-existing modified workspace state before this repair sequence.

## Final Verdict
- PASS_WITH_WARNINGS
