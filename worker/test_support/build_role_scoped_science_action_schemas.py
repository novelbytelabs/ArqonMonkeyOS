#!/usr/bin/env python3
import copy
import hashlib
import json
from pathlib import Path

import yaml

SOURCE = Path("openapi/science_monkeys_actions.openapi.yaml")

OUTPUTS = {
    "explorer": Path("openapi/science_monkeys_actions_explorer.openapi.yaml"),
    "hypothesizer": Path("openapi/science_monkeys_actions_hypothesizer.openapi.yaml"),
    "designer": Path("openapi/science_monkeys_actions_designer.openapi.yaml"),
    "science_auditor": Path("openapi/science_monkeys_actions_science_auditor.openapi.yaml"),
}

SHARED_OPS = [
    ("get", "/v1/whoami"),
    ("get", "/v1/capabilities"),
    ("get", "/v1/show"),
    ("get", "/v1/resume"),
    ("get", "/v1/flows/{flow_ref}/resume"),
    ("get", "/v1/flows/{flow_ref}/history"),
    ("get", "/v1/flows/{flow_ref}/artifacts"),
    ("get", "/v1/flows/{flow_ref}/latest"),
    ("get", "/v1/flows/{flow_ref}/next"),
    ("get", "/v1/flows/{flow_ref}/stop-conditions"),
    ("get", "/v1/artifacts/{artifact_id}"),

    ("get", "/v1/context"),
    ("get", "/v1/constitution"),
    ("post", "/v1/notes"),
    ("post", "/v1/messages"),
    ("get", "/v1/messages/inbox"),
    ("get", "/v1/messages/{message_id}"),
    ("post", "/v1/messages/{message_id}/archive"),

    ("get", "/v1/science/queue"),
    ("get", "/v1/science/queue/{queue_item_id}"),
    ("get", "/v1/science/queue/by-flow/{flow_ref}"),
    ("get", "/v1/science/queue/next"),
    ("get", "/v1/science/queue/blocked"),
    ("get", "/v1/science/queue/quarantined"),
    ("get", "/v1/science/queue/handoffs"),
    ("get", "/v1/science/queue/history/{queue_item_id}"),
]

ROLE_OPS = {
    "explorer": [
        ("post", "/v1/science/research"),
    ],
    "hypothesizer": [
        ("post", "/v1/science/hypothesize"),
        ("post", "/v1/science/interpret"),
        ("post", "/v1/science/iterate"),
    ],
    "designer": [
        ("post", "/v1/science/design-experiment"),
        ("post", "/v1/science/iterate"),
    ],
    "science_auditor": [
        ("post", "/v1/science/audit-experiment"),
        ("post", "/v1/science/record-finding"),
    ],
}

ROLE_TITLES = {
    "explorer": "Arqon Science Monkeys Actions — Explorer",
    "hypothesizer": "Arqon Science Monkeys Actions — Hypothesizer",
    "designer": "Arqon Science Monkeys Actions — Designer",
    "science_auditor": "Arqon Science Monkeys Actions — Science Auditor",
}

ROLE_SCHEMA_IDS = {
    "explorer": "SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_EXPLORER_SCHEMA_001",
    "hypothesizer": "SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_HYPOTHESIZER_SCHEMA_001",
    "designer": "SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_DESIGNER_SCHEMA_001",
    "science_auditor": "SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_SCIENCE_AUDITOR_SCHEMA_001",
}

FORBIDDEN_PATHS = [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/science/queue/{queue_item_id}/claim",
    "/v1/science/queue/{queue_item_id}/complete",
    "/v1/science/queue/{queue_item_id}/block",
    "/v1/science/queue/{queue_item_id}/quarantine",
    "/v1/science/queue/{queue_item_id}/handoff",
    "/v1/science/queue/{queue_item_id}/human-approve",
    "/v1/science/queue/{queue_item_id}/human-reject",
    "/v1/science/queue/{queue_item_id}/human-defer",
    "/v1/science/queue/{queue_item_id}/human-release",
    "/v1/science/queue/{queue_item_id}/human-close",
    "/v1/science/queue/{queue_item_id}/executor-claim",
    "/v1/science/queue/{queue_item_id}/executor-complete",
    "/v1/science/queue/{queue_item_id}/executor-block",
]

FORBIDDEN_PREFIXES = [
    "/v1/coder",
    "/v1/helper",
    "/v1/human",
    "/v1/executor",
]

REQUIRED_STATUS_LABELS = [
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]

MAX_OPERATIONS = 30
VERSION = "0.3.3-read-only-queue-role-scoped-operation-budget"

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def load_source() -> dict:
    if not SOURCE.exists():
        raise SystemExit(f"missing source schema: {SOURCE}")
    raw = SOURCE.read_text(encoding="utf-8")
    data = yaml.safe_load(raw)
    if not isinstance(data, dict):
        raise SystemExit("source schema did not parse to object")
    if "paths" not in data or not isinstance(data["paths"], dict):
        raise SystemExit("source schema missing paths")
    return data

def operation_count(schema: dict) -> int:
    count = 0
    for item in schema.get("paths", {}).values():
        if not isinstance(item, dict):
            continue
        for method in item:
            if method.lower() in {"get", "post", "put", "patch", "delete", "options", "head"}:
                count += 1
    return count

