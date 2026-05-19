# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_IMPORT_LOCK_EXECUTION_AUTHORIZATION_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Define the bounded authorization plan for Stage 3.3 import-lock execution.

This packet is authorization/planning only.

It does not perform GPT Action import.

It does not modify GPT configurations.

It does not run live routes.

It does not certify, promote, approve deployment, claim production readiness, or authorize autonomous Science operation.

## Prior accepted packet

Prior packet:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_SCHEMA_AND_GPT_INSTRUCTION_IMPORT_LOCK_PACKET_001`

Prior packet verdict:

`PASS_WITH_WARNINGS`

Prior packet package SHA256:

`bda743c84b73fed2c9f96f42e611f12f042b0da53590c78a36628d22f9b96dc1`

Prior packet established:

- role-scoped schema files are included
- canonical GPT instruction/config candidates are included
- schema SHA values are recorded
- instruction/config SHA values are recorded
- operation counts are all less than or equal to 30
- forbidden schema routes are absent
- forbidden instruction/config authority phrases are absent
- no GPT Action import occurred
- no live routes were run

## Stage 3.3 import-lock execution meaning

Import-lock execution means preparing and recording the exact operator-facing evidence required for a future Human-approved GPT Action import.

Import-lock execution may include:

- validating schema SHA values
- validating instruction/config SHA values
- validating operation counts
- validating forbidden route absence
- validating forbidden authority absence
- creating per-GPT import checklists
- creating operator instructions for manual GPT UI import
- recording expected post-import evidence fields

Import-lock execution does not itself authorize actual import unless Human separately approves import execution.

## Roles in scope

The only roles in scope are:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

No Code Monkey GPT is in scope.

No Human GPT authority is in scope.

No Science Executor GPT authority is in scope.

## Candidate schema SHAs

Expected role-scoped schema SHA values:

- Explorer:
  `6e00bbcabf2b9a517d8d5d019739fe60347423e1dd1feb1d730f8735f1e1ed8b`
- Hypothesizer:
  `ae6556d2b2792fb6a7ceb963da638bbbc9a4ce8e964d6e786c29e99220be504f`
- Designer:
  `af505087b67a6ac5e9b711b4405d0a4f73f5758b32fb352d17c4fefde4c2df58`
- Science Auditor:
  `04f5612ac78a0440a504e3929dafe11bbc278b496f3b8b0510cdd8247161f708`

## Candidate instruction/config SHAs

Expected canonical GPT instruction/config SHA values:

- Explorer:
  `330b922eeb1d1a8be8d08f8ea0116277ef910859e638d4d7e0c73340129cbe8f`
- Hypothesizer:
  `a4396f01934cf67d26b239363a5ff651ae4b5518db71dd3161534e7ff3063d25`
- Designer:
  `8eca7851392ae801d6ae5e23468472cbf08c5d1419c8cad6c3627c8cfe519c4f`
- Science Auditor:
  `e11cb20234834a3e4d901067a953761ce010459418598f8e5817db3743e83c03`

## Operation-count boundary

Expected operation counts:

- Explorer: 27
- Hypothesizer: 29
- Designer: 28
- Science Auditor: 28

Every schema must remain at or below the GPT Action 30-operation limit.

If any schema exceeds 30 operations, future import execution must fail blocked.

## Forbidden schema surface

The following must remain absent from every Science GPT role-scoped Action schema:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Code Monkey routes
- Human decision routes
- Science Executor routes
- deployment routes
- certification routes
- promotion routes

## Forbidden instruction/config authority

No GPT instruction/config may:

- grant HUMAN authority
- grant SCIENCE_EXECUTOR_AI authority
- authorize `/v1/science/share`
- authorize `/v1/science/execute-experiment`
- authorize Code Monkey routes
- authorize certification
- authorize promotion
- authorize deployment approval
- claim production readiness
- authorize autonomous Science operation
- treat raw GPT output as evidence
- treat ContextBus notes/messages as evidence
- treat queue mutation records as scientific truth

## Future import execution evidence requirements

A future Human-approved import execution packet must record, per GPT:

- GPT name
- expected backend role
- schema path
- schema SHA256 before import
- schema operation count
- schema route list
- forbidden schema route absence proof
- canonical instruction/config path
- instruction/config SHA256 before import
- exact operator who imported or configured the GPT
- timestamp
- manual UI edits if any
- edited/imported schema SHA if UI changes occur
- edited/imported instruction/config SHA if UI changes occur
- screenshots or export evidence if available
- import status
- no-live-routes confirmation
- no-certification confirmation
- no-deployment confirmation
- no-production-readiness confirmation
- no-autonomous-operation confirmation

## Manual UI edit handling

If the GPT UI forces manual edits, field trimming, schema splitting, text shortening, or formatting changes:

- record the exact edit
- recompute SHA256 after the edit
- preserve both the repo-candidate SHA and imported/edited SHA
- explain why the change was required
- fail blocked if the edit changes route authority, role authority, evidence boundaries, or forbidden surface

## Import execution stop conditions

Future import execution must stop if:

- any schema SHA differs from the accepted candidate and the difference is not explained
- any instruction/config SHA differs from the accepted candidate and the difference is not explained
- any schema exceeds 30 operations
- any forbidden route appears in a role-scoped Science GPT schema
- `/v1/science/share` appears
- `/v1/science/execute-experiment` appears
- Code Monkey route appears
- Human decision route appears
- Science Executor route appears
- any GPT instruction grants Human authority
- any GPT instruction grants Science Executor authority
- any GPT instruction authorizes certification
- any GPT instruction approves deployment
- any GPT instruction claims production readiness
- any GPT instruction authorizes autonomous Science operation
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- queue mutation records are treated as scientific truth
- live route testing would be required
- deployment would be required

## Future import execution package contents

A future Human-approved import execution package must include:

- import execution report
- per-GPT import checklist
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

This authorization packet does not:

- import GPT Actions
- modify GPTs
- run live routes
- approve deployment
- certify
- promote
- claim production readiness
- authorize autonomous Science operation

## Human decision options

After this authorization packet is audited, Human may choose one:

1. Approve bounded Stage 3.3 import-lock execution.
2. Request revisions to this authorization packet.
3. Require schema/instruction changes before import execution.
4. Require operation-budget remediation.
5. Hold Stage 3.3.

## Recommended next step

Recommended after audit, if no blockers:

Human may approve bounded import-lock execution only.

That future approval would still not authorize live route smoke, deployment, certification, promotion, production-readiness claims, or autonomous Science operation.

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize live routes, or authorize autonomous Science operation.
