# Operational Workspace Policy 001

Status:

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable

## Purpose

Define the workspace contract for ArqonMonkeyOS so disposable scratch paths do not become critical operational dependencies.

## Directory Contract

### `artifacts/`

Retained deliverables.

Use for audit bundles, helper reports, manifests, replay packages, evidence logs, and any other output that must survive past the current stage.

`artifacts/` is source-of-truth-adjacent durable output and may be committed when the repo workflow requires it.

### `runtime/`

Active execution workspace.

Use for bundle apply directories, generated smoke JavaScript, run transcripts required by validation, and local execution inputs/outputs needed during a run.

`runtime/` is not source of truth and should not be committed.

### `temps/`

Stage-local ephemeral workspace.

Use only for temporary stage files that are disposable after the stage completes.

`temps/` is not source of truth and should not be committed.

### `tmp/`

Scratch only.

`tmp/` is never required by prompts, scripts, CI, validation, audit evidence, or replay packages.

If a file is needed beyond the current stage, copy it into `artifacts/` or another durable evidence path.

## Evidence Rule

Audit evidence may not rely only on local workspace paths.

Bad:

- see `tmp/live_transcript.json`

Good:

- audit bundle includes `evidence/live_transcript.json`
- evidence report records the file SHA256

## Helper Rule

If an expected PM bundle is missing from `runtime/`, Helper must stop and report.

Helper may not infer or manually implement a missing PM bundle.

## Required Status Labels

REQUIRES_HUMAN_REVIEW  
development diagnostic only  
NOT SEALED-TEST CERTIFIED  
not promotable
