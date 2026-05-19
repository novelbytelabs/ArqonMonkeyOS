# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_TARGETED_QUEUE_LOOKUP_REPAIR_001

## Required Status Labels
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Slice Name
- SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_TARGETED_QUEUE_LOOKUP_REPAIR_001

## Previous Typecheck Failure
- `src/science_queue_mutation.ts(275,46): error TS2552: Cannot find name 'buildQueueItems'. Did you mean 'buildQueueItemByRef'?`

## Type-Reference Repair
- Imported `QueueItem` type from `science_queue_read`.
- Updated `resolveQueueState` return type to `item: QueueItem`.
- Behavior unchanged by this narrow repair.

## Observed Live Failure
- `GET /v1/science/queue/history/Q-FLOW-2026-0054?project=ArqonZero` returned Cloudflare 1101 Worker threw exception.

## Root Cause
- Single-item read/mutation routes still materialized full queue through `buildQueueItems(...)`.

## Repair Summary
- Added targeted `buildQueueItemByRef(...)`.
- Direct `Q-FLOW-*` to `FLOW-*` resolution.
- Direct `FLOW-*` lookup.
- Friendly `flow_ref` fallback via `flow_index` only.
- `item` / `history` / `by_flow` now use targeted lookup.
- Mutation resolve path now uses targeted lookup.

## Changed Files
- `worker/src/science_queue_read.ts`
- `worker/src/science_queue_mutation.ts`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_TARGETED_QUEUE_LOOKUP_REPAIR_001.md`

## Typecheck Result
- PASS (`npm run typecheck` in `worker/`)

## Execution Constraint Confirmations
- No live routes were run.
- No queue mutation was performed.
- No GPT Action import was performed.
- No GPT configuration change was performed.
- No certification/promotion/deployment/production/autonomy claim was made.

## Final Verdict
- PASS_WITH_WARNINGS