def build_paths(source_paths: dict, allowed_ops: list[tuple[str, str]]) -> dict:
    new_paths: dict = {}
    missing: list[str] = []
    for method, path in allowed_ops:
        if path not in source_paths:
            missing.append(f"{method.upper()} {path} missing path")
            continue
        source_path_obj = source_paths[path]
        if method not in source_path_obj:
            missing.append(f"{method.upper()} {path} missing method")
            continue
        if path not in new_paths:
            new_paths[path] = {}
        new_paths[path][method] = copy.deepcopy(source_path_obj[method])
    if missing:
        raise SystemExit("missing required operations: " + json.dumps(missing, indent=2))
    return new_paths

def assert_forbidden_absent(schema: dict, role: str) -> None:
    paths = schema.get("paths", {})
    for forbidden in FORBIDDEN_PATHS:
        if forbidden in paths:
            raise SystemExit(f"{role}: forbidden path present: {forbidden}")
    for path in paths:
        for prefix in FORBIDDEN_PREFIXES:
            if path.startswith(prefix):
                raise SystemExit(f"{role}: forbidden prefix present: {path}")
    rendered = yaml.safe_dump(schema, sort_keys=False)
    for token in [
        "/v1/science/share",
        "/v1/science/execute-experiment",
        "human-approve",
        "human-reject",
        "human-defer",
        "human-release",
        "human-close",
        "executor-claim",
        "executor-complete",
        "executor-block",
    ]:
        if token in rendered:
            raise SystemExit(f"{role}: forbidden token present: {token}")

def assert_expected_allowed(role: str, schema: dict, expected_ops: list[tuple[str, str]]) -> None:
    paths = schema.get("paths", {})
    found = []
    for path, path_item in paths.items():
        for method in path_item:
            if method.lower() in {"get", "post", "put", "patch", "delete", "options", "head"}:
                found.append((method.lower(), path))
    if set(found) != set(expected_ops):
        raise SystemExit(
            f"{role}: operation surface mismatch: "
            + json.dumps(
                {
                    "expected": sorted([f"{m.upper()} {p}" for m, p in expected_ops]),
                    "found": sorted([f"{m.upper()} {p}" for m, p in found]),
                },
                indent=2,
            )
        )

def add_role_metadata(schema: dict, role: str, allowed_ops: list[tuple[str, str]]) -> dict:
    out = copy.deepcopy(schema)
    out["info"] = copy.deepcopy(schema.get("info", {}))
    out["info"]["title"] = ROLE_TITLES[role]
    out["info"]["version"] = VERSION
    out["info"]["description"] = (
        f"Role-scoped Science Monkeys Action surface for {role}. "
        "Generated from the audited all-in-one schema to satisfy the 30-operation GPT Action limit. "
        "Required status labels: REQUIRES_HUMAN_REVIEW; development diagnostic only; "
        "NOT SEALED-TEST CERTIFIED; not promotable. "
        "Raw GPT output is not evidence. Queue records are governance coordination records, not scientific truth. "
        "No harness = No truth."
    )
    out["x-arqon_schema_id"] = ROLE_SCHEMA_IDS[role]
    out["x-arqon_role_scope"] = role
    out["x-arqon_schema_status"] = "CANDIDATE_UNTIL_GATE_PASS_AND_HASH_LOCKED_IMPORT"
    out["x-arqon_operation_budget_limit"] = MAX_OPERATIONS
    out["x-arqon_operation_count"] = len(allowed_ops)
    out["x-arqon_import_rule"] = (
        "Import only this exact role-scoped schema into the matching Science GPT after Human approval. "
        "Record schema SHA, operator, timestamp, route presence, and forbidden route absence. "
        "No live smoke is authorized by this schema candidate."
    )
    return out

def main() -> None:
    source = load_source()
    source_sha = sha256_bytes(SOURCE.read_bytes())
    source_count = operation_count(source)

    results = {
        "slice": "SCIENCE_MONKEYS_READ_ONLY_QUEUE_ROLE_SCOPED_ACTION_SCHEMA_OPERATION_BUDGET_REPAIR_001",
        "source_schema": str(SOURCE),
        "source_schema_sha256": source_sha,
        "source_operation_count": source_count,
        "max_operations_per_schema": MAX_OPERATIONS,
        "generated": {},
        "required_status_labels": REQUIRED_STATUS_LABELS,
        "no_gpt_action_import": True,
        "no_live_smoke": True,
        "no_queue_mutation": True,
        "no_certification_promotion_deployment_production_autonomy": True,
    }

    source_paths = source["paths"]

    for role, role_ops in ROLE_OPS.items():
        allowed_ops = SHARED_OPS + role_ops
        role_schema = add_role_metadata(source, role, allowed_ops)
        role_schema["paths"] = build_paths(source_paths, allowed_ops)

        assert_expected_allowed(role, role_schema, allowed_ops)
        assert_forbidden_absent(role_schema, role)

        count = operation_count(role_schema)
        if count > MAX_OPERATIONS:
            raise SystemExit(f"{role}: operation count {count} exceeds {MAX_OPERATIONS}")

        rendered = yaml.safe_dump(role_schema, sort_keys=False, allow_unicode=True)
        yaml.safe_load(rendered)

        out_path = OUTPUTS[role]
        out_path.write_text(rendered, encoding="utf-8")
        out_sha = sha256_bytes(out_path.read_bytes())

        results["generated"][role] = {
            "path": str(out_path),
            "sha256": out_sha,
            "operation_count": count,
            "role_schema_id": ROLE_SCHEMA_IDS[role],
            "route_ops": [f"{method.upper()} {path}" for method, path in allowed_ops],
        }

    out_json = Path("artifacts/science_monkeys_role_scoped_schema_generation_results.json")
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(results, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(json.dumps(results, indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
