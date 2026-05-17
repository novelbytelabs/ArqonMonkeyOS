# OPEN DECISIONS

Status labels:

- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Open design decisions

- Exact flow artifact schema
- Exact `/create-flow` payload and response shape
- Whether `/write-flow` is user-facing or mostly backend/manual primitive
- How ContextOS flow artifacts sync with real Spec Kit paths
- Whether `/checklists` belongs primarily to Auditor, PM, or both
- Exact Helper/Codex `/execute` handoff format
- How Helper reports to both Coder and Auditor evidence stream
- How `/adv-flow` validates gate requirements before advancing
- How to implement GitHub Contents API 409 retry behavior
- How to trigger or schedule context rebuild after broker writes
- Whether to keep `/sync-constitution` as context route or separate constitution payload
- Multi-user identity strategy:
  - temporary user labels
  - `/whoami`
  - OAuth
- Multi-repo swarm generator config format
- How to prevent old docs from overriding merged ground truth
- How to mark stale/superseded docs
- Exact approval gate taxonomy:
  - PLAN_READY
  - DEV_EVIDENCE_READY
  - INTEGRITY_GATE_PASSED
  - CLAIM_OR_PROMOTION_CANDIDATE
- Final repo name decision: RESOLVED -> `ArqonMonkeyOS`
- Whether current repo becomes umbrella repo or infrastructure-only repo
- Whether Science Monkeys and Code Monkeys initially live in the same repo
- Whether Auditor GPT is shared across Science and Code modes
- How `/share` creates PM context
- How Mike/Ash identity is represented before OAuth
- When to rename OpenAPI/server/docs/site references
- Cloudflare naming alignment plan and timing
- GPT Action naming/URL alignment plan and timing
- Source/package naming alignment plan and timing
- Whether `/share` writes a PM inbox message, an official artifact, or both
- First `science_flow` schema and artifact contract
- Science finding evidence levels and claim boundaries
- How to keep old ContextOS URLs/actions working during rename transition
- Whether generated context should switch to MonkeyOS/ContextBus terminology now or after Flow Core

## Resolved execution ordering

These items are no longer open for the current stage:

- Stage 1 read/resume closeout stays closed as bounded diagnostic pass evidence.
- Current work remains in Stage 2 Science command surface normalization.
- Stage 2A schema/import lock must complete before broader Science command smoke.
- Option C queue work does not begin before Stage 2A, 2B, and 2C are complete.
- `/v1/science/share` remains HUMAN-only and out of GPT Action scope for the current stage.
- `/v1/science/execute-experiment` remains non-GPT/local only.

## Documentation control decisions

These are the active documentation governance rules until superseded:

- `docs/00_active_state/ROADMAP.md` is the canonical execution order.
- `docs/00_active_state/OPEN_DECISIONS.md` is the canonical unresolved decision register.
- `docs/00_active_state/OPEN_DECISIONS.md` also serves as the compact saved-ideas register for non-trivial future work that should not get lost between packets.
- `docs/03_commands_and_runbooks/GPT_COMMANDS.md` and `docs/03_commands_and_runbooks/Arqon_ContextOS_Command_Runbook_Cheat_Sheet.md` are operational docs and must reflect currently validated behavior, not mixed historical planning state.
- Detailed plan packets in `docs/04_flows_and_spec_kit/` remain supporting records, not the primary source for current execution order.

## Saved idea register

These items are intentionally preserved even when they are not on the current critical path.

Use this section to keep smaller ideas visible without promoting them into the active execution spine too early.

### Strategic influences and future tracks

- MDASH comparison discipline and benchmark caution:
  [`docs/01_monkeyos_doctrine/MDASH_IMPACT_ON_MONKEYOS_001.md`](../01_monkeyos_doctrine/MDASH_IMPACT_ON_MONKEYOS_001.md)
- NanoResearch-inspired skill, memory, and preference model:
  [`docs/08_research_personalization/NANORESEARCH_INSPIRED_SKILL_MEMORY_PREFERENCE_ROADMAP.md`](../08_research_personalization/NANORESEARCH_INSPIRED_SKILL_MEMORY_PREFERENCE_ROADMAP.md)
- CyberGym benchmark track:
  [`docs/09_benchmarks/CYBERGYM_BENCHMARK_TRACK_001.md`](../09_benchmarks/CYBERGYM_BENCHMARK_TRACK_001.md)

### Core doctrine and origin intent

- MonkeyOS / ContextBus platform doctrine:
  [`docs/01_monkeyos_doctrine/MONKEYOS_CONTEXTBUS_DOCTRINE.md`](../01_monkeyos_doctrine/MONKEYOS_CONTEXTBUS_DOCTRINE.md)
- Orchestration doctrine:
  [`docs/01_monkeyos_doctrine/ORCHESTRATION_DOCTRINE_001.md`](../01_monkeyos_doctrine/ORCHESTRATION_DOCTRINE_001.md)
- Natural-flow user stories and original usage intent:
  [`docs/04_flows_and_spec_kit/Arqon_ContextOS_Natural_Flow_User_Stories.md`](../04_flows_and_spec_kit/Arqon_ContextOS_Natural_Flow_User_Stories.md)

### Science workflow future ideas

