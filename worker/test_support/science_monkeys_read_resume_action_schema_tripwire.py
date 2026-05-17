#!/usr/bin/env python3
"""Tripwire for SCIENCE_MONKEYS_READ_RESUME_ACTION_SCHEMA_INTEGRATION_001.

Fails closed if the action schema or repo source appears to introduce forbidden
queue mutation, share exposure to GPTs, executor authority exposure to GPTs, or
new Science artifact types during this read/resume integration slice.
"""
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
ACTION_SCHEMA = ROOT / "openapi" / "science_monkeys_actions.openapi.yaml"
INDEX = ROOT / "worker" / "src" / "index.ts"
SCIENCE = ROOT / "worker" / "src" / "science.ts"
SCIENCE_SHARE = ROOT / "worker" / "src" / "science_share.ts"

FORBIDDEN_ACTION_STRINGS = [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/queue",
    "/v1/flows/{flow_ref}/advance",
    "/v1/human/advancement-decision",
]

FORBIDDEN_SOURCE_STRINGS = [
    "handleQueue",
    "/v1/queue/",
    "queue_id",
]

FORBIDDEN_NEW_ARTIFACT_TYPES = [
    "evidence_gap_map",
    "claim_map",
    "execution_intake",
    "execution_closeout",
]

REQUIRED_INVARIANT_STRINGS = [
    "SCIENCE_EXECUTOR_AI",
    "HUMAN",
    "ARTIFACT_CONTENT_POLICY_DENIED",
    "UNKNOWN_UNSAFE_PATH",
]


def fail(message: str) -> int:
    print(json.dumps({"ok": False, "error": message}, indent=2))
    return 1


def main() -> int:
    action = ACTION_SCHEMA.read_text()
    source_blob = "\n".join(path.read_text() for path in [INDEX, SCIENCE, SCIENCE_SHARE] if path.exists())

    for forbidden in FORBIDDEN_ACTION_STRINGS:
        if forbidden in action:
            return fail(f"forbidden route exposed in Science GPT action schema: {forbidden}")

    for forbidden in FORBIDDEN_SOURCE_STRINGS:
        if forbidden in source_blob:
            return fail(f"forbidden queue mutation signal found in source: {forbidden}")

    for artifact_type in FORBIDDEN_NEW_ARTIFACT_TYPES:
        if artifact_type in action:
            return fail(f"forbidden new Science artifact type exposed in Science GPT action schema: {artifact_type}")

    combined = action + "\n" + source_blob
    for required in REQUIRED_INVARIANT_STRINGS:
        if required not in combined:
            return fail(f"required invariant string missing: {required}")

    print(json.dumps({
        "ok": True,
        "tripwire": "TRIPWIRE_PASS",
        "forbidden_action_strings_checked": len(FORBIDDEN_ACTION_STRINGS),
        "forbidden_source_strings_checked": len(FORBIDDEN_SOURCE_STRINGS),
        "forbidden_new_artifact_types_checked": len(FORBIDDEN_NEW_ARTIFACT_TYPES),
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
