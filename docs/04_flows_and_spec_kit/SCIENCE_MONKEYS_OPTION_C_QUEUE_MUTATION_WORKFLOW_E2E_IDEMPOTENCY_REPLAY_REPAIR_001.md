# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_IDEMPOTENCY_REPLAY_REPAIR_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Slice

- `SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_IDEMPOTENCY_REPLAY_REPAIR_001`

## Pre-existing Workspace State (Out of Scope)

- `openapi/science_monkeys_actions_explorer.openapi.yaml` was already modified before this slice started.
- That file is outside this slice scope.
- It was left untouched by this slice.
- It was not staged by this slice.
- It was not committed by this slice.

## Observed Failure

- Cloudflare 1101 on idempotency replay for claim route.

## Root Cause

1. Idempotency replay check occurred after transition authority validation, so replay could fail on state transition before replay record resolution.
2. Thrown `Response` errors could escape and surface as runtime internal errors.
3. Queue read/history did not overlay mutation state from `governance/queues/mutations/state/<queue_item_id>.json`, so read views could remain stale after mutation.

## Applied Repair

Changed files in-scope:
- `worker/src/science_queue_mutation.ts`
- `worker/src/science_queue_read.ts`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_IDEMPOTENCY_REPLAY_REPAIR_001.md`

Repair details:
- Reordered idempotency replay check to run before authority transition validation.
- Wrapped mutation handler with checked wrapper that catches thrown `Response` and maps unknown exceptions to bounded 500 mutation error response.
- Added read-side mutation-state overlay support from `governance/queues/mutations/state/...` into queue item state/owner/next-role view.

## Gates

- `git diff` reviewed for in-scope files: PASS
- `npm run typecheck` in `worker/`: PASS

## Boundary Confirmations

- no live routes: CONFIRMED
- no queue mutation execution: CONFIRMED
- no GPT Action import: CONFIRMED
- no GPT configuration change: CONFIRMED
- no certification/promotion/deployment/production/autonomy claim: CONFIRMED

## Final Verdict

`PASS_WITH_WARNINGS`

Reason:
- Patch applied cleanly.
- Typecheck passed.
- Scope remained bounded to allowed files.
- No forbidden runtime actions were performed.
