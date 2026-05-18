#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
schema = (ROOT / "openapi" / "science_monkeys_actions.openapi.yaml").read_text(encoding="utf-8")
index_src = (ROOT / "worker" / "src" / "index.ts").read_text(encoding="utf-8")

tripwires = {
    "queue_route_registered": "if (url.pathname === \"/v1/science/queue\")" in index_src,
    "queue_item_route_registered": "const scienceQueueItemMatch" in index_src,
    "queue_history_route_registered": "const scienceQueueItemHistoryMatch" in index_src,
    "queue_route_handler_wired": "handleScienceQueueReadRequest" in index_src,
    "forbidden_claim_absent_in_schema": "/v1/science/queue/{queue_item_id}/claim" not in schema,
    "forbidden_share_absent_in_schema": "/v1/science/share" not in schema,
    "forbidden_execute_absent_in_schema": "/v1/science/execute-experiment" not in schema,
}

failed = [name for name, ok in tripwires.items() if not ok]
if failed:
    print("TRIPWIRE_FAIL read-only queue regression: " + ", ".join(failed), file=sys.stderr)
    sys.exit(1)

print("TRIPWIRE_PASS")
