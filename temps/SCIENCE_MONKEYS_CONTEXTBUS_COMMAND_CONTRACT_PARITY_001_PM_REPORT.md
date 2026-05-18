# SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001 — PM Report

Status labels:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

Timestamp (UTC): 2026-05-18T01:25:19Z

## Scope completed
Implemented the pre-Stage-2B contract-parity remediation slice for shared ContextBus command smoke, focused on:
- `POST /v1/notes`
- `POST /v1/messages`
- schema parity
- runbook/operator packet alignment
- parity-focused policy/tripwire/offline smoke coverage

## Root problem addressed
Stage 2B command smoke failures were caused by schema/backend/request-shape drift, not only GPT prompt behavior.

Confirmed backend contract:
- `/v1/notes` requires `project`, `title`, `body`, `tags`, `visibility`, with `visibility=team`
- `/v1/messages` requires `project`, `to`, `subject`, `body`

## Implementation summary
1. OpenAPI action schema aligned to backend contract:
- `ContextNoteRequest` now requires `project,title,body,tags,visibility`
- `visibility` constrained to `team`
- `ContextMessageRequest` now requires `project,to,subject,body`
- removed `to_role` from Stage 2B action surface

2. Canonical governance docs updated:
- Stage 2B broad multi-role smoke explicitly blocked until contract parity closes and schema is re-imported
- Added dedicated packet: `SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001`
- Updated runbook and GPT commands to enforce exact note/message request shapes

3. Testability defect fixed:
- `notes.ts` and `messages.ts` now honor injected repo store for POST writes via `handleWorkerFetch(..., { flowRepoStore })`, enabling reliable offline smoke verification.

## Verification evidence
Executed and passed:
- `python3 worker/test_support/science_monkeys_contextbus_command_contract_parity_policy_unit.py`
- `python3 worker/test_support/science_monkeys_contextbus_command_contract_parity_tripwire.py`
- `python3 worker/test_support/science_monkeys_schema_version_lock_policy_unit.py`
- `python3 worker/test_support/compile_smoke_runtime.py`
- `node runtime/flow-core-smoke-dist/test_support/science_monkeys_contextbus_command_contract_parity_offline_smoke.js`

Offline smoke assertions passed:
- notes fail without `tags`
- notes fail without `visibility`
- notes fail with invalid `visibility`
- notes succeed with `tags` + `visibility=team`
- messages fail without `to`
- messages succeed with `to`

## Explorer live smoke evidence status (from operator transcript)
Observed PASS blocks for:
- startup boundary check
- `/sync-context`
- `/sync-constitution`
- `/save-context`
- `/send-message`
- `/inbox`
- `/open-message`
- `/archive-message`

## Candidate schema hash
- File: `openapi/science_monkeys_actions.openapi.yaml`
- SHA256: `6deda9e76e39a677cd5ea956f8b1449dffc634cf3325ae8f3b9c6b2cfc9d890d`

## Remaining operator actions (not done in this slice)
1. Commit current repo changes.
2. Compute post-commit schema SHA256 (must match imported file exactly).
3. Re-import that exact schema into Science GPT Actions.
4. Record schema SHA + commit SHA + GPT import timestamp in smoke evidence.
5. Continue role-by-role Stage 2B after Explorer parity confirmation.

## Files included in this packet
- docs/00_active_state/OPEN_DECISIONS.md
- docs/00_active_state/ROADMAP.md
- docs/03_commands_and_runbooks/Arqon_ContextOS_Command_Runbook_Cheat_Sheet.md
- docs/03_commands_and_runbooks/GPT_COMMANDS.md
- docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_ACTION_SCHEMA_INTEGRATION_001.md
- docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_EXPLORER_SMOKE_PACKET_001.md
- docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001.md
- openapi/science_monkeys_actions.openapi.yaml
- worker/src/index.ts
- worker/src/messages.ts
- worker/src/notes.ts
- worker/test_support/science_monkeys_contextbus_command_contract_parity_offline_smoke.ts
- worker/test_support/science_monkeys_contextbus_command_contract_parity_policy_unit.py
- worker/test_support/science_monkeys_contextbus_command_contract_parity_tripwire.py
- temps/SCIENCE_MONKEYS_CONTEXTBUS_COMMAND_CONTRACT_PARITY_001_PM_REPORT.md
