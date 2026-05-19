# SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_SCHEMA_AND_GPT_INSTRUCTION_IMPORT_LOCK_PLANNING_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Plan Stage 3.3 schema and GPT instruction/config import-lock for the Stage 3 Option C queue mutation surface.

This packet is planning only.

It covers both:

1. Role-scoped GPT Action OpenAPI schemas.
2. Role-scoped GPT instructions/configuration text.

This packet does not import GPT Actions, modify GPTs, run live routes, deploy, certify, promote, claim production readiness, or authorize autonomous Science operation.

## Why schema alone is insufficient

A role GPT is governed by both:

- the GPT Action schema, which controls available routes and operation shapes
- the GPT instruction/config text, which controls role identity, allowed commands, forbidden commands, evidence boundaries, refusal rules, and status language

Therefore Stage 3.3 must lock both schema and instructions/config before any import or live smoke.

## Stage position

Prior stage:

- `SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_2_CLOSEOUT_001`
- verdict: `PASS_WITH_WARNINGS`

Stage 3.3 current objective:

- plan schema/import-lock and GPT instruction/config-lock only

Stage 3.3 does not authorize:

- actual GPT Action import
- GPT configuration changes
- live route smoke
- deployment
- certification
- promotion
- production-readiness claims
- autonomous Science operation

## Roles in scope

Stage 3.3 covers these Science role GPTs:

- Arqon Zero Explorer AI
- Arqon Zero Hypothesizer AI
- Arqon Zero Designer AI
- Arqon Zero Science Auditor AI

No Code Monkey GPT is in scope.

No Human GPT authority is in scope.

No Science Executor GPT authority is in scope.

## Schema candidates in scope

Candidate role-scoped schema files:

- `openapi/science_monkeys_actions_explorer.openapi.yaml`
- `openapi/science_monkeys_actions_hypothesizer.openapi.yaml`
- `openapi/science_monkeys_actions_designer.openapi.yaml`
- `openapi/science_monkeys_actions_science_auditor.openapi.yaml`

Stage 3.3 planning must compute or later require:

- SHA256 for each role-scoped schema
- operation count for each role-scoped schema
- route list for each role-scoped schema
- forbidden route absence proof for each role-scoped schema
- confirmation that each schema remains at or below the GPT Action 30-operation limit, or a remediation plan if not

## GPT instruction/config candidates in scope

Stage 3.3 must also define the import-lock requirements for each GPT instruction/config.

Instruction/config lock must include, per role:

- role identity
- allowed actions/commands
- forbidden actions/commands
- evidence boundaries
- status labels
- refusal rules
- no-certification language
- no-deployment language
- no-production-readiness language
- no-autonomous-operation language
- queue mutation boundaries
- ContextBus notes/messages boundary
- raw GPT output boundary
- Human authority boundary
- Science Executor authority boundary

A future import-lock packet must compute a SHA256 or equivalent stable digest for each role’s instruction/config text.

## Required status labels

Every schema/instruction/import-lock artifact must preserve:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Allowed future schema surface

A future import-lock packet may include only the routes approved for each role, including:

- safe identity/status reads
- safe ContextBus reads
- read-only queue routes
- bounded Stage 3.2 queue mutation routes if included in that role’s schema:
  - `/v1/science/queue/{queue_item_id}/claim`
  - `/v1/science/queue/{queue_item_id}/complete`
  - `/v1/science/queue/{queue_item_id}/block`
  - `/v1/science/queue/{queue_item_id}/quarantine`
  - `/v1/science/queue/{queue_item_id}/handoff`

Each role schema must remain role-scoped.

Each role schema must stay under the 30-operation limit or be split/remediated before import.

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

If any forbidden route appears in a role-scoped Science GPT Action schema, the import-lock must fail blocked.

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

## Per-role instruction/config requirements

### Explorer

Explorer instructions must allow only Explorer-scoped Science behavior and approved queue operations.

Explorer must not:

- perform Human decisions
- perform Science Executor actions
- call `/v1/science/share`
- call `/v1/science/execute-experiment`
- claim certification/deployment/production readiness
- treat queue mutations as evidence

### Hypothesizer

Hypothesizer instructions must allow only Hypothesizer-scoped Science behavior and approved queue operations.

Hypothesizer must not:

- perform Human decisions
- perform Science Executor actions
- call `/v1/science/share`
- call `/v1/science/execute-experiment`
- claim certification/deployment/production readiness
- treat queue mutations as evidence

