#!/usr/bin/env python3
from pathlib import Path

SCHEMA = Path("openapi/science_monkeys_actions.openapi.yaml")
text = SCHEMA.read_text(encoding="utf-8")

required = [
    "version: 0.3.1-contextbus-archive-action-cache-binding",
    "x-arqon_schema_id: SCIENCE_MONKEYS_CONTEXTBUS_ARCHIVE_ACTION_CACHE_BINDING_REPAIR_001",
    "/v1/messages/{message_id}:",
    "operationId: openRoleMessage",
    "/v1/messages/{message_id}/archive:",
    "operationId: archiveRoleMessageByArchivePath",
    "not Science evidence",
    "not findings",
    "not Science artifacts",
    "not promotion",
    "not deployment approval",
    "not production readiness",
    "REQUIRES_HUMAN_REVIEW",
    "development diagnostic only",
    "NOT SEALED-TEST CERTIFIED",
    "not promotable",
]
missing = [s for s in required if s not in text]
if missing:
    raise SystemExit(f"FAIL missing required schema content: {missing}")

message_block = text.split("  /v1/messages/{message_id}:\n", 1)[1].split("\n\n  /v1/messages/{message_id}/archive:", 1)[0]
if "\n    post:\n" in message_block:
    raise SystemExit("FAIL stale POST remains under /v1/messages/{message_id}")
if "operationId: archiveRoleMessage\n" in text:
    raise SystemExit("FAIL stale operationId archiveRoleMessage remains in schema")
for forbidden in [
    "/v1/science/share",
    "/v1/science/execute-experiment",
    "/v1/queue",
    "/v1/coder/",
    "/v1/helper/",
    "/v1/human/",
]:
    if forbidden in text:
        raise SystemExit(f"FAIL forbidden route exposed: {forbidden}")
print("PASS contextbus archive action cache binding policy unit", {"ok": True})