- Science operational bring-up and role constitutions:
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_OPERATIONAL_BRINGUP_001_PLAN.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_OPERATIONAL_BRINGUP_001_PLAN.md)
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_ROLE_CONSTITUTIONS_001.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_ROLE_CONSTITUTIONS_001.md)
- Full read/resume plus Option C architecture:
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_FULL_READ_RESUME_OPTION_C_ROUTE_ARCHITECTURE_PLAN_001.md)
- Diagnostic operational acceptance and runbook direction:
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_DIAGNOSTIC_OPERATIONAL_ACCEPTANCE_PLAN_001.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_DIAGNOSTIC_OPERATIONAL_ACCEPTANCE_PLAN_001.md)
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_DIAGNOSTIC_OPERATIONS_RUNBOOK_001.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_DIAGNOSTIC_OPERATIONS_RUNBOOK_001.md)

### Human governance and advancement ideas

- Human advancement gate and later hardening:
  [`docs/04_flows_and_spec_kit/HUMAN_ADVANCEMENT_GATE_001_PLAN.md`](../04_flows_and_spec_kit/HUMAN_ADVANCEMENT_GATE_001_PLAN.md)
  [`docs/04_flows_and_spec_kit/POST_HUMAN_ADVANCEMENT_BOUNDARY_HARDENING_001_PLAN.md`](../04_flows_and_spec_kit/POST_HUMAN_ADVANCEMENT_BOUNDARY_HARDENING_001_PLAN.md)
- Human-only share bridge and bounded promotion path:
  [`docs/04_flows_and_spec_kit/SCIENCE_MONKEYS_V01_SHARE_INTEGRATION_001.md`](../04_flows_and_spec_kit/SCIENCE_MONKEYS_V01_SHARE_INTEGRATION_001.md)

### Code Monkeys and Science-to-Code ideas

- Science-to-Code handoff boundary:
  [`docs/04_flows_and_spec_kit/SCIENCE_TO_CODE_HANDOFF_001.md`](../04_flows_and_spec_kit/SCIENCE_TO_CODE_HANDOFF_001.md)
- Code Monkeys PM/Coder progression:
  [`docs/04_flows_and_spec_kit/CODE_MONKEYS_PM_PLAN_001.md`](../04_flows_and_spec_kit/CODE_MONKEYS_PM_PLAN_001.md)
  [`docs/04_flows_and_spec_kit/CODE_MONKEYS_PM_TASKS_001.md`](../04_flows_and_spec_kit/CODE_MONKEYS_PM_TASKS_001.md)
  [`docs/04_flows_and_spec_kit/CODE_MONKEYS_CODER_TASKS_001.md`](../04_flows_and_spec_kit/CODE_MONKEYS_CODER_TASKS_001.md)
  [`docs/04_flows_and_spec_kit/CODE_MONKEYS_CODER_IMPLEMENTATION_BUNDLE_001.md`](../04_flows_and_spec_kit/CODE_MONKEYS_CODER_IMPLEMENTATION_BUNDLE_001.md)

### Infrastructure and platform evolution ideas

- Flow Core command family and generic flow model:
  [`docs/00_active_state/CURRENT_STATE.md`](CURRENT_STATE.md)
- Multi-user identity progression and OAuth transition:
  [`docs/ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md`](../ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md)
  [`docs/01_monkeyos_doctrine/GLOSSARY.md`](../01_monkeyos_doctrine/GLOSSARY.md)
- Multi-repo swarm generation:
  [`docs/ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md`](../ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md)
- Rename/doctrine migration and legacy compatibility:
  [`docs/01_monkeyos_doctrine/RENAME_READINESS_PLAN.md`](../01_monkeyos_doctrine/RENAME_READINESS_PLAN.md)
  [`docs/01_monkeyos_doctrine/LEGACY_REFERENCE_SWEEP_001.md`](../01_monkeyos_doctrine/LEGACY_REFERENCE_SWEEP_001.md)

## Idea retention rule

If an idea is important enough to mention in PM discussion, operator notes, or planning chat, it must land in one of these places before the thread is considered closed:

- promoted into `docs/00_active_state/ROADMAP.md` as active execution work
- listed here in `docs/00_active_state/OPEN_DECISIONS.md` as a saved idea or unresolved decision
- written as a dedicated packet in `docs/04_flows_and_spec_kit/`, `docs/01_monkeyos_doctrine/`, `docs/08_research_personalization/`, or `docs/09_benchmarks/`

Small ideas should default to a short bullet here with one linked source doc, rather than being left implicit in chat history.

## Conservative resolution rule

If a decision is unresolved, fail closed, preserve status labels, and require PM/Human review before implementation.

Related ground-truth references:

- [`docs/ground_truth/arqon_contextos_merged_ground_truth_docs/docs/06_FLOW_MODEL.md`](../ground_truth/arqon_contextos_merged_ground_truth_docs/docs/06_FLOW_MODEL.md)
- [`docs/ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md`](../ground_truth/arqon_contextos_merged_ground_truth_docs/docs/08_MULTI_USER_MULTI_REPO.md)
- [`docs/ground_truth/arqon_contextos_merged_ground_truth_docs/docs/09_SECURITY_AND_GOVERNANCE.md`](../ground_truth/arqon_contextos_merged_ground_truth_docs/docs/09_SECURITY_AND_GOVERNANCE.md)
