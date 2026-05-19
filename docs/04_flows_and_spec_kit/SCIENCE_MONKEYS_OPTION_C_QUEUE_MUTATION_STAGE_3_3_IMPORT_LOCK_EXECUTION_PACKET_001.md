# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_IMPORT_LOCK_EXECUTION_PACKET_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the bounded Stage 3.3 import-lock execution packet.

This packet prepares exact import-lock evidence requirements for the four Science role GPTs.

This packet does not perform GPT Action import.

This packet does not modify GPT configurations.

This packet does not run live routes.

This packet does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Prior accepted authorization

Prior packet:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_IMPORT_LOCK_EXECUTION_AUTHORIZATION_001`

Prior verdict:

`PASS_WITH_WARNINGS`

Prior package SHA256:

`b0ab31b709782b1a6549189b0e994381617d8a90408b469aecdfaeaaa9c382b2`

Human accepted this authorization as planning only.

## Import-lock execution definition

For this stage, import-lock execution means preparing a complete operator-facing evidence checklist for a future Human-approved GPT Action import.

It may validate and package:

- accepted role-scoped schema SHA values
- accepted canonical GPT instruction/config SHA values
- operation counts
- route lists
- forbidden route absence checks
- forbidden instruction/config authority checks
- manual UI edit handling
- per-GPT import evidence checklists
- post-import evidence requirements

It does not itself import anything.

## Roles in scope

Only these role GPTs are in scope:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

No Code Monkey GPT is in scope.

No Human GPT authority is in scope.

No Science Executor GPT authority is in scope.

## Accepted schema SHA values

Expected role-scoped schema SHA values:

- Explorer:
  `6e00bbcabf2b9a517d8d5d019739fe60347423e1dd1feb1d730f8735f1e1ed8b`

- Hypothesizer:
  `ae6556d2b2792fb6a7ceb963da638bbbc9a4ce8e964d6e786c29e99220be504f`

- Designer:
  `af505087b67a6ac5e9b711b4405d0a4f73f5758b32fb352d17c4fefde4c2df58`

- Science Auditor:
  `04f5612ac78a0440a504e3929dafe11bbc278b496f3b8b0510cdd8247161f708`

## Accepted instruction/config SHA values

Expected canonical GPT instruction/config SHA values:

- Explorer:
  `330b922eeb1d1a8be8d08f8ea0116277ef910859e638d4d7e0c73340129cbe8f`

- Hypothesizer:
  `a4396f01934cf67d26b239363a5ff651ae4b5518db71dd3161534e7ff3063d25`

- Designer:
  `8eca7851392ae801d6ae5e23468472cbf08c5d1419c8cad6c3627c8cfe519c4f`

- Science Auditor:
  `e11cb20234834a3e4d901067a953761ce010459418598f8e5817db3743e83c03`

## Accepted operation counts

Expected operation counts:

- Explorer: 27
- Hypothesizer: 29
- Designer: 28
- Science Auditor: 28

All role-scoped schemas must remain at or below 30 operations.

If any role-scoped schema exceeds 30 operations, the future import-lock execution must fail blocked.

## Files to include in future import-lock evidence

A future import-lock execution evidence package must include copies of:

- `openapi/science_monkeys_actions_explorer.openapi.yaml`
- `openapi/science_monkeys_actions_hypothesizer.openapi.yaml`
- `openapi/science_monkeys_actions_designer.openapi.yaml`
- `openapi/science_monkeys_actions_science_auditor.openapi.yaml`
- canonical GPT instruction/config file for Explorer
- canonical GPT instruction/config file for Hypothesizer
- canonical GPT instruction/config file for Designer
- canonical GPT instruction/config file for Science Auditor

## Per-GPT checklist fields

A future Human-approved import-lock execution must record, per GPT:

- GPT display name
- expected backend role
- schema file path
- schema SHA256 before import
- schema operation count
- schema route list
- forbidden route absence proof
- canonical instruction/config file path
- canonical instruction/config SHA256 before import
- expected status labels
- manual UI edits, if any
- edited/imported schema SHA256, if any UI change occurs
- edited/imported instruction/config SHA256, if any UI change occurs
- operator name
- timestamp
- import status
- no-live-routes confirmation
- no-certification confirmation
- no-promotion confirmation
- no-deployment confirmation
- no-production-readiness confirmation
- no-autonomous-operation confirmation

## Forbidden schema routes

Every role-scoped Science GPT Action schema must exclude:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- Human decision routes
- Science Executor routes
- deployment routes
- certification routes
- promotion routes

If any forbidden route appears, import-lock execution must fail blocked.

## Forbidden instruction/config authority

Every role instruction/config must exclude:

- HUMAN authority grants
- SCIENCE_EXECUTOR_AI authority grants
- authorization to call `/v1/science/share`
- authorization to call `/v1/science/execute-experiment`
- Code Monkey route authority
- certification authority
- promotion authority
- deployment approval authority
- production-readiness claims
- autonomous Science operation authorization
- raw GPT output as evidence
- ContextBus notes/messages as evidence
- queue mutation records as scientific truth

If any forbidden authority appears, import-lock execution must fail blocked.

## Manual UI edit handling

If future GPT Action import or GPT instruction configuration requires any manual UI edit:

- record the exact edit
- record why the edit was required
- preserve original repo-candidate SHA
- compute imported/edited SHA after the edit
- include both before and after text if possible
- fail blocked if the edit changes route authority
- fail blocked if the edit grants Human authority
- fail blocked if the edit grants Science Executor authority
- fail blocked if the edit weakens evidence boundaries
- fail blocked if the edit authorizes live routes, deployment, certification, production readiness, or autonomous operation

## Future import-lock execution stop conditions

A future import-lock execution must stop if:

- any schema SHA differs from accepted candidate without explanation
- any instruction/config SHA differs from accepted candidate without explanation
- any schema exceeds 30 operations
- `/v1/science/share` appears in a role-scoped Science GPT schema
- `/v1/science/execute-experiment` appears in a role-scoped Science GPT schema
- Code Monkey route appears
- Human decision route appears
- Science Executor route appears
- any instruction/config grants Human authority
- any instruction/config grants Science Executor authority
- any instruction/config authorizes certification
- any instruction/config authorizes deployment
- any instruction/config claims production readiness
- any instruction/config authorizes autonomous Science operation
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- queue mutation records are treated as scientific truth
- live route testing would be required
- deployment would be required
- certification/promotion/autonomy claim appears

## Future import-lock execution package contents

A future Human-approved import-lock execution package must include:

- import-lock execution report
- per-GPT import checklists
- schema files
- schema SHA sidecars
- schema operation-count reports
- schema route-list reports
- forbidden route absence proof
- canonical instruction/config files
- instruction/config SHA sidecars
- imported/edited instruction/config text if changed
- imported/edited schema text if changed
- manual-edit notes
- operator/timestamp record
- no-live-routes confirmation
- no-GPT-live-smoke confirmation
- helper report
- sidecar-canonical zip SHA
- zip listing

## Current packet boundary

This packet does not:

- import GPT Actions
- modify GPT configurations
- run live routes
- approve deployment
- certify
- promote
- claim production readiness
- authorize autonomous Science operation

## Human decision options

After this packet is audited, Human may choose one:

1. Approve bounded Stage 3.3 import-lock execution.
2. Request revisions to this packet.
3. Require schema or instruction/config changes.
4. Require operation-budget remediation.
5. Hold Stage 3.3.

## Recommended next step

Recommended after audit, if no blockers:

Human may approve bounded import-lock execution.

That future execution would still not authorize live route smoke, certification, promotion, deployment approval, production-readiness claims, or autonomous Science operation.

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize live routes, or authorize autonomous Science operation.
