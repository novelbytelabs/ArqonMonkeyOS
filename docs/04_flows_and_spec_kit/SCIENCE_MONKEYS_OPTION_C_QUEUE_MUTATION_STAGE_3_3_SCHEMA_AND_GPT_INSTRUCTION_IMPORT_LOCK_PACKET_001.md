# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_SCHEMA_AND_GPT_INSTRUCTION_IMPORT_LOCK_PACKET_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Author the Stage 3.3 schema and GPT instruction/config import-lock packet for the Stage 3 Option C queue mutation surface.

This packet is authoring/planning evidence only.

It includes role-scoped GPT Action schema evidence requirements, canonical GPT instruction/config text requirements, SHA256 and operation-count requirements, forbidden route and authority checks, and future import-lock audit requirements.

This packet does not import GPT Actions, modify GPTs, run live routes, deploy, certify, promote, claim production readiness, or authorize autonomous Science operation.

## Prior accepted planning slice

Prior slice:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_SCHEMA_AND_GPT_INSTRUCTION_IMPORT_LOCK_PLANNING_001`

Prior verdict:

`PASS_WITH_WARNINGS`

Human accepted that planning slice as planning only and approved authoring this packet only.

## Roles in scope

This packet covers only these Science role GPTs:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

No Code Monkey GPT is in scope. No Human authority is in scope. No Science Executor authority is in scope.

## Schema files in scope

The role-scoped schema files are:

- `openapi/science_monkeys_actions_explorer.openapi.yaml`
- `openapi/science_monkeys_actions_hypothesizer.openapi.yaml`
- `openapi/science_monkeys_actions_designer.openapi.yaml`
- `openapi/science_monkeys_actions_science_auditor.openapi.yaml`

The packet evidence must include copies of these exact schema files from the current repo baseline.

The packet evidence must compute and record:

- SHA256 for each role-scoped schema
- operation count for each role-scoped schema
- route list for each role-scoped schema
- forbidden route absence proof for each role-scoped schema

Each role-scoped schema must remain at or below 30 operations.

## Canonical GPT instruction/config files in scope

The packet must include canonical instruction/config text files for each Science role:

- `canonical_gpt_instructions/arqon_zero_explorer_ai.md`
- `canonical_gpt_instructions/arqon_zero_hypothesizer_ai.md`
- `canonical_gpt_instructions/arqon_zero_designer_ai.md`
- `canonical_gpt_instructions/arqon_zero_science_auditor_ai.md`

The packet evidence must compute and record SHA256 for each canonical instruction/config file.

These instruction/config files are candidates only. They are not imported into GPTs by this packet.

## Required status labels

Every schema/instruction/import-lock artifact must preserve:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Allowed schema surface

Role-scoped Science GPT Action schemas may include only approved role-scoped routes such as:

- safe identity/status reads
- safe ContextBus reads
- read-only queue routes
- bounded Stage 3.2 queue mutation routes:
  - `/v1/science/queue/{queue_item_id}/claim`
  - `/v1/science/queue/{queue_item_id}/complete`
  - `/v1/science/queue/{queue_item_id}/block`
  - `/v1/science/queue/{queue_item_id}/quarantine`
  - `/v1/science/queue/{queue_item_id}/handoff`

Each role schema must remain role-scoped.

## Forbidden schema surface

The following must be absent from every Science GPT role-scoped Action schema:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Human decision routes
- Science Executor routes
- Code Monkey routes
- deployment routes
- certification routes
- promotion routes

If any forbidden route appears in a role-scoped Science GPT Action schema, import-lock must fail blocked.

## Forbidden instruction/config authority

No Science GPT instruction/config may:

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

## Queue mutation instruction boundary

Every role instruction/config must state:

- queue mutation records are governance coordination records
- queue mutation records are not scientific truth
- queue mutation records are not evidence by themselves
- raw GPT output is not evidence
- ContextBus notes/messages are non-official diagnostic transport only
- no harness = no truth
- queue mutation does not approve advancement
- queue mutation does not certify results
- queue mutation does not authorize deployment
- queue mutation does not authorize autonomous Science operation

## Future import-lock packet requirements

A future execution/import-lock packet must record, per GPT:

- GPT name
- expected backend role
- schema file path
- schema SHA256
- schema operation count
- schema route list
- forbidden route absence proof
- canonical instruction/config file path
- instruction/config SHA256
- manual UI edits if any
- edited schema/config SHA if UI changes occur
- operator name
- timestamp
- no-live-smoke boundary
- no-certification boundary
- no-deployment boundary
- no-production-readiness boundary
- no-autonomous-operation boundary

## Future import execution boundary

This packet does not authorize actual GPT Action import.

If Human later approves import execution, that future packet must use the schema and instruction/config SHA values recorded here as candidate inputs, record any manual UI edits, recompute SHA values after any edit, fail closed if forbidden routes or forbidden authority appear, and preserve the no-live-smoke-before-import-lock boundary.

## Required audit package contents

The retained packet package must include:

- this packet document
- actual role-scoped schema file copies
- schema SHA sidecars or SHA list
- schema operation-count report
- schema route-list report
- forbidden route absence proof
- canonical GPT instruction/config files
- instruction/config SHA list
- verification summary
- helper report
- sidecar-canonical zip SHA
- zip listing

## Human decision options

After this packet is audited, Human may choose one:

1. Approve a bounded Stage 3.3 import-lock execution packet.
2. Request revisions to this packet.
3. Require operation-budget remediation.
4. Require instruction/config text changes.
5. Hold Stage 3.3.

## Recommended next step

Recommended after audit, if no blockers:

Authorize a bounded import-lock execution packet only.

That future packet would still not authorize live route smoke, deployment, certification, promotion, production-readiness claims, or autonomous Science operation.

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize live routes, or authorize autonomous Science operation.
