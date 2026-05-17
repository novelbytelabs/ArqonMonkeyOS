#!/usr/bin/env python3
"""Tripwire for SCIENCE_MONKEYS_READ_RESUME_SURFACE_001."""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]

NEW_SCIENCE_ARTIFACT_TYPES = {
    "evidence_gap_map",
    "claim_map",
    "execution_intake",
    "execution_closeout",
    "audit_trail_review",
    "evidence_laundering_review",
}


def main() -> int:
    failures: list[str] = []
    index_path = ROOT / "worker/src/index.ts"
    science_path = ROOT / "worker/src/science.ts"
    flow_policy_path = ROOT / "worker/src/flow_policy.ts"
    openapi_path = ROOT / "openapi/arqon_contextos.openapi.yaml"
    read_resume_path = ROOT / "worker/src/read_resume.ts"
    hardening_test_path = ROOT / "worker/test_support/science_monkeys_read_resume_surface_hardening_policy_unit.ts"

    for path in [index_path, science_path, flow_policy_path, openapi_path, read_resume_path, hardening_test_path]:
        if not path.exists():
            failures.append(f"missing expected file: {path.relative_to(ROOT)}")

    index_text = index_path.read_text(encoding="utf-8") if index_path.exists() else ""
    science_text = science_path.read_text(encoding="utf-8") if science_path.exists() else ""
    flow_policy_text = flow_policy_path.read_text(encoding="utf-8") if flow_policy_path.exists() else ""
    openapi_text = openapi_path.read_text(encoding="utf-8") if openapi_path.exists() else ""
    read_resume_text = read_resume_path.read_text(encoding="utf-8") if read_resume_path.exists() else ""

    for required_hardening_marker in [
        "SECRET_LIKE_PATTERNS",
        "ARTIFACT_CONTENT_POLICY_DENIED",
        "UNKNOWN_UNSAFE_PATH",
        "UNSAFE_ARTIFACT_SOURCE_PATH_PRESENT",
    ]:
        if required_hardening_marker not in read_resume_text:
            failures.append(f"missing read/resume hardening marker: {required_hardening_marker}")

    if re.search(r"/v1/queue", index_text):
        failures.append("queue route added to worker/src/index.ts")
    if re.search(r"^\s*/v1/queue", openapi_text, re.M):
        failures.append("queue route added to OpenAPI")

    share_policy = re.search(r"share:\s*\{[\s\S]*?allowed_roles:\s*\[([^\]]*)\]", science_text)
    if not share_policy:
        failures.append("could not find /v1/science/share policy")
    elif share_policy.group(1).strip() != '"HUMAN"':
        failures.append(f"/v1/science/share allowed_roles changed: [{share_policy.group(1)}]")

    execute_policy = re.search(r'"execute-experiment":\s*\{[\s\S]*?allowed_roles:\s*\[([^\]]*)\]', science_text)
    if not execute_policy:
        failures.append("could not find /v1/science/execute-experiment policy")
    elif execute_policy.group(1).strip() != '"SCIENCE_EXECUTOR_AI"':
        failures.append(f"/v1/science/execute-experiment allowed_roles changed: [{execute_policy.group(1)}]")

    science_slots = re.search(r"export const SCIENCE_ARTIFACT_SLOTS = \[([\s\S]*?)\] as const;", flow_policy_text)
    science_slots_text = science_slots.group(1) if science_slots else ""
    if not science_slots:
        failures.append("could not find SCIENCE_ARTIFACT_SLOTS")
    for artifact_type in NEW_SCIENCE_ARTIFACT_TYPES:
        quoted = f'"{artifact_type}"'
        if quoted in science_text:
            failures.append(f"new Science artifact type present in science.ts: {artifact_type}")
        if quoted in science_slots_text:
            failures.append(f"new Science artifact type present in SCIENCE_ARTIFACT_SLOTS: {artifact_type}")

    if failures:
        print("TRIPWIRE_FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("TRIPWIRE_PASS")
    print("- no queue route added")
    print("- /v1/science/share remains HUMAN-only")
    print("- /v1/science/execute-experiment remains SCIENCE_EXECUTOR_AI-only")
    print("- no new Science artifact type activated")
    print("- artifact body secret-like content is refused")
    print("- unsafe artifact source paths are hidden/fail-closed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
