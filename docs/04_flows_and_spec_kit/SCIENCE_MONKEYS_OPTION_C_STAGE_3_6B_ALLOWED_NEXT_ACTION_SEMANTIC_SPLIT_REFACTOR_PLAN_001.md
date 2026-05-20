---
status: REQUIRES_HUMAN_REVIEW
classification: development diagnostic only
sealed_test_status: NOT SEALED-TEST CERTIFIED
promotion_status: not promotable
artifact_id: SCIENCE_MONKEYS_OPTION_C_STAGE_3_6B_ALLOWED_NEXT_ACTION_SEMANTIC_SPLIT_REFACTOR_PLAN_001
---

# Option C Stage 3.6B Allowed-Next-Action Semantic Split Refactor Plan

Required status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

Record the Human architectural decision and the later bounded refactor plan for queue action semantics.

This is a planning artifact only.

It does not implement code.

It does not authorize live route calls.

It does not authorize queue mutation.

It does not decide safety, eligibility, PASS/FAIL, closeout, certification, promotion, deployment, production readiness, or sealed-test status.

## Human decision being recorded

`allowed_next_action` must not mix two different meanings.

The queue item needs one objective action/state field.

The viewer role needs separate permission/action fields.

## Current issue

Current queue read behavior derives `allowed_next_action` from both:

1. queue item state, such as `READY`, `BLOCKED`, `COMPLETED_STEP`; and
2. the role viewing the queue response, such as `HUMAN`, `EXPLORER_AI`, `HYPOTHESIZER_AI`, `DESIGNER_AI`, or `SCIENCE_AUDITOR_AI`.

That makes the same queue item appear to have different `allowed_next_action` values depending on who reads it.

That is not clean enough for later governance, audit, or closeout work.

## Source basis pulled from repo

Pulled from `main` for this planning pass:

