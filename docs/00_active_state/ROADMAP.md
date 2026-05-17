# Roadmap

Status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

## Baseline

ContextBus (legacy name: ContextOS) v0.2 is operational for:

- context sync
- constitution sync
- notes
- role messages/inbox/archive copy

## Current phase

The active delivery sequence is:

1. Stage 1: Read / resume surface
2. Stage 2A: Science command schema/import/doc normalization
3. Stage 2B: Science ContextBus command smoke
4. Stage 2C: Science command surface closeout
5. Stage 3: Option C queue core
6. Stage 4: Human decision ledger
7. Stage 4.5: Code Monkeys Spec-Kit Fidelity Alignment
8. Stage 5: Unified Science + Code model
9. Stage 6: Production hardening

Current execution is in Stage 2A.

- Stage 1 is completed as bounded diagnostic `PASS_WITH_WARNINGS` evidence.
- Stage 2A is the current active work.
- Stage 2B starts only after Stage 2A audit.
- Stage 2C follows Stage 2B smoke and closes the Science command surface.
- Option C queue work remains blocked until Stage 2A/2B/2C are complete and Human-closed.

## Current control point

The current command surface for Science GPTs is governed by the ContextBus command schema import-lock workflow.

- Active Science GPT Action schema version: `0.3.1-contextbus-archive-action-cache-binding`
- Current archive route shape: `POST /v1/messages/{message_id}/archive`
- `/v1/science/share` remains out of GPT scope here
- `/v1/science/execute-experiment` remains non-GPT/local only

MonkeyOS doctrine reset and docs hierarchy migration are still underway, but they are not the active implementation milestone.

## Next implementation milestone

The next milestone on the critical path is Stage 2B: Science ContextBus command smoke after Stage 2A schema/import/doc normalization is fully locked and audited.

Stage goals:

- Stage 2A goal: lock all Science GPTs to reconciled schema SHA `c73bc8c331a5dda7bdb71ce22b272afa386c4eabf3cbb22ba31ddcf9cf2bc297`, align docs, and audit.
- Stage 2B goal: role-by-role smoke for `/sync-context`, `/sync-constitution`, `/save-context`, `/send-message`, `/inbox`, `/open-message`, and `/archive-message`.
- Stage 2C goal: normalize evidence, audit, and Human-close Stage 2.

Flow Core remains a foundational workstream, but it is not the next operator-facing gating step.

Required Flow Core command family:

- `/create-flow`
- `/load-flow`
- `/flow-status`
- `/adv-flow`
- `/write-flow`

Flow Core must support generic flow families:

- `science_flow`
- `code_flow`
- `audit_flow`
- `governance_flow`

## After current Stage 2 closeout

1. Option C queue core planning and implementation.
2. Human decision ledger.
3. Code Monkeys Spec-Kit Fidelity Alignment.
4. Unified Science and Code workflow model.
5. 409 retry hardening for GitHub Contents write conflicts.
6. Context rebuild automation after broker writes.
7. Multi-user identity progression (temporary labels to OAuth).
8. Multi-repo swarm replication support.

## Stage 4.5 checkpoint

Stage 4.5 is a required high-priority checkpoint after Stage 4 and before Stage 5.

Goal:

- Make Code Monkeys closely mimic GitHub Spec-Kit process, scripts, templates, slash commands, and operator flow before unifying Science and Code.

Known gaps:

- Missing `/constitution` command
- Missing `/dossier` command
- Code Monkeys process does not yet resemble Spec-Kit closely enough
- Need stronger alignment with Spec-Kit templates, flow order, artifacts, and command semantics

Boundary:

- This is not production hardening.
- This is not certification.
- This is a required architecture and process alignment checkpoint before Stage 5 Unified Science + Code model.

## Historical planning context

The earlier Routes 001 and Share Integration planning remains useful as historical context, but it is not the current execution spine:

1. Role/Auth Foundation 001
2. Role/Auth Foundation Audit 001
3. ArqonMonkeyOS Orchestration Doctrine 001
4. Science Monkeys v0.1 Routes 001
5. Routes Audit 001
6. Science Monkeys v0.1 Share Integration 001
7. Share Audit 001

Routes 001 must implement the Science command layer without implementing `/v1/science/share`.

Routes 001 must carry forward:

- broker-key uniqueness warning
- expanded PM_AI denial coverage
- raw redacted HTTP transcript format
- no placeholders/shims/stubs/simulations
- tripwire checks
- guardrail/policy checks
- adversarial tests
- regression tests

## NanoResearch-Inspired Post-Share Roadmap

NanoResearch-style tri-level co-evolution is added as a post-share roadmap item, not a Routes 001 expansion.

Future layer:

1. ContextBus Memory Model 001
2. Skill Registry 001
3. Preference Profile 001
4. Governed Research Personalization 001

Routes 001 must only preserve enough structured artifacts for future extraction.

Required status remains:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Science Monkeys v0.1 Share Integration 001

Share Integration 001 implements `/v1/science/share` as the Human-only bridge from audited Science Monkeys findings into PM-visible context.

Required properties:

- authenticated Human authority before processing
- server-derived Human authority, not body-derived identity
- official `share_packet` writing
- source artifact references
- share packet hash
- idempotency key
- PM-visible message
- generated PM context update
- recoverable outbox state
- generic Flow Core `share_packet` path remains blocked
- no Skill/Memory/Preference runtime expansion

Required status remains:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable
