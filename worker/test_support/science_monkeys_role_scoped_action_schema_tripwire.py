#!/usr/bin/env python3
import json
from pathlib import Path

import yaml

SCHEMAS = {
    "explorer": Path("openapi/science_monkeys_actions_explorer.openapi.yaml"),
    "hypothesizer": Path("openapi/science_monkeys_actions_hypothesizer.openapi.yaml"),
    "designer": Path("openapi/science_monkeys_actions_designer.openapi.yaml"),
    "science_auditor": Path("openapi/science_monkeys_actions_science_auditor.openapi.yaml"),
}

EXPECTED_ROLE_ONLY_SCIENCE_POSTS = {
    "explorer": {"/v1/science/research"},
    "hypothesizer": {"/v1/science/hypothesize", "/v1/science/interpret", "/v1/science/iterate"},
    "designer": {"/v1/science/design-experiment", "/v1/science/iterate"},
    "science_auditor": {"/v1/science/audit-experiment", "/v1/science/record-finding"},
}

QUEUE_ROUTES = {
    "/v1/science/queue",
    "/v1/science/queue/{queue_item_id}",
    "/v1/science/queue/by-flow/{flow_ref}",
    "/v1/science/queue/next",
    "/v1/science/queue/blocked",
    "/v1/science/queue/quarantined",
    "/v1/science/queue/handoffs",
    "/v1/science/queue/history/{queue_item_id}",
}

FORBIDDEN_ANYWHERE = [
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
    "/v1/coder",
    "/v1/helper",
    "/v1/human",
    "/v1/executor",
    "production readiness",
    "deployment approval",
    "certification route",
    "promotion route",
]

def fail(msg):
    raise SystemExit("TRIPWIRE_FAIL " + msg)

def method_set(schema, path):
    return {
        method.lower()
        for method in schema.get("paths", {}).get(path, {})
        if method.lower() in {"get", "post", "put", "patch", "delete", "options", "head"}
    }

def main():
    report = {}

    for role, path in SCHEMAS.items():
        if not path.exists():
            fail(f"{role}: schema missing")

        raw = path.read_text(encoding="utf-8")
        schema = yaml.safe_load(raw)
        paths = schema.get("paths", {})

        for token in FORBIDDEN_ANYWHERE:
            if token in raw:
                fail(f"{role}: forbidden token present {token}")

        for queue_route in QUEUE_ROUTES:
            if queue_route not in paths:
                fail(f"{role}: missing queue route {queue_route}")
            if method_set(schema, queue_route) != {"get"}:
                fail(f"{role}: queue route not GET-only {queue_route}")

        science_posts = {
            p
            for p, item in paths.items()
            if p.startswith("/v1/science/") and "post" in item and not p.startswith("/v1/science/queue")
        }

        if science_posts != EXPECTED_ROLE_ONLY_SCIENCE_POSTS[role]:
            fail(
                f"{role}: science post surface mismatch "
                + json.dumps(
                    {
                        "expected": sorted(EXPECTED_ROLE_ONLY_SCIENCE_POSTS[role]),
                        "found": sorted(science_posts),
                    },
                    indent=2,
                )
            )

        for p, item in paths.items():
            if p.startswith("/v1/science/queue") and "post" in item:
                fail(f"{role}: queue mutation method exposed {p}")

        count = 0
        for item in paths.values():
            for method in item:
                if method.lower() in {"get", "post", "put", "patch", "delete", "options", "head"}:
                    count += 1

        if count > 30:
            fail(f"{role}: count over operation budget {count}")

        report[role] = {
            "operation_count": count,
            "science_posts": sorted(science_posts),
            "queue_routes": sorted(QUEUE_ROUTES),
        }

    print(json.dumps({"ok": True, "report": report}, indent=2))

if __name__ == "__main__":
    main()
