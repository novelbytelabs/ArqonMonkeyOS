# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SAFE_ITEM_PREPARATION_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Record the Explorer-only manual Option C workflow E2E attempt and prepare the remediation path for a safe mutation-eligible queue item.

This packet is documentation and read-only discovery only.

It does not create queue items.

It does not edit source code.

It does not run live routes.

It does not import GPT Actions.

It does not modify GPT configurations.

It does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Prior manual E2E attempt

Prior manual test:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_EXPLORER_ONLY_MANUAL_TEST_001`

Final manual-test verdict:

`REMEDIATION_REQUIRED`

Reason:

Safety boundaries held, but the Option C mutation workflow was not validated end-to-end because no safe mutation-eligible queue item was available to Explorer.

## Manual test results recorded

The manual Explorer GPT test established:

- Explorer boundary acknowledgement: `PASS`
- identity/whoami route: `PASS`
- backend role observed: `EXPLORER_AI`
- queue visibility/read behavior: `PASS_WITH_WARNINGS`
- forbidden route proof: `PASS`
- role authority proof: `PASS`
- truth boundary proof: `PASS_WITH_WARNINGS`
- GPT Action import: `NO`
- GPT configuration change: `NO`
- source edits: `NO`
- secrets exposed: `NO`
- forbidden certification/promotion/deployment/production/autonomy claims: `NO`

The manual test did not establish:

- claim proof
- handoff proof
- block proof
- quarantine proof
- complete proof
- mutation idempotency proof
- mutation state-transition proof

## Interpretation

This is a safe but incomplete E2E attempt.

The safety model held.

The workflow was not proven because Explorer did not receive or select a safe mutation-eligible queue item.

Therefore, the next requirement is safe test-item preparation.

## Safe item requirement

A safe Option C E2E queue item must be:

- development-diagnostic only
- non-production
- non-deployment
- non-certification
- non-promotion
- non-autonomy
- free of secrets
- safe to claim
- safe to handoff if needed
- safe to block or quarantine if needed
- safe to complete if needed
- visible to `EXPLORER_AI`
- eligible for bounded queue mutation
- explicitly labeled not evidence
- explicitly labeled not scientific truth

## Required safe item behavior

The safe item should support at least one complete representative path:

Preferred path:

1. queue read
2. queue by-flow
3. queue history
4. claim
5. idempotency replay
6. history after claim
7. complete

Optional additional path:

1. separate safe item
2. block or quarantine
3. history after block/quarantine

Optional handoff path:

1. claimed item
2. handoff to safe target role if allowed
3. history after handoff

## Safe item labels

The safe item should include or preserve labels equivalent to:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable
- not evidence
- not scientific truth

## Forbidden safe item properties

The safe item must not:

- require `/v1/science/share`
- require `/v1/science/execute-experiment`
- require Human authority
- require Science Executor authority
- require Code Monkey routes
- involve deployment
- involve certification
- involve promotion
- involve production readiness
- involve autonomous Science operation
- contain secrets
- trigger external side effects

## Read-only discovery required

Helper must perform read-only discovery to identify how queue items are currently sourced.

Helper may inspect but not edit:

- worker source files
- OpenAPI files
- docs
- test support files

Discovery should answer:

1. Where are queue items generated or sourced?
2. Are queue items static, repo-backed, runtime-backed, API-backed, or derived from flow artifacts?
3. What fields control `allowed_next_action` or mutation eligibility?
4. What fields control queue item state?
5. What fields control role visibility?
6. What fields control queue history?
7. Is there an existing test/demo item pattern?
8. Is there an existing safe way to create a development-diagnostic item without source edits?
9. If source edits are required later, which exact file(s) would likely need a PM-authored patch?
10. Can safe item preparation be done as documentation/data only, or does it require code/data changes?

## Read-only commands suggested

Helper may run read-only commands such as:

- `rg -n "allowed_next_action|READ_ONLY_RECOMMENDATION_ONLY|queue_item|flow_ref|Q-FLOW|demo-research-flow|science/queue" worker/src worker/test_support docs openapi || true`
- `rg -n "claim|complete|block|quarantine|handoff|idempotency|history" worker/src worker/test_support docs openapi || true`
- `git status --short --branch`
- `git diff --stat`

Helper must not edit files.

## Output required from discovery

Helper must include a section:

`Read-only queue-source discovery findings`

It must report:

- likely queue source file(s)
- likely mutation eligibility field(s)
- likely safe item creation path
- whether future work needs source/data edit
- exact files PM AI likely needs to author in a future patch if edits are required
- whether no-code safe item setup appears possible

If a finding is uncertain, mark it `UNKNOWN`, not guessed.

## Recommended next macro-slice after this packet

If discovery shows a no-code safe item setup is possible:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SAFE_ITEM_SETUP_001`

