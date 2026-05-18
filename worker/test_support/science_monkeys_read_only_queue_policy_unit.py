#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
schema = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")

required_routes = [
    "/v1/science/queue:",
    "/v1/science/queue/{queue_item_id}:",
    "/v1/science/queue/by-flow/{flow_ref}:",
    "/v1/science/queue/next:",
    "/v1/science/queue/blocked:",
    "/v1/science/queue/quarantined:",
    "/v1/science/queue/handoffs:",
    "/v1/science/queue/history/{queue_item_id}:",
    "operationId: listScienceQueue",
    "operationId: getScienceQueueItem",
    "operationId: listScienceQueueByFlow",
    "operationId: getScienceQueueNext",
    "operationId: listScienceQueueBlocked",
    "operationId: listScienceQueueQuarantined",
    "operationId: listScienceQueueHandoffs",
    "operationId: getScienceQueueHistory",
]

missing = [item for item in required_routes if item not in schema]
if missing:
    print("FAIL missing read-only queue schema content: " + ", ".join(missing), file=sys.stderr)
    sys.exit(1)

for forbidden in [
    "/v1/science/queue/{queue_item_id}/claim",
    "/v1/science/queue/{queue_item_id}/complete",
    "/v1/science/queue/{queue_item_id}/block",
    "/v1/science/queue/{queue_item_id}/quarantine",
    "/v1/science/queue/{queue_item_id}/handoff",
    "/v1/science/queue/{queue_item_id}/human-approve",
    "/v1/science/queue/{queue_item_id}/executor-claim",
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/coder/",
    "/v1/helper/",
    "/v1/human/",
]:
    if forbidden in schema:
        print(f"FAIL forbidden route exposed in science action schema: {forbidden}", file=sys.stderr)
        sys.exit(1)

print("PASS read-only queue policy unit")