### Designer

Designer instructions must allow only Designer-scoped Science behavior and approved queue operations.

Designer must not:

- perform Human decisions
- perform Science Executor actions
- call `/v1/science/share`
- call `/v1/science/execute-experiment`
- claim certification/deployment/production readiness
- treat queue mutations as evidence

### Science Auditor

Science Auditor instructions must allow only audit/verification-scoped Science behavior and approved queue operations.

Science Auditor must not:

- perform Human decisions
- perform Science Executor actions
- call `/v1/science/share`
- call `/v1/science/execute-experiment`
- certify production readiness
- approve deployment
- create missing evidence
- modify files
- treat queue mutations as evidence by themselves

## Required future import-lock evidence

A future Stage 3.3 import-lock execution packet must record, per GPT:

- GPT name
- expected backend role
- schema file path
- schema SHA256
- schema operation count
- schema route list
- forbidden route absence proof
- instruction/config text or exported configuration
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

## Required future forbidden checks

A future import-lock packet must check every role schema and instruction/config for absence of:

- `/v1/science/share`
- `/v1/science/execute-experiment`
- Human authority
- Science Executor authority
- Code Monkey route exposure
- certification claims
- deployment approval
- production-readiness claims
- autonomous Science operation claims
- raw GPT output as evidence
- ContextBus notes/messages as evidence
- queue mutation records as scientific truth

## Required future operation-count checks

A future import-lock packet must compute operation counts for:

- Explorer schema
- Hypothesizer schema
- Designer schema
- Science Auditor schema

If any schema exceeds 30 operations, the future packet must stop and require operation-budget remediation before import.

## Required future SHA strategy

A future import-lock packet must use stable SHA256 digests for:

- each role schema
- each role instruction/config file or canonical text export
- edited/imported schema if the GPT UI requires manual field-length edits
- edited/imported instructions if the GPT UI requires manual edits

Any manual edit must be explicitly recorded.

If imported schema/config SHA differs from repo-candidate SHA, the difference must be recorded and audited.

## Required future audit zip contents

A future Stage 3.3 import-lock audit zip must include:

- `AUDIT_MANIFEST.json`
- `AUDIT_MANIFEST.sha256`
- schema files
- schema SHA sidecars
- schema operation-count reports
- schema route-list reports
- forbidden route absence proof
- GPT instruction/config canonical text files
- GPT instruction/config SHA sidecars
- manual-edit notes if any
- import evidence checklist
- helper report
- zip listing
- sidecar-canonical zip SHA

## Required future stop conditions

A future Stage 3.3 import-lock packet must stop if:

- any role schema exceeds 30 operations
- any forbidden route appears in a Science GPT schema
- `/v1/science/share` appears in a Science GPT schema
- `/v1/science/execute-experiment` appears in a Science GPT schema
- Human decision route appears
- Science Executor route appears
- Code Monkey route appears
- any GPT instruction grants Human authority
- any GPT instruction grants Science Executor authority
- any GPT instruction claims certification
- any GPT instruction approves deployment
- any GPT instruction claims production readiness
- any GPT instruction authorizes autonomous Science operation
- raw GPT output is treated as evidence
- ContextBus notes/messages are treated as evidence
- queue mutation records are treated as scientific truth
- live route call would be required
- deployment would be required
- certification/promotion/autonomy claim appears

## Human decision options

After this planning packet is audited, Human may choose one:

1. Approve authoring a Stage 3.3 schema and GPT instruction/config import-lock packet.
2. Request revisions to this planning packet.
3. Require operation-budget remediation before import-lock packet authoring.
4. Require instruction/config canonicalization before import-lock packet authoring.
5. Hold Stage 3.3.

## Recommended next step

Recommended after audit, if no blockers:

Authorize authoring:

`SCIENCE_MONKEYS_OPTION_C_QUEUE_MUTATION_STAGE_3_3_SCHEMA_AND_GPT_INSTRUCTION_IMPORT_LOCK_PACKET_001`

That future packet would still not authorize actual GPT Action import unless Human separately approves import execution.

## Final status

Recommended packet status:

`PASS_WITH_WARNINGS`

Required labels remain:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

This packet does not certify, promote, approve deployment, claim production readiness, authorize GPT Action import, authorize live routes, or authorize autonomous Science operation.
