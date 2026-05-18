# TEMPS / ARTIFACTS Policy Remediation 001 Report

Required status:
- REQUIRES_HUMAN_REVIEW
- development diagnostic only
- NOT SEALED-TEST CERTIFIED
- not promotable

## Purpose

Record the workspace-policy remediation that removed durable reliance on `temps/`, aligned retained outputs with `artifacts/`, and limited current retained material to the active stage.

## Policy

Workspace roles are now:

- `artifacts/`: retained outputs that must survive the current stage
- `runtime/`: active workflow outputs that another step may read during the same run
- `tmp/`: disposable scratch
- `temps/`: stage-local temporary files only; disposable after use

Operational rule:

- if a file must live beyond the current stage, it does not belong in `temps/`
- docs, scripts, and validation must not depend on durable files living in `temps/`

Canonical policy file:

- `docs/01_monkeyos_doctrine/OPERATIONAL_WORKSPACE_POLICY_001.md`

## Implemented Changes

The remediation applied these categories of changes:

- updated evidence/spec docs that referenced retained files in `temps/` so they now point to `artifacts/`
- updated remaining support scripts that wrote retained outputs to `temps/` so they now write to `artifacts/`
- updated related policy/tripwire checks to reflect the new directory contract
- kept only current-stage retained files in `artifacts/`
- removed obsolete stage files from `temps/`

## Current Retained Stage Material

Current retained stage material is limited to `artifacts/stage_3_2*`:

- `artifacts/stage_3_2_execution_reconstruction/`
- `artifacts/stage_3_2_remediation_input_bundle/`
- `artifacts/stage_3_2_remediation_input_bundle.zip`
- `artifacts/stage_3_2_truth_boundary_typecheck_fix.patch`
- `artifacts/stage_3_2_truth_boundary_typecheck_output_after_patch.txt`
- `artifacts/stage_3_2_truth_boundary_typecheck_patch_bundle.zip`
- `artifacts/stage_3_2_truth_boundary_typecheck_patch_bundle_manifest.json`

## Removed Bundle Generators

The following audit-bundle generator scripts were deleted as part of the cleanup direction to stop retaining that generator set:

- `worker/test_support/build_artifact_open_subrequest_remediation_audit_bundle.py`
- `worker/test_support/build_auditor_helper_execution_review_audit_bundle.py`
- `worker/test_support/build_coder_handoff_audit_bundle.py`
- `worker/test_support/build_coder_implementation_bundle_audit_bundle.py`
- `worker/test_support/build_coder_tasks_audit_bundle.py`
- `worker/test_support/build_coder_work_plan_audit_bundle.py`
- `worker/test_support/build_contextbus_archive_action_cache_binding_audit_bundle.py`
- `worker/test_support/build_contextbus_command_action_schema_audit_bundle.py`
- `worker/test_support/build_contextbus_message_archive_schema_runtime_parity_audit_bundle.py`
- `worker/test_support/build_contextbus_schema_version_gate_repair_audit_bundle.py`
- `worker/test_support/build_helper_execution_intake_audit_bundle.py`
- `worker/test_support/build_helper_execution_report_audit_bundle.py`
- `worker/test_support/build_human_advancement_decision_audit_bundle.py`
- `worker/test_support/build_operational_discipline_audit_bundle.py`
- `worker/test_support/build_pm_intake_audit_bundle.py`
- `worker/test_support/build_pm_plan_audit_bundle.py`
- `worker/test_support/build_pm_specify_audit_bundle.py`
- `worker/test_support/build_pm_tasking_audit_bundle.py`
- `worker/test_support/build_pm_tasks_audit_bundle.py`
- `worker/test_support/build_read_only_queue_audit_bundle.py`
- `worker/test_support/build_read_resume_action_schema_integration_audit_bundle.py`
- `worker/test_support/build_share_integration_audit_bundle.py`

## Non-Policy Change Included In Commit

This commit also includes the stage 3.2 typecheck remediation in:

- `worker/src/science_queue_mutation.ts`

That change is separate from the `temps/` policy cleanup. It introduces a local mutation truth-boundary type and constant to satisfy the existing queue mutation typecheck without changing route behavior.

## Outcome

At close of this remediation:

- `temps/` is no longer used as the intended durable home for retained outputs
- retained current-stage material is under `artifacts/`
- committed docs and the remaining relevant scripts reflect the new directory policy
- historical generator retention was reduced by deleting the removed audit-bundle builder set
