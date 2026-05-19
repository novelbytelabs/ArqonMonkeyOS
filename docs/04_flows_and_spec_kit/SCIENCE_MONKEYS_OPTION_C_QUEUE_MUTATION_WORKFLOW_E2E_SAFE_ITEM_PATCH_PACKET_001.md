# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SAFE_ITEM_PATCH_PACKET_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Author the exact implementation patch packet needed to repair safe mutation-eligible Explorer queue item signaling for Option C workflow E2E.

This is packet authoring only.

This packet does not implement code changes.

This packet does not run live routes.

This packet does not mutate queue state.

This packet does not import GPT Actions.

This packet does not modify GPT configuration.

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Context

- Explorer GPT configuration passes `OPTION_C_QUEUE_WORKFLOW_SMOKE`.
- Explorer `whoami` returns `EXPLORER_AI`.
- Queue list returns 35 items.
- No safe mutation-eligible item is selected because visible items report:
  - `allowed_next_action = READ_ONLY_RECOMMENDATION_ONLY`

Read-only discovery established:

- Queue items are built in `worker/src/science_queue_read.ts`.
- `buildQueueItems(...)` hardcodes `allowed_next_action` to `READ_ONLY_RECOMMENDATION_ONLY`.
- Mutation routes exist in `worker/src/science_queue_mutation.ts`.
- Explorer role-scoped schema currently exposes read-only queue routes, not queue mutation routes.
- Mutation endpoints exist in broader OpenAPI surface.
- Explorer schema operation count is 27; adding five mutation routes requires operation budget rebalancing to stay <= 30.

## Blocker Findings

1. Read metadata currently advertises read-only recommendation only, even where backend mutation layer may permit bounded mutation.
2. Explorer role-scoped schema does not currently expose queue mutation operations needed for Explorer-only representative workflow mutation proof.
3. Operation budget must remain <= 30.

## Intended File Scope

Exact future implementation scope:

- `worker/src/science_queue_read.ts`
- `openapi/science_monkeys_actions_explorer.openapi.yaml`

No other files are in required scope for this packet objective unless later Human-approved remediation expands scope.

## PM Patch Plan

### A. `worker/src/science_queue_read.ts`

Add helper function near `roleFromGate(...)` or before `buildQueueItems(...)`:

```ts
function allowedNextActionForQueueItem(role: Role, state: string, currentRoleOwner: string, allowedNextRole: string): string {
  if (!["EXPLORER_AI", "HYPOTHESIZER_AI", "DESIGNER_AI", "SCIENCE_AUDITOR_AI"].includes(role)) {
    return "READ_ONLY_RECOMMENDATION_ONLY";
  }

  if (state === "READY") {
    if (currentRoleOwner === "UNKNOWN" || currentRoleOwner === role || allowedNextRole === role) {
      return "CLAIM_ELIGIBLE";
    }
    return "CLAIM_POLICY_CHECK_REQUIRED";
  }

  if (state === "CLAIMED") {
    return "CLAIMED_ITEM_REQUIRES_STATE_RECORD_CHECK";
  }

  if (state === "BLOCKED") {
    return "BLOCKED_ITEM_POLICY_CHECK_REQUIRED";
  }

  if (state === "QUARANTINED") {
    return "READ_ONLY_RECOMMENDATION_ONLY";
  }

  if (state === "COMPLETED_STEP") {
    return "READ_ONLY_RECOMMENDATION_ONLY";
  }

  return "READ_ONLY_RECOMMENDATION_ONLY";
}
```

Then replace:

```ts
allowed_next_action: "READ_ONLY_RECOMMENDATION_ONLY",
```

with:

```ts
allowed_next_action: allowedNextActionForQueueItem(role, state, nextRole, nextRole),
```

Boundary note:

- This helper changes read metadata only.
- It does not grant mutation authority.
- Mutation authority remains enforced by `worker/src/science_queue_mutation.ts`.

### B. `openapi/science_monkeys_actions_explorer.openapi.yaml`

Patch Explorer schema to add five mutation operations:

