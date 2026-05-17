#!/usr/bin/env python3
"""Policy checks for Science Monkeys read/resume GPT Action schema integration.

No YAML dependency is required; this checks the canonical schema text for bounded
route exposure and forbidden authority drift.
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
ACTION_SCHEMA = ROOT / "openapi" / "science_monkeys_actions.openapi.yaml"
MAIN_OPENAPI = ROOT / "openapi" / "arqon_contextos.openapi.yaml"

REQUIRED_GET_PATHS = [
    "/v1/whoami",
    "/v1/capabilities",
    "/v1/show",
    "/v1/resume",
    "/v1/flows/{flow_ref}/resume",
    "/v1/flows/{flow_ref}/history",
    "/v1/flows/{flow_ref}/artifacts",
    "/v1/flows/{flow_ref}/latest",
    "/v1/flows/{flow_ref}/next",
    "/v1/flows/{flow_ref}/stop-conditions",
    "/v1/artifacts/{artifact_id}",
]

REQUIRED_SCIENCE_WRITE_PATHS = [
    "/v1/science/research",
    "/v1/science/hypothesize",
    "/v1/science/interpret",
    "/v1/science/design-experiment",
    "/v1/science/iterate",
    "/v1/science/audit-experiment",
    "/v1/science/record-finding",
]

FORBIDDEN_ACTION_SCHEMA_PATHS = [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/queue",
    "/v1/human/advancement-decision",
    "/v1/flows/{flow_ref}/advance",
]

FORBIDDEN_NEW_ARTIFACT_TYPES = [
    "evidence_gap_map",
    "claim_map",
    "execution_intake",
    "execution_closeout",
]


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def has_path_block(schema: str, path: str, method: str) -> bool:
    pattern = rf"^  {re.escape(path)}:\n(?:    .+\n)*?    {method}:"
    return re.search(pattern, schema, re.MULTILINE) is not None


def main() -> int:
    action = ACTION_SCHEMA.read_text()
    main_openapi = MAIN_OPENAPI.read_text()

    for path in REQUIRED_GET_PATHS:
        assert_true(has_path_block(action, path, "get"), f"missing GET action schema path: {path}")

    for path in REQUIRED_SCIENCE_WRITE_PATHS:
        assert_true(has_path_block(action, path, "post"), f"missing existing Science POST action schema path: {path}")

    for forbidden in FORBIDDEN_ACTION_SCHEMA_PATHS:
        assert_true(forbidden not in action, f"forbidden path exposed in Science GPT action schema: {forbidden}")

    for artifact_type in FORBIDDEN_NEW_ARTIFACT_TYPES:
        assert_true(artifact_type not in action, f"new Science artifact type activated in action schema: {artifact_type}")

    assert_true("ARTIFACT_CONTENT_POLICY_DENIED" in action, "action schema must document ARTIFACT_CONTENT_POLICY_DENIED")
    assert_true("ARTIFACT_CONTENT_POLICY_DENIED" in main_openapi, "main OpenAPI must document ARTIFACT_CONTENT_POLICY_DENIED")
    assert_true("UNKNOWN_UNSAFE_PATH" in action, "action schema must mention UNKNOWN_UNSAFE_PATH")
    assert_true("Read-only" in action or "read-only" in action, "action schema should mark artifact read as read-only")

    assert_true("REQUIRES_HUMAN_REVIEW" in action, "status label missing from action schema description/context")
    assert_true("NOT SEALED-TEST CERTIFIED" in action or "No harness = No truth" in action, "truth boundary missing from action schema")

    print(json.dumps({
        "ok": True,
        "required_get_paths": len(REQUIRED_GET_PATHS),
        "science_write_paths_preserved": len(REQUIRED_SCIENCE_WRITE_PATHS),
        "forbidden_paths_checked": len(FORBIDDEN_ACTION_SCHEMA_PATHS),
        "forbidden_new_artifact_types_checked": len(FORBIDDEN_NEW_ARTIFACT_TYPES),
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
