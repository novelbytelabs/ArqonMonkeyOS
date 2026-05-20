# Roadmap

Status:
REQUIRES_HUMAN_REVIEW
development diagnostic only
NOT SEALED-TEST CERTIFIED
not promotable

Control doctrine:

- No evidence = no claim.
- No audit = no promotion.
- No human approval = no advancement.
- No harness = no truth.

## Doc freshness

- Last reconciled: `2026-05-19`
- Reconciled against recent repo evidence, including commits:
  - `c482cd7` Stage 3.6 role-path observation packet
  - `fe4d6bf` Stage 3.6 tripwire preflight record
  - `43b0138` bounded Stage 3.5 closeout
  - `874d2ef` queue read hardening
  - `0b11255` idempotency replay before visibility checks
  - `99d2e18` handoff visibility repair
- Reconciled against later-stage closeout packet evidence:
  - `docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_COMMAND_SURFACE_CLOSEOUT_001.md`
- This roadmap is authoritative for operator-facing execution state only after reconciliation against in-repo artifacts.
- Historical planning language must not be treated as current execution state without matching evidence.

## Baseline

ContextBus (legacy name: ContextOS) v0.2 is operational for:

- context sync
- constitution sync
- notes
- role messages/inbox/archive copy

## Current execution state

The long-range delivery sequence remains:

1. Stage 1: Read / resume surface
2. Stage 2A: Science command schema/import/doc normalization
3. Stage 2B: Science ContextBus command smoke
4. Stage 2C: Science command surface closeout
5. Stage 3: Option C queue core
6. Stage 4: Human decision ledger
7. Stage 4.5: Code Monkeys Spec-Kit Fidelity Alignment
8. Stage 5: Unified Science + Code model
9. Stage 6: Production hardening

The repo is not in a single clean linear stage. It is currently operating in two distinct tracks:

- Core platform critical path:
  - Stage 2A completed as bounded schema/import/doc normalization evidence.
  - Stage 2B completed as `PASS_WITH_WARNINGS` role-smoke evidence.
  - Stage 2C closeout packet exists and consolidates Stages 1, 2A, and 2B.
  - Later Stage 3 planning docs treat Stage 2 as closed `PASS_WITH_WARNINGS`.
- Bounded Option C queue workflow track:
  - Stage 3 queue-route implementation and repair work has already occurred in code and docs.
  - Stage 3.5 bounded closeout artifacts exist in-repo and are scoped to the bounded Option C queue workflow objective only.
  - Stage 3.6 role-path observation and live evidence capture artifacts exist in-repo and are not closeout.
  - Stage 3.6B semantic-split planning now exists as a bounded planning checkpoint for queue action semantics.

Authoritative current-state summary:

- Stage 1 is completed as bounded diagnostic `PASS_WITH_WARNINGS` evidence.
- Stage 2A completed as bounded diagnostic `PASS_WITH_WARNINGS` evidence.
- Stage 2B completed as bounded diagnostic `PASS_WITH_WARNINGS` evidence.
- Stage 2C closed as `PASS_WITH_WARNINGS`.
- Stage 3.5 is closed only for the bounded Option C queue workflow objective by Human decision.
- Stage 3.6 produced observation/evidence packets and divergence analysis; it is not closed.
- Stage 3.6B is in planning/package state only; no semantic-split implementation is complete.
- Deployed Worker commit/build proof remains UNKNOWN in the bounded Stage 3.5 and Stage 3.6 evidence chain.

## Current control point

The current command surface for Science GPTs is governed by the ContextBus command schema import-lock workflow.

- Active Science GPT Action schema version: `0.3.1-contextbus-archive-action-cache-binding`
- Current archive route shape: `POST /v1/messages/{message_id}/archive`
- `/v1/science/share` remains out of GPT scope here
- `/v1/science/execute-experiment` remains non-GPT/local only

MonkeyOS doctrine reset and docs hierarchy migration are still underway, but they are not the active implementation milestone.

Queue-path control note:

- The Stage 3.6 evidence chain established that `allowed_next_action` is currently viewer-scoped in observed queue responses.
- Stage 3.6B planning exists because the current field appears to mix objective item state with viewer-specific permission semantics.
- Until an audited additive semantic split is implemented, `allowed_next_action` should be treated as legacy viewer-scoped output.

## Next implementation milestone

The next core-platform milestone is bounded Stage 3.6B semantic-split planning and then the next authorized implementation slice after that planning/audit chain is complete.

Stage goals:

- Preserve the Stage 2 closure state consistently across active-state docs.
- Keep Stage 3.6B scoped to queue action semantic split planning until a later implementation packet is explicitly authorized.
- Preserve the boundary that bounded queue-workflow artifacts do not imply certification, promotion, deployment approval, or production readiness.

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
   - Stage 3.6B allowed-next-action semantic split: add objective `item_next_action` and viewer-scoped `viewer_allowed_action` / `viewer_can_mutate` fields before relying on role-path queue action semantics for closeout.
2. Human decision ledger.
3. Code Monkeys Spec-Kit Fidelity Alignment.
4. Unified Science and Code workflow model.
5. 409 retry hardening for GitHub Contents write conflicts.
6. Context rebuild automation after broker writes.
7. Multi-user identity progression (temporary labels to OAuth).
8. Multi-repo swarm replication support.

## Bounded completed milestones

- Stage 3.5 bounded Option C queue workflow closeout exists by Human decision only.
  - Boundary: not certification, not promotion, not deployment proof, not sealed-test certification.
- Stage 2A schema/import/doc normalization evidence exists.
- Stage 2B Science ContextBus command role-smoke evidence exists.
- Stage 2C Science command surface closed as `PASS_WITH_WARNINGS`.
- Stage 3.6 role-path observation packet exists.
- Stage 3.6 role-path live evidence capture exists.
- Stage 3.6 allowed-next-action divergence analysis exists.
- These bounded later-stage artifacts do not by themselves imply broader certification, promotion, or production readiness.

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

Historical note:

- Earlier single-track roadmap language is preserved for traceability, but it no longer accurately describes the repo's full current state without the bounded queue-workflow exceptions documented above.

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

## Active Integrity Guardrails

- [DECEPTION_TRIPWIRE_HARNESS_AND_GUARDRAILS_001](DECEPTION_TRIPWIRE_HARNESS_AND_GUARDRAILS_001.md)
- [PM_INPUT_TRIPWIRE_HARNESS_001](PM_INPUT_TRIPWIRE_HARNESS_001.md)

## Roadmap update gate

- Do not advance the roadmap state from planning to execution without linked in-repo artifacts.
- Do not mark any stage closed without matching Human decision evidence.
- Do not let tripwire output alone decide roadmap truth; tripwire findings are clues that require manual review.
- Reconcile this roadmap against `CURRENT_STATE.md` and active bounded flow/spec-kit artifacts whenever a new stage packet is added.