- `POST /v1/science/queue/{queue_item_id}/claim`
- `POST /v1/science/queue/{queue_item_id}/handoff`
- `POST /v1/science/queue/{queue_item_id}/block`
- `POST /v1/science/queue/{queue_item_id}/quarantine`
- `POST /v1/science/queue/{queue_item_id}/complete`

To stay <= 30 operations, remove four nonessential queue summary reads:

- `GET /v1/science/queue/next`
- `GET /v1/science/queue/blocked`
- `GET /v1/science/queue/quarantined`
- `GET /v1/science/queue/handoffs`

Expected operation count:

- `27 - 4 + 5 = 28`

Update schema metadata:

- version indicates Option C queue mutation E2E candidate
- `x-arqon_schema_id` indicates Explorer Option C queue mutation E2E candidate
- `x-arqon_operation_count` = `28`

Do not add:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- Human decision routes
- Science Executor routes

### C. OpenAPI Request Schema

Add bounded request schema for queue mutations if not already present in Explorer schema:

```yaml
QueueMutationRequest:
  type: object
  additionalProperties: false
  required:
    - project
    - idempotency_key
  properties:
    project:
      type: string
      enum:
        - ArqonZero
      default: ArqonZero
    idempotency_key:
      type: string
      description: Required idempotency key for safe replay detection.
    reason:
      type: string
      description: Claim reason for claim requests.
    handoff_reason:
      type: string
      description: Required for handoff requests.
    target_role:
      type: string
      enum:
        - HYPOTHESIZER_AI
        - DESIGNER_AI
        - SCIENCE_AUDITOR_AI
      description: Handoff target role. Explorer must not hand off to HUMAN or SCIENCE_EXECUTOR_AI.
    blocked_reason:
      type: string
      description: Required for block requests.
    quarantine_reason:
      type: string
      description: Required for quarantine requests if backend allows the role.
    completion_summary:
      type: string
      description: Required for complete requests.
    evidence_refs:
      type: array
      items:
        type: string
      description: Optional refs; queue mutation records are not evidence by themselves.
```

### D. Tests Required in Future Execution Packet

Future implementation execution must run at minimum:

- worker typecheck
- YAML parse for Explorer schema
- operation count check for Explorer schema <= 30
- forbidden route grep for Explorer schema
- queue read metadata offline/unit check showing at least one READY Explorer-visible item can report `CLAIM_ELIGIBLE` or `CLAIM_POLICY_CHECK_REQUIRED`
- mutation policy/unit tests if present
- no source-route behavior expansion outside Option C queue metadata/schema scope

### E. Expected Future Evidence

Future execution must report:

- changed files
- exact operation count
- Explorer schema SHA after patch
- whether forbidden routes remain absent
- whether worker typecheck passes
- whether YAML parse passes
- whether no artifacts/zips/sha/listings were committed
- no live routes
- no GPT Action import
- no GPT configuration change
- no certification/promotion/deployment/production/autonomy claim

## Artifact Policy

- `artifacts/` is local temporary auditability support only.
- `artifacts/` must not be git-tracked.
- `artifacts/` must not be committed.
- `*.zip`, `*.sha256`, `*_zip_listing.txt` must not be committed.
- `runtime/`, `tmp/`, and `temps/` must not be committed.

## Stop Conditions

Stop future implementation execution immediately if:

- forbidden route appears
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears
- Human decision route appears
- Science Executor route appears
- operation count exceeds 30
- schema SHA mismatch appears without explanation
- instruction/config SHA mismatch appears without explanation
- GPT Action import would be required but is not separately authorized
- GPT configuration change would be required but is not separately authorized
- live routes would be required but are not separately authorized
- certification/promotion/deployment/production/autonomy claim appears
- secrets would be printed

## Human Decision Options

After audit, Human may choose one:

1. Approve exact implementation patch packet execution for this scope.
2. Request packet revisions before implementation.
3. Require schema-only remediation first.
4. Require metadata-only remediation first.
5. Hold Option C queue mutation E2E remediation.

## Final Status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize GPT configuration changes, authorize live routes, or authorize autonomous Science operation.