If discovery shows a source/data patch is required:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_WORKFLOW_E2E_SAFE_ITEM_PATCH_PACKET_001`

That future packet must be PM-authored exact patch content only. Helper must not write implementation logic.

## Boundaries

This packet does not authorize:

- live routes
- GPT Action import
- GPT configuration changes
- source edits
- queue mutation
- certification
- promotion
- deployment approval
- production-readiness claims
- autonomous Science operation

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Read-only queue-source discovery findings

Derived from read-only command output only.

- likely queue source file(s):
  - `worker/src/science_queue_read.ts`
  - supporting route mounts in `worker/src/index.ts`
  - mutation behavior references queue source in `worker/src/science_queue_mutation.ts`

- queue item generation/sourcing model:
  - queue items are derived from repo-backed flow index/manifests in `governance/flows/` via `buildQueueItems(...)` in `worker/src/science_queue_read.ts`.
  - queue item id format is generated as `Q-${flow_id}`.
  - items are filtered by role visibility in `visibilityFilter(...)`.

- likely mutation eligibility field(s):
  - `current_state`
  - `current_role_owner`
  - `allowed_next_role`
  - mutation route transition checks in `TRANSITIONS` map (`worker/src/science_queue_mutation.ts`).

- likely queue state field(s):
  - queue read side: `current_state` derived from flow status/gate (`readState(...)`).
  - mutation side persistent state: `governance/queues/mutations/state/<queue_item>.json` with `current_state`, `claimed_by`, `handoff_target_role`.

- likely role visibility field(s):
  - `visibilityFilter(...)` uses role + `current_state` + `current_role_owner` + `allowed_next_role`.

- likely queue history source:
  - queue history route maps from `flow_manifest.history` (read-only transform in `handleScienceQueueReadRequest(..., "history", ...)`).

- existing test/demo item pattern:
  - `worker/test_support/science_monkeys_read_only_queue_offline_smoke.ts` uses seeded IDs like `Q-FLOW-2026-0001` and flow ref `science-read-only-smoke` in offline harness context.

- existing safe way to create development-diagnostic item without source edits:
  - UNKNOWN from static read-only repository inspection alone.
  - observed behavior indicates queue depends on repo flow data/state presence; no dedicated no-code runtime seeding command was identified in this discovery pass.

- whether future work needs source/data edit:
  - likely data and/or context setup change required to ensure a mutation-eligible safe queue item appears to Explorer.
  - exact minimal mechanism (data-only vs code patch) is UNKNOWN from static read-only inspection alone.

- exact files PM AI likely needs to author in a future patch if edits are required:
  - data/context paths likely involved: `governance/flows/flow_index.json` and `governance/flows/<flow_id>/flow_manifest.json` (if policy allows data seeding).
  - behavior files likely involved if code patch is required: `worker/src/science_queue_read.ts`, `worker/src/science_queue_mutation.ts`.

- whether no-code safe item setup appears possible:
  - UNKNOWN.