- `docs/00_active_state/ROADMAP.md`
  - observed blob SHA from GitHub contents response: `62049992007f5a77581c2b7e6e016c75b022b2bb`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_STAGE_3_6_ROLE_PATH_EXPANSION_PLAN_001.md`
  - observed blob SHA from GitHub contents response: `d63e7e62c268be1667715baf091198140783dc77`
- `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPTION_C_STAGE_3_6_ROLE_PATH_OBSERVATION_PACKET_001.md`
  - observed blob SHA from GitHub contents response: `55ccbf2647626e470a11fad2822e142345735941`
- `worker/src/science_queue_read.ts`
  - observed blob SHA from GitHub contents response: `6caf27b21ae1c76026010a25ee736928c5834d34`

Relevant current source behavior:

- `allowedNextActionForQueueItem(role, state, currentRoleOwner, allowedNextRole)` receives `role`.
- Non-mutating roles return `READ_ONLY_RECOMMENDATION_ONLY` before state-specific checks.
- Mutating roles can receive state-specific values such as `CLAIM_ELIGIBLE` or `BLOCKED_ITEM_POLICY_CHECK_REQUIRED`.
- `overlayMutationStateForItem(...)` recomputes `allowed_next_action` using the viewer role.
- `buildQueueItems(...)` also initializes `allowed_next_action` using the viewer role.

## Target semantic split

Later queue responses should expose separate concepts.

Example target shape:

```json
{
  "current_state": "BLOCKED",
  "item_next_action": "BLOCKED_ITEM_POLICY_CHECK_REQUIRED",
  "viewer_role": "HUMAN",
  "viewer_allowed_action": "READ_ONLY_RECOMMENDATION_ONLY",
  "viewer_can_mutate": false,
  "allowed_next_action": "READ_ONLY_RECOMMENDATION_ONLY"
}
```

Compatibility rule:

- Keep `allowed_next_action` during the transition.
- Treat `allowed_next_action` as legacy viewer-scoped output until it is renamed or deprecated.
- Add new fields first; do not remove the old field in the first implementation slice.

## Field definitions

### `item_next_action`

Objective queue-item next action.

It must be derived from queue item state and queue item routing metadata, not from the role viewing the response.

Examples:

| Queue item state | Proposed `item_next_action` |
|---|---|
| `READY` | `CLAIM_REQUIRED` |
| `CLAIMED` | `CLAIMED_ITEM_REQUIRES_STATE_RECORD_CHECK` |
| `BLOCKED` | `BLOCKED_ITEM_POLICY_CHECK_REQUIRED` |
| `QUARANTINED` | `READ_ONLY_RECOMMENDATION_ONLY` |
| `COMPLETED_STEP` | `READ_ONLY_RECOMMENDATION_ONLY` |
| `WAITING_FOR_HUMAN` | `HUMAN_DECISION_REQUIRED` |
| `WAITING_FOR_EXECUTOR` | `EXECUTOR_ACTION_REQUIRED` |
| `UNKNOWN` | `READ_ONLY_RECOMMENDATION_ONLY` |

Note:

`CLAIM_REQUIRED` is intentionally more objective than `CLAIM_ELIGIBLE`, because eligibility depends on the viewer role.

### `viewer_role`

The authenticated backend role that is viewing the queue response.

### `viewer_allowed_action`

The action this viewer may consider next, based on immutable role policy plus the item objective action.

Examples:

| Viewer | Item state | `item_next_action` | `viewer_allowed_action` |
|---|---|---|---|
| `HUMAN` | `BLOCKED` | `BLOCKED_ITEM_POLICY_CHECK_REQUIRED` | `READ_ONLY_RECOMMENDATION_ONLY` |
| `EXPLORER_AI` | `BLOCKED` | `BLOCKED_ITEM_POLICY_CHECK_REQUIRED` | `BLOCKED_ITEM_POLICY_CHECK_REQUIRED` |
| `HUMAN` | `READY` | `CLAIM_REQUIRED` | `READ_ONLY_RECOMMENDATION_ONLY` |
| `EXPLORER_AI` with matching owner/next role | `READY` | `CLAIM_REQUIRED` | `CLAIM_ELIGIBLE` |
| `EXPLORER_AI` without matching owner/next role | `READY` | `CLAIM_REQUIRED` | `CLAIM_POLICY_CHECK_REQUIRED` |

### `viewer_can_mutate`

Boolean summary of whether the viewer role is in the queue-mutating role set for this route family.

This must come from fixed role policy, not from queue item state alone.

Expected values:

| Role | Proposed `viewer_can_mutate` |
|---|---|
| `EXPLORER_AI` | `true` |
| `HYPOTHESIZER_AI` | `true` |
| `DESIGNER_AI` | `true` |
| `SCIENCE_AUDITOR_AI` | `true` |
| `HUMAN` | `false` for this route family unless an explicitly separate Human-only decision route is used |
| `SCIENCE_EXECUTOR_AI` | `false` unless a later execution-specific route policy explicitly allows it |
| unknown/other roles | `false` |

## Proposed internal function split

Current function to split later:

```ts
allowedNextActionForQueueItem(role, state, currentRoleOwner, allowedNextRole)
```

Proposed later function set:

```ts
itemNextActionForQueueItem(state, currentRoleOwner, allowedNextRole)
viewerCanMutateQueue(role)
viewerAllowedActionForQueueItem(role, itemNextAction, state, currentRoleOwner, allowedNextRole)
```

Expected rule:

```text
itemNextActionForQueueItem(...) must not receive viewer role.
viewerAllowedActionForQueueItem(...) may receive viewer role.
```

## Implementation phases

### Stage 3.6B — semantic decision record

Create this planning artifact and update the roadmap.

No source-code implementation.

No route execution.

No mutation.

### Stage 3.6C — additive compatibility implementation

Add new response fields without removing `allowed_next_action`.

Minimum fields:

```json
{
  "item_next_action": "BLOCKED_ITEM_POLICY_CHECK_REQUIRED",
  "viewer_role": "HUMAN",
  "viewer_allowed_action": "READ_ONLY_RECOMMENDATION_ONLY",
  "viewer_can_mutate": false,
  "allowed_next_action": "READ_ONLY_RECOMMENDATION_ONLY"
}
```

Compatibility rule:

```text
allowed_next_action remains legacy viewer-scoped output.
```

### Stage 3.6D — tests and docs alignment

Add or update tests proving:

- the same queue item has the same `item_next_action` across roles;
- HUMAN and non-HUMAN roles may have different `viewer_allowed_action`;
- the old `allowed_next_action` remains unchanged during the compatibility window;
- truth-boundary fields remain present;
- no mutation route behavior is changed by the read response refactor.

Update docs and Auditor expectations to check both fields separately.

### Stage 3.6E — deprecation decision

Only after compatibility evidence and audit:

- decide whether to keep `allowed_next_action` indefinitely as a legacy alias;
- or rename it to `legacy_viewer_scoped_allowed_next_action`;
- or remove it in a later breaking-change version.

Do not remove it in Stage 3.6C.

## Example applications

### Example 1: HUMAN reads blocked queue item

The item itself says:

```text
item_next_action = BLOCKED_ITEM_POLICY_CHECK_REQUIRED
```

The viewer policy says:

```text
viewer_allowed_action = READ_ONLY_RECOMMENDATION_ONLY
viewer_can_mutate = false
```

Meaning:

The item objectively needs a blocked-item policy check, but HUMAN is not being told to mutate this queue item through the Science queue mutation route.

### Example 2: Explorer reads the same blocked queue item

The item itself still says:

```text
item_next_action = BLOCKED_ITEM_POLICY_CHECK_REQUIRED
```

The viewer policy says:

```text
viewer_allowed_action = BLOCKED_ITEM_POLICY_CHECK_REQUIRED
viewer_can_mutate = true
```

Meaning:

The item objective state did not change. Only the viewer's allowed route posture changed.

### Example 3: Auditor reads a ready item owned by Explorer

The item itself says:

```text
item_next_action = CLAIM_REQUIRED
```

The viewer policy may say:

```text
viewer_allowed_action = CLAIM_POLICY_CHECK_REQUIRED
```

Meaning:

The item can be claimable in principle, but this viewer is not automatically eligible to claim it.

## Non-goals

This plan does not:

- certify Stage 3.6;
- close Stage 3.6;
- authorize production deployment;
- decide safety or eligibility;
- prove deployed Worker commit/build provenance;
- treat queue records as scientific evidence or scientific truth;
- authorize mutation route expansion;
- remove the existing `allowed_next_action` field immediately;
- rewrite the whole queue system.

## Acceptance criteria for later implementation

A later implementation packet should be accepted only if it provides raw evidence that:

1. `item_next_action` is stable across roles for the same queue item and same captured runtime window.
2. `viewer_allowed_action` may differ by role.
3. `viewer_can_mutate` is role-policy-derived.
4. Existing `allowed_next_action` remains present during the compatibility period.
5. Existing clients are not broken by the additive change.
6. All read responses preserve required status labels and truth-boundary fields.
7. No mutation route behavior changed unless separately authorized.
8. Tests cover HUMAN and at least one non-HUMAN Science role.
9. Auditor expectations distinguish item objective state from viewer permission.
10. Stage 3.6 closeout remains blocked until separately audited and Human-decided.

## Current status

PLANNED_FOR_LATER_COMPATIBILITY_REFACTOR
