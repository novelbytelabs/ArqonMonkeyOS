#!/usr/bin/env python3
import json
from pathlib import Path

import yaml

RESULTS = Path("artifacts/science_monkeys_role_scoped_schema_generation_results.json")

EXPECTED_ROLES = {
    "explorer",
    "hypothesizer",
    "designer",
    "science_auditor",
}

EXPECTED_COUNTS = {
    "explorer": 27,
    "hypothesizer": 29,
    "designer": 28,
    "science_auditor": 28,
}

REQUIRED_LABELS = [
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]

FORBIDDEN_TOKENS = [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/science/queue/{queue_item_id}/claim",
    "/v1/science/queue/{queue_item_id}/complete",
    "/v1/science/queue/{queue_item_id}/block",
    "/v1/science/queue/{queue_item_id}/quarantine",
    "/v1/science/queue/{queue_item_id}/handoff",
    "human-approve",
    "human-reject",
    "human-defer",
    "human-release",
    "human-close",
    "executor-claim",
    "executor-complete",
    "executor-block",
    "/v1/coder",
    "/v1/helper",
    "/v1/human",
    "/v1/executor",
]

def op_count(schema):
    count = 0
    for path_item in schema.get("paths", {}).values():
        for method in path_item:
            if method.lower() in {"get", "post", "put", "patch", "delete", "options", "head"}:
                count += 1
    return count

def fail(msg):
    raise SystemExit("FAIL " + msg)

def main():
    if not RESULTS.exists():
        fail(f"missing results file: {RESULTS}")

    results = json.loads(RESULTS.read_text(encoding="utf-8"))
    roles = set(results.get("generated", {}).keys())
    if roles != EXPECTED_ROLES:
        fail(f"role set mismatch: {roles}")

    for role, expected_count in EXPECTED_COUNTS.items():
        record = results["generated"][role]
        path = Path(record["path"])
        if not path.exists():
            fail(f"{role}: schema missing {path}")

        raw = path.read_text(encoding="utf-8")
        schema = yaml.safe_load(raw)

        actual_count = op_count(schema)
        if actual_count != expected_count:
            fail(f"{role}: operation count {actual_count} != expected {expected_count}")

        if actual_count > 30:
            fail(f"{role}: operation count exceeds limit")

        if schema.get("x-arqon_role_scope") != role:
            fail(f"{role}: missing role scope metadata")

        if schema.get("x-arqon_operation_count") != actual_count:
            fail(f"{role}: x-arqon_operation_count mismatch")

        for label in REQUIRED_LABELS:
            if label not in raw:
                fail(f"{role}: missing label {label}")

        for forbidden in FORBIDDEN_TOKENS:
            if forbidden in raw:
                fail(f"{role}: forbidden token present {forbidden}")

        if "No harness = No truth" not in raw:
            fail(f"{role}: missing No harness = No truth")

        if "No live smoke is authorized" not in raw:
            fail(f"{role}: missing no-live-smoke import rule")

    print(json.dumps({"ok": True, "roles": sorted(roles), "counts": EXPECTED_COUNTS}, indent=2))

if __name__ == "__main__":
    main()
