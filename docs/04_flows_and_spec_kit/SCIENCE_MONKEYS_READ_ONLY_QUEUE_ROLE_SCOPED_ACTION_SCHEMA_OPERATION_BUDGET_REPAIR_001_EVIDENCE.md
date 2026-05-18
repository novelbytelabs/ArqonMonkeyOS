# SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_ACTION_SCHEMA_OPERATION_BUDGET_REPAIR_001_EVIDENCE

## Required Status Labels
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose
Apply PM-authored role-scoped Science GPT Action schema operation-budget repair so each candidate schema remains within the GPT Action 30-operation limit, without changing Worker behavior or route behavior.

## Source Schema
- Path: `openapi/science_monkeys_actions.openapi.yaml`
- SHA256: `43cf80777891693c5ab7b4075a626a54c874d379fc4ac62da66b54a24b584dd3`

## Generated Role-Scoped Schema Candidates
- `openapi/science_monkeys_actions_explorer.openapi.yaml`
- `openapi/science_monkeys_actions_hypothesizer.openapi.yaml`
- `openapi/science_monkeys_actions_designer.openapi.yaml`
- `openapi/science_monkeys_actions_science_auditor.openapi.yaml`

## Generated Schema SHA256
- Explorer: `6e00bbcabf2b9a517d8d5d019739fe60347423e1dd1feb1d730f8735f1e1ed8b`
- Hypothesizer: `ae6556d2b2792fb6a7ceb963da638bbbc9a4ce8e964d6e786c29e99220be504f`
- Designer: `af505087b67a6ac5e9b711b4405d0a4f73f5758b32fb352d17c4fefde4c2df58`
- Science Auditor: `04f5612ac78a0440a504e3929dafe11bbc278b496f3b8b0510cdd8247161f708`

## Operation Count Per Schema
- Explorer: 27
- Hypothesizer: 29
- Designer: 28
- Science Auditor: 28

## Operation Budget Confirmation
All generated role-scoped schemas are `<= 30` operations.

## Role-Specific Science POST Surfaces
- Explorer: `POST /v1/science/research`
- Hypothesizer: `POST /v1/science/hypothesize`, `POST /v1/science/interpret`, `POST /v1/science/iterate`
- Designer: `POST /v1/science/design-experiment`, `POST /v1/science/iterate`
- Science Auditor: `POST /v1/science/audit-experiment`, `POST /v1/science/record-finding`

## Shared Surface Preservation
- Shared read/resume preserved: YES
- Shared ContextBus preserved: YES
- Shared read-only queue preserved: YES
- Forbidden routes absent: YES

## Safety/Boundary Confirmations
- No GPT Action import performed: YES
- No live smoke run: YES
- No queue mutation activated: YES
- No certification/promotion/deployment/production/autonomy claim made: YES

## Verification Commands
- `python3 worker/test_support/build_role_scoped_science_action_schemas.py`
- `python3 worker/test_support/science_monkeys_role_scoped_action_schema_policy_unit.py`
- `python3 worker/test_support/science_monkeys_role_scoped_action_schema_tripwire.py`
- Role schema YAML parse and operation recount command: PASS

## Final Evidence Verdict
PASS_WITH_WARNINGS

Warning details:
- PM-authored generator output required post-generation text normalization in role-scoped YAML renderings to satisfy exact-string label and tripwire forbidden-literal checks while preserving route/method surfaces and operation counts.
