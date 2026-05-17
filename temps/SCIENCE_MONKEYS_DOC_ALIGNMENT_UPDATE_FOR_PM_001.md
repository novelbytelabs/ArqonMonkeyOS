# SCIENCE_MONKEYS_DOC_ALIGNMENT_UPDATE_FOR_PM_001

Status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Bring the active planning spine and operator-facing command docs back into alignment with the currently validated Science GPT Action schema and execution stage.

## Updated documents

- `docs/00_active_state/ROADMAP.md`
- `docs/00_active_state/OPEN_DECISIONS.md`
- `docs/03_commands_and_runbooks/GPT_COMMANDS.md`
- `docs/03_commands_and_runbooks/Arqon_ContextOS_Command_Runbook_Cheat_Sheet.md`

## Alignment summary

The docs now reflect:

- current execution is in `Stage 2A`
- `Stage 1` read/resume closeout is treated as completed bounded diagnostic evidence
- `Stage 2B` broader Science command smoke is next, after schema/import normalization
- `Option C` remains blocked until Stage `2A` / `2B` / `2C` are complete
- current Science GPT Action schema version is `0.3.1-contextbus-archive-action-cache-binding`
- archive binding uses `POST /v1/messages/{message_id}/archive`
- `/v1/science/share` remains out of GPT scope
- `/v1/science/execute-experiment` remains non-GPT/local only

## Why this was necessary

The repo had drift between:

- planning docs that still centered older milestone framing
- operator docs that still described `v0.2` as the effective current state
- the actual validated Science GPT Action schema and import-lock evidence

That mismatch risked:

- incorrect operator setup
- premature movement toward `Option C`
- stale archive-route instructions
- confusion about what is current versus planned

## Documentation governance now stated explicitly

- `docs/00_active_state/ROADMAP.md` is the canonical execution-order document
- `docs/00_active_state/OPEN_DECISIONS.md` is the canonical unresolved decision register
- `docs/03_commands_and_runbooks/GPT_COMMANDS.md` and the runbook cheat sheet are operational docs and must reflect current validated behavior
- detailed plan packets in `docs/04_flows_and_spec_kit/` remain supporting records, not the primary current-state spine

## Recommended next step

Use the updated docs as the working reference before any broader Science command smoke or new planning branch.

Suggested next action:

- PM/Human review of the aligned documentation set
- then proceed with the next approved Stage `2B` command-smoke step only if still consistent with current import-lock evidence
