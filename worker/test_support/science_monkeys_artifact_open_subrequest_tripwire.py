#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
read_resume = (ROOT / "worker/src/read_resume.ts").read_text()
action_schema = (ROOT / "openapi/science_monkeys_actions.openapi.yaml").read_text()
main_openapi = (ROOT / "openapi/arqon_contextos.openapi.yaml").read_text()

failures = []

required_source_markers = [
    "ARTIFACT_OPEN_DEFAULT_SCAN_LIMIT",
    "ARTIFACT_OPEN_MAX_SCAN_LIMIT",
    "FLOW_SCOPED_LOOKUP",
    "BOUNDED_RECENT_FLOW_SCAN",
    "ARTIFACT_FLOW_REF_REQUIRED",
    "Pass flow_ref for deterministic low-subrequest artifact body reads.",
]
for marker in required_source_markers:
    if marker not in read_resume:
        failures.append(f"missing source marker: {marker}")

for queue_marker in ["/v1/queue/{queue_id}/claim", "/v1/queue/{queue_id}/complete", "/v1/queue/{queue_id}/block", "/v1/queue/{queue_id}/quarantine", "/v1/queue/{queue_id}/handoff"]:
    if queue_marker in action_schema:
        failures.append(f"Option C queue mutation route exposed in Science GPT Action schema: {queue_marker}")

for schema_name, schema_text in [("action", action_schema), ("main", main_openapi)]:
    artifact_idx = schema_text.find("/v1/artifacts/{artifact_id}")
    if artifact_idx == -1:
        failures.append(f"{schema_name} schema missing artifact open route")
        continue
    artifact_block = schema_text[artifact_idx:artifact_idx + 2500]
    for marker in ["flow_ref", "scan_limit", "ARTIFACT_FLOW_REF_REQUIRED"]:
        if marker not in artifact_block:
            failures.append(f"{schema_name} artifact route missing {marker}")

for forbidden in ["/v1/science/share", "/v1/science/execute-experiment"]:
    if forbidden in action_schema:
        failures.append(f"forbidden route exposed in Science GPT Action schema: {forbidden}")

for forbidden_claim in ["production ready", "deployment approved"]:
    if forbidden_claim.lower() in (read_resume + action_schema + main_openapi).lower():
        failures.append(f"forbidden claim marker found: {forbidden_claim}")

if failures:
    print("TRIPWIRE_FAIL")
    for failure in failures:
        print(f"- {failure}")
    raise SystemExit(1)

print("TRIPWIRE_PASS")
